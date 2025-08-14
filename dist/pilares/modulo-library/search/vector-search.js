import Fuse from 'fuse.js';
export class VectorSearchEngine {
    fuseIndex = null;
    initialized = false;
    constructor(_vectorDbPath) {
        // ChromaDB integration simplified for now
    }
    async initialize() {
        if (this.initialized)
            return;
        this.initialized = true;
    }
    async semanticSearch(query, scores, limit = 10) {
        await this.initialize();
        return this.fallbackSearch(query, scores, limit);
    }
    fallbackSearch(query, scores, limit) {
        if (!this.fuseIndex) {
            this.fuseIndex = new Fuse(scores, {
                keys: [
                    { name: 'title', weight: 0.4 },
                    { name: 'composer', weight: 0.3 },
                    { name: 'style', weight: 0.2 },
                    { name: 'description', weight: 0.1 }
                ],
                threshold: 0.4,
                includeScore: true
            });
        }
        const results = this.fuseIndex.search(query, { limit });
        return results.map(result => ({
            score: result.item,
            relevance: 1 - (result.score || 0),
            source: 'local'
        }));
    }
    async addEmbedding(_scoreId, _textContent) {
        await this.initialize();
        // Simplified implementation for now
    }
    updateFuseIndex(scores) {
        this.fuseIndex = new Fuse(scores, {
            keys: [
                { name: 'title', weight: 0.4 },
                { name: 'composer', weight: 0.3 },
                { name: 'style', weight: 0.2 },
                { name: 'description', weight: 0.1 }
            ],
            threshold: 0.4,
            includeScore: true
        });
    }
    async deleteEmbedding(_scoreId) {
        await this.initialize();
        // Simplified implementation for now
    }
}
//# sourceMappingURL=vector-search.js.map