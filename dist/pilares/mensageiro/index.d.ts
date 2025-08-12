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
import { MensageiroMIDI } from '../../types/index.js';
import type { MidiPort } from '../../types/index.js';
/**
 * Main Mensageiro implementation using jzz for cross-platform MIDI
 */
export declare class Mensageiro implements MensageiroMIDI {
    private midiInterface;
    private portManager;
    private protocolHandler;
    private initialized;
    constructor();
    /**
     * Initialize the MIDI system - must be called before other operations
     */
    initialize(): Promise<void>;
    /**
     * Ensure system is initialized before operations
     */
    private ensureInitialized;
    listPorts(): MidiPort[];
    connectToPort(portName: string): Promise<boolean>;
    disconnectPort(): void;
    getConnectedPort(): string | null;
    sendNoteOn(note: number, velocity: number, channel: number): void;
    sendNoteOff(note: number, channel: number): void;
    sendCC(controller: number, value: number, channel: number): void;
    sendProgramChange(program: number, channel: number): void;
    sendAllNotesOff(channel?: number): void;
    sendPanic(): void;
    /**
     * Get current system status for health checks
     */
    getSystemStatus(): {
        initialized: boolean;
        connectedPort: string | null;
        availablePorts: number;
        portManagerStatus: import("./port-manager.js").PortManagerStatus;
        midiInterfaceStatus: import("./midi-interface.js").MidiInterfaceStatus;
    };
    /**
     * Cleanup resources when shutting down
     */
    cleanup(): Promise<void>;
}
export declare const mensageiro: Mensageiro;
export default Mensageiro;
//# sourceMappingURL=index.d.ts.map