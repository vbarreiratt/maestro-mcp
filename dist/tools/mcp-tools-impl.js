/**
 * MCP Tools Implementation
 * Real implementations for all 8 mandatory MIDI tools
 */
import { CC_MAPPINGS } from './mcp-tools-schemas.js';
import { Mensageiro } from '../pilares/modulo-midi/mensageiro/index.js';
import { Tradutor } from '../pilares/modulo-midi/tradutor/index.js';
import { Maestro } from '../pilares/modulo-midi/maestro/index.js';
import Note from '@tonaljs/note';
import { logger } from '../utils/logger.js';
/**
 * Core MCP Tools Class
 * Orchestrates the 3 Pilares for MCP tool execution
 */
export class MCPToolsImpl {
    mensageiro;
    tradutor;
    maestro;
    defaultOutputPort = null;
    globalBPM = 120;
    constructor() {
        this.mensageiro = new Mensageiro();
        this.tradutor = new Tradutor();
        this.maestro = new Maestro();
        // Initialize the Pilares
        this.initializePilares();
        // Setup Maestro callbacks to Mensageiro
        this.setupMaestroCallbacks();
    }
    async initializePilares() {
        try {
            await this.mensageiro.initialize();
            await this.maestro.initialize();
            // Auto-connect to first available MIDI output port
            await this.autoConnectMidiOutput();
            logger.info('All 3 Pilares initialized successfully');
        }
        catch (error) {
            logger.error('Failed to initialize Pilares', error);
        }
    }
    /**
     * Auto-connect to first available MIDI output port
     */
    async autoConnectMidiOutput() {
        try {
            const ports = this.mensageiro.listPorts();
            const outputPort = ports.find(port => port.type === 'output');
            if (outputPort) {
                const success = await this.mensageiro.connectToPort(outputPort.name);
                if (success) {
                    this.defaultOutputPort = outputPort.name;
                    logger.info(`Auto-connected to MIDI output: ${outputPort.name}`);
                }
                else {
                    logger.warn(`Failed to auto-connect to port: ${outputPort.name}`);
                }
            }
            else {
                logger.warn('No MIDI output ports available for auto-connection');
            }
        }
        catch (error) {
            logger.warn('Auto-connection failed, MIDI operations will require manual port configuration', error);
        }
    }
    setupMaestroCallbacks() {
        this.maestro.onNoteEvent = (event) => {
            const midiNote = typeof event.midiNote === 'number' ? event.midiNote : 60;
            // Keep normalized velocity (0-1) for consistency with MCP tools
            this.mensageiro.sendNoteOn(midiNote, event.velocity, event.channel);
            // Schedule note off
            setTimeout(() => {
                this.mensageiro.sendNoteOff(midiNote, event.channel);
            }, event.duration * 1000);
        };
        this.maestro.onCCEvent = (event) => {
            this.mensageiro.sendCC(event.controller, event.value, event.channel);
        };
        this.maestro.onSystemEvent = (event) => {
            if (event.type === 'program_change' && event.channel) {
                this.mensageiro.sendProgramChange(event.value, event.channel);
            }
        };
    }
    // ========================
    // 1. SYSTEM MANAGEMENT
    // ========================
    async midi_list_ports(params) {
        logger.info('🎹 Listing MIDI ports', { refresh: params.refresh });
        try {
            const ports = await this.mensageiro.listPorts();
            logger.info(`Found ${ports.length} MIDI ports`);
            return {
                success: true,
                ports: ports.map(port => ({
                    id: port.id,
                    name: port.name,
                    type: port.type,
                    connected: port.connected,
                    manufacturer: port.manufacturer || 'Unknown'
                })),
                count: ports.length,
                currentOutput: this.defaultOutputPort
            };
        }
        catch (error) {
            logger.error('Failed to list MIDI ports', { error: error instanceof Error ? error.message : error });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                ports: [],
                count: 0
            };
        }
    }
    async configure_midi_output(params) {
        logger.info('🔧 Configuring MIDI output', { portName: params.portName });
        try {
            const success = await this.mensageiro.connectToPort(params.portName);
            if (success) {
                this.defaultOutputPort = params.portName;
                logger.info(`Successfully configured output port: ${params.portName}`);
                return {
                    success: true,
                    message: `Successfully configured MIDI output to: ${params.portName}`,
                    portName: params.portName
                };
            }
            else {
                logger.warn(`Failed to connect to port: ${params.portName}`);
                return {
                    success: false,
                    error: `Could not connect to MIDI port: ${params.portName}`,
                    availablePorts: (await this.mensageiro.listPorts()).map(p => p.name)
                };
            }
        }
        catch (error) {
            logger.error('Failed to configure MIDI output', { error: error instanceof Error ? error.message : error });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    // ========================
    // 2. BASIC MUSICAL CONTROL
    // ========================
    async midi_send_note(params) {
        logger.info('🎵 Sending MIDI note', params);
        try {
            // Handle port override
            if (params.outputPort) {
                await this.mensageiro.connectToPort(params.outputPort);
            }
            // Convert note to MIDI number if needed
            let midiNote;
            if (typeof params.note === 'string') {
                const midiFromNote = Note.midi(params.note);
                if (midiFromNote === null) {
                    throw new Error(`Invalid note: ${params.note}`);
                }
                midiNote = midiFromNote;
            }
            else {
                midiNote = params.note;
            }
            // Keep normalized velocity (0-1) - Mensageiro will handle MIDI conversion
            // Send note on immediately - velocity is normalized (0-1)
            this.mensageiro.sendNoteOn(midiNote, params.velocity, params.channel);
            // Schedule note off
            setTimeout(() => {
                this.mensageiro.sendNoteOff(midiNote, params.channel);
            }, params.duration * 1000);
            return {
                success: true,
                message: `Note sent: ${params.note} (MIDI ${midiNote}) on channel ${params.channel}`,
                midiNote,
                velocity: params.velocity,
                duration: params.duration,
                channel: params.channel
            };
        }
        catch (error) {
            logger.error('Failed to send MIDI note', { error: error instanceof Error ? error.message : error });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async midi_play_phrase(params) {
        logger.info('🎼 Playing musical phrase', params);
        try {
            // Handle port override
            if (params.outputPort) {
                await this.mensageiro.connectToPort(params.outputPort);
            }
            // Parse notes
            const noteNames = params.notes.split(' ').filter(n => n.trim());
            if (noteNames.length === 0) {
                throw new Error('No valid notes provided');
            }
            // Create musical plan
            const musicalPlan = {
                bpm: params.tempo,
                timeSignature: "4/4",
                key: "C major",
                events: noteNames.map((noteName, index) => ({
                    time: `${index}:0`, // Bar:beat format
                    type: "note",
                    value: noteName,
                    duration: "4n", // Quarter note duration
                    velocity: 0.8,
                    channel: params.channel,
                    articulation: params.style
                }))
            };
            // Use Tradutor to create executable score
            const scoreResult = await this.tradutor.translateMusicalPlan(musicalPlan);
            // Use Maestro to schedule and play
            this.maestro.setBPM(params.tempo);
            const playbackId = this.maestro.schedulePartitura(scoreResult);
            this.maestro.play();
            return {
                success: true,
                message: `Playing phrase: ${params.notes}`,
                noteCount: noteNames.length,
                tempo: params.tempo,
                style: params.style,
                playbackId,
                duration: noteNames.length * (60 / params.tempo) // Approximate duration
            };
        }
        catch (error) {
            logger.error('Failed to play musical phrase', { error: error instanceof Error ? error.message : error });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    // ========================
    // 3. ADVANCED CONTROL
    // ========================
    async midi_sequence_commands(params) {
        logger.info('🎭 Executing MIDI sequence', { commandCount: params.commands.length });
        try {
            // Handle port override
            if (params.outputPort) {
                await this.mensageiro.connectToPort(params.outputPort);
            }
            const results = [];
            for (const command of params.commands) {
                const result = await this.executeSequenceCommand(command);
                results.push(result);
                if (!result.success) {
                    logger.warn('Command failed in sequence', { command, error: result.error });
                }
            }
            const successCount = results.filter(r => r.success).length;
            return {
                success: successCount === results.length,
                message: `Executed ${successCount}/${results.length} commands successfully`,
                results,
                totalCommands: params.commands.length,
                successfulCommands: successCount
            };
        }
        catch (error) {
            logger.error('Failed to execute MIDI sequence', { error: error instanceof Error ? error.message : error });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async executeSequenceCommand(command) {
        try {
            const delay = command.time ? command.time * 1000 : 0;
            if (delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            switch (command.type) {
                case 'note':
                    if (!command.note)
                        throw new Error('Note parameter required for note command');
                    let midiNote;
                    if (typeof command.note === 'string') {
                        const midiFromNote = Note.midi(command.note);
                        if (midiFromNote === null) {
                            throw new Error(`Invalid note: ${command.note}`);
                        }
                        midiNote = midiFromNote;
                    }
                    else {
                        midiNote = command.note;
                    }
                    // Use normalized velocity directly (0-1)
                    const velocity = command.velocity || 0.8;
                    const channel = command.channel || 1;
                    const duration = (command.duration || 1.0) * 1000;
                    this.mensageiro.sendNoteOn(midiNote, velocity, channel);
                    setTimeout(() => {
                        this.mensageiro.sendNoteOff(midiNote, channel);
                    }, duration);
                    return { success: true, type: 'note', midiNote, velocity: command.velocity };
                case 'cc':
                    if (command.controller === undefined || command.value === undefined) {
                        throw new Error('Controller and value required for CC command');
                    }
                    this.mensageiro.sendCC(command.controller, command.value, command.channel || 1);
                    return { success: true, type: 'cc', controller: command.controller, value: command.value };
                case 'delay':
                    // Delay already handled above
                    return { success: true, type: 'delay', duration: command.time };
                default:
                    throw new Error(`Unknown command type: ${command.type}`);
            }
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                command
            };
        }
    }
    async midi_send_cc(params) {
        logger.info('🎛️ Sending MIDI CC', params);
        try {
            // Handle port override
            if (params.outputPort) {
                await this.mensageiro.connectToPort(params.outputPort);
            }
            // Convert controller name to number if needed
            let controllerNumber;
            if (typeof params.controller === 'string') {
                if (params.controller in CC_MAPPINGS) {
                    controllerNumber = CC_MAPPINGS[params.controller];
                }
                else {
                    throw new Error(`Unknown controller name: ${params.controller}`);
                }
            }
            else {
                controllerNumber = params.controller;
            }
            this.mensageiro.sendCC(controllerNumber, params.value, params.channel);
            return {
                success: true,
                message: `CC sent: Controller ${controllerNumber} = ${params.value} on channel ${params.channel}`,
                controller: controllerNumber,
                controllerName: typeof params.controller === 'string' ? params.controller : 'Custom',
                value: params.value,
                channel: params.channel
            };
        }
        catch (error) {
            logger.error('Failed to send MIDI CC', { error: error instanceof Error ? error.message : error });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    // ========================
    // 4. TIME & STATE MANAGEMENT  
    // ========================
    async midi_set_tempo(params) {
        logger.info('⏱️ Setting global tempo', params);
        try {
            this.globalBPM = params.bpm;
            this.maestro.setBPM(params.bpm);
            return {
                success: true,
                message: `Global tempo set to ${params.bpm} BPM`,
                bpm: params.bpm,
                previousBPM: this.globalBPM
            };
        }
        catch (error) {
            logger.error('Failed to set tempo', { error: error instanceof Error ? error.message : error });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async midi_transport_control(params) {
        logger.info('▶️ Transport control', params);
        try {
            switch (params.action) {
                case 'play':
                    this.maestro.play();
                    break;
                case 'pause':
                    this.maestro.pause();
                    break;
                case 'stop':
                    this.maestro.stop();
                    break;
                case 'rewind':
                    this.maestro.stop();
                    // Rewind to beginning (implementation depends on Maestro capabilities)
                    break;
                default:
                    throw new Error(`Unknown transport action: ${params.action}`);
            }
            return {
                success: true,
                message: `Transport ${params.action} executed`,
                action: params.action,
                currentState: this.maestro.getPlaybackState(),
                currentTime: this.maestro.getCurrentTime()
            };
        }
        catch (error) {
            logger.error('Failed to control transport', { error: error instanceof Error ? error.message : error });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async midi_panic(_params) {
        logger.info('🚨 MIDI PANIC - Emergency stop');
        try {
            // Stop all transport
            this.maestro.stop();
            // Send All Notes Off and Reset Controllers on all channels
            for (let channel = 1; channel <= 16; channel++) {
                this.mensageiro.sendAllNotesOff(channel);
            }
            // Send panic to Mensageiro
            this.mensageiro.sendPanic();
            return {
                success: true,
                message: 'MIDI PANIC executed - all notes stopped, controllers reset',
                timestamp: new Date().toISOString(),
                actionsPerformed: [
                    'Transport stopped',
                    'All Notes Off (channels 1-16)',
                    'Reset Controllers (channels 1-16)',
                    'Mensageiro panic'
                ]
            };
        }
        catch (error) {
            logger.error('Failed to execute MIDI panic', { error: error instanceof Error ? error.message : error });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}
//# sourceMappingURL=mcp-tools-impl.js.map