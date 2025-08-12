/**
 * Pilar 3: O Mensageiro (MIDI Low-Level Interface)
 * Main entry point for MIDI communication layer
 *
 * Responsibilities:
 * - Direct communication with MIDI ports
 * - Connection and device management
 * - MIDI protocol translation
 * - Port status monitoring
 */
import JZZ from 'jzz';
import { MidiInterface } from './midi-interface.js';
import { logger } from '../../../utils/logger.js';
import { PortManager } from './port-manager.js';
import { ProtocolHandler } from './protocol.js';
import { ErrorCodes } from '../../../schemas/common-schemas.js';
import { MidiError } from '../../../types/index.js';
/**
 * Main Mensageiro implementation using jzz for cross-platform MIDI
 */
export class Mensageiro {
    midiInterface;
    portManager;
    protocolHandler;
    initialized = false;
    constructor() {
        this.midiInterface = new MidiInterface();
        this.portManager = new PortManager();
        this.protocolHandler = new ProtocolHandler();
    }
    /**
     * Initialize the MIDI system - must be called before other operations
     */
    async initialize() {
        try {
            logger.info('[Mensageiro] Initializing MIDI system...');
            // Initialize JZZ MIDI engine
            await JZZ().then(() => {
                console.log('[Mensageiro] JZZ MIDI engine initialized successfully');
            });
            await this.midiInterface.initialize();
            await this.portManager.initialize();
            this.initialized = true;
            console.log('[Mensageiro] MIDI system initialized successfully');
        }
        catch (error) {
            const midiError = new MidiError(`Failed to initialize MIDI system: ${error instanceof Error ? error.message : error}`, ErrorCodes.SYSTEM_INITIALIZATION_FAILED);
            console.error('[Mensageiro] Initialization failed:', midiError);
            throw midiError;
        }
    }
    /**
     * Ensure system is initialized before operations
     */
    ensureInitialized() {
        if (!this.initialized) {
            throw new MidiError('MIDI system not initialized. Call initialize() first.', ErrorCodes.SYSTEM_INITIALIZATION_FAILED);
        }
    }
    // Port Management API
    listPorts() {
        this.ensureInitialized();
        return this.portManager.listPorts();
    }
    async connectToPort(portName) {
        this.ensureInitialized();
        try {
            const success = this.portManager.connectToPort(portName);
            if (success) {
                // Connect the MIDI interface to the selected port
                const connectedPort = this.portManager.getConnectedPort();
                if (connectedPort) {
                    await this.midiInterface.setActivePort(connectedPort.name);
                }
            }
            return success;
        }
        catch (error) {
            console.error('[Mensageiro] Failed to connect to port:', error);
            return false;
        }
    }
    disconnectPort() {
        this.ensureInitialized();
        try {
            this.midiInterface.clearActivePort();
            this.portManager.disconnectPort();
            console.log('[Mensageiro] Disconnected from MIDI port');
        }
        catch (error) {
            console.error('[Mensageiro] Error during disconnect:', error);
        }
    }
    getConnectedPort() {
        this.ensureInitialized();
        return this.portManager.getConnectedPortName();
    }
    // Immediate MIDI Sending API
    sendNoteOn(note, velocity, channel) {
        this.ensureInitialized();
        try {
            // Validate parameters
            this.protocolHandler.validateNoteParameters(note, velocity, channel);
            // Convert normalized velocity (0-1) to MIDI velocity (0-127)
            const midiVelocity = this.protocolHandler.convertVelocity(velocity);
            // Send MIDI note on message
            this.midiInterface.sendNoteOn(note, midiVelocity, channel);
            console.log(`[Mensageiro] Note ON: ${note} vel:${midiVelocity} ch:${channel}`);
        }
        catch (error) {
            const midiError = error instanceof MidiError
                ? error
                : new MidiError(`Failed to send note on: ${error}`, ErrorCodes.MIDI_SEND_FAILED);
            console.error('[Mensageiro] Send note on failed:', midiError);
            throw midiError;
        }
    }
    sendNoteOff(note, channel) {
        this.ensureInitialized();
        try {
            this.protocolHandler.validateNoteParameters(note, 0, channel);
            this.midiInterface.sendNoteOff(note, channel);
            console.log(`[Mensageiro] Note OFF: ${note} ch:${channel}`);
        }
        catch (error) {
            const midiError = error instanceof MidiError
                ? error
                : new MidiError(`Failed to send note off: ${error}`, ErrorCodes.MIDI_SEND_FAILED);
            console.error('[Mensageiro] Send note off failed:', midiError);
            throw midiError;
        }
    }
    sendCC(controller, value, channel) {
        this.ensureInitialized();
        try {
            this.protocolHandler.validateCCParameters(controller, value, channel);
            this.midiInterface.sendCC(controller, value, channel);
            console.log(`[Mensageiro] CC: ${controller} val:${value} ch:${channel}`);
        }
        catch (error) {
            const midiError = error instanceof MidiError
                ? error
                : new MidiError(`Failed to send CC: ${error}`, ErrorCodes.MIDI_SEND_FAILED);
            console.error('[Mensageiro] Send CC failed:', midiError);
            throw midiError;
        }
    }
    sendProgramChange(program, channel) {
        this.ensureInitialized();
        try {
            this.protocolHandler.validateProgramChangeParameters(program, channel);
            this.midiInterface.sendProgramChange(program, channel);
            console.log(`[Mensageiro] Program Change: ${program} ch:${channel}`);
        }
        catch (error) {
            const midiError = error instanceof MidiError
                ? error
                : new MidiError(`Failed to send program change: ${error}`, ErrorCodes.MIDI_SEND_FAILED);
            console.error('[Mensageiro] Send program change failed:', midiError);
            throw midiError;
        }
    }
    // Utility Functions
    sendAllNotesOff(channel) {
        this.ensureInitialized();
        try {
            if (channel !== undefined) {
                this.protocolHandler.validateChannelParameter(channel);
                // Send All Notes Off CC (123) for specific channel
                this.midiInterface.sendCC(123, 0, channel);
                console.log(`[Mensageiro] All Notes Off sent to channel ${channel}`);
            }
            else {
                // Send to all channels
                for (let ch = 1; ch <= 16; ch++) {
                    this.midiInterface.sendCC(123, 0, ch);
                }
                console.log('[Mensageiro] All Notes Off sent to all channels');
            }
        }
        catch (error) {
            console.error('[Mensageiro] Failed to send All Notes Off:', error);
        }
    }
    sendPanic() {
        this.ensureInitialized();
        try {
            console.log('[Mensageiro] PANIC - Emergency stop initiated');
            // Send emergency stop to all channels
            for (let channel = 1; channel <= 16; channel++) {
                // All Sound Off (CC 120)
                this.midiInterface.sendCC(120, 0, channel);
                // All Notes Off (CC 123)
                this.midiInterface.sendCC(123, 0, channel);
                // Reset All Controllers (CC 121)
                this.midiInterface.sendCC(121, 0, channel);
                // Send individual note off for all notes as backup
                for (let note = 0; note <= 127; note++) {
                    this.midiInterface.sendNoteOff(note, channel);
                }
            }
            console.log('[Mensageiro] PANIC complete - All MIDI activity stopped');
        }
        catch (error) {
            console.error('[Mensageiro] PANIC failed:', error);
            // Even if panic fails, we should try to log the issue
        }
    }
    /**
     * Get current system status for health checks
     */
    getSystemStatus() {
        this.ensureInitialized();
        return {
            initialized: this.initialized,
            connectedPort: this.getConnectedPort(),
            availablePorts: this.listPorts().length,
            portManagerStatus: this.portManager.getStatus(),
            midiInterfaceStatus: this.midiInterface.getStatus()
        };
    }
    /**
     * Cleanup resources when shutting down
     */
    async cleanup() {
        try {
            console.log('[Mensageiro] Starting cleanup...');
            // Send panic to stop all MIDI activity only if we're connected
            if (this.initialized && this.getConnectedPort()) {
                try {
                    this.sendPanic();
                }
                catch (error) {
                    console.warn('[Mensageiro] Panic during cleanup failed:', error);
                }
            }
            // Cleanup components
            await this.midiInterface.cleanup();
            await this.portManager.cleanup();
            this.initialized = false;
            console.log('[Mensageiro] Cleanup completed');
        }
        catch (error) {
            console.error('[Mensageiro] Cleanup error:', error);
        }
    }
}
// Export singleton instance
export const mensageiro = new Mensageiro();
// Export for dependency injection
export default Mensageiro;
//# sourceMappingURL=index.js.map