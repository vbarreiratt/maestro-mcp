import type { ScoreMetadata } from '../../../schemas/library-schemas.js';
export interface SearchResult {
    score: ScoreMetadata;
    relevance: number;
    source: 'local' | 'online';
}
export declare class VectorSearchEngine {
    private fuseIndex;
    private initialized;
    constructor(_vectorDbPath: string);
    initialize(): Promise<void>;
    semanticSearch(query: string, scores: ScoreMetadata[], limit?: number): Promise<SearchResult[]>;
    private fallbackSearch;
    addEmbedding(_scoreId: string, _textContent: string): Promise<void>;
    updateFuseIndex(scores: ScoreMetadata[]): void;
    deleteEmbedding(_scoreId: string): Promise<void>;
}
//# sourceMappingURL=vector-search.d.ts.map