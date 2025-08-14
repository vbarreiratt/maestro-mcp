import { z } from 'zod';
export declare const supabaseLibraryTools: {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        verbose: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        verbose: boolean;
    }, {
        verbose?: boolean | undefined;
    }>;
}[];
export declare const SUPABASE_LIBRARY_TOOL_SCHEMAS: {
    maestro_search_library: z.ZodObject<{
        verbose: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        verbose: boolean;
    }, {
        verbose?: boolean | undefined;
    }>;
    maestro_midi_play_from_library: z.ZodObject<{
        verbose: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        verbose: boolean;
    }, {
        verbose?: boolean | undefined;
    }>;
    maestro_library_info: z.ZodObject<{
        verbose: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        verbose: boolean;
    }, {
        verbose?: boolean | undefined;
    }>;
};
//# sourceMappingURL=supabase-library-tools.d.ts.map