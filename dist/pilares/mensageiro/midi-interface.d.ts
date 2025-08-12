/**
 * MIDI Interface - Direct communication with MIDI hardware/software
 * Handles low-level MIDI message sending using jzz library
 */
export interface MidiInterfaceStatus {
    hasActivePort: boolean;
    portName: string | null;
    lastMessageTime: number | null;
    messagesSent: number;
    errorsCount: number;
}
/**
 * Handles direct MIDI communication through jzz library
 */
export declare class MidiInterface {
    private activePort;
    private activePortName;
    private messagesSent;
    private errorsCount;
    private lastMessageTime;
    constructor();
    initialize(): Promise<void>;
    /**
     * Set the active MIDI output port
     */
    setActivePort(portName: string): Promise<void>;
    /**
     * Clear the active port and close connection
     */
    clearActivePort(): Promise<void>;
    /**
     * Ensure we have an active port for sending messages
     */
    private ensureActivePort;
    /**
     * Send MIDI Note On message
     */
    sendNoteOn(note: number, velocity: number, channel: number): void;
    /**
     * Send MIDI Note Off message
     */
    sendNoteOff(note: number, channel: number): void;
    /**
     * Send MIDI Control Change message
     */
    sendCC(controller: number, value: number, channel: number): void;
    /**
     * Send MIDI Program Change message
     */
    sendProgramChange(program: number, channel: number): void;
    /**
     * Send raw MIDI message (for advanced use cases)
     */
    sendRawMidiMessage(data: number[]): void;
    /**
     * Send System Exclusive (SysEx) message
     */
    sendSysEx(data: number[]): void;
    /**
     * Get current interface status
     */
    getStatus(): MidiInterfaceStatus;
    /**
     * Reset statistics
     */
    resetStats(): void;
    /**
     * Test the connection by sending a harmless message
     */
    testConnection(): Promise<boolean>;
    /**
     * Get latency estimate (basic implementation)
     */
    measureLatency(): Promise<number>;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=midi-interface.d.ts.map