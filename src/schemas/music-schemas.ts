/**
 * Rigorous Zod schemas for musical concepts and theory
 * Follows best practices for music-specific validation
 */

import { z } from 'zod';
import { NoteEventSchema, CCEventSchema, SystemEventSchema } from './midi-schemas.js';

// Musical time notation validator
const MusicalTimeSchema = z.string().regex(/^(\d+:)?\d+(:\d+)?$|^\d+[ndt]\.?$/, {
  message: 'Time must be in format "0:0", "1:2:3", "4n", "8t", etc.'
});

// Extended articulation including dynamics
const ExtendedArticulationSchema = z.enum([
  'legato', 'staccato', 'tenuto', 'marcato', 
  'accent', 'sforzando', 'crescendo', 'diminuendo'
], {
  errorMap: () => ({ 
    message: 'Articulation must be legato, staccato, tenuto, marcato, accent, sforzando, crescendo, or diminuendo' 
  })
});

// Music event types
const MusicEventTypeSchema = z.enum(['note', 'chord', 'cc', 'sequence', 'rest'], {
  errorMap: () => ({ message: 'Event type must be note, chord, cc, sequence, or rest' })
});

// Chord notation validator
const ChordSchema = z.string().regex(/^[A-G]([b#])?(maj|min|m|M|dim|aug|\d+)?(\+|-|sus|add)?(\d+)?$/, {
  message: 'Chord must be in format like C, Cmaj7, F#min, Bbdim, Gsus4, Cadd9'
});

// Scale notation validator (exported for use in other modules)
export const ScaleSchema = z.string().regex(/^[A-G]([b#])?\s*(major|minor|dorian|mixolydian|lydian|phrygian|locrian|blues|pentatonic|chromatic)$/i, {
  message: 'Scale must be like "C major", "F# minor", "Bb dorian", "A blues"'
});

// Music Event schema
export const MusicEventSchema = z.object({
  time: MusicalTimeSchema,
  type: MusicEventTypeSchema,
  value: z.union([z.string(), z.number(), z.record(z.any())]),
  duration: z.string().regex(/^\d+[ndt]\.?$/).optional(),
  velocity: z.number().min(0).max(1).optional(),
  channel: z.number().int().min(1).max(16).optional(),
  articulation: ExtendedArticulationSchema.optional(),
  // Allow additional properties for extensibility
  metadata: z.record(z.any()).optional()
});

// Musical Plan schema (main input format)
export const PlanoMusicalSchema = z.object({
  bpm: z.number().min(20).max(300),
  timeSignature: z.string().regex(/^\d+\/\d+$/).default('4/4'),
  key: z.string().regex(/^[A-G]([b#])?\s*(major|minor|maj|min|m|M)?$/i).optional(),
  events: z.array(MusicEventSchema).min(1)
}).refine((data) => {
  // Validate that at least one event is not a rest
  return data.events.some(event => event.type !== 'rest');
}, {
  message: 'Musical plan must contain at least one non-rest event',
  path: ['events']
});

// Executable Score schema (output from Tradutor)
export const PartituraExecutavelSchema = z.object({
  metadata: z.object({
    bpm: z.number().min(20).max(300),
    timeSignature: z.string().regex(/^\d+\/\d+$/),
    key: z.string(),
    totalDuration: z.string(),
    eventCount: z.number().min(0),
    generatedAt: z.date().optional(),
    version: z.string().optional()
  }),
  noteEvents: z.array(NoteEventSchema),
  controlChangeEvents: z.array(CCEventSchema),
  systemEvents: z.array(SystemEventSchema)
}).refine((data) => {
  // Validate timing consistency
  const allEvents = [
    ...data.noteEvents.map(e => e.absoluteTime),
    ...data.controlChangeEvents.map(e => e.absoluteTime),
    ...data.systemEvents.map(e => e.absoluteTime)
  ];
  
  return allEvents.every(time => time >= 0);
}, {
  message: 'All events must have non-negative absolute times',
  path: ['noteEvents', 'controlChangeEvents', 'systemEvents']
});

// Chord voicing options
export const ChordVoicingSchema = z.enum([
  'close', 'open', 'drop2', 'drop3', 'quartal', 'rootless', 'shell'
], {
  errorMap: () => ({ 
    message: 'Voicing must be close, open, drop2, drop3, quartal, rootless, or shell' 
  })
});

// Musical phrase schema
export const MusicalPhraseSchema = z.object({
  notes: z.array(z.string().regex(/^[A-G]([b#])?[0-9]$/)).min(1),
  rhythm: z.array(z.string().regex(/^\d+[ndt]\.?$/)).optional(),
  articulations: z.array(ExtendedArticulationSchema).optional(),
  dynamics: z.array(z.enum(['pp', 'p', 'mp', 'mf', 'f', 'ff', 'sf'])).optional()
}).refine((data) => {
  // If rhythm is provided, it must match notes length
  if (data.rhythm && data.rhythm.length !== data.notes.length) {
    return false;
  }
  return true;
}, {
  message: 'Rhythm array must match notes array length',
  path: ['rhythm']
});

// Progression schema
export const ProgressionSchema = z.object({
  chords: z.array(ChordSchema).min(1),
  durations: z.array(z.string().regex(/^\d+[ndt]\.?$/)).optional(),
  key: z.string().regex(/^[A-G]([b#])?\s*(major|minor|maj|min|m|M)?$/i),
  voicing: ChordVoicingSchema.default('close')
});

// Musical style parameters
export const StyleParametersSchema = z.object({
  swing: z.number().min(0).max(1).default(0),
  humanization: z.number().min(0).max(1).default(0.1),
  groove: z.enum(['straight', 'swing', 'shuffle', 'latin', 'reggae']).default('straight'),
  intensity: z.number().min(0).max(1).default(0.7),
  rubato: z.number().min(0).max(1).default(0)
});

// Musical context for AI interpretation
export const MusicalContextSchema = z.object({
  genre: z.enum([
    'classical', 'jazz', 'rock', 'pop', 'electronic', 'folk', 
    'blues', 'country', 'latin', 'world', 'experimental'
  ]).optional(),
  mood: z.enum([
    'happy', 'sad', 'energetic', 'calm', 'mysterious', 'dramatic',
    'romantic', 'aggressive', 'peaceful', 'tension', 'release'
  ]).optional(),
  complexity: z.enum(['simple', 'moderate', 'complex', 'virtuosic']).default('moderate'),
  target: z.enum(['practice', 'performance', 'composition', 'analysis']).default('performance')
});

// Validation helper functions
export function validateChordProgression(chords: string[], _key: string): boolean {
  // Basic validation - could be expanded with more music theory
  if (chords.length === 0) return false;
  
  // Check if all chords are valid format
  const chordRegex = /^[A-G]([b#])?(maj|min|m|M|dim|aug|\d+)?(\+|-|sus|add)?(\d+)?$/;
  return chords.every(chord => chordRegex.test(chord));
}

export function parseMusicalTime(time: string, bpm: number, timeSignature = '4/4'): number {
  // Handle different time formats
  if (time.includes(':')) {
    // Format: "bar:beat:subdivision" or "beat:subdivision"
    const parts = time.split(':').map(Number);
    const timeSigParts = timeSignature.split('/').map(Number);
    const timeSigNumerator = timeSigParts[0];
    
    if (!timeSigNumerator) {
      throw new Error(`Invalid time signature: ${timeSignature}`);
    }
    
    if (parts.length === 2) {
      // "beat:subdivision"
      const beat = parts[0];
      const subdivision = parts[1];
      if (beat === undefined || subdivision === undefined) {
        throw new Error(`Invalid time format: ${time}`);
      }
      return (beat + subdivision / 100) * (60 / bpm);
    } else if (parts.length === 3) {
      // "bar:beat:subdivision"
      const bar = parts[0];
      const beat = parts[1];
      const subdivision = parts[2];
      if (bar === undefined || beat === undefined || subdivision === undefined) {
        throw new Error(`Invalid time format: ${time}`);
      }
      return (bar * timeSigNumerator + beat + subdivision / 100) * (60 / bpm);
    }
  } else if (time.match(/^\d+[ndt]\.?$/)) {
    // Musical notation format
    return parseNoteDuration(time, bpm);
  }
  
  throw new Error(`Invalid time format: ${time}`);
}

export function parseNoteDuration(notation: string, bpm: number): number {
  const match = notation.match(/^(\d+)([ndt])(\.?)$/);
  if (!match) {
    throw new Error(`Invalid note duration: ${notation}`);
  }
  
  const [, value, type, dotted] = match;
  
  if (!value || !type) {
    throw new Error(`Invalid duration format: ${notation}`);
  }
  
  const noteValue = parseInt(value);
  
  // Calculate duration in seconds
  let seconds = (60 / bpm) * (4 / noteValue);
  
  if (type === 't') seconds *= 2/3; // Triplet
  if (type === 'd') seconds *= 3/2; // Dotted (different from musical dot)
  if (dotted === '.') seconds *= 1.5; // Musical dot
  
  return seconds;
}

export function expandChord(chord: string, _voicing: string = 'close', octave: number = 4): string[] {
  // Basic chord expansion - would need full music theory library for complete implementation
  const rootNote = chord.match(/^[A-G]([b#])?/)?.[0] || 'C';
  const quality = chord.replace(rootNote, '').toLowerCase();
  
  // This is a simplified version - real implementation would use @tonaljs/chord
  const chordTones: Record<string, number[]> = {
    '': [0, 4, 7], // major
    'maj': [0, 4, 7],
    'm': [0, 3, 7], // minor
    'min': [0, 3, 7],
    '7': [0, 4, 7, 10], // dominant 7th
    'maj7': [0, 4, 7, 11], // major 7th
    'm7': [0, 3, 7, 10], // minor 7th
    'dim': [0, 3, 6], // diminished
    'aug': [0, 4, 8], // augmented
  };
  
  const intervals = chordTones[quality] || chordTones[''];
  if (!intervals) {
    throw new Error(`Unknown chord quality: ${quality}`);
  }
  
  return intervals.map(interval => `${rootNote}${octave + Math.floor(interval / 12)}`);
}

// Type exports
export type PlanoMusical = z.infer<typeof PlanoMusicalSchema>;
export type MusicEvent = z.infer<typeof MusicEventSchema>;
export type PartituraExecutavel = z.infer<typeof PartituraExecutavelSchema>;
export type MusicalPhrase = z.infer<typeof MusicalPhraseSchema>;
export type Progression = z.infer<typeof ProgressionSchema>;
export type StyleParameters = z.infer<typeof StyleParametersSchema>;
export type MusicalContext = z.infer<typeof MusicalContextSchema>;
export type ChordVoicing = z.infer<typeof ChordVoicingSchema>;