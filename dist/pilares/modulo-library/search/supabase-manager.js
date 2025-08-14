import { createClient } from '@supabase/supabase-js';
export class SupabaseLibraryManager {
    supabase;
    constructor(config) {
        this.supabase = createClient(config.url, config.anonKey);
    }
    async search(criteria) {
        let query = this.supabase
            .from('music_scores')
            .select('*')
            .eq('is_public', true);
        if (criteria.composer) {
            query = query.ilike('composer', `%${criteria.composer}%`);
        }
        if (criteria.style) {
            query = query.eq('style', criteria.style);
        }
        if (criteria.year) {
            query = query.eq('composition_year', criteria.year);
        }
        if (criteria.year_range) {
            query = query
                .gte('composition_year', criteria.year_range[0])
                .lte('composition_year', criteria.year_range[1]);
        }
        if (criteria.key) {
            query = query.ilike('key_signature', `%${criteria.key}%`);
        }
        if (criteria.difficulty) {
            query = query.eq('difficulty', criteria.difficulty);
        }
        if (criteria.bpm_range) {
            query = query
                .gte('bpm', criteria.bpm_range[0])
                .lte('bpm', criteria.bpm_range[1]);
        }
        if (criteria.query) {
            query = query.or(`title.ilike.%${criteria.query}%,description.ilike.%${criteria.query}%`);
        }
        const { data, error } = await query
            .order('composition_year', { ascending: false })
            .order('composer')
            .order('title')
            .limit(criteria.limit || 10);
        if (error) {
            throw new Error(`Supabase search error: ${error.message}`);
        }
        return data?.map(this.convertToScoreMetadata) || [];
    }
    async getScore(scoreId) {
        const { data, error } = await this.supabase
            .from('music_scores')
            .select('maestro_format')
            .eq('id', scoreId)
            .eq('is_public', true)
            .single();
        if (error || !data) {
            return null;
        }
        return data.maestro_format;
    }
    async getUpdatedScores(since) {
        let query = this.supabase
            .from('music_scores')
            .select('*')
            .eq('is_public', true);
        if (since) {
            query = query.gte('updated_at', since.toISOString());
        }
        const { data, error } = await query
            .order('updated_at', { ascending: false })
            .limit(1000);
        if (error) {
            throw new Error(`Failed to get updated scores: ${error.message}`);
        }
        return data?.map(row => ({
            metadata: this.convertToScoreMetadata(row),
            maestro_format: row.maestro_format
        })) || [];
    }
    convertToScoreMetadata(row) {
        return {
            id: row.id,
            title: row.title,
            composer: row.composer,
            style: row.style,
            composition_year: row.composition_year,
            key_signature: row.key_signature,
            bpm: row.bpm,
            time_signature: row.time_signature,
            difficulty: row.difficulty,
            duration_seconds: row.duration_seconds,
            voices_count: row.voices_count,
            instruments: row.instruments || [],
            tags: row.tags || [],
            preview_notes: row.preview_notes,
            description: row.description
        };
    }
}
//# sourceMappingURL=supabase-manager.js.map