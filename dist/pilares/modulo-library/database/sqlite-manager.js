import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export class SQLiteLibraryManager {
    db;
    initialized = false;
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath);
        this.initialize();
    }
    async initialize() {
        if (this.initialized)
            return;
        return new Promise((resolve, reject) => {
            const schemaPath = join(__dirname, 'schema.sql');
            const schema = readFileSync(schemaPath, 'utf-8');
            this.db.exec(schema, (err) => {
                if (err) {
                    reject(new Error(`Failed to initialize database: ${err.message}`));
                }
                else {
                    this.initialized = true;
                    resolve();
                }
            });
        });
    }
    async search(criteria) {
        await this.initialize();
        let query = 'SELECT * FROM scores WHERE 1=1';
        const params = [];
        if (criteria.composer) {
            query += ' AND LOWER(composer) LIKE LOWER(?)';
            params.push(`%${criteria.composer}%`);
        }
        if (criteria.style) {
            query += ' AND LOWER(style) LIKE LOWER(?)';
            params.push(`%${criteria.style}%`);
        }
        if (criteria.year) {
            query += ' AND composition_year = ?';
            params.push(criteria.year);
        }
        if (criteria.year_range) {
            query += ' AND composition_year BETWEEN ? AND ?';
            params.push(criteria.year_range[0], criteria.year_range[1]);
        }
        if (criteria.key) {
            query += ' AND LOWER(key_signature) LIKE LOWER(?)';
            params.push(`%${criteria.key}%`);
        }
        if (criteria.difficulty) {
            query += ' AND difficulty = ?';
            params.push(criteria.difficulty);
        }
        if (criteria.bpm_range) {
            query += ' AND bpm BETWEEN ? AND ?';
            params.push(criteria.bpm_range[0], criteria.bpm_range[1]);
        }
        if (criteria.query) {
            query += ' AND (LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?) OR LOWER(tags) LIKE LOWER(?))';
            const searchTerm = `%${criteria.query}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        query += ' ORDER BY composition_year DESC, composer, title LIMIT ?';
        params.push(criteria.limit);
        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(new Error(`Search failed: ${err.message}`));
                }
                else {
                    const results = rows.map(row => ({
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
                        instruments: row.instruments ? JSON.parse(row.instruments) : [],
                        tags: row.tags ? JSON.parse(row.tags) : [],
                        preview_notes: row.preview_notes,
                        description: row.description
                    }));
                    resolve(results);
                }
            });
        });
    }
    async getFullScore(scoreId) {
        await this.initialize();
        return new Promise((resolve, reject) => {
            this.db.get('SELECT maestro_format FROM scores WHERE id = ?', [scoreId], (err, row) => {
                if (err) {
                    reject(new Error(`Failed to get score: ${err.message}`));
                }
                else if (!row) {
                    resolve(null);
                }
                else {
                    try {
                        const maestroFormat = JSON.parse(row.maestro_format);
                        resolve(maestroFormat);
                    }
                    catch (parseErr) {
                        reject(new Error(`Invalid maestro format for score ${scoreId}`));
                    }
                }
            });
        });
    }
    async addScore(score) {
        await this.initialize();
        const { id, title, composer, style, composition_year, key_signature, bpm, time_signature, difficulty, duration_seconds, voices_count, instruments, tags, preview_notes, description } = score.metadata;
        return new Promise((resolve, reject) => {
            this.db.run(`
        INSERT OR REPLACE INTO scores (
          id, title, composer, style, composition_year, key_signature,
          bpm, time_signature, difficulty, duration_seconds, voices_count,
          instruments, tags, maestro_format, preview_notes, description,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
                id, title, composer, style, composition_year, key_signature,
                bpm, time_signature, difficulty, duration_seconds, voices_count,
                instruments ? JSON.stringify(instruments) : null,
                tags ? JSON.stringify(tags) : null,
                JSON.stringify(score.maestro_format),
                preview_notes, description
            ], (err) => {
                if (err) {
                    reject(new Error(`Failed to add score: ${err.message}`));
                }
                else {
                    resolve();
                }
            });
        });
    }
    async getLastSyncTimestamp() {
        await this.initialize();
        return new Promise((resolve, reject) => {
            this.db.get('SELECT value FROM sync_metadata WHERE key = ?', ['last_sync'], (err, row) => {
                if (err) {
                    reject(new Error(`Failed to get sync timestamp: ${err.message}`));
                }
                else if (!row) {
                    resolve(null);
                }
                else {
                    resolve(new Date(row.value));
                }
            });
        });
    }
    async updateSyncTimestamp() {
        await this.initialize();
        return new Promise((resolve, reject) => {
            this.db.run('INSERT OR REPLACE INTO sync_metadata (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)', ['last_sync', new Date().toISOString()], (err) => {
                if (err) {
                    reject(new Error(`Failed to update sync timestamp: ${err.message}`));
                }
                else {
                    resolve();
                }
            });
        });
    }
    async getStatistics() {
        await this.initialize();
        return new Promise((resolve, reject) => {
            this.db.get(`
        SELECT 
          COUNT(*) as total,
          COUNT(DISTINCT composer) as composers,
          COUNT(DISTINCT style) as styles
        FROM scores
      `, (err, row) => {
                if (err) {
                    reject(new Error(`Failed to get statistics: ${err.message}`));
                }
                else {
                    resolve({
                        total: row.total,
                        composers: row.composers,
                        styles: row.styles
                    });
                }
            });
        });
    }
    close() {
        this.db.close();
    }
}
//# sourceMappingURL=sqlite-manager.js.map