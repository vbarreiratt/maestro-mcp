/**
 * Rigorous Zod schemas for MIDI operations
 * Follows best practices for validation with clear error messages
 * Enhanced with Hybrid Musical Notation support
 */
import { z } from 'zod';
// Base MIDI constants and validators
const MIDI_NOTE_RANGE = z.number().int().min(0).max(127);
const MIDI_VELOCITY = z.number().min(0).max(1);
const MIDI_CHANNEL = z.number().int().min(1).max(16);
const MIDI_CC_VALUE = z.number().int().min(0).max(127);
const MIDI_BPM = z.number().min(20).max(300);
// Musical note validator (exported for internal use)
export const MidiNoteSchema = z.union([
    MIDI_NOTE_RANGE,
    z.string().regex(/^[A-G]([b#])?([0-9]|10)$/, {
        message: 'Note must be in format like C4, F#3, Bb5 (note + optional accidental + octave 0-10)'
    }),
    // Enhanced: Support for hybrid notation with duration
    z.string().regex(/^[A-G]([b#])?([0-9]|10):[wqehst](@[0-1](\.[0-9]+)?(\.(leg|stac|ten|accent|ghost))?)?$/, {
        message: 'Hybrid notation: C4:q@0.8.leg (note:duration@velocity.articulation)'
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
// Articulation types (exported for internal use)
export const ArticulationSchema = z.enum(['legato', 'staccato', 'tenuto', 'marcato', 'accent', 'sforzando'], {
    errorMap: () => ({ message: 'Articulation must be legato, staccato, tenuto, marcato, accent, or sforzando' })
});
// ========================
// HYBRID NOTATION SCHEMAS
// ========================
export const HybridMusicInputSchema = z.object({
    // Required
    bpm: z.number().min(60).max(200).describe("BPM (Beats Per Minute)"),
    notes: z.string().min(1).describe("Hybrid notation: 'A4:q@0.8.leg B4:e | C4:h'"),
    // Optional - Musical Structure
    timeSignature: z.string().regex(/^\d+\/\d+$/).default("4/4").describe("Time signature like '4/4', '3/4', '6/8'"),
    key: MusicalKeySchema.optional().describe("Musical key like 'C major', 'A minor'"),
    // Optional - Global Defaults (fallback when not specified inline)
    velocity: z.number().min(0).max(1).default(0.8).describe("Global velocity 0.0-1.0"),
    articulation: z.number().min(0).max(1).default(0.8).describe("Global articulation 0.0-1.0 (0=staccato, 1=legato)"),
    reverb: z.number().min(0).max(1).default(0.4).describe("Reverb amount 0.0-1.0"),
    swing: z.number().min(0).max(1).default(0.0).describe("Swing amount 0.0-1.0 (0=straight, 0.67=swing)"),
    // Optional - Technical
    channel: z.number().int().min(1).max(16).default(1).describe("MIDI channel 1-16"),
    transpose: z.number().int().min(-12).max(12).default(0).describe("Transpose in semitones")
});
export const LegacyMusicInputSchema = z.object({
    // Legacy format support
    notes: z.union([
        z.string().describe("Simple notes: 'C4 D4 E4 F4'"),
        z.array(z.string()).describe("Array of notes")
    ]),
    rhythm: z.array(z.string()).optional().describe("Rhythm array: ['quarter', 'quarter', 'half']"),
    tempo: z.number().optional().describe("Legacy BPM parameter"),
    channel: z.number().int().min(1).max(16).optional(),
    velocity: z.number().min(0).max(1).optional(),
    gap: z.number().optional().describe("Gap between notes in ms"),
    style: ArticulationSchema.optional()
});
export const UnifiedMusicInputSchema = z.union([
    HybridMusicInputSchema,
    LegacyMusicInputSchema
]).describe("Unified schema supporting both hybrid and legacy notation");
// ========================
// ENHANCED TOOL SCHEMAS  
// ========================
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
// NOTE: MCP Tool schemas are defined in mcp-tools-schemas.ts
// This file contains only internal MIDI operation schemas
// Internal schemas for MIDI operations (not MCP tools)
export const InternalMidiTempoSchema = z.object({
    bpm: MIDI_BPM
});
export const InternalMidiTransportSchema = z.object({
    action: z.enum(['play', 'pause', 'stop', 'rewind'])
});
export const InternalMidiPortConfigSchema = z.object({
    portName: z.string().min(1)
});
export const InternalMidiListPortsSchema = z.object({
    refresh: z.boolean().default(false)
});
// Error handling schemas
export const MidiErrorSchema = z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
});
// Validation helper functions
export function validateMidiNote(note) {
    if (typeof note === 'number') {
        return MIDI_NOTE_RANGE.parse(note);
    }
    // Convert string note to MIDI number
    const match = note.match(/^([A-G])([b#])?(\d+)$/);
    if (!match) {
        throw new Error(`Invalid note format: ${note}. Use format like C4, F#3, Bb5`);
    }
    const [, noteName, accidental = '', octave] = match;
    const noteMap = {
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
    if (accidental === '#')
        midiNote += 1;
    if (accidental === 'b')
        midiNote -= 1;
    return MIDI_NOTE_RANGE.parse(midiNote);
}
export function validateController(controller) {
    if (typeof controller === 'number') {
        return z.number().int().min(0).max(127).parse(controller);
    }
    const controllerMap = {
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
export function parseMusicalDuration(duration, bpm) {
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
    if (type === 't')
        seconds *= 2 / 3; // Triplet
    if (type === 'd')
        seconds *= 3 / 2; // Dotted
    if (dotted === '.')
        seconds *= 1.5; // Additional dot
    return seconds;
}
//# sourceMappingURL=midi-schemas.js.map