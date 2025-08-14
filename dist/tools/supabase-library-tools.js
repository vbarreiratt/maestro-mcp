import { z } from 'zod';
export const supabaseLibraryTools = [
    {
        name: "maestro_search_library",
        description: "🔍 Busca partituras na biblioteca online (Supabase)",
        inputSchema: z.object({
            query: z.string().optional().describe("Busca geral: 'bach fugue F# major'"),
            composer: z.string().optional().describe("Compositor: 'bach', 'chopin'"),
            style: z.string().optional().describe("Estilo: 'fugue', 'nocturne', 'waltz'"),
            year: z.number().optional().describe("Ano específico: 1850, 1740"),
            year_range: z.tuple([z.number(), z.number()]).optional().describe("Período: [1800, 1850]"),
            key: z.string().optional().describe("Tonalidade: 'F# major', 'C minor'"),
            difficulty: z.number().min(1).max(10).optional().describe("Dificuldade 1-10"),
            limit: z.number().optional().describe("Limite de resultados (padrão: 10)"),
            verbose: z.boolean().default(false).describe("Resposta detalhada")
        })
    },
    {
        name: "maestro_midi_play_from_library",
        description: "🎼 Executa partitura da biblioteca online",
        inputSchema: z.object({
            score_id: z.string().optional().describe("ID específico da partitura"),
            query: z.string().optional().describe("ou busca: 'bach fugue F# major'"),
            modifications: z.record(z.any()).optional().describe("Modificações: channel_mapping, bpm, etc."),
            preview_only: z.boolean().default(false).describe("Apenas preview (8 compassos)"),
            verbose: z.boolean().default(false).describe("Resposta detalhada")
        })
    },
    {
        name: "maestro_library_info",
        description: "📊 Informações da biblioteca online",
        inputSchema: z.object({
            verbose: z.boolean().default(false).describe("Resposta detalhada")
        })
    }
];
export const SUPABASE_LIBRARY_TOOL_SCHEMAS = {
    maestro_search_library: supabaseLibraryTools[0].inputSchema,
    maestro_midi_play_from_library: supabaseLibraryTools[1].inputSchema,
    maestro_library_info: supabaseLibraryTools[2].inputSchema,
};
//# sourceMappingURL=supabase-library-tools.js.map