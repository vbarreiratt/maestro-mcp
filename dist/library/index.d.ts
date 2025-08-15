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
    bpm?: number;
    preview_notes?: string;
}
export declare class SupabaseLibrary {
    private supabase;
    constructor();
    search(params: {
        query?: string;
        composer?: string;
        style?: string;
        year?: number;
        limit?: number;
    }): Promise<SearchResult[]>;
    getScore(scoreId: string): Promise<MaestroFormat | null>;
    getStats(): Promise<{
        total: number;
        composers: string[];
        styles: string[];
    }>;
}
export {};
//# sourceMappingURL=index.d.ts.map