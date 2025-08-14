import type { ScoreMetadata, MaestroFormat, SearchCriteria, FullScore } from '../../../schemas/library-schemas.js';
export interface SupabaseConfig {
    url: string;
    anonKey: string;
}
export declare class SupabaseLibraryManager {
    private supabase;
    constructor(config: SupabaseConfig);
    search(criteria: SearchCriteria): Promise<ScoreMetadata[]>;
    getScore(scoreId: string): Promise<MaestroFormat | null>;
    getUpdatedScores(since: Date | null): Promise<FullScore[]>;
    private convertToScoreMetadata;
}
//# sourceMappingURL=supabase-manager.d.ts.map