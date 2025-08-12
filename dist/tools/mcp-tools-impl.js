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
    // ========================
    // UNIFIED NOTE PARSER
    // ========================
    /**
     * Parse single note with unified notation support
     * Supports both simple (C4) and musical (C4:q) notation formats
     */
    async parseUnifiedNote(noteInput, defaultDuration = 1.0) {
        try {
            // Handle numeric input (already MIDI note)
            if (typeof noteInput === 'number') {
                return {
                    midiNote: noteInput,
                    duration: defaultDuration,
                    originalInput: noteInput
                };
            }
            // Handle string input - check for musical notation
            if (noteInput.includes(':')) {
                // Musical notation format: "C4:q"
                const [noteName, durationCode] = noteInput.split(':');
                if (!noteName || !durationCode) {
                    throw new Error(`Invalid musical notation: ${noteInput}`);
                }
                // Convert note name to MIDI
                const midiFromNote = Note.midi(noteName);
                if (midiFromNote === null) {
                    throw new Error(`Invalid note name: ${noteName}`);
                }
                // Convert duration code to seconds using current BPM
                const durationInSeconds = this.convertDurationCodeToSeconds(durationCode, this.globalBPM);
                return {
                    midiNote: midiFromNote,
                    duration: durationInSeconds,
                    originalInput: noteInput
                };
            }
            else {
                // Simple notation format: "C4"
                const midiFromNote = Note.midi(noteInput);
                if (midiFromNote === null) {
                    throw new Error(`Invalid note: ${noteInput}`);
                }
                return {
                    midiNote: midiFromNote,
                    duration: defaultDuration,
                    originalInput: noteInput
                };
            }
        }
        catch (error) {
            logger.error('Failed to parse unified note', { noteInput, defaultDuration, error });
            throw new Error(`Note parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Convert duration code (q, h, w, e, s) to seconds based on BPM
     */
    convertDurationCodeToSeconds(durationCode, bpm) {
        const quarterNoteDuration = 60 / bpm;
        const durationMap = {
            'w': quarterNoteDuration * 4, // whole
            'h': quarterNoteDuration * 2, // half
            'q': quarterNoteDuration, // quarter
            'e': quarterNoteDuration / 2, // eighth
            's': quarterNoteDuration / 4, // sixteenth
            't': quarterNoteDuration / 8, // thirty-second
        };
        // Handle dotted notes
        const isDotted = durationCode.endsWith('.');
        const cleanCode = isDotted ? durationCode.slice(0, -1) : durationCode;
        const baseDuration = durationMap[cleanCode];
        if (baseDuration === undefined) {
            logger.warn(`Unknown duration code: ${durationCode}, using quarter note`);
            return quarterNoteDuration;
        }
        // Apply dotted duration (adds half the original duration)
        return isDotted ? baseDuration * 1.5 : baseDuration;
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
        logger.info('🎵 Sending MIDI note with unified parser', params);
        try {
            // Handle port override
            if (params.outputPort) {
                await this.mensageiro.connectToPort(params.outputPort);
            }
            // Use unified note parser to support both C4 and C4:q formats
            const parsedNote = await this.parseUnifiedNote(params.note, params.duration);
            const finalDuration = parsedNote.duration; // Use duration from notation if available
            logger.info('🎵 Parsed note details', {
                original: parsedNote.originalInput,
                midiNote: parsedNote.midiNote,
                duration: finalDuration,
                velocity: params.velocity,
                channel: params.channel
            });
            // Send note on immediately - velocity is normalized (0-1)
            this.mensageiro.sendNoteOn(parsedNote.midiNote, params.velocity, params.channel);
            // Schedule note off with parsed duration
            setTimeout(() => {
                this.mensageiro.sendNoteOff(parsedNote.midiNote, params.channel);
            }, finalDuration * 1000);
            return {
                success: true,
                message: `Note sent: ${parsedNote.originalInput} (MIDI ${parsedNote.midiNote}) on channel ${params.channel}`,
                midiNote: parsedNote.midiNote,
                velocity: params.velocity,
                duration: finalDuration,
                channel: params.channel,
                notationUsed: typeof params.note === 'string' && params.note.includes(':') ? 'musical' : 'simple'
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
        logger.info('🎼 Playing musical phrase with enhanced timing', params);
        try {
            // Handle port override
            if (params.outputPort) {
                await this.mensageiro.connectToPort(params.outputPort);
            }
            // NEW: Use enhanced notation parser
            const { parseNotes, calculateNoteTiming, quantizeToMusicalGrid } = await import('../pilares/modulo-midi/tradutor/transformers.js');
            // Parse notes using the new system with backwards compatibility
            const phraseOptions = {
                notes: params.notes,
                ...(params.rhythm && { rhythm: params.rhythm }),
                notation: params.notation || 'auto',
                quantize: params.quantize || false,
                timeSignature: params.timeSignature || [4, 4],
                tempo: params.tempo
            };
            const parsedNotes = parseNotes(params.notes, phraseOptions);
            if (parsedNotes.length === 0) {
                throw new Error('No valid notes found in input');
            }
            // Calculate precise timing
            const timedNotes = calculateNoteTiming(parsedNotes, params.tempo, params.timeSignature);
            // Apply quantization if requested
            if (params.quantize) {
                const positions = timedNotes.map(n => n.startTime);
                const quantizedPositions = quantizeToMusicalGrid(positions, params.tempo, 'sixteenth');
                // Update timed notes with quantized positions
                timedNotes.forEach((note, index) => {
                    note.startTime = quantizedPositions[index] || note.startTime;
                });
            }
            // Create enhanced musical plan with precise timing
            const musicalPlan = {
                bpm: params.tempo,
                timeSignature: `${params.timeSignature?.[0] || 4}/${params.timeSignature?.[1] || 4}`,
                key: "C major",
                events: timedNotes.map((timedNote, index) => ({
                    time: `${Math.floor(timedNote.startTime / (60 / params.tempo))}:${((timedNote.startTime % (60 / params.tempo)) * 4).toFixed(0)}`, // Bar:beat format
                    type: "note",
                    value: timedNote.note === 'rest' ? 'r' : timedNote.note,
                    duration: this.convertDurationToToneJS(parsedNotes[index]?.duration || 'quarter'),
                    velocity: timedNote.velocity || 0.8,
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
            // Calculate actual duration using enhanced timing
            const totalDuration = Math.max(...timedNotes.map(n => n.startTime + n.duration));
            return {
                success: true,
                message: `Playing phrase with enhanced timing: ${params.notes}`,
                noteCount: parsedNotes.length,
                tempo: params.tempo,
                style: params.style,
                playbackId,
                duration: `${totalDuration.toFixed(2)} seconds`,
                notationUsed: params.notation || 'auto',
                quantized: params.quantize || false,
                timing: 'enhanced-precision'
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
                    // Use unified parser to support both C4 and C4:q formats
                    const parsedNote = await this.parseUnifiedNote(command.note, command.duration || 1.0);
                    const finalDuration = parsedNote.duration * 1000; // Convert to ms
                    // Use normalized velocity directly (0-1)
                    const velocity = command.velocity || 0.8;
                    const channel = command.channel || 1;
                    logger.info('🎵 Sequence note parsed', {
                        original: parsedNote.originalInput,
                        midiNote: parsedNote.midiNote,
                        duration: parsedNote.duration,
                        velocity,
                        channel
                    });
                    this.mensageiro.sendNoteOn(parsedNote.midiNote, velocity, channel);
                    setTimeout(() => {
                        this.mensageiro.sendNoteOff(parsedNote.midiNote, channel);
                    }, finalDuration);
                    return {
                        success: true,
                        type: 'note',
                        midiNote: parsedNote.midiNote,
                        velocity: command.velocity,
                        duration: parsedNote.duration,
                        notationUsed: typeof command.note === 'string' && command.note.includes(':') ? 'musical' : 'simple'
                    };
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
    // ========================
    // NEW: SCORE IMPORT
    // ========================
    async midi_import_score(params) {
        logger.info('🎼 Importing and executing musical score', {
            source: params.source,
            tempo: params.tempo,
            preview: params.preview
        });
        try {
            let sequence;
            switch (params.source) {
                case 'text_notation':
                    sequence = this.parseTextNotation(params.data);
                    break;
                case 'guitar_tab':
                    sequence = this.parseGuitarTab(params.data);
                    break;
                case 'musicxml':
                    return {
                        success: false,
                        error: 'MusicXML import not yet implemented. Use text_notation format instead.',
                        supportedFormats: ['text_notation', 'guitar_tab']
                    };
                default:
                    return {
                        success: false,
                        error: `Unsupported source format: ${params.source}`,
                        supportedFormats: ['text_notation', 'guitar_tab', 'musicxml']
                    };
            }
            if (!sequence || sequence.notes.length === 0) {
                return {
                    success: false,
                    error: 'No musical content found in the provided data'
                };
            }
            // Calculate total duration
            const totalDuration = this.calculateTotalDuration(sequence, params.tempo);
            if (params.preview) {
                return {
                    success: true,
                    preview: true,
                    sequence: sequence,
                    totalDuration: `${totalDuration.toFixed(2)} seconds`,
                    noteCount: sequence.notes.length,
                    estimatedBars: Math.ceil(totalDuration / (240 / params.tempo)), // Rough bar estimate
                    message: 'Preview calculated - use preview: false to execute'
                };
            }
            // Execute using existing midi_play_phrase functionality with enhanced options
            const executeParams = {
                notes: sequence.notes.join(' '),
                rhythm: sequence.rhythms.join(' '),
                tempo: params.tempo,
                channel: params.channel,
                quantize: params.quantize,
                notation: 'auto',
                outputPort: params.outputPort,
                style: 'legato',
                gap: 100,
                timeSignature: [4, 4]
            };
            // Use the enhanced midi_play_phrase with the new notation system  
            const result = await this.midi_play_phrase(executeParams);
            return {
                success: true,
                imported: true,
                source: params.source,
                totalDuration: `${totalDuration.toFixed(2)} seconds`,
                noteCount: sequence.notes.length,
                executionResult: result,
                message: `Successfully imported and executed ${params.source} score`
            };
        }
        catch (error) {
            logger.error('Failed to import/execute score', {
                source: params.source,
                error: error instanceof Error ? error.message : error
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                source: params.source
            };
        }
    }
    // ========================
    // HELPER METHODS FOR SCORE PARSING
    // ========================
    parseTextNotation(data) {
        try {
            // Handle bar lines and clean up input
            const cleanData = data
                .replace(/\|/g, ' ') // Remove bar lines
                .replace(/\s+/g, ' ') // Normalize spaces
                .trim();
            const tokens = cleanData.split(' ').filter(token => token.length > 0);
            const notes = [];
            const rhythms = [];
            for (const token of tokens) {
                if (token.includes(':')) {
                    // Musical notation format: "C4:q"
                    const [note, durationCode] = token.split(':');
                    if (note && durationCode) {
                        notes.push(note);
                        // Convert duration codes to full names
                        const durationMap = {
                            'w': 'whole', 'h': 'half', 'q': 'quarter',
                            'e': 'eighth', 's': 'sixteenth', 't': 'thirty-second'
                        };
                        // Handle dotted notes
                        const isDotted = durationCode.endsWith('.');
                        const cleanCode = isDotted ? durationCode.slice(0, -1) : durationCode;
                        const baseDuration = durationMap[cleanCode] || 'quarter';
                        const finalDuration = isDotted ? `dotted-${baseDuration}` : baseDuration;
                        rhythms.push(finalDuration);
                    }
                }
                else if (token.toLowerCase() === 'rest' || token === 'r') {
                    notes.push('rest');
                    rhythms.push('quarter');
                }
                else {
                    // Simple note format: "C4"
                    notes.push(token);
                    rhythms.push('quarter'); // Default to quarter notes
                }
            }
            return { notes, rhythms };
        }
        catch (error) {
            throw new Error(`Failed to parse text notation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    parseGuitarTab(data) {
        try {
            // Basic guitar tablature parser
            // Format: "3-0-2-3" (frets on strings) or more complex tab notation
            const lines = data.split('\n').filter(line => line.trim().length > 0);
            const notes = [];
            const rhythms = [];
            // Standard guitar tuning (low to high): E2, A2, D3, G3, B3, E4
            const stringTuning = [
                Note.get('E2').midi || 40, // 6th string (lowest)
                Note.get('A2').midi || 45, // 5th string  
                Note.get('D3').midi || 50, // 4th string
                Note.get('G3').midi || 55, // 3rd string
                Note.get('B3').midi || 59, // 2nd string
                Note.get('E4').midi || 64 // 1st string (highest)
            ];
            for (const line of lines) {
                // Simple fret notation: "3-0-2-3" etc.
                if (line.includes('-')) {
                    const frets = line.split('-');
                    frets.forEach((fret, stringIndex) => {
                        const fretNum = parseInt(fret.trim());
                        if (!isNaN(fretNum) && fretNum >= 0 && stringIndex < stringTuning.length) {
                            const midiNote = stringTuning[5 - stringIndex] + fretNum; // Reverse string order
                            const noteName = Note.fromMidi(midiNote);
                            if (noteName) {
                                notes.push(noteName);
                                rhythms.push('quarter');
                            }
                        }
                    });
                }
            }
            if (notes.length === 0) {
                throw new Error('No valid guitar tablature found. Expected format: "3-0-2-3" (fret numbers separated by dashes)');
            }
            return { notes, rhythms };
        }
        catch (error) {
            throw new Error(`Failed to parse guitar tablature: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    calculateTotalDuration(sequence, bpm) {
        try {
            const quarterNoteDuration = 60 / bpm;
            const durationMap = {
                'whole': 4, 'half': 2, 'quarter': 1, 'eighth': 0.5, 'sixteenth': 0.25,
                'dotted-whole': 6, 'dotted-half': 3, 'dotted-quarter': 1.5, 'dotted-eighth': 0.75
            };
            let totalQuarterNotes = 0;
            for (const rhythm of sequence.rhythms) {
                totalQuarterNotes += durationMap[rhythm] || 1;
            }
            return totalQuarterNotes * quarterNoteDuration;
        }
        catch (error) {
            logger.warn('Failed to calculate duration, using default', { error });
            return sequence.notes.length * (60 / bpm); // Fallback: quarter notes
        }
    }
    /**
     * Convert duration names to Tone.js format
     */
    convertDurationToToneJS(duration) {
        const conversionMap = {
            'whole': '1n',
            'half': '2n',
            'quarter': '4n',
            'eighth': '8n',
            'sixteenth': '16n',
            'thirty-second': '32n',
            'dotted-whole': '1n.',
            'dotted-half': '2n.',
            'dotted-quarter': '4n.',
            'dotted-eighth': '8n.',
            'dotted-sixteenth': '16n.'
        };
        return conversionMap[duration] || '4n'; // Default to quarter note
    }
}
//# sourceMappingURL=mcp-tools-impl.js.map