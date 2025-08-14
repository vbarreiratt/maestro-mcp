import 'dotenv/config';
import { SQLiteLibraryManager } from './database/index.js';
import { VectorSearchEngine, SupabaseLibraryManager, type SearchResult } from './search/index.js';
import type { 
  ScoreMetadata, 
  MaestroFormat, 
  SearchCriteria, 
  FullScore, 
  LibraryConfig 
} from '../../schemas/library-schemas.js';


export interface SyncResult {
  success: boolean;
  addedScores?: number;
  reason?: string;
}

export class HybridLibraryManager {
  private localManager: SQLiteLibraryManager;
  private onlineManager?: SupabaseLibraryManager;
  private vectorSearch: VectorSearchEngine;
  private cache: Map<string, MaestroFormat> = new Map();
  private config: LibraryConfig;
  private scoresCache: ScoreMetadata[] = [];
  private scoresCacheUpdated = false;

  constructor() {
    this.config = this.loadConfig();
    this.localManager = new SQLiteLibraryManager(this.config.localDbPath);
    this.vectorSearch = new VectorSearchEngine(this.config.vectorDbPath);
    
    if (this.config.onlineEnabled && this.config.supabase) {
      this.onlineManager = new SupabaseLibraryManager(this.config.supabase);
    }

    this.initializeVectorSearch();
  }

  private loadConfig(): LibraryConfig {
    const defaultConfig: LibraryConfig = {
      localDbPath: './src/data/library.db',
      vectorDbPath: './src/data/vector_embeddings',
      onlineEnabled: process.env['ONLINE_LIBRARY_ENABLED'] === 'true',
      cacheOnlineResults: process.env['CACHE_ONLINE_RESULTS'] !== 'false',
      syncIntervalHours: parseInt(process.env['SYNC_INTERVAL_HOURS'] || '24'),
      supabase: process.env['SUPABASE_URL'] && process.env['SUPABASE_ANON_KEY'] ? {
        url: process.env['SUPABASE_URL'],
        anonKey: process.env['SUPABASE_ANON_KEY']
      } : undefined
    };

    return defaultConfig;
  }

  private async initializeVectorSearch(): Promise<void> {
    try {
      await this.vectorSearch.initialize();
      await this.updateScoresCache();
      this.vectorSearch.updateFuseIndex(this.scoresCache);
    } catch (error) {
      console.warn('Vector search initialization failed:', error);
    }
  }

  private async updateScoresCache(): Promise<void> {
    try {
      this.scoresCache = await this.localManager.search({ limit: 10000 });
      this.scoresCacheUpdated = true;
    } catch (error) {
      console.warn('Failed to update scores cache:', error);
    }
  }

  async search(criteria: SearchCriteria): Promise<SearchResult[]> {
    if (!this.scoresCacheUpdated) {
      await this.updateScoresCache();
    }

    const localResults = await this.localManager.search(criteria);
    
    let results: SearchResult[] = localResults.map(score => ({
      score,
      relevance: 1.0,
      source: 'local' as const
    }));

    if (criteria.query && results.length > 0) {
      const semanticResults = await this.vectorSearch.semanticSearch(
        criteria.query,
        this.scoresCache,
        criteria.limit
      );
      
      results = this.mergeAndRankResults(results, semanticResults);
    }

    let onlineResults: SearchResult[] = [];
    if (this.onlineManager && results.length < criteria.limit) {
      try {
        const onlineScores = await this.onlineManager.search({
          ...criteria,
          limit: criteria.limit - results.length
        });

        onlineResults = onlineScores.map(score => ({
          score,
          relevance: 0.8,
          source: 'online' as const
        }));

        if (this.config.cacheOnlineResults) {
          this.cacheOnlineResults(onlineResults);
        }
      } catch (error) {
        console.warn('Online search failed:', error);
      }
    }

    const finalResults = this.mergeAndRankResults(results, onlineResults);
    return finalResults.slice(0, criteria.limit);
  }

  private mergeAndRankResults(local: SearchResult[], online: SearchResult[]): SearchResult[] {
    const allResults = [...local, ...online];
    const uniqueResults = new Map<string, SearchResult>();

    for (const result of allResults) {
      const existing = uniqueResults.get(result.score.id);
      if (!existing || result.relevance > existing.relevance) {
        uniqueResults.set(result.score.id, result);
      }
    }

    return Array.from(uniqueResults.values())
      .sort((a, b) => b.relevance - a.relevance);
  }

  private async cacheOnlineResults(results: SearchResult[]): Promise<void> {
    for (const result of results) {
      try {
        const maestroFormat = await this.onlineManager?.getScore(result.score.id);
        if (maestroFormat) {
          const fullScore: FullScore = {
            metadata: result.score,
            maestro_format: maestroFormat
          };
          await this.localManager.addScore(fullScore);
          
          const searchText = this.generateSearchText(result.score);
          await this.vectorSearch.addEmbedding(result.score.id, searchText);
        }
      } catch (error) {
        console.warn(`Failed to cache score ${result.score.id}:`, error);
      }
    }
    
    await this.updateScoresCache();
  }

  async getScore(scoreId: string): Promise<MaestroFormat | null> {
    if (this.cache.has(scoreId)) {
      return this.cache.get(scoreId)!;
    }

    let score = await this.localManager.getFullScore(scoreId);

    if (!score && this.onlineManager) {
      try {
        score = await this.onlineManager.getScore(scoreId);
        
        if (score && this.config.cacheOnlineResults) {
          const metadata = this.scoresCache.find(s => s.id === scoreId);
          if (metadata) {
            const fullScore: FullScore = { metadata, maestro_format: score };
            await this.localManager.addScore(fullScore);
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch score ${scoreId} online:`, error);
      }
    }

    if (score) {
      this.cache.set(scoreId, score);
    }

    return score;
  }

  async addScore(score: FullScore): Promise<void> {
    await this.localManager.addScore(score);
    
    const searchText = this.generateSearchText(score.metadata);
    await this.vectorSearch.addEmbedding(score.metadata.id, searchText);
    
    this.cache.set(score.metadata.id, score.maestro_format);
    await this.updateScoresCache();
  }

  private generateSearchText(metadata: ScoreMetadata): string {
    const parts = [
      metadata.title,
      metadata.composer,
      metadata.style,
      metadata.description || '',
      ...(metadata.tags || []),
      metadata.key_signature || '',
      metadata.composition_year?.toString() || ''
    ];
    
    return parts.filter(Boolean).join(' ');
  }

  async syncWithOnline(): Promise<SyncResult> {
    if (!this.onlineManager) {
      return { success: false, reason: 'Online disabled' };
    }

    try {
      const lastSync = await this.localManager.getLastSyncTimestamp();
      const newScores = await this.onlineManager.getUpdatedScores(lastSync);
      
      for (const score of newScores) {
        await this.localManager.addScore(score);
        
        const searchText = this.generateSearchText(score.metadata);
        await this.vectorSearch.addEmbedding(score.metadata.id, searchText);
      }
      
      await this.localManager.updateSyncTimestamp();
      await this.updateScoresCache();
      
      return { success: true, addedScores: newScores.length };
    } catch (error) {
      return { 
        success: false, 
        reason: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getStatistics(): Promise<{ 
    total: number; 
    composers: number; 
    styles: number; 
    onlineEnabled: boolean 
  }> {
    const stats = await this.localManager.getStatistics();
    return {
      ...stats,
      onlineEnabled: this.config.onlineEnabled
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  close(): void {
    this.localManager.close();
    this.clearCache();
  }
}