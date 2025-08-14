import { z } from 'zod';
import { HybridLibraryManager } from '../pilares/modulo-library/index.js';
let libraryManager = null;
export function getLibraryManager() {
    if (!libraryManager) {
        libraryManager = new HybridLibraryManager();
    }
    return libraryManager;
}
// ========================
// LIBRARY TOOL SCHEMAS
// ========================
export const SearchLibrarySchema = z.object({
    query: z.string().optional().describe("Busca textual: 'bach fugue F# major'"),
    composer: z.string().optional().describe("Compositor: 'bach', 'chopin'"),
    style: z.string().optional().describe("Estilo musical: 'fugue', 'nocturne', 'waltz'"),
    year: z.number().optional().describe("Ano específico: 1850, 1740"),
    year_range: z.tuple([z.number(), z.number()]).optional().describe("Período: [1800, 1850]"),
    key: z.string().optional().describe("Tonalidade: 'F# major', 'C minor'"),
    difficulty: z.number().min(1).max(10).optional().describe("Dificuldade 1-10"),
    bpm_range: z.tuple([z.number(), z.number()]).optional().describe("BPM: [120, 180]"),
    limit: z.number().default(10).describe("Limite de resultados"),
    verbose: z.boolean().default(false).describe("Resposta detalhada")
}).describe("🔍 Busca partituras na biblioteca musical");
export const PlayFromLibrarySchema = z.object({
    score_id: z.string().optional().describe("ID específico da partitura"),
    query: z.string().optional().describe("Busca: 'bach fugue F# major'"),
    modifications: z.record(z.any()).optional().describe("Modificações usando path notation"),
    preview_only: z.boolean().default(false).describe("Apenas primeiros 8 compassos"),
    verbose: z.boolean().default(false).describe("Resposta detalhada")
}).describe("🎼 Executa partitura da biblioteca por ID ou busca");
export const LibraryInfoSchema = z.object({
    category: z.enum(["composers", "styles", "total_scores", "all"]).optional().describe("Categoria de informação"),
    verbose: z.boolean().default(false).describe("Resposta detalhada")
}).describe("📊 Estatísticas e conteúdo da biblioteca");
export const AddToLibrarySchema = z.object({
    title: z.string().describe("Título da partitura"),
    composer: z.string().describe("Compositor"),
    style: z.string().describe("Estilo musical"),
    maestro_format: z.record(z.any()).describe("Formato maestro completo"),
    metadata: z.record(z.any()).optional().describe("Metadados adicionais"),
    verbose: z.boolean().default(false).describe("Resposta detalhada")
}).describe("➕ Adiciona nova partitura à biblioteca");
// ========================
// LIBRARY TOOL IMPLEMENTATIONS
// ========================
export async function searchLibrary(params) {
    const validatedParams = SearchLibrarySchema.parse(params);
    const manager = getLibraryManager();
    try {
        const criteria = {
            query: validatedParams.query,
            composer: validatedParams.composer,
            style: validatedParams.style,
            year: validatedParams.year,
            year_range: validatedParams.year_range,
            key: validatedParams.key,
            difficulty: validatedParams.difficulty,
            bpm_range: validatedParams.bpm_range,
            limit: validatedParams.limit
        };
        const results = await manager.search(criteria);
        if (validatedParams.verbose) {
            return {
                success: true,
                found: results.length,
                results: results.map(r => ({
                    id: r.score.id,
                    title: r.score.title,
                    composer: r.score.composer,
                    style: r.score.style,
                    year: r.score.composition_year,
                    key: r.score.key_signature,
                    difficulty: r.score.difficulty,
                    relevance: r.relevance,
                    source: r.source
                })),
                search_criteria: criteria
            };
        }
        const summary = results.slice(0, 3).map(r => `${r.score.composer} - ${r.score.title} (${r.score.style}${r.score.composition_year ? `, ${r.score.composition_year}` : ''})`).join('\n');
        return {
            success: true,
            found: results.length,
            summary,
            use_play_from_library: "Use maestro:midi_play_from_library with score_id or query to play"
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Search failed'
        };
    }
}
export async function playFromLibrary(params) {
    const validatedParams = PlayFromLibrarySchema.parse(params);
    const manager = getLibraryManager();
    try {
        let scoreId = validatedParams.score_id;
        let maestroFormat = null;
        if (scoreId) {
            maestroFormat = await manager.getScore(scoreId);
        }
        else if (validatedParams.query) {
            const searchResults = await manager.search({
                query: validatedParams.query,
                limit: 1
            });
            if (searchResults.length === 0) {
                return {
                    success: false,
                    error: `No scores found for query: "${validatedParams.query}"`
                };
            }
            const firstResult = searchResults[0];
            if (!firstResult) {
                return {
                    success: false,
                    error: `No scores found for query: "${validatedParams.query}"`
                };
            }
            scoreId = firstResult.score.id;
            maestroFormat = await manager.getScore(scoreId);
        }
        else {
            return {
                success: false,
                error: "Either score_id or query must be provided"
            };
        }
        if (!maestroFormat) {
            return {
                success: false,
                error: `Score not found: ${scoreId}`
            };
        }
        // Apply modifications if provided
        if (validatedParams.modifications) {
            maestroFormat = applyModifications(maestroFormat, validatedParams.modifications);
        }
        // For preview_only, limit to first 8 measures (simplified approach)
        if (validatedParams.preview_only && maestroFormat.notes) {
            const notes = maestroFormat.notes.split(' ');
            const previewNotes = notes.slice(0, 8).join(' ');
            maestroFormat = { ...maestroFormat, notes: previewNotes };
        }
        // Use existing MIDI play system
        const { MCPToolsImpl } = await import('./mcp-tools-impl.js');
        const tools = new MCPToolsImpl();
        const result = await tools.midi_play_phrase({
            ...maestroFormat,
            verbose: validatedParams.verbose
        });
        return {
            success: true,
            score_id: scoreId,
            preview_mode: validatedParams.preview_only,
            applied_modifications: !!validatedParams.modifications,
            playback_result: result
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Playback failed'
        };
    }
}
export async function getLibraryInfo(params) {
    const validatedParams = LibraryInfoSchema.parse(params);
    const manager = getLibraryManager();
    try {
        const stats = await manager.getStatistics();
        if (validatedParams.verbose || validatedParams.category === 'all') {
            return {
                success: true,
                statistics: {
                    total_scores: stats.total,
                    composers: stats.composers,
                    styles: stats.styles,
                    online_enabled: stats.onlineEnabled
                },
                features: {
                    semantic_search: "Search by description: 'melancholic piano solo'",
                    year_filtering: "Filter by period: year_range: [1800, 1850]",
                    hybrid_system: "Local + Online library with intelligent caching"
                }
            };
        }
        switch (validatedParams.category) {
            case 'total_scores':
                return { success: true, total_scores: stats.total };
            case 'composers':
                return { success: true, composers: stats.composers };
            case 'styles':
                return { success: true, styles: stats.styles };
            default:
                return {
                    success: true,
                    summary: `${stats.total} scores, ${stats.composers} composers, ${stats.styles} styles`
                };
        }
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get library info'
        };
    }
}
export async function addToLibrary(params) {
    const validatedParams = AddToLibrarySchema.parse(params);
    const manager = getLibraryManager();
    try {
        const score = {
            metadata: {
                id: generateScoreId(validatedParams.composer, validatedParams.title),
                title: validatedParams.title,
                composer: validatedParams.composer,
                style: validatedParams.style,
                time_signature: '4/4',
                ...validatedParams.metadata
            },
            maestro_format: validatedParams.maestro_format
        };
        await manager.addScore(score);
        return {
            success: true,
            score_id: score.metadata.id,
            added_to_library: true,
            message: `Added "${validatedParams.title}" by ${validatedParams.composer} to library`
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to add to library'
        };
    }
}
// ========================
// UTILITY FUNCTIONS
// ========================
function applyModifications(format, modifications) {
    const modified = JSON.parse(JSON.stringify(format));
    for (const [path, value] of Object.entries(modifications)) {
        setNestedProperty(modified, path, value);
    }
    return modified;
}
function setNestedProperty(obj, path, value) {
    const keys = path.split(/[\.\[\]]+/).filter(k => k);
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!key)
            continue;
        if (!(key in current)) {
            const nextKey = keys[i + 1];
            current[key] = nextKey && !isNaN(Number(nextKey)) ? [] : {};
        }
        current = current[key];
    }
    const finalKey = keys[keys.length - 1];
    if (finalKey) {
        current[finalKey] = value;
    }
}
function generateScoreId(composer, title) {
    const normalized = `${composer}_${title}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 50);
    return `${normalized}_${Date.now()}`;
}
// ========================
// EXPORT TOOL DEFINITIONS
// ========================
export const LIBRARY_TOOLS = [
    {
        name: "maestro_search_library",
        description: "🔍 Busca partituras na biblioteca musical",
        inputSchema: SearchLibrarySchema
    },
    {
        name: "maestro_midi_play_from_library",
        description: "🎼 Executa partitura da biblioteca por ID ou busca",
        inputSchema: PlayFromLibrarySchema
    },
    {
        name: "maestro_library_info",
        description: "📊 Estatísticas e conteúdo da biblioteca",
        inputSchema: LibraryInfoSchema
    },
    {
        name: "maestro_add_to_library",
        description: "➕ Adiciona nova partitura à biblioteca",
        inputSchema: AddToLibrarySchema
    }
];
//# sourceMappingURL=library-tools.js.map