/**
 * Rigorous Zod schemas for MIDI operations
 * Follows best practices for validation with clear error messages
 */
import { z } from 'zod';
export declare const TimeSignatureSchema: z.ZodString;
export declare const MusicalKeySchema: z.ZodString;
export declare const MusicalDurationSchema: z.ZodString;
export declare const CCEventSchema: z.ZodObject<{
    absoluteTime: z.ZodNumber;
    controller: z.ZodUnion<[z.ZodNumber, z.ZodEnum<["volume", "pan", "expression", "sustain", "reverb", "chorus"]>]>;
    value: z.ZodNumber;
    channel: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    value: number;
    channel: number;
    controller: number | "volume" | "pan" | "expression" | "reverb" | "chorus" | "sustain";
    absoluteTime: number;
    description?: string | undefined;
}, {
    value: number;
    channel: number;
    controller: number | "volume" | "pan" | "expression" | "reverb" | "chorus" | "sustain";
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
    velocity: number;
    duration: number;
    channel: number;
    articulation: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando";
    absoluteTime: number;
    toneName: string;
    midiNote: number;
    noteOffTime: number;
}, {
    velocity: number;
    duration: number;
    channel: number;
    articulation: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando";
    absoluteTime: number;
    toneName: string;
    midiNote: number;
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
export declare const MidiSendNoteSchema: z.ZodObject<{
    note: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
    velocity: z.ZodDefault<z.ZodNumber>;
    duration: z.ZodDefault<z.ZodNumber>;
    channel: z.ZodDefault<z.ZodNumber>;
    outputPort: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    note: string | number;
    velocity: number;
    duration: number;
    channel: number;
    outputPort?: string | undefined;
}, {
    note: string | number;
    velocity?: number | undefined;
    duration?: number | undefined;
    channel?: number | undefined;
    outputPort?: string | undefined;
}>;
export declare const MidiPlayPhraseSchema: z.ZodObject<{
    notes: z.ZodString;
    rhythm: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodString]>>;
    tempo: z.ZodDefault<z.ZodNumber>;
    style: z.ZodDefault<z.ZodEnum<["legato", "staccato", "tenuto", "marcato", "accent", "sforzando"]>>;
    channel: z.ZodDefault<z.ZodNumber>;
    outputPort: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    channel: number;
    notes: string;
    tempo: number;
    style: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando";
    outputPort?: string | undefined;
    rhythm?: string | undefined;
}, {
    notes: string;
    channel?: number | undefined;
    outputPort?: string | undefined;
    rhythm?: string | undefined;
    tempo?: number | undefined;
    style?: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando" | undefined;
}>;
export declare const SequenceCommandSchema: z.ZodObject<{
    type: z.ZodEnum<["note", "cc", "delay"]>;
    time: z.ZodOptional<z.ZodNumber>;
    note: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
    duration: z.ZodOptional<z.ZodNumber>;
    velocity: z.ZodOptional<z.ZodNumber>;
    controller: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
    value: z.ZodOptional<z.ZodNumber>;
    channel: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "note" | "cc" | "delay";
    value?: number | undefined;
    note?: string | number | undefined;
    velocity?: number | undefined;
    duration?: number | undefined;
    channel?: number | undefined;
    time?: number | undefined;
    controller?: string | number | undefined;
}, {
    type: "note" | "cc" | "delay";
    value?: number | undefined;
    note?: string | number | undefined;
    velocity?: number | undefined;
    duration?: number | undefined;
    channel?: number | undefined;
    time?: number | undefined;
    controller?: string | number | undefined;
}>;
export declare const MidiSequenceSchema: z.ZodObject<{
    commands: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["note", "cc", "delay"]>;
        time: z.ZodOptional<z.ZodNumber>;
        note: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
        duration: z.ZodOptional<z.ZodNumber>;
        velocity: z.ZodOptional<z.ZodNumber>;
        controller: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
        value: z.ZodOptional<z.ZodNumber>;
        channel: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "note" | "cc" | "delay";
        value?: number | undefined;
        note?: string | number | undefined;
        velocity?: number | undefined;
        duration?: number | undefined;
        channel?: number | undefined;
        time?: number | undefined;
        controller?: string | number | undefined;
    }, {
        type: "note" | "cc" | "delay";
        value?: number | undefined;
        note?: string | number | undefined;
        velocity?: number | undefined;
        duration?: number | undefined;
        channel?: number | undefined;
        time?: number | undefined;
        controller?: string | number | undefined;
    }>, "many">;
    outputPort: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    commands: {
        type: "note" | "cc" | "delay";
        value?: number | undefined;
        note?: string | number | undefined;
        velocity?: number | undefined;
        duration?: number | undefined;
        channel?: number | undefined;
        time?: number | undefined;
        controller?: string | number | undefined;
    }[];
    outputPort?: string | undefined;
}, {
    commands: {
        type: "note" | "cc" | "delay";
        value?: number | undefined;
        note?: string | number | undefined;
        velocity?: number | undefined;
        duration?: number | undefined;
        channel?: number | undefined;
        time?: number | undefined;
        controller?: string | number | undefined;
    }[];
    outputPort?: string | undefined;
}>;
export declare const MidiCCSchema: z.ZodObject<{
    controller: z.ZodUnion<[z.ZodNumber, z.ZodEnum<["volume", "pan", "expression", "sustain", "reverb", "chorus"]>]>;
    value: z.ZodNumber;
    channel: z.ZodDefault<z.ZodNumber>;
    outputPort: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    value: number;
    channel: number;
    controller: number | "volume" | "pan" | "expression" | "reverb" | "chorus" | "sustain";
    outputPort?: string | undefined;
}, {
    value: number;
    controller: number | "volume" | "pan" | "expression" | "reverb" | "chorus" | "sustain";
    channel?: number | undefined;
    outputPort?: string | undefined;
}>;
export declare const MidiTempoSchema: z.ZodObject<{
    bpm: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    bpm: number;
}, {
    bpm: number;
}>;
export declare const MidiTransportSchema: z.ZodObject<{
    action: z.ZodEnum<["play", "pause", "stop", "rewind"]>;
}, "strip", z.ZodTypeAny, {
    action: "play" | "pause" | "stop" | "rewind";
}, {
    action: "play" | "pause" | "stop" | "rewind";
}>;
export declare const MidiPortConfigSchema: z.ZodObject<{
    portName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    portName: string;
}, {
    portName: string;
}>;
export declare const MidiListPortsSchema: z.ZodObject<{
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
//# sourceMappingURL=midi-schemas.d.ts.map