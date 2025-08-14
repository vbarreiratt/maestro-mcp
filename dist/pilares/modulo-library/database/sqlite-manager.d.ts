import type { ScoreMetadata, MaestroFormat, SearchCriteria, FullScore } from '../../../schemas/library-schemas.js';
export declare class SQLiteLibraryManager {
    private db;
    private initialized;
    constructor(dbPath: string);
    private initialize;
    search(criteria: SearchCriteria): Promise<ScoreMetadata[]>;
    getFullScore(scoreId: string): Promise<MaestroFormat | null>;
    addScore(score: FullScore): Promise<void>;
    getLastSyncTimestamp(): Promise<Date | null>;
    updateSyncTimestamp(): Promise<void>;
    getStatistics(): Promise<{
        total: number;
        composers: number;
        styles: number;
    }>;
    close(): void;
}
//# sourceMappingURL=sqlite-manager.d.ts.map