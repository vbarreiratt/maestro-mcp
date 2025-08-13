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
    targetDAW: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    portName: string;
    targetDAW?: string | undefined;
}, {
    portName: string;
    targetDAW?: string | undefined;
}>;
export declare const MidiPlayPhraseSchema: z.ZodObject<{
    bpm: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
    voices: z.ZodOptional<z.ZodArray<z.ZodObject<{
        channel: z.ZodNumber;
        notes: z.ZodString;
        velocity: z.ZodOptional<z.ZodNumber>;
        articulation: z.ZodOptional<z.ZodNumber>;
        transpose: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        channel: number;
        notes: string;
        velocity?: number | undefined;
        articulation?: number | undefined;
        transpose?: number | undefined;
    }, {
        channel: number;
        notes: string;
        velocity?: number | undefined;
        articulation?: number | undefined;
        transpose?: number | undefined;
    }>, "many">>;
    timeSignature: z.ZodDefault<z.ZodString>;
    key: z.ZodOptional<z.ZodString>;
    velocity: z.ZodDefault<z.ZodNumber>;
    articulation: z.ZodDefault<z.ZodNumber>;
    reverb: z.ZodDefault<z.ZodNumber>;
    swing: z.ZodDefault<z.ZodNumber>;
    channel: z.ZodDefault<z.ZodNumber>;
    transpose: z.ZodDefault<z.ZodNumber>;
    outputPort: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    channel: number;
    velocity: number;
    articulation: number;
    transpose: number;
    bpm: number;
    timeSignature: string;
    reverb: number;
    swing: number;
    notes?: string | undefined;
    voices?: {
        channel: number;
        notes: string;
        velocity?: number | undefined;
        articulation?: number | undefined;
        transpose?: number | undefined;
    }[] | undefined;
    key?: string | undefined;
    outputPort?: string | undefined;
}, {
    bpm: number;
    channel?: number | undefined;
    notes?: string | undefined;
    velocity?: number | undefined;
    articulation?: number | undefined;
    transpose?: number | undefined;
    voices?: {
        channel: number;
        notes: string;
        velocity?: number | undefined;
        articulation?: number | undefined;
        transpose?: number | undefined;
    }[] | undefined;
    timeSignature?: string | undefined;
    key?: string | undefined;
    reverb?: number | undefined;
    swing?: number | undefined;
    outputPort?: string | undefined;
}>;
export declare const MidiSendNoteSchema: z.ZodObject<{
    note: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    velocity: z.ZodDefault<z.ZodNumber>;
    duration: z.ZodDefault<z.ZodNumber>;
    bpm: z.ZodDefault<z.ZodNumber>;
    channel: z.ZodDefault<z.ZodNumber>;
    outputPort: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    channel: number;
    velocity: number;
    bpm: number;
    note: string | number;
    duration: number;
    outputPort?: string | undefined;
}, {
    note: string | number;
    channel?: number | undefined;
    velocity?: number | undefined;
    bpm?: number | undefined;
    outputPort?: string | undefined;
    duration?: number | undefined;
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
    channel?: number | undefined;
    velocity?: number | undefined;
    note?: string | number | undefined;
    duration?: number | undefined;
    time?: number | undefined;
    controller?: number | undefined;
}, {
    type: "note" | "cc" | "delay";
    value?: number | undefined;
    channel?: number | undefined;
    velocity?: number | undefined;
    note?: string | number | undefined;
    duration?: number | undefined;
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
        channel?: number | undefined;
        velocity?: number | undefined;
        note?: string | number | undefined;
        duration?: number | undefined;
        time?: number | undefined;
        controller?: number | undefined;
    }, {
        type: "note" | "cc" | "delay";
        value?: number | undefined;
        channel?: number | undefined;
        velocity?: number | undefined;
        note?: string | number | undefined;
        duration?: number | undefined;
        time?: number | undefined;
        controller?: number | undefined;
    }>, "many">;
    outputPort: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    commands: {
        type: "note" | "cc" | "delay";
        value?: number | undefined;
        channel?: number | undefined;
        velocity?: number | undefined;
        note?: string | number | undefined;
        duration?: number | undefined;
        time?: number | undefined;
        controller?: number | undefined;
    }[];
    outputPort?: string | undefined;
}, {
    commands: {
        type: "note" | "cc" | "delay";
        value?: number | undefined;
        channel?: number | undefined;
        velocity?: number | undefined;
        note?: string | number | undefined;
        duration?: number | undefined;
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
    controller: number | "reverb" | "volume" | "pan" | "expression" | "chorus" | "modwheel" | "sustain";
    outputPort?: string | undefined;
}, {
    value: number;
    controller: number | "reverb" | "volume" | "pan" | "expression" | "chorus" | "modwheel" | "sustain";
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
export declare const MidiImportScoreSchema: z.ZodObject<{
    source: z.ZodEnum<["text_notation", "musicxml", "guitar_tab"]>;
    data: z.ZodString;
    tempo: z.ZodDefault<z.ZodNumber>;
    channel: z.ZodDefault<z.ZodNumber>;
    preview: z.ZodDefault<z.ZodBoolean>;
    quantize: z.ZodDefault<z.ZodBoolean>;
    outputPort: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    channel: number;
    source: "text_notation" | "musicxml" | "guitar_tab";
    data: string;
    tempo: number;
    preview: boolean;
    quantize: boolean;
    outputPort?: string | undefined;
}, {
    source: "text_notation" | "musicxml" | "guitar_tab";
    data: string;
    channel?: number | undefined;
    outputPort?: string | undefined;
    tempo?: number | undefined;
    preview?: boolean | undefined;
    quantize?: boolean | undefined;
}>;
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
        targetDAW: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        portName: string;
        targetDAW?: string | undefined;
    }, {
        portName: string;
        targetDAW?: string | undefined;
    }>;
    readonly midi_send_note: z.ZodObject<{
        note: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        velocity: z.ZodDefault<z.ZodNumber>;
        duration: z.ZodDefault<z.ZodNumber>;
        bpm: z.ZodDefault<z.ZodNumber>;
        channel: z.ZodDefault<z.ZodNumber>;
        outputPort: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        channel: number;
        velocity: number;
        bpm: number;
        note: string | number;
        duration: number;
        outputPort?: string | undefined;
    }, {
        note: string | number;
        channel?: number | undefined;
        velocity?: number | undefined;
        bpm?: number | undefined;
        outputPort?: string | undefined;
        duration?: number | undefined;
    }>;
    readonly midi_play_phrase: z.ZodObject<{
        bpm: z.ZodNumber;
        notes: z.ZodOptional<z.ZodString>;
        voices: z.ZodOptional<z.ZodArray<z.ZodObject<{
            channel: z.ZodNumber;
            notes: z.ZodString;
            velocity: z.ZodOptional<z.ZodNumber>;
            articulation: z.ZodOptional<z.ZodNumber>;
            transpose: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            channel: number;
            notes: string;
            velocity?: number | undefined;
            articulation?: number | undefined;
            transpose?: number | undefined;
        }, {
            channel: number;
            notes: string;
            velocity?: number | undefined;
            articulation?: number | undefined;
            transpose?: number | undefined;
        }>, "many">>;
        timeSignature: z.ZodDefault<z.ZodString>;
        key: z.ZodOptional<z.ZodString>;
        velocity: z.ZodDefault<z.ZodNumber>;
        articulation: z.ZodDefault<z.ZodNumber>;
        reverb: z.ZodDefault<z.ZodNumber>;
        swing: z.ZodDefault<z.ZodNumber>;
        channel: z.ZodDefault<z.ZodNumber>;
        transpose: z.ZodDefault<z.ZodNumber>;
        outputPort: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        channel: number;
        velocity: number;
        articulation: number;
        transpose: number;
        bpm: number;
        timeSignature: string;
        reverb: number;
        swing: number;
        notes?: string | undefined;
        voices?: {
            channel: number;
            notes: string;
            velocity?: number | undefined;
            articulation?: number | undefined;
            transpose?: number | undefined;
        }[] | undefined;
        key?: string | undefined;
        outputPort?: string | undefined;
    }, {
        bpm: number;
        channel?: number | undefined;
        notes?: string | undefined;
        velocity?: number | undefined;
        articulation?: number | undefined;
        transpose?: number | undefined;
        voices?: {
            channel: number;
            notes: string;
            velocity?: number | undefined;
            articulation?: number | undefined;
            transpose?: number | undefined;
        }[] | undefined;
        timeSignature?: string | undefined;
        key?: string | undefined;
        reverb?: number | undefined;
        swing?: number | undefined;
        outputPort?: string | undefined;
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
            channel?: number | undefined;
            velocity?: number | undefined;
            note?: string | number | undefined;
            duration?: number | undefined;
            time?: number | undefined;
            controller?: number | undefined;
        }, {
            type: "note" | "cc" | "delay";
            value?: number | undefined;
            channel?: number | undefined;
            velocity?: number | undefined;
            note?: string | number | undefined;
            duration?: number | undefined;
            time?: number | undefined;
            controller?: number | undefined;
        }>, "many">;
        outputPort: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        commands: {
            type: "note" | "cc" | "delay";
            value?: number | undefined;
            channel?: number | undefined;
            velocity?: number | undefined;
            note?: string | number | undefined;
            duration?: number | undefined;
            time?: number | undefined;
            controller?: number | undefined;
        }[];
        outputPort?: string | undefined;
    }, {
        commands: {
            type: "note" | "cc" | "delay";
            value?: number | undefined;
            channel?: number | undefined;
            velocity?: number | undefined;
            note?: string | number | undefined;
            duration?: number | undefined;
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
        controller: number | "reverb" | "volume" | "pan" | "expression" | "chorus" | "modwheel" | "sustain";
        outputPort?: string | undefined;
    }, {
        value: number;
        controller: number | "reverb" | "volume" | "pan" | "expression" | "chorus" | "modwheel" | "sustain";
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
    readonly midi_import_score: z.ZodObject<{
        source: z.ZodEnum<["text_notation", "musicxml", "guitar_tab"]>;
        data: z.ZodString;
        tempo: z.ZodDefault<z.ZodNumber>;
        channel: z.ZodDefault<z.ZodNumber>;
        preview: z.ZodDefault<z.ZodBoolean>;
        quantize: z.ZodDefault<z.ZodBoolean>;
        outputPort: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        channel: number;
        source: "text_notation" | "musicxml" | "guitar_tab";
        data: string;
        tempo: number;
        preview: boolean;
        quantize: boolean;
        outputPort?: string | undefined;
    }, {
        source: "text_notation" | "musicxml" | "guitar_tab";
        data: string;
        channel?: number | undefined;
        outputPort?: string | undefined;
        tempo?: number | undefined;
        preview?: boolean | undefined;
        quantize?: boolean | undefined;
    }>;
};
export type MCPToolSchemas = typeof MCP_TOOL_SCHEMAS;
//# sourceMappingURL=mcp-tools-schemas.d.ts.map