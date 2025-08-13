/**
 * Hybrid Musical Notation Parser
 * Parses hybrid notation format: "A4:q@0.8.leg B4:e | C4:h"
 * Maintains full compatibility with legacy formats
 */
export interface ParsedNote {
    note: string;
    midiNote: number;
    duration: number;
    velocity: number;
    articulation: number;
    measureIndex: number;
    beatPosition: number;
    absoluteTime: number;
    isChord: boolean;
    chordNotes: string[] | undefined;
    chordMidiNotes: number[] | undefined;
}
export interface GlobalDefaults {
    bpm: number;
    velocity: number;
    articulation: number;
    timeSignature: string;
    swing: number;
    reverb: number;
    transpose: number;
}
export interface Voice {
    channel: number;
    notes: string;
    velocity?: number;
    articulation?: number;
    transpose?: number;
}
export interface MultiVoiceInput {
    voices: Voice[];
    bpm: number;
    timeSignature?: string;
    key?: string;
    velocity?: number;
    articulation?: number;
    reverb?: number;
    swing?: number;
    transpose?: number;
}
export interface VoiceResult {
    channel: number;
    parsedNotes: ParsedNote[];
    totalDuration: number;
}
/**
 * Main parser function for hybrid notation
 * Parses full notation string with measures, notes, and all parameters
 */
export declare function parseHybridNotation(notes: string, globalDefaults: GlobalDefaults): ParsedNote[];
/**
 * Detect input format automatically
 */
export declare function detectInputFormat(input: any): 'hybrid' | 'legacy';
/**
 * Calculate total duration of parsed notes
 */
export declare function calculateTotalDuration(parsedNotes: ParsedNote[], bpm: number): number;
/**
 * Apply audio effects to parsed notes
 */
export declare function applyEffects(parsedNotes: ParsedNote[], effects: {
    reverb?: number;
    swing?: number;
    transpose?: number;
}): ParsedNote[];
/**
 * Detects if input uses multi-voice format
 * @param input - input object to analyze
 * @returns true if multi-voice format detected
 */
export declare function isMultiVoiceInput(input: any): input is MultiVoiceInput;
/**
 * Parses multi-voice notation with independent channels
 * @param multiVoiceInput - input with voices array
 * @returns array of voice results with parsed notes per channel
 */
export declare function parseMultiVoice(multiVoiceInput: MultiVoiceInput): VoiceResult[];
/**
 * Enhanced detection that supports both single-voice and multi-voice formats
 */
export declare function detectNotationFormat(input: any): 'hybrid' | 'multi-voice' | 'legacy';
/**
 * Unified parsing function that handles both single-voice and multi-voice inputs
 */
export declare function parseUnifiedNotation(input: any): VoiceResult[];
//# sourceMappingURL=hybrid-notation-parser.d.ts.map