/**
 * Musical Transformers - The 5 Required Functions
 *
 * Implements the core transformation functions required by the Tradutor:
 * 1. expandChord() - Real chord expansion with Tonal.js
 * 2. parseMusicalTime() - Convert musical notation to absolute time
 * 3. validateMusicTheory() - Re-export from validators
 * 4. normalizeVelocity() - Normalize velocity to 0-1 range
 * 5. calculateArticulation() - Apply articulation effects
 */
import { ChordVoicing } from '../../../schemas/music-schemas.js';
export { validateMusicTheory, validateMusicalConsistency } from './validators.js';
/**
 * 1. EXPAND CHORD - Convert chord symbols to individual notes with voicing
 */
export declare function expandChord(chord: string, voicing?: ChordVoicing | string, octave?: number): string[];
/**
 * 2. PARSE MUSICAL TIME - Convert musical notation to absolute time in seconds
 */
export declare function parseMusicalTime(time: string, bpm: number, timeSignature?: string): number;
/**
 * 3. VALIDATE MUSIC THEORY - Re-exported from validators module
 * (Already implemented in validators.ts)
 */
/**
 * 4. NORMALIZE VELOCITY - Convert various velocity formats to 0-1 range
 */
export declare function normalizeVelocity(velocity: number | string | undefined): number;
/**
 * 5. CALCULATE ARTICULATION - Apply articulation effects to duration and attack
 */
export interface ArticulationResult {
    effectiveDuration: number;
    type: 'legato' | 'staccato' | 'tenuto' | 'marcato' | 'accent' | 'sforzando';
    attackModifier: number;
    releaseModifier: number;
}
export declare function calculateArticulation(articulation: string | undefined, baseDuration: number): ArticulationResult;
/**
 * Additional utility function: Convert MIDI note to frequency
 */
export declare function midiToFrequency(midiNote: number): number;
/**
 * Additional utility function: Convert frequency to MIDI note
 */
export declare function frequencyToMidi(frequency: number): number;
/**
 * Additional utility function: Get note name from MIDI number
 */
export declare function midiToNoteName(midiNote: number): string;
export interface ParsedNote {
    note: string;
    duration: string;
    dotted?: boolean;
    tied?: boolean;
}
export interface PhraseOptions {
    notes: string;
    rhythm?: string | string[];
    notation?: 'auto' | 'simple' | 'musical';
    quantize?: boolean;
    beatPositions?: number[];
    timeSignature?: [number, number];
    tempo?: number;
}
/**
 * NEW: Parse notes with automatic format detection
 * Supports both "C4 E4 G4" and "C4:q E4:e G4:e" formats
 */
export declare function parseNotes(input: string, options?: Partial<PhraseOptions>): ParsedNote[];
/**
 * NEW: Parse musical notation format like "C4:q E4:e G4:h"
 */
export declare function parseMusicalNotation(input: string): ParsedNote[];
/**
 * NEW: Parse simple notation format like "C4 E4 G4" with optional rhythm array
 */
export declare function parseSimpleNotation(input: string, rhythm?: string | string[]): ParsedNote[];
/**
 * NEW: Calculate precise timing for parsed notes
 */
export declare function calculateNoteTiming(parsedNotes: ParsedNote[], bpm: number, timeSignature?: [number, number]): Array<{
    note: string;
    startTime: number;
    duration: number;
    velocity?: number;
}>;
/**
 * NEW: Quantize timing to musical grid
 */
export declare function quantizeToMusicalGrid(positions: number[], bpm: number, subdivision?: 'quarter' | 'eighth' | 'sixteenth'): number[];
//# sourceMappingURL=transformers.d.ts.map