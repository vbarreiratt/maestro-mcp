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

import Note from '@tonaljs/note';
import Chord from '@tonaljs/chord';
import { ChordVoicing } from '../../../schemas/music-schemas.js';
import { expandChordAdvanced } from './music-theory.js';
// Import validation functions for re-export
import { logger } from '../../../utils/logger.js';

// Re-export validation functions to meet interface requirements
export { validateMusicTheory, validateMusicalConsistency } from './validators.js';

/**
 * 1. EXPAND CHORD - Convert chord symbols to individual notes with voicing
 */
export function expandChord(
  chord: string, 
  voicing: ChordVoicing | string = 'close', 
  octave: number = 4
): string[] {
  try {
    logger.debug('Expanding chord', { chord, voicing, octave });

    // Validate inputs
    if (!chord || typeof chord !== 'string') {
      throw new Error(`Invalid chord: ${chord}`);
    }

    if (octave < 0 || octave > 10) {
      throw new Error(`Octave ${octave} outside valid range (0-10)`);
    }

    // Use advanced chord expansion from music-theory module
    const normalizedVoicing = voicing as ChordVoicing;
    const expandedNotes = expandChordAdvanced(chord, normalizedVoicing, octave);

    logger.debug('Chord expansion successful', { 
      chord, 
      voicing, 
      notes: expandedNotes.length,
      result: expandedNotes 
    });

    return expandedNotes;

  } catch (error) {
    logger.error('Chord expansion failed', { chord, voicing, octave, error });
    
    // Fallback: try basic chord expansion
    try {
      const chordInfo = Chord.get(chord);
      if (chordInfo.notes && chordInfo.notes.length > 0) {
        return chordInfo.notes.map((note: string, index: number) => `${note}${octave + Math.floor(index / 7)}`);
      }
    } catch (fallbackError) {
      logger.error('Fallback chord expansion also failed', { fallbackError });
    }

    throw new Error(`Failed to expand chord ${chord}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 2. PARSE MUSICAL TIME - Convert musical notation to absolute time in seconds
 */
export function parseMusicalTime(
  time: string, 
  bpm: number, 
  timeSignature: string = '4/4'
): number {
  try {
    logger.debug('Parsing musical time', { time, bpm, timeSignature });

    // Validate inputs
    if (!time || typeof time !== 'string') {
      throw new Error(`Invalid time format: ${time}`);
    }

    if (bpm <= 0 || bpm > 300) {
      throw new Error(`Invalid BPM: ${bpm}`);
    }

    // Parse time signature
    const [numerator, denominator] = timeSignature.split('/').map(Number);
    if (!numerator || !denominator || numerator <= 0 || denominator <= 0) {
      throw new Error(`Invalid time signature: ${timeSignature}`);
    }

    let absoluteTime = 0;

    if (time.includes(':')) {
      // Handle bar:beat:subdivision format
      absoluteTime = parseBarBeatTime(time, bpm, numerator);
    } else if (time.match(/^\d+[ndt]\.?$/)) {
      // Handle musical note duration format
      absoluteTime = parseNoteDuration(time, bpm);
    } else {
      throw new Error(`Unrecognized time format: ${time}`);
    }

    if (absoluteTime < 0) {
      throw new Error(`Calculated negative time: ${absoluteTime}`);
    }

    logger.debug('Musical time parsed successfully', { 
      time, 
      bpm, 
      timeSignature, 
      result: absoluteTime 
    });

    return absoluteTime;

  } catch (error) {
    logger.error('Musical time parsing failed', { time, bpm, timeSignature, error });
    throw new Error(`Failed to parse musical time ${time}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse bar:beat:subdivision format
 */
function parseBarBeatTime(time: string, bpm: number, timeSigNumerator: number): number {
  const parts = time.split(':').map(Number);
  
  if (parts.length === 2) {
    // Format: "beat:subdivision"
    const [beat, subdivision] = parts;
    if (beat === undefined || subdivision === undefined) {
      throw new Error(`Invalid beat:subdivision format: ${time}`);
    }
    return (beat + subdivision / 100) * (60 / bpm);
    
  } else if (parts.length === 3) {
    // Format: "bar:beat:subdivision"  
    const [bar, beat, subdivision] = parts;
    if (bar === undefined || beat === undefined || subdivision === undefined) {
      throw new Error(`Invalid bar:beat:subdivision format: ${time}`);
    }
    
    // Validate beat is within time signature
    if (beat >= timeSigNumerator) {
      throw new Error(`Beat ${beat} exceeds time signature numerator ${timeSigNumerator}`);
    }
    
    return (bar * timeSigNumerator + beat + subdivision / 100) * (60 / bpm);
    
  } else {
    throw new Error(`Invalid bar:beat format: ${time} (expected 2 or 3 parts)`);
  }
}

/**
 * Parse musical note duration (4n, 8t, 2n., etc.)
 */
function parseNoteDuration(notation: string, bpm: number): number {
  const match = notation.match(/^(\d+)([ndt])(\.?)$/);
  if (!match) {
    throw new Error(`Invalid note duration format: ${notation}`);
  }

  const [, valueStr, type, dotted] = match;
  
  if (!valueStr || !type) {
    throw new Error(`Invalid duration components: ${notation}`);
  }

  const noteValue = parseInt(valueStr);
  if (noteValue <= 0 || noteValue > 64) {
    throw new Error(`Note value ${noteValue} outside valid range (1-64)`);
  }

  // Calculate base duration in seconds
  let seconds = (60 / bpm) * (4 / noteValue);

  // Apply modifiers
  switch (type) {
    case 'n':
      // Normal note duration - no change
      break;
    case 't':
      // Triplet - 2/3 of normal duration
      seconds *= 2/3;
      break;
    case 'd':
      // Dotted note equivalent - 3/2 of normal
      seconds *= 3/2;
      break;
    default:
      throw new Error(`Unknown duration type: ${type}`);
  }

  // Apply musical dot (adds half the note value)
  if (dotted === '.') {
    seconds *= 1.5;
  }

  return seconds;
}

/**
 * 3. VALIDATE MUSIC THEORY - Re-exported from validators module
 * (Already implemented in validators.ts)
 */

/**
 * 4. NORMALIZE VELOCITY - Convert various velocity formats to 0-1 range
 */
export function normalizeVelocity(velocity: number | string | undefined): number {
  try {
    // Handle undefined/null
    if (velocity === undefined || velocity === null) {
      return 0.8; // Default moderate velocity
    }

    let normalizedVelocity: number;

    if (typeof velocity === 'string') {
      // Handle string descriptors
      const velocityMap: Record<string, number> = {
        'ppp': 0.1, 'pp': 0.2, 'p': 0.35, 'mp': 0.5,
        'mf': 0.65, 'f': 0.8, 'ff': 0.9, 'fff': 1.0,
        'pianissimo': 0.2, 'piano': 0.35, 'mezzo-piano': 0.5,
        'mezzo-forte': 0.65, 'forte': 0.8, 'fortissimo': 0.9,
        'soft': 0.3, 'medium': 0.6, 'loud': 0.85,
        'whisper': 0.15, 'normal': 0.7, 'accent': 0.95
      };

      const lowerVelocity = velocity.toLowerCase();
      if (lowerVelocity in velocityMap) {
        normalizedVelocity = velocityMap[lowerVelocity] || 0.8;
      } else {
        // Try to parse as number string
        const parsed = parseFloat(velocity);
        if (isNaN(parsed)) {
          logger.warn('Unknown velocity descriptor, using default', { velocity });
          normalizedVelocity = 0.8;
        } else {
          normalizedVelocity = parsed;
        }
      }
    } else if (typeof velocity === 'number') {
      normalizedVelocity = velocity;
    } else {
      throw new Error(`Invalid velocity type: ${typeof velocity}`);
    }

    // Normalize different input ranges
    if (normalizedVelocity > 1) {
      if (normalizedVelocity <= 127) {
        // MIDI range (0-127) -> normalize to 0-1
        normalizedVelocity = normalizedVelocity / 127;
      } else {
        throw new Error(`Velocity ${normalizedVelocity} outside all valid ranges`);
      }
    }

    // Clamp to valid range
    normalizedVelocity = Math.max(0, Math.min(1, normalizedVelocity));

    logger.debug('Velocity normalized', { 
      input: velocity, 
      output: normalizedVelocity 
    });

    return normalizedVelocity;

  } catch (error) {
    logger.error('Velocity normalization failed', { velocity, error });
    return 0.8; // Safe fallback
  }
}

/**
 * 5. CALCULATE ARTICULATION - Apply articulation effects to duration and attack
 */
export interface ArticulationResult {
  effectiveDuration: number;
  type: 'legato' | 'staccato' | 'tenuto' | 'marcato' | 'accent' | 'sforzando';
  attackModifier: number; // Velocity multiplier
  releaseModifier: number; // Note-off velocity modifier
}

export function calculateArticulation(
  articulation: string | undefined, 
  baseDuration: number
): ArticulationResult {
  try {
    logger.debug('Calculating articulation', { articulation, baseDuration });

    // Validate inputs
    if (baseDuration <= 0) {
      throw new Error(`Invalid base duration: ${baseDuration}`);
    }

    const articulationType = (articulation || 'legato').toLowerCase();

    let effectiveDuration = baseDuration;
    let attackModifier = 1.0;
    let releaseModifier = 1.0;
    let normalizedType: ArticulationResult['type'] = 'legato';

    switch (articulationType) {
      case 'legato':
        // Smooth, connected - full duration
        effectiveDuration = baseDuration * 0.98; // Slight overlap prevention
        attackModifier = 1.0;
        releaseModifier = 0.9;
        normalizedType = 'legato';
        break;

      case 'staccato':
        // Short, detached - half duration
        effectiveDuration = baseDuration * 0.5;
        attackModifier = 1.1;
        releaseModifier = 1.2;
        normalizedType = 'staccato';
        break;

      case 'tenuto':
        // Held for full value - emphasize sustain
        effectiveDuration = baseDuration * 0.95;
        attackModifier = 1.0;
        releaseModifier = 0.8;
        normalizedType = 'tenuto';
        break;

      case 'marcato':
        // Marked, stressed - full duration with accent
        effectiveDuration = baseDuration * 0.9;
        attackModifier = 1.3;
        releaseModifier = 1.1;
        normalizedType = 'marcato';
        break;

      case 'accent':
        // Accented attack - normal duration, stronger attack
        effectiveDuration = baseDuration * 0.95;
        attackModifier = 1.25;
        releaseModifier = 1.0;
        normalizedType = 'accent';
        break;

      case 'sforzando':
      case 'sfz':
        // Sudden strong accent
        effectiveDuration = baseDuration * 0.85;
        attackModifier = 1.4;
        releaseModifier = 1.2;
        normalizedType = 'sforzando';
        break;

      default:
        logger.warn('Unknown articulation type, using legato', { articulation });
        effectiveDuration = baseDuration * 0.98;
        attackModifier = 1.0;
        releaseModifier = 0.9;
        normalizedType = 'legato';
    }

    // Ensure effective duration doesn't become too short
    effectiveDuration = Math.max(effectiveDuration, 0.01); // Minimum 10ms

    // Clamp modifiers to reasonable ranges
    attackModifier = Math.max(0.1, Math.min(2.0, attackModifier));
    releaseModifier = Math.max(0.1, Math.min(2.0, releaseModifier));

    const result: ArticulationResult = {
      effectiveDuration,
      type: normalizedType,
      attackModifier,
      releaseModifier
    };

    logger.debug('Articulation calculated', { 
      articulation, 
      baseDuration, 
      result 
    });

    return result;

  } catch (error) {
    logger.error('Articulation calculation failed', { articulation, baseDuration, error });
    
    // Safe fallback
    return {
      effectiveDuration: Math.max(baseDuration * 0.95, 0.01),
      type: 'legato',
      attackModifier: 1.0,
      releaseModifier: 1.0
    };
  }
}

/**
 * Additional utility function: Convert MIDI note to frequency
 */
export function midiToFrequency(midiNote: number): number {
  if (midiNote < 0 || midiNote > 127) {
    throw new Error(`MIDI note ${midiNote} outside valid range (0-127)`);
  }
  
  // A4 = 440 Hz = MIDI note 69
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

/**
 * Additional utility function: Convert frequency to MIDI note
 */
export function frequencyToMidi(frequency: number): number {
  if (frequency <= 0) {
    throw new Error(`Invalid frequency: ${frequency}`);
  }
  
  // A4 = 440 Hz = MIDI note 69
  const midiNote = 69 + 12 * Math.log2(frequency / 440);
  return Math.round(midiNote);
}

/**
 * Additional utility function: Get note name from MIDI number
 */
export function midiToNoteName(midiNote: number): string {
  if (midiNote < 0 || midiNote > 127) {
    throw new Error(`MIDI note ${midiNote} outside valid range (0-127)`);
  }
  
  // Use Tonal.js for accurate note name conversion
  const noteName = Note.fromMidi(midiNote);
  return noteName || `MIDI${midiNote}`;
}