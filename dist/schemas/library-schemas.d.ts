import { z } from 'zod';
export declare const ScoreMetadataSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    composer: z.ZodString;
    style: z.ZodString;
    composition_year: z.ZodOptional<z.ZodNumber>;
    key_signature: z.ZodOptional<z.ZodString>;
    bpm: z.ZodOptional<z.ZodNumber>;
    time_signature: z.ZodDefault<z.ZodString>;
    difficulty: z.ZodOptional<z.ZodNumber>;
    duration_seconds: z.ZodOptional<z.ZodNumber>;
    voices_count: z.ZodOptional<z.ZodNumber>;
    instruments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    preview_notes: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    time_signature: string;
    id: string;
    title: string;
    composer: string;
    style: string;
    bpm?: number | undefined;
    description?: string | undefined;
    composition_year?: number | undefined;
    key_signature?: string | undefined;
    difficulty?: number | undefined;
    duration_seconds?: number | undefined;
    voices_count?: number | undefined;
    instruments?: string[] | undefined;
    tags?: string[] | undefined;
    preview_notes?: string | undefined;
}, {
    id: string;
    title: string;
    composer: string;
    style: string;
    bpm?: number | undefined;
    time_signature?: string | undefined;
    description?: string | undefined;
    composition_year?: number | undefined;
    key_signature?: string | undefined;
    difficulty?: number | undefined;
    duration_seconds?: number | undefined;
    voices_count?: number | undefined;
    instruments?: string[] | undefined;
    tags?: string[] | undefined;
    preview_notes?: string | undefined;
}>;
export declare const MaestroFormatSchema: z.ZodObject<{
    bpm: z.ZodOptional<z.ZodNumber>;
    timeSignature: z.ZodOptional<z.ZodString>;
    key: z.ZodOptional<z.ZodString>;
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
    notes: z.ZodOptional<z.ZodString>;
    velocity: z.ZodOptional<z.ZodNumber>;
    articulation: z.ZodOptional<z.ZodNumber>;
    transpose: z.ZodOptional<z.ZodNumber>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    bpm: z.ZodOptional<z.ZodNumber>;
    timeSignature: z.ZodOptional<z.ZodString>;
    key: z.ZodOptional<z.ZodString>;
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
    notes: z.ZodOptional<z.ZodString>;
    velocity: z.ZodOptional<z.ZodNumber>;
    articulation: z.ZodOptional<z.ZodNumber>;
    transpose: z.ZodOptional<z.ZodNumber>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    bpm: z.ZodOptional<z.ZodNumber>;
    timeSignature: z.ZodOptional<z.ZodString>;
    key: z.ZodOptional<z.ZodString>;
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
    notes: z.ZodOptional<z.ZodString>;
    velocity: z.ZodOptional<z.ZodNumber>;
    articulation: z.ZodOptional<z.ZodNumber>;
    transpose: z.ZodOptional<z.ZodNumber>;
}, z.ZodTypeAny, "passthrough">>;
export declare const FullScoreSchema: z.ZodObject<{
    metadata: z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        composer: z.ZodString;
        style: z.ZodString;
        composition_year: z.ZodOptional<z.ZodNumber>;
        key_signature: z.ZodOptional<z.ZodString>;
        bpm: z.ZodOptional<z.ZodNumber>;
        time_signature: z.ZodDefault<z.ZodString>;
        difficulty: z.ZodOptional<z.ZodNumber>;
        duration_seconds: z.ZodOptional<z.ZodNumber>;
        voices_count: z.ZodOptional<z.ZodNumber>;
        instruments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        preview_notes: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        time_signature: string;
        id: string;
        title: string;
        composer: string;
        style: string;
        bpm?: number | undefined;
        description?: string | undefined;
        composition_year?: number | undefined;
        key_signature?: string | undefined;
        difficulty?: number | undefined;
        duration_seconds?: number | undefined;
        voices_count?: number | undefined;
        instruments?: string[] | undefined;
        tags?: string[] | undefined;
        preview_notes?: string | undefined;
    }, {
        id: string;
        title: string;
        composer: string;
        style: string;
        bpm?: number | undefined;
        time_signature?: string | undefined;
        description?: string | undefined;
        composition_year?: number | undefined;
        key_signature?: string | undefined;
        difficulty?: number | undefined;
        duration_seconds?: number | undefined;
        voices_count?: number | undefined;
        instruments?: string[] | undefined;
        tags?: string[] | undefined;
        preview_notes?: string | undefined;
    }>;
    maestro_format: z.ZodObject<{
        bpm: z.ZodOptional<z.ZodNumber>;
        timeSignature: z.ZodOptional<z.ZodString>;
        key: z.ZodOptional<z.ZodString>;
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
        notes: z.ZodOptional<z.ZodString>;
        velocity: z.ZodOptional<z.ZodNumber>;
        articulation: z.ZodOptional<z.ZodNumber>;
        transpose: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        bpm: z.ZodOptional<z.ZodNumber>;
        timeSignature: z.ZodOptional<z.ZodString>;
        key: z.ZodOptional<z.ZodString>;
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
        notes: z.ZodOptional<z.ZodString>;
        velocity: z.ZodOptional<z.ZodNumber>;
        articulation: z.ZodOptional<z.ZodNumber>;
        transpose: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        bpm: z.ZodOptional<z.ZodNumber>;
        timeSignature: z.ZodOptional<z.ZodString>;
        key: z.ZodOptional<z.ZodString>;
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
        notes: z.ZodOptional<z.ZodString>;
        velocity: z.ZodOptional<z.ZodNumber>;
        articulation: z.ZodOptional<z.ZodNumber>;
        transpose: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    metadata: {
        time_signature: string;
        id: string;
        title: string;
        composer: string;
        style: string;
        bpm?: number | undefined;
        description?: string | undefined;
        composition_year?: number | undefined;
        key_signature?: string | undefined;
        difficulty?: number | undefined;
        duration_seconds?: number | undefined;
        voices_count?: number | undefined;
        instruments?: string[] | undefined;
        tags?: string[] | undefined;
        preview_notes?: string | undefined;
    };
    maestro_format: {
        notes?: string | undefined;
        velocity?: number | undefined;
        articulation?: number | undefined;
        transpose?: number | undefined;
        bpm?: number | undefined;
        voices?: {
            channel: number;
            notes: string;
            velocity?: number | undefined;
            articulation?: number | undefined;
            transpose?: number | undefined;
        }[] | undefined;
        timeSignature?: string | undefined;
        key?: string | undefined;
    } & {
        [k: string]: unknown;
    };
}, {
    metadata: {
        id: string;
        title: string;
        composer: string;
        style: string;
        bpm?: number | undefined;
        time_signature?: string | undefined;
        description?: string | undefined;
        composition_year?: number | undefined;
        key_signature?: string | undefined;
        difficulty?: number | undefined;
        duration_seconds?: number | undefined;
        voices_count?: number | undefined;
        instruments?: string[] | undefined;
        tags?: string[] | undefined;
        preview_notes?: string | undefined;
    };
    maestro_format: {
        notes?: string | undefined;
        velocity?: number | undefined;
        articulation?: number | undefined;
        transpose?: number | undefined;
        bpm?: number | undefined;
        voices?: {
            channel: number;
            notes: string;
            velocity?: number | undefined;
            articulation?: number | undefined;
            transpose?: number | undefined;
        }[] | undefined;
        timeSignature?: string | undefined;
        key?: string | undefined;
    } & {
        [k: string]: unknown;
    };
}>;
export declare const SearchCriteriaSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    composer: z.ZodOptional<z.ZodString>;
    style: z.ZodOptional<z.ZodString>;
    year: z.ZodOptional<z.ZodNumber>;
    year_range: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    key: z.ZodOptional<z.ZodString>;
    difficulty: z.ZodOptional<z.ZodNumber>;
    bpm_range: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    key?: string | undefined;
    composer?: string | undefined;
    style?: string | undefined;
    difficulty?: number | undefined;
    query?: string | undefined;
    year?: number | undefined;
    year_range?: [number, number] | undefined;
    bpm_range?: [number, number] | undefined;
}, {
    key?: string | undefined;
    limit?: number | undefined;
    composer?: string | undefined;
    style?: string | undefined;
    difficulty?: number | undefined;
    query?: string | undefined;
    year?: number | undefined;
    year_range?: [number, number] | undefined;
    bpm_range?: [number, number] | undefined;
}>;
export declare const SearchResultSchema: z.ZodObject<{
    score: z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        composer: z.ZodString;
        style: z.ZodString;
        composition_year: z.ZodOptional<z.ZodNumber>;
        key_signature: z.ZodOptional<z.ZodString>;
        bpm: z.ZodOptional<z.ZodNumber>;
        time_signature: z.ZodDefault<z.ZodString>;
        difficulty: z.ZodOptional<z.ZodNumber>;
        duration_seconds: z.ZodOptional<z.ZodNumber>;
        voices_count: z.ZodOptional<z.ZodNumber>;
        instruments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        preview_notes: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        time_signature: string;
        id: string;
        title: string;
        composer: string;
        style: string;
        bpm?: number | undefined;
        description?: string | undefined;
        composition_year?: number | undefined;
        key_signature?: string | undefined;
        difficulty?: number | undefined;
        duration_seconds?: number | undefined;
        voices_count?: number | undefined;
        instruments?: string[] | undefined;
        tags?: string[] | undefined;
        preview_notes?: string | undefined;
    }, {
        id: string;
        title: string;
        composer: string;
        style: string;
        bpm?: number | undefined;
        time_signature?: string | undefined;
        description?: string | undefined;
        composition_year?: number | undefined;
        key_signature?: string | undefined;
        difficulty?: number | undefined;
        duration_seconds?: number | undefined;
        voices_count?: number | undefined;
        instruments?: string[] | undefined;
        tags?: string[] | undefined;
        preview_notes?: string | undefined;
    }>;
    relevance: z.ZodNumber;
    source: z.ZodEnum<["local", "online"]>;
}, "strip", z.ZodTypeAny, {
    source: "local" | "online";
    score: {
        time_signature: string;
        id: string;
        title: string;
        composer: string;
        style: string;
        bpm?: number | undefined;
        description?: string | undefined;
        composition_year?: number | undefined;
        key_signature?: string | undefined;
        difficulty?: number | undefined;
        duration_seconds?: number | undefined;
        voices_count?: number | undefined;
        instruments?: string[] | undefined;
        tags?: string[] | undefined;
        preview_notes?: string | undefined;
    };
    relevance: number;
}, {
    source: "local" | "online";
    score: {
        id: string;
        title: string;
        composer: string;
        style: string;
        bpm?: number | undefined;
        time_signature?: string | undefined;
        description?: string | undefined;
        composition_year?: number | undefined;
        key_signature?: string | undefined;
        difficulty?: number | undefined;
        duration_seconds?: number | undefined;
        voices_count?: number | undefined;
        instruments?: string[] | undefined;
        tags?: string[] | undefined;
        preview_notes?: string | undefined;
    };
    relevance: number;
}>;
export declare const LibraryConfigSchema: z.ZodObject<{
    localDbPath: z.ZodString;
    vectorDbPath: z.ZodString;
    onlineEnabled: z.ZodDefault<z.ZodBoolean>;
    cacheOnlineResults: z.ZodDefault<z.ZodBoolean>;
    syncIntervalHours: z.ZodDefault<z.ZodNumber>;
    supabase: z.ZodOptional<z.ZodObject<{
        url: z.ZodString;
        anonKey: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        anonKey: string;
    }, {
        url: string;
        anonKey: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    localDbPath: string;
    vectorDbPath: string;
    onlineEnabled: boolean;
    cacheOnlineResults: boolean;
    syncIntervalHours: number;
    supabase?: {
        url: string;
        anonKey: string;
    } | undefined;
}, {
    localDbPath: string;
    vectorDbPath: string;
    onlineEnabled?: boolean | undefined;
    cacheOnlineResults?: boolean | undefined;
    syncIntervalHours?: number | undefined;
    supabase?: {
        url: string;
        anonKey: string;
    } | undefined;
}>;
export type ScoreMetadata = z.infer<typeof ScoreMetadataSchema>;
export type MaestroFormat = z.infer<typeof MaestroFormatSchema>;
export type FullScore = z.infer<typeof FullScoreSchema>;
export type SearchCriteria = z.infer<typeof SearchCriteriaSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type LibraryConfig = z.infer<typeof LibraryConfigSchema>;
//# sourceMappingURL=library-schemas.d.ts.map