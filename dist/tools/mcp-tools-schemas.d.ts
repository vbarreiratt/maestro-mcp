/**
 * MCP Tools Schema Definitions
 * Complete schemas for all 8 mandatory MIDI tools
 */
import { z } from 'zod';
export declare const MidiListPortsSchema: z.ZodObject<{
    refresh: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    refresh?: boolean | undefined;
}, {
    refresh?: boolean | undefined;
}>;
export declare const ConfigureMidiOutputSchema: z.ZodObject<{
    portName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    portName: string;
}, {
    portName: string;
}>;
export declare const MidiSendNoteSchema: z.ZodObject<{
    note: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
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
    rhythm: z.ZodDefault<z.ZodUnion<[z.ZodString, z.ZodLiteral<"whole">, z.ZodLiteral<"half">, z.ZodLiteral<"quarter">, z.ZodLiteral<"eighth">, z.ZodLiteral<"sixteenth">]>>;
    tempo: z.ZodDefault<z.ZodNumber>;
    style: z.ZodDefault<z.ZodEnum<["legato", "staccato", "tenuto", "marcato"]>>;
    channel: z.ZodDefault<z.ZodNumber>;
    gap: z.ZodDefault<z.ZodNumber>;
    outputPort: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    channel: number;
    notes: string;
    rhythm: string;
    tempo: number;
    style: "legato" | "staccato" | "tenuto" | "marcato";
    gap: number;
    outputPort?: string | undefined;
}, {
    notes: string;
    channel?: number | undefined;
    outputPort?: string | undefined;
    rhythm?: string | undefined;
    tempo?: number | undefined;
    style?: "legato" | "staccato" | "tenuto" | "marcato" | undefined;
    gap?: number | undefined;
}>;
export declare const MidiSequenceCommandSchema: z.ZodObject<{
    type: z.ZodEnum<["note", "cc", "delay"]>;
    time: z.ZodOptional<z.ZodNumber>;
    note: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    duration: z.ZodOptional<z.ZodNumber>;
    velocity: z.ZodOptional<z.ZodNumber>;
    controller: z.ZodOptional<z.ZodNumber>;
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
    controller?: number | undefined;
}, {
    type: "note" | "cc" | "delay";
    value?: number | undefined;
    note?: string | number | undefined;
    velocity?: number | undefined;
    duration?: number | undefined;
    channel?: number | undefined;
    time?: number | undefined;
    controller?: number | undefined;
}>;
export declare const MidiSequenceCommandsSchema: z.ZodObject<{
    commands: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["note", "cc", "delay"]>;
        time: z.ZodOptional<z.ZodNumber>;
        note: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        duration: z.ZodOptional<z.ZodNumber>;
        velocity: z.ZodOptional<z.ZodNumber>;
        controller: z.ZodOptional<z.ZodNumber>;
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
        controller?: number | undefined;
    }, {
        type: "note" | "cc" | "delay";
        value?: number | undefined;
        note?: string | number | undefined;
        velocity?: number | undefined;
        duration?: number | undefined;
        channel?: number | undefined;
        time?: number | undefined;
        controller?: number | undefined;
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
        controller?: number | undefined;
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
        controller?: number | undefined;
    }[];
    outputPort?: string | undefined;
}>;
export declare const MidiSendCCSchema: z.ZodObject<{
    controller: z.ZodUnion<[z.ZodNumber, z.ZodEnum<["volume", "pan", "expression", "reverb", "chorus", "modwheel", "sustain"]>]>;
    value: z.ZodNumber;
    channel: z.ZodDefault<z.ZodNumber>;
    outputPort: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    value: number;
    channel: number;
    controller: number | "volume" | "pan" | "expression" | "reverb" | "chorus" | "modwheel" | "sustain";
    outputPort?: string | undefined;
}, {
    value: number;
    controller: number | "volume" | "pan" | "expression" | "reverb" | "chorus" | "modwheel" | "sustain";
    channel?: number | undefined;
    outputPort?: string | undefined;
}>;
export declare const MidiSetTempoSchema: z.ZodObject<{
    bpm: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    bpm: number;
}, {
    bpm: number;
}>;
export declare const MidiTransportControlSchema: z.ZodObject<{
    action: z.ZodEnum<["play", "pause", "stop", "rewind"]>;
}, "strip", z.ZodTypeAny, {
    action: "play" | "pause" | "stop" | "rewind";
}, {
    action: "play" | "pause" | "stop" | "rewind";
}>;
export declare const MidiPanicSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const CC_MAPPINGS: {
    readonly volume: 7;
    readonly pan: 10;
    readonly expression: 11;
    readonly reverb: 91;
    readonly chorus: 93;
    readonly modwheel: 1;
    readonly sustain: 64;
};
export declare const MCP_TOOL_SCHEMAS: {
    readonly midi_list_ports: z.ZodObject<{
        refresh: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        refresh?: boolean | undefined;
    }, {
        refresh?: boolean | undefined;
    }>;
    readonly configure_midi_output: z.ZodObject<{
        portName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        portName: string;
    }, {
        portName: string;
    }>;
    readonly midi_send_note: z.ZodObject<{
        note: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
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
    readonly midi_play_phrase: z.ZodObject<{
        notes: z.ZodString;
        rhythm: z.ZodDefault<z.ZodUnion<[z.ZodString, z.ZodLiteral<"whole">, z.ZodLiteral<"half">, z.ZodLiteral<"quarter">, z.ZodLiteral<"eighth">, z.ZodLiteral<"sixteenth">]>>;
        tempo: z.ZodDefault<z.ZodNumber>;
        style: z.ZodDefault<z.ZodEnum<["legato", "staccato", "tenuto", "marcato"]>>;
        channel: z.ZodDefault<z.ZodNumber>;
        gap: z.ZodDefault<z.ZodNumber>;
        outputPort: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        channel: number;
        notes: string;
        rhythm: string;
        tempo: number;
        style: "legato" | "staccato" | "tenuto" | "marcato";
        gap: number;
        outputPort?: string | undefined;
    }, {
        notes: string;
        channel?: number | undefined;
        outputPort?: string | undefined;
        rhythm?: string | undefined;
        tempo?: number | undefined;
        style?: "legato" | "staccato" | "tenuto" | "marcato" | undefined;
        gap?: number | undefined;
    }>;
    readonly midi_sequence_commands: z.ZodObject<{
        commands: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["note", "cc", "delay"]>;
            time: z.ZodOptional<z.ZodNumber>;
            note: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            duration: z.ZodOptional<z.ZodNumber>;
            velocity: z.ZodOptional<z.ZodNumber>;
            controller: z.ZodOptional<z.ZodNumber>;
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
            controller?: number | undefined;
        }, {
            type: "note" | "cc" | "delay";
            value?: number | undefined;
            note?: string | number | undefined;
            velocity?: number | undefined;
            duration?: number | undefined;
            channel?: number | undefined;
            time?: number | undefined;
            controller?: number | undefined;
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
            controller?: number | undefined;
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
            controller?: number | undefined;
        }[];
        outputPort?: string | undefined;
    }>;
    readonly midi_send_cc: z.ZodObject<{
        controller: z.ZodUnion<[z.ZodNumber, z.ZodEnum<["volume", "pan", "expression", "reverb", "chorus", "modwheel", "sustain"]>]>;
        value: z.ZodNumber;
        channel: z.ZodDefault<z.ZodNumber>;
        outputPort: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        channel: number;
        controller: number | "volume" | "pan" | "expression" | "reverb" | "chorus" | "modwheel" | "sustain";
        outputPort?: string | undefined;
    }, {
        value: number;
        controller: number | "volume" | "pan" | "expression" | "reverb" | "chorus" | "modwheel" | "sustain";
        channel?: number | undefined;
        outputPort?: string | undefined;
    }>;
    readonly midi_set_tempo: z.ZodObject<{
        bpm: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        bpm: number;
    }, {
        bpm: number;
    }>;
    readonly midi_transport_control: z.ZodObject<{
        action: z.ZodEnum<["play", "pause", "stop", "rewind"]>;
    }, "strip", z.ZodTypeAny, {
        action: "play" | "pause" | "stop" | "rewind";
    }, {
        action: "play" | "pause" | "stop" | "rewind";
    }>;
    readonly midi_panic: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
};
export type MCPToolSchemas = typeof MCP_TOOL_SCHEMAS;
//# sourceMappingURL=mcp-tools-schemas.d.ts.map