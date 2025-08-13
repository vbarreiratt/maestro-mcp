/**
 * Hybrid Musical Notation Parser
 * Parses hybrid notation format: "A4:q@0.8.leg B4:e | C4:h"
 * Maintains full compatibility with legacy formats
 */

import Note from '@tonaljs/note';
import { logger, LogContext } from './logger.js';

// Core interfaces for parsed notation
export interface ParsedNote {
  note: string;           // "C4" or "C4,E4,G4" for chords
  midiNote: number;       // MIDI note number (60 for C4)
  duration: number;       // In beats (1.0 = quarter note)
  velocity: number;       // 0.0-1.0 (combining global + inline)
  articulation: number;   // 0.0-1.0 (combining global + inline)
  measureIndex: number;   // Which measure (0-based)
  beatPosition: number;   // Position in measure
  absoluteTime: number;   // Absolute time in seconds
  isChord: boolean;       // True if this represents multiple notes
  chordNotes: string[] | undefined;  // Array of individual note names if isChord
  chordMidiNotes: number[] | undefined; // Array of MIDI numbers if isChord
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

// Duration mapping (beats in 4/4 time)
const DURATION_MAP: Record<string, number> = {
  'w': 4.0,   // whole
  'h': 2.0,   // half
  'q': 1.0,   // quarter
  'e': 0.5,   // eighth
  's': 0.25,  // sixteenth
  't': 0.125  // thirty-second
};

// Articulation mapping
const ARTICULATION_MAP: Record<string, number | string> = {
  'leg': 1.0,     // legato
  'stac': 0.0,    // staccato
  'ten': 0.9,     // tenuto
  'accent': 'velocity+0.2',  // boost velocity
  'ghost': 'velocity-0.3'    // reduce velocity
};

// Named chord definitions (basic chord library)
const CHORD_DEFINITIONS: Record<string, string[]> = {
  // Major chords
  'C': ['C', 'E', 'G'],
  'D': ['D', 'F#', 'A'],
  'E': ['E', 'G#', 'B'],
  'F': ['F', 'A', 'C'],
  'G': ['G', 'B', 'D'],
  'A': ['A', 'C#', 'E'],
  'B': ['B', 'D#', 'F#'],
  
  // Minor chords
  'Cm': ['C', 'Eb', 'G'],
  'Dm': ['D', 'F', 'A'],
  'Em': ['E', 'G', 'B'],
  'Fm': ['F', 'Ab', 'C'],
  'Gm': ['G', 'Bb', 'D'],
  'Am': ['A', 'C', 'E'],
  'Bm': ['B', 'D', 'F#'],
  
  // 7th chords
  'C7': ['C', 'E', 'G', 'Bb'],
  'Cmaj7': ['C', 'E', 'G', 'B'],
  'Cm7': ['C', 'Eb', 'G', 'Bb'],
  'D7': ['D', 'F#', 'A', 'C'],
  'Dm7': ['D', 'F', 'A', 'C'],
  'E7': ['E', 'G#', 'B', 'D'],
  'Em7': ['E', 'G', 'B', 'D'],
  'F7': ['F', 'A', 'C', 'Eb'],
  'Fmaj7': ['F', 'A', 'C', 'E'],
  'G7': ['G', 'B', 'D', 'F'],
  'Gmaj7': ['G', 'B', 'D', 'F#'],
  'A7': ['A', 'C#', 'E', 'G'],
  'Am7': ['A', 'C', 'E', 'G'],
  'B7': ['B', 'D#', 'F#', 'A'],
  'Bm7': ['B', 'D', 'F#', 'A']
};

/**
 * Expands a named chord to its constituent notes
 * @param chordName - e.g., "Cmaj7", "Am", "G7"
 * @param octave - octave for the root note (default: 4)
 * @returns Array of note names with octaves
 */
function expandNamedChord(chordName: string, octave: number = 4): string[] {
  // Handle inversions like "C/E"
  const [baseChord, bassNote] = chordName.split('/');
  const chordKey = baseChord || chordName;
  
  let chordNotes = CHORD_DEFINITIONS[chordKey];
  if (!chordNotes) {
    throw new Error(`Unknown chord: ${chordName}`);
  }
  
  // Add octaves to notes
  const notesWithOctaves = chordNotes.map((note: string, index: number) => {
    // Higher notes get higher octaves to avoid muddy sound
    const noteOctave = octave + Math.floor(index / 3);
    return `${note}${noteOctave}`;
  });
  
  // Handle bass note (inversion)
  if (bassNote) {
    // Put bass note first with lower octave
    const bassWithOctave = `${bassNote}${octave - 1}`;
    return [bassWithOctave, ...notesWithOctaves.filter((n: string) => !n.startsWith(bassNote))];
  }
  
  return notesWithOctaves;
}

/**
 * Parses chord notation from brackets
 * @param chordStr - e.g., "[C3 E3 G3]", "[Cmaj7]", "[C/E]"
 * @returns Array of note names
 */
function parseChordString(chordStr: string): string[] {
  // Remove brackets
  const cleanStr = chordStr.replace(/[\[\]]/g, '').trim();
  
  // Check if it's a named chord (no spaces, contains letters)
  if (!cleanStr.includes(' ') && /[A-G]/.test(cleanStr)) {
    // Named chord like "Cmaj7" or "Am"
    // Extract octave if specified (e.g., "Cmaj7/4")
    const [chordPart, octavePart] = cleanStr.split('/');
    const octave = octavePart ? parseInt(octavePart) : 4;
    return expandNamedChord(chordPart || cleanStr, octave);
  }
  
  // Manual chord like "C3 E3 G3"
  return cleanStr.split(/\s+/).filter(note => note.length > 0);
}

/**
 * Parse a single note or chord string with full hybrid notation support
 * Format: "A4:q@0.8.leg" or "[C3 E3 G3]:q@0.8.leg" or "[Cmaj7]:h@0.9"
 */
function parseNoteString(
  noteStr: string, 
  globalDefaults: GlobalDefaults,
  measureIndex: number,
  beatPosition: number
): ParsedNote | null {
  const context: LogContext = { 
    component: 'HybridParser', 
    operation: 'parseNoteString',
    noteStr,
    measureIndex,
    beatPosition
  };

  try {
    // Check if this is a chord (contains brackets)
    const isChord = noteStr.includes('[') && noteStr.includes(']');
    
    // Parse the notation: note:duration@velocity.articulation or [chord]:duration@velocity.articulation
    let notePart = noteStr;
    let durationPart = '';
    let velocityPart = '';
    let articulationPart = '';

    // Extract duration (after :)
    if (noteStr.includes(':')) {
      const colonSplit = noteStr.split(':');
      notePart = colonSplit[0] || '';
      
      if (colonSplit.length > 1) {
        const afterColon = colonSplit[1] || '';

        // Extract velocity and articulation (format: duration@velocity.articulation)
        if (afterColon.includes('@')) {
          const atSplit = afterColon.split('@');
          durationPart = atSplit[0] || '';
          
          if (atSplit.length > 1) {
            const afterAt = atSplit[1] || '';
            
            // Extract articulation (after .)
            // But first check if this is a decimal number vs articulation
            if (afterAt.includes('.')) {
              // Check if the entire afterAt is a simple decimal (like "0.7")
              if (afterAt.match(/^\d+\.\d+$/)) {
                // It's just a decimal number, no articulation
                velocityPart = afterAt;
              } else {
                // It has a dot but it's not just a decimal, so parse velocity.articulation
                // For cases like "0.7.leg", we need to find where the number ends and articulation starts
                const dotSplit = afterAt.split('.');
                
                // Find the last non-numeric part as articulation
                let articulationIndex = -1;
                for (let i = dotSplit.length - 1; i >= 0; i--) {
                  const part = dotSplit[i];
                  if (part && !/^\d+$/.test(part)) {
                    articulationIndex = i;
                    break;
                  }
                }
                
                if (articulationIndex > 0) {
                  // Reconstruct velocity from parts before articulation
                  velocityPart = dotSplit.slice(0, articulationIndex).join('.');
                  const artPart = dotSplit[articulationIndex];
                  articulationPart = artPart || '';
                } else {
                  // No valid articulation found, treat as velocity
                  velocityPart = afterAt;
                }
              }
            } else {
              velocityPart = afterAt;
            }
          }
        } else {
          // No velocity specified, check for articulation only
          if (afterColon.includes('.')) {
            const dotSplit = afterColon.split('.');
            durationPart = dotSplit[0] || '';
            articulationPart = dotSplit[1] || '';
          } else {
            durationPart = afterColon;
          }
        }
      }
    }

    // Process chord or single note
    let chordNotes: string[] = [];
    let chordMidiNotes: number[] = [];
    let finalMidiNote: number;
    
    if (isChord) {
      // Parse chord
      try {
        chordNotes = parseChordString(notePart);
        chordMidiNotes = chordNotes.map(note => {
          const midiNum = Note.midi(note);
          if (midiNum === null) {
            throw new Error(`Invalid note in chord: ${note}`);
          }
          return Math.max(0, Math.min(127, midiNum + globalDefaults.transpose));
        });
        
        // Use the lowest note as the primary MIDI note for compatibility
        finalMidiNote = Math.min(...chordMidiNotes);
        
        // Update notePart to be comma-separated for display
        notePart = chordNotes.join(',');
        
      } catch (error) {
        throw new Error(`Failed to parse chord ${notePart}: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      // Parse single note to MIDI
      const midiNote = Note.midi(notePart);
      if (midiNote === null) {
        throw new Error(`Invalid note name: ${notePart}`);
      }

      // Apply transpose
      finalMidiNote = Math.max(0, Math.min(127, midiNote + globalDefaults.transpose));
    }

    // Parse duration (default to quarter note)
    let duration = 1.0; // quarter note default
    if (durationPart && DURATION_MAP[durationPart] !== undefined) {
      duration = DURATION_MAP[durationPart]!;
    } else if (durationPart) {
      // Try parsing as decimal (for custom durations)
      const customDuration = parseFloat(durationPart);
      if (!isNaN(customDuration) && customDuration > 0) {
        duration = customDuration;
      } else {
        logger.warn('Invalid duration code, skipping note', { ...context, durationPart });
        return null; // Skip notes with invalid duration codes
      }
    }

    // Parse velocity (default to global)
    let velocity = globalDefaults.velocity;
    if (velocityPart) {
      const parsedVelocity = parseFloat(velocityPart);
      if (!isNaN(parsedVelocity) && parsedVelocity >= 0 && parsedVelocity <= 1) {
        velocity = parsedVelocity;
      } else {
        logger.warn('Invalid velocity value, using global default', { ...context, velocityPart, parsedVelocity });
      }
    }

    // Parse articulation (default to global)
    let articulation = globalDefaults.articulation;
    if (articulationPart) {
      const articulationEffect = ARTICULATION_MAP[articulationPart];
      if (typeof articulationEffect === 'number') {
        articulation = articulationEffect;
      } else if (typeof articulationEffect === 'string') {
        // Handle special articulations that modify velocity
        if (articulationEffect === 'velocity+0.2') {
          velocity = Math.min(1.0, velocity + 0.2);
          articulation = 0.9; // slightly more legato for accents
        } else if (articulationEffect === 'velocity-0.3') {
          velocity = Math.max(0.0, velocity - 0.3);
          articulation = 0.7; // ghost notes are somewhat detached
        }
      } else {
        logger.warn('Unknown articulation code, using global default', { ...context, articulationPart });
      }
    }

    // Calculate absolute time (considering BPM and position)
    const beatsPerSecond = globalDefaults.bpm / 60;
    const absoluteTime = (measureIndex * getBeatsPerMeasure(globalDefaults.timeSignature) + beatPosition) / beatsPerSecond;

    const parsedNote: ParsedNote = {
      note: notePart,
      midiNote: finalMidiNote,
      duration,
      velocity,
      articulation,
      measureIndex,
      beatPosition,
      absoluteTime,
      isChord,
      chordNotes: isChord ? chordNotes : undefined,
      chordMidiNotes: isChord ? chordMidiNotes : undefined
    };

    logger.debug('Successfully parsed note', { ...context, parsedNote });
    return parsedNote;

  } catch (error) {
    logger.error('Failed to parse note string', { ...context, error });
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse note "${noteStr}": ${errorMessage}`);
  }
}

/**
 * Get beats per measure from time signature
 */
function getBeatsPerMeasure(timeSignature: string): number {
  const [numerator, denominator] = timeSignature.split('/').map(Number);
  if (!numerator || !denominator) {
    logger.warn('Invalid time signature, defaulting to 4/4', { timeSignature });
    return 4;
  }
  
  // Convert to quarter note beats
  return numerator * (4 / denominator);
}

/**
 * Smart split that preserves chord brackets
 * Splits "[C3 E3 G3]:q@0.8" as one unit, not three separate notes
 */
function smartSplitNotes(measure: string): string[] {
  const notes: string[] = [];
  let current = '';
  let inBrackets = false;
  let i = 0;
  
  while (i < measure.length) {
    const char = measure[i];
    
    if (char === '[') {
      inBrackets = true;
      current += char;
    } else if (char === ']') {
      inBrackets = false;
      current += char;
    } else if (char === ' ' && !inBrackets) {
      // Space outside brackets - end current note
      if (current.trim().length > 0) {
        notes.push(current.trim());
        current = '';
      }
    } else {
      current += char;
    }
    i++;
  }
  
  // Add final note
  if (current.trim().length > 0) {
    notes.push(current.trim());
  }
  
  return notes;
}

/**
 * Main parser function for hybrid notation
 * Parses full notation string with measures, notes, and all parameters
 */
export function parseHybridNotation(
  notes: string,
  globalDefaults: GlobalDefaults
): ParsedNote[] {
  const context: LogContext = { 
    component: 'HybridParser', 
    operation: 'parseHybridNotation',
    notesLength: notes.length
  };

  try {
    logger.info('Starting hybrid notation parsing', { ...context, notes: notes.substring(0, 100) + (notes.length > 100 ? '...' : '') });

    const parsedNotes: ParsedNote[] = [];
    
    // Split by measures (|)
    const measures = notes.split('|').map(m => m.trim()).filter(m => m.length > 0);
    
    logger.debug('Split into measures', { ...context, measureCount: measures.length });

    for (let measureIndex = 0; measureIndex < measures.length; measureIndex++) {
      const measure = measures[measureIndex];
      if (!measure) continue;
      
      let beatPosition = 0;

      // Split measure by notes, preserving chord brackets
      const noteStrings = smartSplitNotes(measure);
      
      for (const noteStr of noteStrings) {
        const parsedNote = parseNoteString(noteStr, globalDefaults, measureIndex, beatPosition);
        
        // Skip notes with invalid notation (null return)
        if (parsedNote !== null) {
          parsedNotes.push(parsedNote);
          // Advance beat position by note duration
          beatPosition += parsedNote.duration;
        }
      }
    }

    // Apply swing if specified
    if (globalDefaults.swing > 0) {
      applySwing(parsedNotes, globalDefaults.swing);
    }

    logger.info('Hybrid notation parsing completed', { 
      ...context, 
      totalNotes: parsedNotes.length,
      totalDuration: parsedNotes.length > 0 && parsedNotes[parsedNotes.length - 1] 
        ? parsedNotes[parsedNotes.length - 1]!.absoluteTime + parsedNotes[parsedNotes.length - 1]!.duration * 60 / globalDefaults.bpm 
        : 0
    });

    return parsedNotes;

  } catch (error) {
    logger.error('Failed to parse hybrid notation', { ...context, error });
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse hybrid notation: ${errorMessage}`);
  }
}

/**
 * Apply swing timing to parsed notes
 * Modifies the timing of eighth notes and shorter durations
 */
function applySwing(parsedNotes: ParsedNote[], swingAmount: number): void {
  const context: LogContext = { 
    component: 'HybridParser', 
    operation: 'applySwing',
    swingAmount,
    noteCount: parsedNotes.length
  };

  try {
    logger.debug('Applying swing timing', context);

    for (let i = 0; i < parsedNotes.length; i++) {
      const note = parsedNotes[i];
      if (!note) continue;
      
      // Apply swing to eighth notes and shorter
      if (note.duration <= 0.5) {
        const beatInMeasure = note.beatPosition % 1;
        
        // Apply swing to off-beats (2nd, 4th eighth note in each beat)
        if (beatInMeasure >= 0.5) {
          const swingDelay = (note.duration * swingAmount * 0.5);
          note.absoluteTime += swingDelay;
        }
      }
    }

    logger.debug('Swing timing applied successfully', context);
  } catch (error) {
    logger.error('Failed to apply swing timing', { ...context, error });
    // Don't throw - swing is an enhancement, not critical
  }
}

/**
 * Detect input format automatically
 */
export function detectInputFormat(input: any): 'hybrid' | 'legacy' {
  // If has "bpm" and "notes" as string with ":" = hybrid
  if (input.bpm && typeof input.notes === 'string' && input.notes.includes(':')) {
    return 'hybrid';
  }
  
  // If has "notes" as string with ":" but no bpm = treat as hybrid with default bpm
  if (typeof input.notes === 'string' && input.notes.includes(':')) {
    return 'hybrid';
  }
  
  // If has "rhythm" array = legacy
  if (input.rhythm && Array.isArray(input.rhythm)) {
    return 'legacy';
  }
  
  // If has "notes" as array = legacy
  if (Array.isArray(input.notes)) {
    return 'legacy';
  }

  // If has "tempo" instead of "bpm" = legacy
  if (input.tempo && !input.bpm) {
    return 'legacy';
  }
  
  // Default to legacy for safety (maintains compatibility)
  return 'legacy';
}

/**
 * Calculate total duration of parsed notes
 */
export function calculateTotalDuration(parsedNotes: ParsedNote[], bpm: number): number {
  if (parsedNotes.length === 0) return 0;
  
  const lastNote = parsedNotes[parsedNotes.length - 1];
  if (!lastNote) return 0;
  
  const lastNoteEndTime = lastNote.absoluteTime + (lastNote.duration * 60 / bpm);
  
  return lastNoteEndTime;
}

/**
 * Apply audio effects to parsed notes
 */
export function applyEffects(
  parsedNotes: ParsedNote[], 
  effects: { 
    reverb?: number; 
    swing?: number; 
    transpose?: number; 
  }
): ParsedNote[] {
  // Create deep copy to avoid mutating original
  const processedNotes = parsedNotes.map(note => ({ ...note }));
  
  // Apply transpose if specified and not already applied
  if (effects.transpose && effects.transpose !== 0) {
    for (const note of processedNotes) {
      note.midiNote = Math.max(0, Math.min(127, note.midiNote + effects.transpose));
    }
  }
  
  // Swing is applied during parsing, but could be re-applied here if needed
  
  // Reverb affects articulation (more reverb = more legato)
  if (effects.reverb && effects.reverb > 0) {
    for (const note of processedNotes) {
      note.articulation = Math.min(1.0, note.articulation + (effects.reverb * 0.2));
    }
  }
  
  return processedNotes;
}
