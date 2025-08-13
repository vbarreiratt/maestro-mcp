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
//# sourceMappingURL=hybrid-notation-parser.d.ts.map