import 'dotenv/config';
import { type SearchResult } from './search/index.js';
import type { MaestroFormat, SearchCriteria, FullScore } from '../../schemas/library-schemas.js';
export interface SyncResult {
    success: boolean;
    addedScores?: number;
    reason?: string;
}
export declare class HybridLibraryManager {
    private localManager;
    private onlineManager?;
    private vectorSearch;
    private cache;
    private config;
    private scoresCache;
    private scoresCacheUpdated;
    constructor();
    private loadConfig;
    private initializeVectorSearch;
    private updateScoresCache;
    search(criteria: SearchCriteria): Promise<SearchResult[]>;
    private mergeAndRankResults;
    private cacheOnlineResults;
    getScore(scoreId: string): Promise<MaestroFormat | null>;
    addScore(score: FullScore): Promise<void>;
    private generateSearchText;
    syncWithOnline(): Promise<SyncResult>;
    getStatistics(): Promise<{
        total: number;
        composers: number;
        styles: number;
        onlineEnabled: boolean;
    }>;
    clearCache(): void;
    close(): void;
}
//# sourceMappingURL=index.d.ts.map