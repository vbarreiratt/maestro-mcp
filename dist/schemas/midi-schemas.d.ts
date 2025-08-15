/**
 * Rigorous Zod schemas for MIDI operations
 * Follows best practices for validation with clear error messages
 * Enhanced with Hybrid Musical Notation support
 */
import { z } from 'zod';
export declare const MidiNoteSchema: z.ZodUnion<[z.ZodNumber, z.ZodString, z.ZodString]>;
export declare const TimeSignatureSchema: z.ZodString;
export declare const MusicalKeySchema: z.ZodString;
export declare const MusicalDurationSchema: z.ZodString;
export declare const ArticulationSchema: z.ZodEnum<["legato", "staccato", "tenuto", "marcato", "accent", "sforzando"]>;
export declare const HybridMusicInputSchema: z.ZodObject<{
    bpm: z.ZodNumber;
    notes: z.ZodString;
    timeSignature: z.ZodDefault<z.ZodString>;
    key: z.ZodOptional<z.ZodString>;
    velocity: z.ZodDefault<z.ZodNumber>;
    articulation: z.ZodDefault<z.ZodNumber>;
    reverb: z.ZodDefault<z.ZodNumber>;
    swing: z.ZodDefault<z.ZodNumber>;
    channel: z.ZodDefault<z.ZodNumber>;
    transpose: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    channel: number;
    notes: string;
    velocity: number;
    articulation: number;
    transpose: number;
    bpm: number;
    timeSignature: string;
    reverb: number;
    swing: number;
    key?: string | undefined;
}, {
    notes: string;
    bpm: number;
    channel?: number | undefined;
    velocity?: number | undefined;
    articulation?: number | undefined;
    transpose?: number | undefined;
    timeSignature?: string | undefined;
    key?: string | undefined;
    reverb?: number | undefined;
    swing?: number | undefined;
}>;
export declare const LegacyMusicInputSchema: z.ZodObject<{
    notes: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    rhythm: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tempo: z.ZodOptional<z.ZodNumber>;
    channel: z.ZodOptional<z.ZodNumber>;
    velocity: z.ZodOptional<z.ZodNumber>;
    gap: z.ZodOptional<z.ZodNumber>;
    style: z.ZodOptional<z.ZodEnum<["legato", "staccato", "tenuto", "marcato", "accent", "sforzando"]>>;
}, "strip", z.ZodTypeAny, {
    notes: string | string[];
    channel?: number | undefined;
    velocity?: number | undefined;
    tempo?: number | undefined;
    rhythm?: string[] | undefined;
    style?: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando" | undefined;
    gap?: number | undefined;
}, {
    notes: string | string[];
    channel?: number | undefined;
    velocity?: number | undefined;
    tempo?: number | undefined;
    rhythm?: string[] | undefined;
    style?: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando" | undefined;
    gap?: number | undefined;
}>;
export declare const UnifiedMusicInputSchema: z.ZodUnion<[z.ZodObject<{
    bpm: z.ZodNumber;
    notes: z.ZodString;
    timeSignature: z.ZodDefault<z.ZodString>;
    key: z.ZodOptional<z.ZodString>;
    velocity: z.ZodDefault<z.ZodNumber>;
    articulation: z.ZodDefault<z.ZodNumber>;
    reverb: z.ZodDefault<z.ZodNumber>;
    swing: z.ZodDefault<z.ZodNumber>;
    channel: z.ZodDefault<z.ZodNumber>;
    transpose: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    channel: number;
    notes: string;
    velocity: number;
    articulation: number;
    transpose: number;
    bpm: number;
    timeSignature: string;
    reverb: number;
    swing: number;
    key?: string | undefined;
}, {
    notes: string;
    bpm: number;
    channel?: number | undefined;
    velocity?: number | undefined;
    articulation?: number | undefined;
    transpose?: number | undefined;
    timeSignature?: string | undefined;
    key?: string | undefined;
    reverb?: number | undefined;
    swing?: number | undefined;
}>, z.ZodObject<{
    notes: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    rhythm: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tempo: z.ZodOptional<z.ZodNumber>;
    channel: z.ZodOptional<z.ZodNumber>;
    velocity: z.ZodOptional<z.ZodNumber>;
    gap: z.ZodOptional<z.ZodNumber>;
    style: z.ZodOptional<z.ZodEnum<["legato", "staccato", "tenuto", "marcato", "accent", "sforzando"]>>;
}, "strip", z.ZodTypeAny, {
    notes: string | string[];
    channel?: number | undefined;
    velocity?: number | undefined;
    tempo?: number | undefined;
    rhythm?: string[] | undefined;
    style?: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando" | undefined;
    gap?: number | undefined;
}, {
    notes: string | string[];
    channel?: number | undefined;
    velocity?: number | undefined;
    tempo?: number | undefined;
    rhythm?: string[] | undefined;
    style?: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando" | undefined;
    gap?: number | undefined;
}>]>;
export declare const CCEventSchema: z.ZodObject<{
    absoluteTime: z.ZodNumber;
    controller: z.ZodUnion<[z.ZodNumber, z.ZodEnum<["volume", "pan", "expression", "sustain", "reverb", "chorus"]>]>;
    value: z.ZodNumber;
    channel: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    value: number;
    channel: number;
    controller: number | "reverb" | "volume" | "pan" | "expression" | "chorus" | "sustain";
    absoluteTime: number;
    description?: string | undefined;
}, {
    value: number;
    channel: number;
    controller: number | "reverb" | "volume" | "pan" | "expression" | "chorus" | "sustain";
    absoluteTime: number;
    description?: string | undefined;
}>;
export declare const NoteEventSchema: z.ZodObject<{
    absoluteTime: z.ZodNumber;
    toneName: z.ZodString;
    midiNote: z.ZodNumber;
    velocity: z.ZodNumber;
    duration: z.ZodNumber;
    channel: z.ZodNumber;
    articulation: z.ZodEnum<["legato", "staccato", "tenuto", "marcato", "accent", "sforzando"]>;
    noteOffTime: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    channel: number;
    velocity: number;
    articulation: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando";
    duration: number;
    midiNote: number;
    absoluteTime: number;
    toneName: string;
    noteOffTime: number;
}, {
    channel: number;
    velocity: number;
    articulation: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando";
    duration: number;
    midiNote: number;
    absoluteTime: number;
    toneName: string;
    noteOffTime: number;
}>;
export declare const SystemEventSchema: z.ZodObject<{
    absoluteTime: z.ZodNumber;
    type: z.ZodEnum<["tempo_change", "time_signature", "program_change"]>;
    value: z.ZodAny;
    channel: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "tempo_change" | "time_signature" | "program_change";
    absoluteTime: number;
    value?: any;
    channel?: number | undefined;
}, {
    type: "tempo_change" | "time_signature" | "program_change";
    absoluteTime: number;
    value?: any;
    channel?: number | undefined;
}>;
export declare const MidiPortSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["input", "output"]>;
    connected: z.ZodBoolean;
    manufacturer: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "input" | "output";
    name: string;
    id: string;
    connected: boolean;
    manufacturer?: string | undefined;
}, {
    type: "input" | "output";
    name: string;
    id: string;
    connected: boolean;
    manufacturer?: string | undefined;
}>;
export declare const InternalMidiTempoSchema: z.ZodObject<{
    bpm: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    bpm: number;
}, {
    bpm: number;
}>;
export declare const InternalMidiTransportSchema: z.ZodObject<{
    action: z.ZodEnum<["play", "pause", "stop", "rewind"]>;
}, "strip", z.ZodTypeAny, {
    action: "play" | "pause" | "stop" | "rewind";
}, {
    action: "play" | "pause" | "stop" | "rewind";
}>;
export declare const InternalMidiPortConfigSchema: z.ZodObject<{
    portName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    portName: string;
}, {
    portName: string;
}>;
export declare const InternalMidiListPortsSchema: z.ZodObject<{
    refresh: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    refresh: boolean;
}, {
    refresh?: boolean | undefined;
}>;
export declare const MidiErrorSchema: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    details: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    code: string;
    message: string;
    details?: any;
}, {
    code: string;
    message: string;
    details?: any;
}>;
export declare function validateMidiNote(note: string | number): number;
export declare function validateController(controller: string | number): number;
export declare function parseMusicalDuration(duration: string, bpm: number): number;
export type InternalMidiTempoInput = z.infer<typeof InternalMidiTempoSchema>;
export type InternalMidiTransportInput = z.infer<typeof InternalMidiTransportSchema>;
export type InternalMidiPortConfigInput = z.infer<typeof InternalMidiPortConfigSchema>;
export type InternalMidiListPortsInput = z.infer<typeof InternalMidiListPortsSchema>;
export type MidiPort = z.infer<typeof MidiPortSchema>;
export type NoteEvent = z.infer<typeof NoteEventSchema>;
export type CCEvent = z.infer<typeof CCEventSchema>;
export type SystemEvent = z.infer<typeof SystemEventSchema>;
//# sourceMappingURL=midi-schemas.d.ts.map