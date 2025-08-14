CREATE TABLE IF NOT EXISTS scores (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    composer TEXT NOT NULL,
    style TEXT NOT NULL,
    composition_year INTEGER,
    key_signature TEXT,
    bpm INTEGER,
    time_signature TEXT DEFAULT '4/4',
    difficulty INTEGER CHECK(difficulty BETWEEN 1 AND 10),
    duration_seconds INTEGER,
    voices_count INTEGER,
    instruments TEXT,
    tags TEXT,
    maestro_format TEXT NOT NULL,
    preview_notes TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_composer ON scores(composer);
CREATE INDEX IF NOT EXISTS idx_style ON scores(style);
CREATE INDEX IF NOT EXISTS idx_composition_year ON scores(composition_year);
CREATE INDEX IF NOT EXISTS idx_key ON scores(key_signature);
CREATE INDEX IF NOT EXISTS idx_difficulty ON scores(difficulty);
CREATE INDEX IF NOT EXISTS idx_bpm ON scores(bpm);

CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    score_ids TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);