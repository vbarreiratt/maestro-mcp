/**
 * Real Music Theory Implementation using Tonal.js
 * 
 * Provides sophisticated musical intelligence for chord progressions,
 * harmonic analysis, scale relationships, and musical transformations.
 */

import Chord from '@tonaljs/chord';
import Note from '@tonaljs/note';
import Scale from '@tonaljs/scale';
import Key from '@tonaljs/key';
import { ChordVoicing } from '../../../schemas/music-schemas.js';
import { logger } from '../../../utils/logger.js';

/**
 * Advanced chord expansion with multiple voicing options
 */
export function expandChordAdvanced(
  chord: string, 
  voicing: ChordVoicing = 'close', 
  octave: number = 4
): string[] {
  try {
    const chordInfo = Chord.get(chord);
    
    if (!chordInfo.notes || chordInfo.notes.length === 0) {
      throw new Error(`Invalid or unrecognized chord: ${chord}`);
    }

    logger.debug('Expanding chord', { chord, voicing, octave, chordInfo: chordInfo.symbol });

    let notes = chordInfo.notes;

    // Apply voicing transformations
    switch (voicing) {
      case 'close':
        // All notes within an octave
        notes = notes.map((note: string, index: number) => `${note}${octave + Math.floor(index / 7)}`);
        break;

      case 'open':
        // Spread notes across multiple octaves
        notes = notes.map((note: string, index: number) => {
          const oct = octave + Math.floor(index / 3);
          return `${note}${oct}`;
        });
        break;

      case 'drop2':
        // Move second highest note down an octave
        if (notes.length >= 3) {
          const bass = `${notes[0]}${octave}`;
          const middle = `${notes[notes.length - 2]}${octave}`;
          const top = `${notes[notes.length - 1]}${octave + 1}`;
          const others = notes.slice(1, -2).map(note => `${note}${octave + 1}`);
          notes = [bass, middle, ...others, top];
        } else {
          notes = notes.map((note, index) => `${note}${octave + Math.floor(index / 2)}`);
        }
        break;

      case 'drop3':
        // Move third highest note down an octave
        if (notes.length >= 4) {
          const bass = `${notes[0]}${octave}`;
          const drop = `${notes[notes.length - 3]}${octave}`;
          const middle = `${notes[notes.length - 2]}${octave + 1}`;
          const top = `${notes[notes.length - 1]}${octave + 1}`;
          const others = notes.slice(1, -3).map(note => `${note}${octave + 1}`);
          notes = [bass, drop, ...others, middle, top];
        } else {
          notes = notes.map((note, index) => `${note}${octave + Math.floor(index / 2)}`);
        }
        break;

      case 'quartal':
        // Build in fourths instead of thirds
        const root = notes[0];
        if (root) {
          const rootNote = Note.get(root);
          notes = [
            `${root}${octave}`,
            `${Note.transpose(rootNote.name, '4P')}${octave}`,
            `${Note.transpose(rootNote.name, '7m')}${octave + 1}`,
            `${Note.transpose(rootNote.name, '10M')}${octave + 1}`
          ].filter(n => n !== 'undefined');
        }
        break;

      case 'rootless':
        // Omit root note (common in jazz)
        notes = notes.slice(1).map((note, index) => `${note}${octave + Math.floor(index / 3)}`);
        break;

      case 'shell':
        // Only root, 3rd, and 7th (if available)
        if (notes.length >= 3) {
          const shell = [notes[0], notes[2]]; // root and 3rd
          if (notes.length >= 4) shell.push(notes[3]); // add 7th if available
          notes = shell.map((note, index) => `${note}${octave + Math.floor(index / 2)}`);
        } else {
          notes = notes.map((note, index) => `${note}${octave + Math.floor(index / 2)}`);
        }
        break;

      default:
        logger.warn('Unknown voicing type, using close voicing', { voicing });
        notes = notes.map((note, index) => `${note}${octave + Math.floor(index / 7)}`);
    }

    // Validate all generated notes
    const validNotes = notes.filter(note => {
      const midiNote = Note.midi(note);
      return midiNote !== null && midiNote >= 0 && midiNote <= 127;
    });

    if (validNotes.length === 0) {
      throw new Error(`No valid MIDI notes generated for chord ${chord} with voicing ${voicing}`);
    }

    logger.debug('Chord expanded successfully', { 
      chord, 
      voicing, 
      generatedNotes: validNotes.length,
      notes: validNotes 
    });

    return validNotes;

  } catch (error) {
    logger.error('Chord expansion failed', { chord, voicing, octave, error });
    throw new Error(`Failed to expand chord ${chord}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Analyze chord progression for musical validity
 */
export function analyzeProgression(chords: string[], key?: string): {
  isValid: boolean;
  analysis: string[];
  romanNumerals: string[];
  recommendations?: string[];
} {
  try {
    const keyInfo = key ? Key.majorKey(key) : Key.majorKey('C');
    const analysis: string[] = [];
    const romanNumerals: string[] = [];
    let isValid = true;

    for (const chord of chords) {
      const chordInfo = Chord.get(chord);
      
      if (!chordInfo.notes || chordInfo.notes.length === 0) {
        analysis.push(`Invalid chord: ${chord}`);
        romanNumerals.push('?');
        isValid = false;
        continue;
      }

      // Find chord function in key
      const chordRoot = chordInfo.tonic;
      if (chordRoot && keyInfo.scale) {
        const degreeIndex = keyInfo.scale.indexOf(chordRoot);
        if (degreeIndex !== -1) {
          const romanNumeral = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'][degreeIndex];
          romanNumerals.push(romanNumeral || '?');
          analysis.push(`${chord} = ${romanNumeral} in ${key || 'C major'}`);
        } else {
          // Secondary dominant or borrowed chord
          romanNumerals.push('sec');
          analysis.push(`${chord} = secondary/borrowed chord`);
        }
      } else {
        romanNumerals.push('?');
        analysis.push(`${chord} = analysis unclear`);
      }
    }

    return {
      isValid,
      analysis,
      romanNumerals,
      ...(isValid ? {} : { recommendations: ['Check chord spellings', 'Consider enharmonic equivalents'] })
    };

  } catch (error) {
    logger.error('Progression analysis failed', { chords, key, error });
    return {
      isValid: false,
      analysis: ['Analysis failed due to error'],
      romanNumerals: chords.map(() => '?'),
      recommendations: ['Verify chord notation', 'Check key signature']
    };
  }
}

/**
 * Generate scale for musical context
 */
export function generateScale(scaleName: string, octave: number = 4): string[] {
  try {
    const scale = Scale.get(scaleName);
    
    if (!scale.notes || scale.notes.length === 0) {
      throw new Error(`Invalid or unrecognized scale: ${scaleName}`);
    }

    // Generate notes across the specified octave
    const scaleNotes = scale.notes.map(note => `${note}${octave}`);
    
    // Add octave note
    if (scale.notes[0]) {
      scaleNotes.push(`${scale.notes[0]}${octave + 1}`);
    }

    logger.debug('Scale generated', { scaleName, octave, noteCount: scaleNotes.length });

    return scaleNotes;

  } catch (error) {
    logger.error('Scale generation failed', { scaleName, octave, error });
    throw new Error(`Failed to generate scale ${scaleName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Transpose musical elements
 */
export function transposeChord(chord: string, interval: string): string {
  try {
    const chordInfo = Chord.get(chord);
    
    if (!chordInfo.tonic) {
      throw new Error(`Cannot transpose invalid chord: ${chord}`);
    }

    const newRoot = Note.transpose(chordInfo.tonic, interval);
    const newChord = `${newRoot}${chordInfo.aliases[0]?.replace(chordInfo.tonic, '') || ''}`;
    
    logger.debug('Chord transposed', { original: chord, interval, result: newChord });
    
    return newChord;

  } catch (error) {
    logger.error('Chord transposition failed', { chord, interval, error });
    throw new Error(`Failed to transpose chord ${chord} by ${interval}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Find enharmonic equivalents
 */
export function findEnharmonics(note: string): string[] {
  try {
    const noteInfo = Note.get(note);
    
    if (!noteInfo.name) {
      throw new Error(`Invalid note: ${note}`);
    }

    const enharmonics = Note.enharmonic(noteInfo.name);
    return enharmonics ? [noteInfo.name, enharmonics] : [noteInfo.name];

  } catch (error) {
    logger.error('Enharmonic search failed', { note, error });
    return [note]; // Return original note if error
  }
}

/**
 * Musical interval calculations
 */
export function calculateInterval(note1: string, note2: string): {
  semitones: number;
  name: string;
  quality: string;
} {
  try {
    const midi1 = Note.midi(note1);
    const midi2 = Note.midi(note2);
    
    if (midi1 === null || midi2 === null) {
      throw new Error(`Invalid notes for interval calculation: ${note1}, ${note2}`);
    }

    const semitones = Math.abs(midi2 - midi1);
    
    // Basic interval names (can be expanded)
    const intervalNames: Record<number, { name: string; quality: string }> = {
      0: { name: 'unison', quality: 'perfect' },
      1: { name: 'minor 2nd', quality: 'minor' },
      2: { name: 'major 2nd', quality: 'major' },
      3: { name: 'minor 3rd', quality: 'minor' },
      4: { name: 'major 3rd', quality: 'major' },
      5: { name: 'perfect 4th', quality: 'perfect' },
      6: { name: 'tritone', quality: 'augmented' },
      7: { name: 'perfect 5th', quality: 'perfect' },
      8: { name: 'minor 6th', quality: 'minor' },
      9: { name: 'major 6th', quality: 'major' },
      10: { name: 'minor 7th', quality: 'minor' },
      11: { name: 'major 7th', quality: 'major' },
      12: { name: 'octave', quality: 'perfect' }
    };

    const intervalInfo = intervalNames[semitones % 12] || { name: 'compound', quality: 'complex' };

    return {
      semitones,
      name: intervalInfo.name,
      quality: intervalInfo.quality
    };

  } catch (error) {
    logger.error('Interval calculation failed', { note1, note2, error });
    throw new Error(`Failed to calculate interval between ${note1} and ${note2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if notes form a valid chord
 */
export function identifyChord(notes: string[]): {
  chord: string | null;
  confidence: number;
  alternatives: string[];
} {
  try {
    if (notes.length < 2) {
      return { chord: null, confidence: 0, alternatives: [] };
    }

    // Convert to note names without octaves
    const noteNames = notes.map(note => Note.pitchClass(note)).filter(Boolean);
    
    if (noteNames.length === 0) {
      return { chord: null, confidence: 0, alternatives: [] };
    }

    // Try to detect chord
    const detected = Chord.detect(noteNames);
    
    if (detected.length === 0) {
      return { chord: null, confidence: 0, alternatives: [] };
    }

    // Return best match with confidence based on note count match
    const bestMatch = detected[0];
    const chordInfo = bestMatch ? Chord.get(bestMatch) : null;
    const confidence = chordInfo && chordInfo.notes ? 
      Math.min(noteNames.length / chordInfo.notes.length, 1) : 0;

    return {
      chord: bestMatch || null,
      confidence,
      alternatives: detected.slice(1, 4) // Top 3 alternatives
    };

  } catch (error) {
    logger.error('Chord identification failed', { notes, error });
    return { chord: null, confidence: 0, alternatives: [] };
  }
}

// Export commonly used constants
export const CIRCLE_OF_FIFTHS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

export const COMMON_CHORD_PROGRESSIONS = {
  'ii-V-I': ['Dm7', 'G7', 'Cmaj7'],
  'I-vi-IV-V': ['C', 'Am', 'F', 'G'],
  'vi-IV-I-V': ['Am', 'F', 'C', 'G'],
  'I-V-vi-IV': ['C', 'G', 'Am', 'F']
};