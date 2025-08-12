/**
 * Rigorous Zod schemas for MIDI operations
 * Follows best practices for validation with clear error messages
 */

import { z } from 'zod';

// Base MIDI constants and validators
const MIDI_NOTE_RANGE = z.number().int().min(0).max(127);
const MIDI_VELOCITY = z.number().min(0).max(1);
const MIDI_CHANNEL = z.number().int().min(1).max(16);
const MIDI_CC_VALUE = z.number().int().min(0).max(127);
const MIDI_BPM = z.number().min(20).max(300);

// Musical note validator (both string and number formats)
const MidiNoteSchema = z.union([
  MIDI_NOTE_RANGE,
  z.string().regex(/^[A-G]([b#])?([0-9]|10)$/, {
    message: 'Note must be in format like C4, F#3, Bb5 (note + optional accidental + octave 0-10)'
  })
]);

// Time signature validator (exported for use in other modules)
export const TimeSignatureSchema = z.string().regex(/^\d+\/\d+$/, {
  message: 'Time signature must be in format like 4/4, 3/4, 6/8'
});

// Musical key validator (exported for use in other modules)
export const MusicalKeySchema = z.string().regex(/^[A-G]([b#])?\s*(major|minor|maj|min|m|M)?$/i, {
  message: 'Key must be like "C major", "F# minor", "Bb", "Am"'
});

// Duration in musical notation (exported for use in other modules)
export const MusicalDurationSchema = z.string().regex(/^\d+[ndt]\.?$/, {
  message: 'Duration must be musical notation like 4n, 8t, 2n., 16d'
});

// Articulation types
const ArticulationSchema = z.enum(['legato', 'staccato', 'tenuto', 'marcato', 'accent', 'sforzando'], {
  errorMap: () => ({ message: 'Articulation must be legato, staccato, tenuto, marcato, accent, or sforzando' })
});

// MIDI Control Change schema
export const CCEventSchema = z.object({
  absoluteTime: z.number().min(0),
  controller: z.union([
    z.number().int().min(0).max(127),
    z.enum(['volume', 'pan', 'expression', 'sustain', 'reverb', 'chorus'], {
      errorMap: () => ({ message: 'Controller must be 0-127 or known name like volume, pan, expression' })
    })
  ]),
  value: MIDI_CC_VALUE,
  channel: MIDI_CHANNEL,
  description: z.string().optional()
});

// MIDI Note Event schema
export const NoteEventSchema = z.object({
  absoluteTime: z.number().min(0),
  toneName: z.string().regex(/^[A-G]([b#])?[0-9]$/, {
    message: 'Tone name must be like C4, F#3, Bb5'
  }),
  midiNote: MIDI_NOTE_RANGE,
  velocity: MIDI_VELOCITY,
  duration: z.number().min(0.001), // Minimum 1ms
  channel: MIDI_CHANNEL,
  articulation: ArticulationSchema,
  noteOffTime: z.number().min(0)
});

// System Event schema
export const SystemEventSchema = z.object({
  absoluteTime: z.number().min(0),
  type: z.enum(['tempo_change', 'time_signature', 'program_change']),
  value: z.any(),
  channel: MIDI_CHANNEL.optional()
});

// MIDI Port schema
export const MidiPortSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['input', 'output']),
  connected: z.boolean(),
  manufacturer: z.string().optional()
});

// Tool parameter schemas
export const MidiSendNoteSchema = z.object({
  note: MidiNoteSchema,
  velocity: MIDI_VELOCITY.default(0.8),
  duration: z.number().min(0.001).default(1.0),
  channel: MIDI_CHANNEL.default(1),
  outputPort: z.string().optional()
});

export const MidiPlayPhraseSchema = z.object({
  notes: z.string().min(1).describe('Space-separated notes like "C4 E4 G4 C5"'),
  rhythm: z.union([
    z.string().regex(/^(whole|half|quarter|eighth|sixteenth|thirty-second)$/, {
      message: 'Rhythm must be whole, half, quarter, eighth, sixteenth, or thirty-second'
    }),
    z.string().regex(/^\d+[ndt]\.?$/, {
      message: 'Rhythm must be musical notation like 4n, 8t, 2n.'
    })
  ]).optional(),
  tempo: MIDI_BPM.default(120),
  style: ArticulationSchema.default('legato'),
  channel: MIDI_CHANNEL.default(1),
  outputPort: z.string().optional()
});

export const SequenceCommandSchema = z.object({
  type: z.enum(['note', 'cc', 'delay']),
  time: z.number().min(0).optional(),
  note: MidiNoteSchema.optional(),
  duration: z.number().min(0.001).optional(),
  velocity: MIDI_VELOCITY.optional(),
  controller: z.union([z.number().int().min(0).max(127), z.string()]).optional(),
  value: MIDI_CC_VALUE.optional(),
  channel: MIDI_CHANNEL.optional()
});

export const MidiSequenceSchema = z.object({
  commands: z.array(SequenceCommandSchema).min(1),
  outputPort: z.string().optional()
});

export const MidiCCSchema = z.object({
  controller: z.union([
    z.number().int().min(0).max(127),
    z.enum(['volume', 'pan', 'expression', 'sustain', 'reverb', 'chorus'])
  ]),
  value: MIDI_CC_VALUE,
  channel: MIDI_CHANNEL.default(1),
  outputPort: z.string().optional()
});

export const MidiTempoSchema = z.object({
  bpm: MIDI_BPM
});

export const MidiTransportSchema = z.object({
  action: z.enum(['play', 'pause', 'stop', 'rewind'])
});

export const MidiPortConfigSchema = z.object({
  portName: z.string().min(1)
});

export const MidiListPortsSchema = z.object({
  refresh: z.boolean().default(false)
});

// Error handling schemas
export const MidiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional()
});

// Validation helper functions
export function validateMidiNote(note: string | number): number {
  if (typeof note === 'number') {
    return MIDI_NOTE_RANGE.parse(note);
  }
  
  // Convert string note to MIDI number
  const match = note.match(/^([A-G])([b#])?(\d+)$/);
  if (!match) {
    throw new Error(`Invalid note format: ${note}. Use format like C4, F#3, Bb5`);
  }
  
  const [, noteName, accidental = '', octave] = match;
  const noteMap: Record<string, number> = {
    'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
  };
  
  if (!noteName || !octave) {
    throw new Error(`Invalid note format: ${note}`);
  }
  
  const baseNote = noteMap[noteName];
  if (baseNote === undefined) {
    throw new Error(`Invalid note name: ${noteName}`);
  }
  
  let midiNote = baseNote + (parseInt(octave) + 1) * 12;
  
  if (accidental === '#') midiNote += 1;
  if (accidental === 'b') midiNote -= 1;
  
  return MIDI_NOTE_RANGE.parse(midiNote);
}

export function validateController(controller: string | number): number {
  if (typeof controller === 'number') {
    return z.number().int().min(0).max(127).parse(controller);
  }
  
  const controllerMap: Record<string, number> = {
    'volume': 7,
    'pan': 10,
    'expression': 11,
    'sustain': 64,
    'reverb': 91,
    'chorus': 93
  };
  
  const ccNumber = controllerMap[controller.toLowerCase()];
  if (ccNumber === undefined) {
    throw new Error(`Unknown controller: ${controller}. Use 0-127 or: ${Object.keys(controllerMap).join(', ')}`);
  }
  
  return ccNumber;
}

export function parseMusicalDuration(duration: string, bpm: number): number {
  const match = duration.match(/^(\d+)([ndt])(\.?)$/);
  if (!match) {
    throw new Error(`Invalid duration: ${duration}. Use format like 4n, 8t, 2n.`);
  }
  
  const [, value, type, dotted] = match;
  
  if (!value || !type) {
    throw new Error(`Invalid duration format: ${duration}`);
  }
  
  const noteValue = parseInt(value);
  
  // Calculate duration in seconds
  let seconds = (60 / bpm) * (4 / noteValue);
  
  if (type === 't') seconds *= 2/3; // Triplet
  if (type === 'd') seconds *= 3/2; // Dotted
  if (dotted === '.') seconds *= 1.5; // Additional dot
  
  return seconds;
}

// Type exports
export type MidiSendNoteInput = z.infer<typeof MidiSendNoteSchema>;
export type MidiPlayPhraseInput = z.infer<typeof MidiPlayPhraseSchema>;
export type MidiSequenceInput = z.infer<typeof MidiSequenceSchema>;
export type MidiCCInput = z.infer<typeof MidiCCSchema>;
export type MidiTempoInput = z.infer<typeof MidiTempoSchema>;
export type MidiTransportInput = z.infer<typeof MidiTransportSchema>;
export type MidiPortConfigInput = z.infer<typeof MidiPortConfigSchema>;
export type MidiListPortsInput = z.infer<typeof MidiListPortsSchema>;
export type SequenceCommand = z.infer<typeof SequenceCommandSchema>;
export type MidiPort = z.infer<typeof MidiPortSchema>;
export type NoteEvent = z.infer<typeof NoteEventSchema>;
export type CCEvent = z.infer<typeof CCEventSchema>;
export type SystemEvent = z.infer<typeof SystemEventSchema>;