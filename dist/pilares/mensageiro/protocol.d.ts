/**
 * Protocol Handler - MIDI protocol validation and utility functions
 * Handles MIDI message validation, conversions, and protocol compliance
 */
/**
 * MIDI Protocol constants and validation
 */
export declare class ProtocolHandler {
    static readonly MIDI_NOTE_MIN = 0;
    static readonly MIDI_NOTE_MAX = 127;
    static readonly MIDI_VELOCITY_MIN = 0;
    static readonly MIDI_VELOCITY_MAX = 127;
    static readonly MIDI_CC_MIN = 0;
    static readonly MIDI_CC_MAX = 127;
    static readonly MIDI_CHANNEL_MIN = 1;
    static readonly MIDI_CHANNEL_MAX = 16;
    static readonly MIDI_PROGRAM_MIN = 0;
    static readonly MIDI_PROGRAM_MAX = 127;
    static readonly VELOCITY_NORMALIZED_MIN = 0;
    static readonly VELOCITY_NORMALIZED_MAX = 1;
    constructor();
    /**
     * Validate MIDI note parameters
     */
    validateNoteParameters(note: number, velocity: number, channel: number): void;
    /**
     * Validate MIDI Control Change parameters
     */
    validateCCParameters(controller: number, value: number, channel: number): void;
    /**
     * Validate MIDI Program Change parameters
     */
    validateProgramChangeParameters(program: number, channel: number): void;
    /**
     * Validate MIDI note number (0-127)
     */
    validateNote(note: number): void;
    /**
     * Validate normalized velocity (0.0-1.0)
     */
    validateNormalizedVelocity(velocity: number): void;
    /**
     * Validate MIDI velocity (0-127)
     */
    validateMidiVelocity(velocity: number): void;
    /**
     * Validate MIDI channel (1-16)
     */
    validateChannel(channel: number): void;
    /**
     * Validate MIDI controller number (0-127)
     */
    validateController(controller: number): void;
    /**
     * Validate MIDI CC value (0-127)
     */
    validateCCValue(value: number): void;
    /**
     * Validate MIDI program number (0-127)
     */
    validateProgram(program: number): void;
    /**
     * Validate channel parameter (used for utility functions)
     */
    validateChannelParameter(channel: number): void;
    /**
     * Convert normalized velocity (0-1) to MIDI velocity (0-127)
     */
    convertVelocity(normalizedVelocity: number): number;
    /**
     * Convert MIDI velocity (0-127) to normalized velocity (0-1)
     */
    convertVelocityToNormalized(midiVelocity: number): number;
    /**
     * Convert note name (e.g., "C4") to MIDI note number
     */
    convertNoteNameToMidi(noteName: string): number;
    /**
     * Convert MIDI note number to note name (e.g., 60 -> "C4")
     */
    convertMidiToNoteName(midiNote: number): string;
    /**
     * Get controller name from CC number
     */
    getControllerName(controller: number): string;
    /**
     * Check if a controller is a continuous controller (0-127 range)
     */
    isContinuousController(controller: number): boolean;
    /**
     * Check if a controller is a switch controller (on/off)
     */
    isSwitchController(controller: number): boolean;
    /**
     * Get recommended value range for a controller
     */
    getControllerValueRange(controller: number): {
        min: number;
        max: number;
        type: 'continuous' | 'switch';
    };
    /**
     * Create a MIDI message byte array
     */
    createMidiMessage(status: number, data1?: number, data2?: number): number[];
    /**
     * Create Note On message bytes
     */
    createNoteOnMessage(channel: number, note: number, velocity: number): number[];
    /**
     * Create Note Off message bytes
     */
    createNoteOffMessage(channel: number, note: number): number[];
    /**
     * Create Control Change message bytes
     */
    createCCMessage(channel: number, controller: number, value: number): number[];
    /**
     * Create Program Change message bytes
     */
    createProgramChangeMessage(channel: number, program: number): number[];
    /**
     * Parse MIDI message bytes to readable format
     */
    parseMidiMessage(bytes: number[]): string;
}
//# sourceMappingURL=protocol.d.ts.map