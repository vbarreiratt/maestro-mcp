/**
 * Rigorous Zod schemas for musical concepts and theory
 * Follows best practices for music-specific validation
 */
import { z } from 'zod';
export declare const ScaleSchema: z.ZodString;
export declare const MusicEventSchema: z.ZodObject<{
    time: z.ZodString;
    type: z.ZodEnum<["note", "chord", "cc", "sequence", "rest"]>;
    value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodRecord<z.ZodString, z.ZodAny>]>;
    duration: z.ZodOptional<z.ZodString>;
    velocity: z.ZodOptional<z.ZodNumber>;
    channel: z.ZodOptional<z.ZodNumber>;
    articulation: z.ZodOptional<z.ZodEnum<["legato", "staccato", "tenuto", "marcato", "accent", "sforzando", "crescendo", "diminuendo"]>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    value: string | number | Record<string, any>;
    type: "note" | "cc" | "chord" | "sequence" | "rest";
    time: string;
    velocity?: number | undefined;
    articulation?: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando" | "crescendo" | "diminuendo" | undefined;
    channel?: number | undefined;
    duration?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    value: string | number | Record<string, any>;
    type: "note" | "cc" | "chord" | "sequence" | "rest";
    time: string;
    velocity?: number | undefined;
    articulation?: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando" | "crescendo" | "diminuendo" | undefined;
    channel?: number | undefined;
    duration?: string | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const PlanoMusicalSchema: z.ZodEffects<z.ZodObject<{
    bpm: z.ZodNumber;
    timeSignature: z.ZodDefault<z.ZodString>;
    key: z.ZodOptional<z.ZodString>;
    events: z.ZodArray<z.ZodObject<{
        time: z.ZodString;
        type: z.ZodEnum<["note", "chord", "cc", "sequence", "rest"]>;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodRecord<z.ZodString, z.ZodAny>]>;
        duration: z.ZodOptional<z.ZodString>;
        velocity: z.ZodOptional<z.ZodNumber>;
        channel: z.ZodOptional<z.ZodNumber>;
        articulation: z.ZodOptional<z.ZodEnum<["legato", "staccato", "tenuto", "marcato", "accent", "sforzando", "crescendo", "diminuendo"]>>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        value: string | number | Record<string, any>;
        type: "note" | "cc" | "chord" | "sequence" | "rest";
        time: string;
        velocity?: number | undefined;
        articulation?: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando" | "crescendo" | "diminuendo" | undefined;
        channel?: number | undefined;
        duration?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }, {
        value: string | number | Record<string, any>;
        type: "note" | "cc" | "chord" | "sequence" | "rest";
        time: string;
        velocity?: number | undefined;
        articulation?: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando" | "crescendo" | "diminuendo" | undefined;
        channel?: number | undefined;
        duration?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    bpm: number;
    timeSignature: string;
    events: {
        value: string | number | Record<string, any>;
        type: "note" | "cc" | "chord" | "sequence" | "rest";
        time: string;
        velocity?: number | undefined;
        articulation?: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando" | "crescendo" | "diminuendo" | undefined;
        channel?: number | undefined;
        duration?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }[];
    key?: string | undefined;
}, {
    bpm: number;
    events: {
        value: string | number | Record<string, any>;
        type: "note" | "cc" | "chord" | "sequence" | "rest";
        time: string;
        velocity?: number | undefined;
        articulation?: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando" | "crescendo" | "diminuendo" | undefined;
        channel?: number | undefined;
        duration?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }[];
    timeSignature?: string | undefined;
    key?: string | undefined;
}>, {
    bpm: number;
    timeSignature: string;
    events: {
        value: string | number | Record<string, any>;
        type: "note" | "cc" | "chord" | "sequence" | "rest";
        time: string;
        velocity?: number | undefined;
        articulation?: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando" | "crescendo" | "diminuendo" | undefined;
        channel?: number | undefined;
        duration?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }[];
    key?: string | undefined;
}, {
    bpm: number;
    events: {
        value: string | number | Record<string, any>;
        type: "note" | "cc" | "chord" | "sequence" | "rest";
        time: string;
        velocity?: number | undefined;
        articulation?: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando" | "crescendo" | "diminuendo" | undefined;
        channel?: number | undefined;
        duration?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }[];
    timeSignature?: string | undefined;
    key?: string | undefined;
}>;
export declare const PartituraExecutavelSchema: z.ZodEffects<z.ZodObject<{
    metadata: z.ZodObject<{
        bpm: z.ZodNumber;
        timeSignature: z.ZodString;
        key: z.ZodString;
        totalDuration: z.ZodString;
        eventCount: z.ZodNumber;
        generatedAt: z.ZodOptional<z.ZodDate>;
        version: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        bpm: number;
        timeSignature: string;
        key: string;
        totalDuration: string;
        eventCount: number;
        version?: string | undefined;
        generatedAt?: Date | undefined;
    }, {
        bpm: number;
        timeSignature: string;
        key: string;
        totalDuration: string;
        eventCount: number;
        version?: string | undefined;
        generatedAt?: Date | undefined;
    }>;
    noteEvents: z.ZodArray<z.ZodObject<{
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
        articulation: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando";
        channel: number;
        duration: number;
        midiNote: number;
        absoluteTime: number;
        toneName: string;
        noteOffTime: number;
    }, {
        velocity: number;
        articulation: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando";
        channel: number;
        duration: number;
        midiNote: number;
        absoluteTime: number;
        toneName: string;
        noteOffTime: number;
    }>, "many">;
    controlChangeEvents: z.ZodArray<z.ZodObject<{
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
    }>, "many">;
    systemEvents: z.ZodArray<z.ZodObject<{
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
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    noteEvents: {
        velocity: number;
        articulation: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando";
        channel: number;
        duration: number;
        midiNote: number;
        absoluteTime: number;
        toneName: string;
        noteOffTime: number;
    }[];
    systemEvents: {
        type: "tempo_change" | "time_signature" | "program_change";
        absoluteTime: number;
        value?: any;
        channel?: number | undefined;
    }[];
    metadata: {
        bpm: number;
        timeSignature: string;
        key: string;
        totalDuration: string;
        eventCount: number;
        version?: string | undefined;
        generatedAt?: Date | undefined;
    };
    controlChangeEvents: {
        value: number;
        channel: number;
        controller: number | "reverb" | "volume" | "pan" | "expression" | "chorus" | "sustain";
        absoluteTime: number;
        description?: string | undefined;
    }[];
}, {
    noteEvents: {
        velocity: number;
        articulation: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando";
        channel: number;
        duration: number;
        midiNote: number;
        absoluteTime: number;
        toneName: string;
        noteOffTime: number;
    }[];
    systemEvents: {
        type: "tempo_change" | "time_signature" | "program_change";
        absoluteTime: number;
        value?: any;
        channel?: number | undefined;
    }[];
    metadata: {
        bpm: number;
        timeSignature: string;
        key: string;
        totalDuration: string;
        eventCount: number;
        version?: string | undefined;
        generatedAt?: Date | undefined;
    };
    controlChangeEvents: {
        value: number;
        channel: number;
        controller: number | "reverb" | "volume" | "pan" | "expression" | "chorus" | "sustain";
        absoluteTime: number;
        description?: string | undefined;
    }[];
}>, {
    noteEvents: {
        velocity: number;
        articulation: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando";
        channel: number;
        duration: number;
        midiNote: number;
        absoluteTime: number;
        toneName: string;
        noteOffTime: number;
    }[];
    systemEvents: {
        type: "tempo_change" | "time_signature" | "program_change";
        absoluteTime: number;
        value?: any;
        channel?: number | undefined;
    }[];
    metadata: {
        bpm: number;
        timeSignature: string;
        key: string;
        totalDuration: string;
        eventCount: number;
        version?: string | undefined;
        generatedAt?: Date | undefined;
    };
    controlChangeEvents: {
        value: number;
        channel: number;
        controller: number | "reverb" | "volume" | "pan" | "expression" | "chorus" | "sustain";
        absoluteTime: number;
        description?: string | undefined;
    }[];
}, {
    noteEvents: {
        velocity: number;
        articulation: "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando";
        channel: number;
        duration: number;
        midiNote: number;
        absoluteTime: number;
        toneName: string;
        noteOffTime: number;
    }[];
    systemEvents: {
        type: "tempo_change" | "time_signature" | "program_change";
        absoluteTime: number;
        value?: any;
        channel?: number | undefined;
    }[];
    metadata: {
        bpm: number;
        timeSignature: string;
        key: string;
        totalDuration: string;
        eventCount: number;
        version?: string | undefined;
        generatedAt?: Date | undefined;
    };
    controlChangeEvents: {
        value: number;
        channel: number;
        controller: number | "reverb" | "volume" | "pan" | "expression" | "chorus" | "sustain";
        absoluteTime: number;
        description?: string | undefined;
    }[];
}>;
export declare const ChordVoicingSchema: z.ZodEnum<["close", "open", "drop2", "drop3", "quartal", "rootless", "shell"]>;
export declare const MusicalPhraseSchema: z.ZodEffects<z.ZodObject<{
    notes: z.ZodArray<z.ZodString, "many">;
    rhythm: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    articulations: z.ZodOptional<z.ZodArray<z.ZodEnum<["legato", "staccato", "tenuto", "marcato", "accent", "sforzando", "crescendo", "diminuendo"]>, "many">>;
    dynamics: z.ZodOptional<z.ZodArray<z.ZodEnum<["pp", "p", "mp", "mf", "f", "ff", "sf"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    notes: string[];
    rhythm?: string[] | undefined;
    articulations?: ("legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando" | "crescendo" | "diminuendo")[] | undefined;
    dynamics?: ("pp" | "p" | "mp" | "mf" | "f" | "ff" | "sf")[] | undefined;
}, {
    notes: string[];
    rhythm?: string[] | undefined;
    articulations?: ("legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando" | "crescendo" | "diminuendo")[] | undefined;
    dynamics?: ("pp" | "p" | "mp" | "mf" | "f" | "ff" | "sf")[] | undefined;
}>, {
    notes: string[];
    rhythm?: string[] | undefined;
    articulations?: ("legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando" | "crescendo" | "diminuendo")[] | undefined;
    dynamics?: ("pp" | "p" | "mp" | "mf" | "f" | "ff" | "sf")[] | undefined;
}, {
    notes: string[];
    rhythm?: string[] | undefined;
    articulations?: ("legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando" | "crescendo" | "diminuendo")[] | undefined;
    dynamics?: ("pp" | "p" | "mp" | "mf" | "f" | "ff" | "sf")[] | undefined;
}>;
export declare const ProgressionSchema: z.ZodObject<{
    chords: z.ZodArray<z.ZodString, "many">;
    durations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    key: z.ZodString;
    voicing: z.ZodDefault<z.ZodEnum<["close", "open", "drop2", "drop3", "quartal", "rootless", "shell"]>>;
}, "strip", z.ZodTypeAny, {
    key: string;
    chords: string[];
    voicing: "close" | "open" | "drop2" | "drop3" | "quartal" | "rootless" | "shell";
    durations?: string[] | undefined;
}, {
    key: string;
    chords: string[];
    durations?: string[] | undefined;
    voicing?: "close" | "open" | "drop2" | "drop3" | "quartal" | "rootless" | "shell" | undefined;
}>;
export declare const StyleParametersSchema: z.ZodObject<{
    swing: z.ZodDefault<z.ZodNumber>;
    humanization: z.ZodDefault<z.ZodNumber>;
    groove: z.ZodDefault<z.ZodEnum<["straight", "swing", "shuffle", "latin", "reggae"]>>;
    intensity: z.ZodDefault<z.ZodNumber>;
    rubato: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    swing: number;
    humanization: number;
    groove: "swing" | "straight" | "shuffle" | "latin" | "reggae";
    intensity: number;
    rubato: number;
}, {
    swing?: number | undefined;
    humanization?: number | undefined;
    groove?: "swing" | "straight" | "shuffle" | "latin" | "reggae" | undefined;
    intensity?: number | undefined;
    rubato?: number | undefined;
}>;
export declare const MusicalContextSchema: z.ZodObject<{
    genre: z.ZodOptional<z.ZodEnum<["classical", "jazz", "rock", "pop", "electronic", "folk", "blues", "country", "latin", "world", "experimental"]>>;
    mood: z.ZodOptional<z.ZodEnum<["happy", "sad", "energetic", "calm", "mysterious", "dramatic", "romantic", "aggressive", "peaceful", "tension", "release"]>>;
    complexity: z.ZodDefault<z.ZodEnum<["simple", "moderate", "complex", "virtuosic"]>>;
    target: z.ZodDefault<z.ZodEnum<["practice", "performance", "composition", "analysis"]>>;
}, "strip", z.ZodTypeAny, {
    target: "performance" | "practice" | "composition" | "analysis";
    complexity: "simple" | "moderate" | "complex" | "virtuosic";
    genre?: "pop" | "experimental" | "latin" | "classical" | "jazz" | "rock" | "electronic" | "folk" | "blues" | "country" | "world" | undefined;
    mood?: "happy" | "sad" | "energetic" | "calm" | "mysterious" | "dramatic" | "romantic" | "aggressive" | "peaceful" | "tension" | "release" | undefined;
}, {
    target?: "performance" | "practice" | "composition" | "analysis" | undefined;
    genre?: "pop" | "experimental" | "latin" | "classical" | "jazz" | "rock" | "electronic" | "folk" | "blues" | "country" | "world" | undefined;
    mood?: "happy" | "sad" | "energetic" | "calm" | "mysterious" | "dramatic" | "romantic" | "aggressive" | "peaceful" | "tension" | "release" | undefined;
    complexity?: "simple" | "moderate" | "complex" | "virtuosic" | undefined;
}>;
export declare function validateChordProgression(chords: string[], _key: string): boolean;
export declare function parseMusicalTime(time: string, bpm: number, timeSignature?: string): number;
export declare function parseNoteDuration(notation: string, bpm: number): number;
export declare function expandChord(chord: string, _voicing?: string, octave?: number): string[];
export type PlanoMusical = z.infer<typeof PlanoMusicalSchema>;
export type MusicEvent = z.infer<typeof MusicEventSchema>;
export type PartituraExecutavel = z.infer<typeof PartituraExecutavelSchema>;
export type MusicalPhrase = z.infer<typeof MusicalPhraseSchema>;
export type Progression = z.infer<typeof ProgressionSchema>;
export type StyleParameters = z.infer<typeof StyleParametersSchema>;
export type MusicalContext = z.infer<typeof MusicalContextSchema>;
export type ChordVoicing = z.infer<typeof ChordVoicingSchema>;
//# sourceMappingURL=music-schemas.d.ts.map