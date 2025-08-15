import { createClient } from '@supabase/supabase-js';
export class SupabaseLibrary {
    supabase;
    constructor() {
        this.supabase = createClient(process.env['SUPABASE_URL'], process.env['SUPABASE_ANON_KEY']);
    }
    async search(params) {
        let query = this.supabase
            .from('music_scores')
            .select('id, title, composer, style, composition_year, key_signature, difficulty, bpm, preview_notes')
            .eq('is_public', true);
        if (params.composer)
            query = query.ilike('composer', `%${params.composer}%`);
        if (params.style)
            query = query.ilike('style', `%${params.style}%`);
        if (params.year)
            query = query.eq('composition_year', params.year);
        if (params.query) {
            query = query.or(`title.ilike.%${params.query}%,composer.ilike.%${params.query}%`);
        }
        const { data, error } = await query.limit(params.limit || 10);
        if (error)
            throw new Error(error.message);
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
        return JSON.parse(data.maestro_format);
    }
    async getStats() {
        const { data, error } = await this.supabase
            .from('music_scores')
            .select('composer, style')
            .eq('is_public', true);
        if (error)
            return { total: 0, composers: [], styles: [] };
        const composers = [...new Set(data?.map(d => d.composer) || [])];
        const styles = [...new Set(data?.map(d => d.style) || [])];
        return {
            total: data?.length || 0,
            composers: composers.sort(),
            styles: styles.sort()
        };
    }
}
//# sourceMappingURL=index.js.map