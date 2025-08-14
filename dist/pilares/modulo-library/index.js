import 'dotenv/config';
import { SQLiteLibraryManager } from './database/index.js';
import { VectorSearchEngine, SupabaseLibraryManager } from './search/index.js';
export class HybridLibraryManager {
    localManager;
    onlineManager;
    vectorSearch;
    cache = new Map();
    config;
    scoresCache = [];
    scoresCacheUpdated = false;
    constructor() {
        this.config = this.loadConfig();
        this.localManager = new SQLiteLibraryManager(this.config.localDbPath);
        this.vectorSearch = new VectorSearchEngine(this.config.vectorDbPath);
        if (this.config.onlineEnabled && this.config.supabase) {
            this.onlineManager = new SupabaseLibraryManager(this.config.supabase);
        }
        this.initializeVectorSearch();
    }
    loadConfig() {
        const defaultConfig = {
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
    async initializeVectorSearch() {
        try {
            await this.vectorSearch.initialize();
            await this.updateScoresCache();
            this.vectorSearch.updateFuseIndex(this.scoresCache);
        }
        catch (error) {
            console.warn('Vector search initialization failed:', error);
        }
    }
    async updateScoresCache() {
        try {
            this.scoresCache = await this.localManager.search({ limit: 10000 });
            this.scoresCacheUpdated = true;
        }
        catch (error) {
            console.warn('Failed to update scores cache:', error);
        }
    }
    async search(criteria) {
        if (!this.scoresCacheUpdated) {
            await this.updateScoresCache();
        }
        const localResults = await this.localManager.search(criteria);
        let results = localResults.map(score => ({
            score,
            relevance: 1.0,
            source: 'local'
        }));
        if (criteria.query && results.length > 0) {
            const semanticResults = await this.vectorSearch.semanticSearch(criteria.query, this.scoresCache, criteria.limit);
            results = this.mergeAndRankResults(results, semanticResults);
        }
        let onlineResults = [];
        if (this.onlineManager && results.length < criteria.limit) {
            try {
                const onlineScores = await this.onlineManager.search({
                    ...criteria,
                    limit: criteria.limit - results.length
                });
                onlineResults = onlineScores.map(score => ({
                    score,
                    relevance: 0.8,
                    source: 'online'
                }));
                if (this.config.cacheOnlineResults) {
                    this.cacheOnlineResults(onlineResults);
                }
            }
            catch (error) {
                console.warn('Online search failed:', error);
            }
        }
        const finalResults = this.mergeAndRankResults(results, onlineResults);
        return finalResults.slice(0, criteria.limit);
    }
    mergeAndRankResults(local, online) {
        const allResults = [...local, ...online];
        const uniqueResults = new Map();
        for (const result of allResults) {
            const existing = uniqueResults.get(result.score.id);
            if (!existing || result.relevance > existing.relevance) {
                uniqueResults.set(result.score.id, result);
            }
        }
        return Array.from(uniqueResults.values())
            .sort((a, b) => b.relevance - a.relevance);
    }
    async cacheOnlineResults(results) {
        for (const result of results) {
            try {
                const maestroFormat = await this.onlineManager?.getScore(result.score.id);
                if (maestroFormat) {
                    const fullScore = {
                        metadata: result.score,
                        maestro_format: maestroFormat
                    };
                    await this.localManager.addScore(fullScore);
                    const searchText = this.generateSearchText(result.score);
                    await this.vectorSearch.addEmbedding(result.score.id, searchText);
                }
            }
            catch (error) {
                console.warn(`Failed to cache score ${result.score.id}:`, error);
            }
        }
        await this.updateScoresCache();
    }
    async getScore(scoreId) {
        if (this.cache.has(scoreId)) {
            return this.cache.get(scoreId);
        }
        let score = await this.localManager.getFullScore(scoreId);
        if (!score && this.onlineManager) {
            try {
                score = await this.onlineManager.getScore(scoreId);
                if (score && this.config.cacheOnlineResults) {
                    const metadata = this.scoresCache.find(s => s.id === scoreId);
                    if (metadata) {
                        const fullScore = { metadata, maestro_format: score };
                        await this.localManager.addScore(fullScore);
                    }
                }
            }
            catch (error) {
                console.warn(`Failed to fetch score ${scoreId} online:`, error);
            }
        }
        if (score) {
            this.cache.set(scoreId, score);
        }
        return score;
    }
    async addScore(score) {
        await this.localManager.addScore(score);
        const searchText = this.generateSearchText(score.metadata);
        await this.vectorSearch.addEmbedding(score.metadata.id, searchText);
        this.cache.set(score.metadata.id, score.maestro_format);
        await this.updateScoresCache();
    }
    generateSearchText(metadata) {
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
    async syncWithOnline() {
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
        }
        catch (error) {
            return {
                success: false,
                reason: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async getStatistics() {
        const stats = await this.localManager.getStatistics();
        return {
            ...stats,
            onlineEnabled: this.config.onlineEnabled
        };
    }
    clearCache() {
        this.cache.clear();
    }
    close() {
        this.localManager.close();
        this.clearCache();
    }
}
//# sourceMappingURL=index.js.map