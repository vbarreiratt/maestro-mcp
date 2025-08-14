import { createClient } from '@supabase/supabase-js';
export class SupabaseLibrary {
    supabase;
    constructor() {
        // Instantâneo - apenas cria client HTTP
        const supabaseUrl = process.env['SUPABASE_URL'];
        const supabaseKey = process.env['SUPABASE_ANON_KEY'];
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
        }
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }
    async search(criteria) {
        let query = this.supabase
            .from('music_scores')
            .select('id, title, composer, style, composition_year, key_signature, difficulty, preview_notes')
            .eq('is_public', true);
        if (criteria.composer)
            query = query.ilike('composer', `%${criteria.composer}%`);
        if (criteria.style)
            query = query.eq('style', criteria.style);
        if (criteria.year)
            query = query.eq('composition_year', criteria.year);
        if (criteria.year_range) {
            query = query
                .gte('composition_year', criteria.year_range[0])
                .lte('composition_year', criteria.year_range[1]);
        }
        if (criteria.key)
            query = query.ilike('key_signature', `%${criteria.key}%`);
        if (criteria.difficulty)
            query = query.eq('difficulty', criteria.difficulty);
        if (criteria.query) {
            query = query.or(`title.ilike.%${criteria.query}%,composer.ilike.%${criteria.query}%,style.ilike.%${criteria.query}%`);
        }
        const { data, error } = await query.limit(criteria.limit || 10);
        if (error)
            throw new Error(`Search error: ${error.message}`);
        return data || [];
    }
    async getScore(scoreId) {
        const { data, error } = await this.supabase
            .from('music_scores')
            .select('maestro_format')
            .eq('id', scoreId)
            .eq('is_public', true)
            .single();
        if (error || !data)
            return null;
        return data.maestro_format;
    }
    async getLibraryInfo() {
        const { data, error } = await this.supabase
            .from('music_scores')
            .select('composer, style')
            .eq('is_public', true);
        if (error)
            throw new Error(`Library info error: ${error.message}`);
        const composers = [...new Set(data?.map(d => d.composer) || [])];
        const styles = [...new Set(data?.map(d => d.style) || [])];
        return {
            total_scores: data?.length || 0,
            composers: composers.sort(),
            styles: styles.sort()
        };
    }
}
//# sourceMappingURL=supabase-library.js.map