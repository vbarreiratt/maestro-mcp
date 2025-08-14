interface MaestroFormat {
    bpm: number;
    key: string;
    articulation?: number;
    timeSignature?: string;
    voices: Array<{
        notes: string;
        channel: number;
        velocity: number;
    }>;
}
interface SearchResult {
    id: string;
    title: string;
    composer: string;
    style: string;
    composition_year?: number;
    key_signature?: string;
    difficulty?: number;
    preview_notes?: string;
}
export declare class SupabaseLibrary {
    private supabase;
    constructor();
    search(criteria: {
        query?: string;
        composer?: string;
        style?: string;
        year?: number;
        year_range?: [number, number];
        key?: string;
        difficulty?: number;
        limit?: number;
    }): Promise<SearchResult[]>;
    getScore(scoreId: string): Promise<MaestroFormat | null>;
    getLibraryInfo(): Promise<{
        total_scores: number;
        composers: string[];
        styles: string[];
    }>;
}
export {};
//# sourceMappingURL=supabase-library.d.ts.map