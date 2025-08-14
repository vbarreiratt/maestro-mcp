import { z } from 'zod';
import { HybridLibraryManager } from '../pilares/modulo-library/index.js';
export declare function getLibraryManager(): HybridLibraryManager;
export declare const SearchLibrarySchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    composer: z.ZodOptional<z.ZodString>;
    style: z.ZodOptional<z.ZodString>;
    year: z.ZodOptional<z.ZodNumber>;
    year_range: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    key: z.ZodOptional<z.ZodString>;
    difficulty: z.ZodOptional<z.ZodNumber>;
    bpm_range: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    limit: z.ZodDefault<z.ZodNumber>;
    verbose: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    verbose: boolean;
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
    verbose?: boolean | undefined;
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
export declare const PlayFromLibrarySchema: z.ZodObject<{
    score_id: z.ZodOptional<z.ZodString>;
    query: z.ZodOptional<z.ZodString>;
    modifications: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    preview_only: z.ZodDefault<z.ZodBoolean>;
    verbose: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    verbose: boolean;
    preview_only: boolean;
    modifications?: Record<string, any> | undefined;
    query?: string | undefined;
    score_id?: string | undefined;
}, {
    verbose?: boolean | undefined;
    modifications?: Record<string, any> | undefined;
    query?: string | undefined;
    score_id?: string | undefined;
    preview_only?: boolean | undefined;
}>;
export declare const LibraryInfoSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodEnum<["composers", "styles", "total_scores", "all"]>>;
    verbose: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    verbose: boolean;
    category?: "composers" | "styles" | "total_scores" | "all" | undefined;
}, {
    verbose?: boolean | undefined;
    category?: "composers" | "styles" | "total_scores" | "all" | undefined;
}>;
export declare const AddToLibrarySchema: z.ZodObject<{
    title: z.ZodString;
    composer: z.ZodString;
    style: z.ZodString;
    maestro_format: z.ZodRecord<z.ZodString, z.ZodAny>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    verbose: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    verbose: boolean;
    title: string;
    composer: string;
    style: string;
    maestro_format: Record<string, any>;
    metadata?: Record<string, any> | undefined;
}, {
    title: string;
    composer: string;
    style: string;
    maestro_format: Record<string, any>;
    verbose?: boolean | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare function searchLibrary(params: Record<string, unknown>): Promise<{
    success: boolean;
    found: number;
    results: {
        id: string;
        title: string;
        composer: string;
        style: string;
        year: number | undefined;
        key: string | undefined;
        difficulty: number | undefined;
        relevance: number;
        source: "local" | "online";
    }[];
    search_criteria: {
        limit: number;
        key?: string | undefined;
        composer?: string | undefined;
        style?: string | undefined;
        difficulty?: number | undefined;
        query?: string | undefined;
        year?: number | undefined;
        year_range?: [number, number] | undefined;
        bpm_range?: [number, number] | undefined;
    };
    summary?: never;
    use_play_from_library?: never;
    error?: never;
} | {
    success: boolean;
    found: number;
    summary: string;
    use_play_from_library: string;
    results?: never;
    search_criteria?: never;
    error?: never;
} | {
    success: boolean;
    error: string;
    found?: never;
    results?: never;
    search_criteria?: never;
    summary?: never;
    use_play_from_library?: never;
}>;
export declare function playFromLibrary(params: Record<string, unknown>): Promise<{
    success: boolean;
    error: string;
    score_id?: never;
    preview_mode?: never;
    applied_modifications?: never;
    playback_result?: never;
} | {
    success: boolean;
    score_id: string;
    preview_mode: boolean;
    applied_modifications: boolean;
    playback_result: any;
    error?: never;
}>;
export declare function getLibraryInfo(params: Record<string, unknown>): Promise<{
    success: boolean;
    statistics: {
        total_scores: number;
        composers: number;
        styles: number;
        online_enabled: boolean;
    };
    features: {
        semantic_search: string;
        year_filtering: string;
        hybrid_system: string;
    };
    total_scores?: never;
    composers?: never;
    styles?: never;
    summary?: never;
    error?: never;
} | {
    success: boolean;
    total_scores: number;
    statistics?: never;
    features?: never;
    composers?: never;
    styles?: never;
    summary?: never;
    error?: never;
} | {
    success: boolean;
    composers: number;
    statistics?: never;
    features?: never;
    total_scores?: never;
    styles?: never;
    summary?: never;
    error?: never;
} | {
    success: boolean;
    styles: number;
    statistics?: never;
    features?: never;
    total_scores?: never;
    composers?: never;
    summary?: never;
    error?: never;
} | {
    success: boolean;
    summary: string;
    statistics?: never;
    features?: never;
    total_scores?: never;
    composers?: never;
    styles?: never;
    error?: never;
} | {
    success: boolean;
    error: string;
    statistics?: never;
    features?: never;
    total_scores?: never;
    composers?: never;
    styles?: never;
    summary?: never;
}>;
export declare function addToLibrary(params: Record<string, unknown>): Promise<{
    success: boolean;
    score_id: string;
    added_to_library: boolean;
    message: string;
    error?: never;
} | {
    success: boolean;
    error: string;
    score_id?: never;
    added_to_library?: never;
    message?: never;
}>;
export declare const LIBRARY_TOOLS: ({
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        query: z.ZodOptional<z.ZodString>;
        composer: z.ZodOptional<z.ZodString>;
        style: z.ZodOptional<z.ZodString>;
        year: z.ZodOptional<z.ZodNumber>;
        year_range: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
        key: z.ZodOptional<z.ZodString>;
        difficulty: z.ZodOptional<z.ZodNumber>;
        bpm_range: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
        limit: z.ZodDefault<z.ZodNumber>;
        verbose: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        verbose: boolean;
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
        verbose?: boolean | undefined;
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
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        score_id: z.ZodOptional<z.ZodString>;
        query: z.ZodOptional<z.ZodString>;
        modifications: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        preview_only: z.ZodDefault<z.ZodBoolean>;
        verbose: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        verbose: boolean;
        preview_only: boolean;
        modifications?: Record<string, any> | undefined;
        query?: string | undefined;
        score_id?: string | undefined;
    }, {
        verbose?: boolean | undefined;
        modifications?: Record<string, any> | undefined;
        query?: string | undefined;
        score_id?: string | undefined;
        preview_only?: boolean | undefined;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        category: z.ZodOptional<z.ZodEnum<["composers", "styles", "total_scores", "all"]>>;
        verbose: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        verbose: boolean;
        category?: "composers" | "styles" | "total_scores" | "all" | undefined;
    }, {
        verbose?: boolean | undefined;
        category?: "composers" | "styles" | "total_scores" | "all" | undefined;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        title: z.ZodString;
        composer: z.ZodString;
        style: z.ZodString;
        maestro_format: z.ZodRecord<z.ZodString, z.ZodAny>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        verbose: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        verbose: boolean;
        title: string;
        composer: string;
        style: string;
        maestro_format: Record<string, any>;
        metadata?: Record<string, any> | undefined;
    }, {
        title: string;
        composer: string;
        style: string;
        maestro_format: Record<string, any>;
        verbose?: boolean | undefined;
        metadata?: Record<string, any> | undefined;
    }>;
})[];
//# sourceMappingURL=library-tools.d.ts.map