import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

export class SupabaseLibrary {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env['SUPABASE_URL']!,
      process.env['SUPABASE_ANON_KEY']!
    );
  }

  async search(params: {
    query?: string;
    composer?: string;
    style?: string;
    year?: number;
    limit?: number;
  }): Promise<SearchResult[]> {
    let query = this.supabase
      .from('music_scores')
      .select('id, title, composer, style, composition_year, key_signature, difficulty, bpm, preview_notes')
      .eq('is_public', true);

    if (params.composer) query = query.ilike('composer', `%${params.composer}%`);
    if (params.style) query = query.ilike('style', `%${params.style}%`);
    if (params.year) query = query.eq('composition_year', params.year);
    if (params.query) {
      query = query.or(`title.ilike.%${params.query}%,composer.ilike.%${params.query}%`);
    }

    const { data, error } = await query.limit(params.limit || 10);
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getScore(scoreId: string): Promise<MaestroFormat | null> {
    const { data, error } = await this.supabase
      .from('music_scores')
      .select('maestro_format')
      .eq('id', scoreId)
      .eq('is_public', true)
      .single();

    if (error || !data) return null;
    return JSON.parse(data.maestro_format) as MaestroFormat;
  }

  async getStats(): Promise<{total: number; composers: string[]; styles: string[]}> {
    const { data, error } = await this.supabase
      .from('music_scores')
      .select('composer, style')
      .eq('is_public', true);

    if (error) return { total: 0, composers: [], styles: [] };

    const composers = [...new Set(data?.map(d => d.composer) || [])];
    const styles = [...new Set(data?.map(d => d.style) || [])];

    return {
      total: data?.length || 0,
      composers: composers.sort(),
      styles: styles.sort()
    };
  }
}