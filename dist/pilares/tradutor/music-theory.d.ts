/**
 * Real Music Theory Implementation using Tonal.js
 *
 * Provides sophisticated musical intelligence for chord progressions,
 * harmonic analysis, scale relationships, and musical transformations.
 */
import { ChordVoicing } from '../../schemas/music-schemas.js';
/**
 * Advanced chord expansion with multiple voicing options
 */
export declare function expandChordAdvanced(chord: string, voicing?: ChordVoicing, octave?: number): string[];
/**
 * Analyze chord progression for musical validity
 */
export declare function analyzeProgression(chords: string[], key?: string): {
    isValid: boolean;
    analysis: string[];
    romanNumerals: string[];
    recommendations?: string[];
};
/**
 * Generate scale for musical context
 */
export declare function generateScale(scaleName: string, octave?: number): string[];
/**
 * Transpose musical elements
 */
export declare function transposeChord(chord: string, interval: string): string;
/**
 * Find enharmonic equivalents
 */
export declare function findEnharmonics(note: string): string[];
/**
 * Musical interval calculations
 */
export declare function calculateInterval(note1: string, note2: string): {
    semitones: number;
    name: string;
    quality: string;
};
/**
 * Check if notes form a valid chord
 */
export declare function identifyChord(notes: string[]): {
    chord: string | null;
    confidence: number;
    alternatives: string[];
};
export declare const CIRCLE_OF_FIFTHS: string[];
export declare const COMMON_CHORD_PROGRESSIONS: {
    'ii-V-I': string[];
    'I-vi-IV-V': string[];
    'vi-IV-I-V': string[];
    'I-V-vi-IV': string[];
};
//# sourceMappingURL=music-theory.d.ts.map