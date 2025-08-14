# OBJETIVO: Implementar Sistema de Biblioteca Musical Unificado no Maestro MCP

## CONTEXTO
Evoluir o servidor Maestro MCP (TypeScript) para incluir biblioteca musical local com busca inteligente, mantendo 100% das capacidades atuais + nova funcionalidade de repertório clássico. Reduzir verbosidade em 90% para casos de repertório conhecido.

## PASSO 0: SETUP GIT (EXECUTAR PRIMEIRO)
```bash
# Criar nova branch para esta feature
git checkout -b feat/unified-music-library

# Verificar que está na branch correta
git branch
```

## ARQUITETURA DA EVOLUÇÃO

### 1. NOVA ESTRUTURA DE DIRETÓRIOS
```bash
maestro-mcp/
├── src/
│   ├── pilares/
│   │   ├── modulo midi/          # [MANTER ATUAL]
│   │   ├── modulo audio/         # [MANTER ATUAL]
│   │   └── modulo library/       # [NOVO - BIBLIOTECA MUSICAL]
│   │       ├── database/
│   │       │   ├── readme.md
│   │       │   ├── index.ts
│   │       │   ├── sqlite-manager.ts
│   │       │   ├── schema.sql
│   │       │   └── migrations.ts
│   │       ├── search/
│   │       │   ├── readme.md
│   │       │   ├── index.ts
│   │       │   ├── vector-search.ts
│   │       │   ├── semantic-engine.ts
│   │       │   └── fuzzy-matcher.ts
│   │       ├── content/
│   │       │   ├── readme.md
│   │       │   ├── index.ts
│   │       │   ├── score-loader.ts
│   │       │   ├── format-converter.ts
│   │       │   └── cache-manager.ts
│   │       └── curator/
│   │           ├── readme.md
│   │           ├── index.ts
│   │           ├── bach-collection.ts
│   │           ├── chopin-collection.ts
│   │           ├── jazz-standards.ts
│   │           └── patterns-library.ts
│   ├── data/                     # [NOVO - DADOS DA BIBLIOTECA]
│   │   ├── library.db           # SQLite database
│   │   ├── vector_embeddings/   # ChromaDB storage
│   │   └── scores/             # JSON scores cache
│   ├── schemas/                 # [EXPANDIR ATUAL]
│   │   ├── midi-schemas.ts     # [MANTER]
│   │   ├── music-schemas.ts    # [MANTER]
│   │   ├── library-schemas.ts  # [NOVO]
│   │   └── common-schemas.ts   # [MANTER]
│   ├── tools/                  # [EXPANDIR ATUAL]
│   │   ├── midi-tools.ts      # [MANTER TODAS AS FUNÇÕES ATUAIS]
│   │   ├── library-tools.ts   # [NOVO - FUNÇÕES DA BIBLIOTECA]
│   │   ├── system-tools.ts    # [MANTER]
│   │   └── index.ts           # [EXPANDIR]
│   └── [resto mantém igual]
```

### 2. NOVAS DEPENDÊNCIAS
```json
// package.json additions
{
  "dependencies": {
    "sqlite3": "^5.1.6",
    "chromadb": "^1.7.0", 
    "fuse.js": "^7.0.0",
    "sentence-transformers": "^1.0.0",
    "supabase": "^2.38.0",
    "dotenv": "^16.3.1"
  }
}
```

### 3. CONFIGURAÇÃO HÍBRIDA (LOCAL + ONLINE)

#### A. Arquivo de Configuração (.env)
```bash
# Local Library (sempre ativo)
LOCAL_LIBRARY_PATH=./src/data/library.db
VECTOR_DB_PATH=./src/data/vector_embeddings

# Online Library (Supabase - opcional)
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
ENABLE_ONLINE_SYNC=true
SYNC_INTERVAL_HOURS=24

# Biblioteca online como fallback/expansão
ONLINE_LIBRARY_ENABLED=true
CACHE_ONLINE_RESULTS=true
```

#### B. Schema Supabase (SQL)
```sql
-- Execute no painel Supabase SQL Editor
CREATE TABLE public.music_scores (
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
    instruments JSONB,
    tags JSONB,
    maestro_format JSONB NOT NULL,
    preview_notes TEXT,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_music_composer ON public.music_scores(composer);
CREATE INDEX idx_music_style ON public.music_scores(style);
CREATE INDEX idx_music_year ON public.music_scores(composition_year);
CREATE INDEX idx_music_key ON public.music_scores(key_signature);
CREATE INDEX idx_music_difficulty ON public.music_scores(difficulty);

-- RLS (Row Level Security) - apenas leitura pública
ALTER TABLE public.music_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.music_scores FOR SELECT USING (is_public = true);
```

### 3. ESQUEMA DO BANCO DE DADOS
```sql
-- src/pilares/modulo library/database/schema.sql
CREATE TABLE IF NOT EXISTS scores (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    composer TEXT NOT NULL,
    style TEXT NOT NULL,
    composition_year INTEGER,     -- [NOVO] Ano da composição
    key_signature TEXT,
    bpm INTEGER,
    time_signature TEXT DEFAULT '4/4',
    difficulty INTEGER CHECK(difficulty BETWEEN 1 AND 10),
    duration_seconds INTEGER,
    voices_count INTEGER,
    instruments TEXT, -- JSON array
    tags TEXT,        -- JSON array  
    maestro_format TEXT NOT NULL, -- JSON completo para execução
    preview_notes TEXT,           -- Primeiros 8 compassos
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_composer ON scores(composer);
CREATE INDEX idx_style ON scores(style);
CREATE INDEX idx_composition_year ON scores(composition_year);  -- [NOVO]
CREATE INDEX idx_key ON scores(key_signature);
CREATE INDEX idx_difficulty ON scores(difficulty);
CREATE INDEX idx_bpm ON scores(bpm);

CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    score_ids TEXT NOT NULL -- JSON array of score IDs
);
```

### 4. NOVAS FUNÇÕES MCP (ADICIONAR A tools/library-tools.ts)

```typescript
// Funções que devem ser implementadas:

export const libraryTools = {
  // BUSCA NA BIBLIOTECA
  "maestro:search_library": {
    description: "🔍 Busca partituras na biblioteca musical",
    parameters: {
      query: "string?",           // "bach fugue F# major"
      composer: "string?",        // "bach", "chopin"
      style: "string?",          // "fugue", "nocturne", "waltz"
      year: "number?",           // [NOVO] 1850, 1740
      year_range: "[number, number]?", // [NOVO] [1800, 1850]
      key: "string?",            // "F# major", "C minor"
      difficulty: "number?",      // 1-10
      bpm_range: "[number, number]?", // [120, 180]
      limit: "number?",          // default: 10
      verbose: "boolean?"        // default: false
    }
  },

  // EXECUÇÃO DA BIBLIOTECA
  "maestro:midi_play_from_library": {
    description: "🎼 Executa partitura da biblioteca por ID ou busca",
    parameters: {
      score_id: "string?",           // ID específico
      query: "string?",              // ou busca: "bach fugue F# major"
      modifications: "object?",      // Mesmo sistema do replay_last
      preview_only: "boolean?",      // Apenas primeiros 8 compassos
      verbose: "boolean?"
    }
  },

  // INFORMAÇÕES DA BIBLIOTECA
  "maestro:library_info": {
    description: "📊 Estatísticas e conteúdo da biblioteca",
    parameters: {
      category: "string?",  // "composers", "styles", "total_scores"
      verbose: "boolean?"
    }
  },

  // ADICIONAR À BIBLIOTECA (FUTURO)
  "maestro:add_to_library": {
    description: "➕ Adiciona nova partitura à biblioteca",
    parameters: {
      title: "string",
      composer: "string", 
      style: "string",
      maestro_format: "object", // Formato completo
      metadata: "object?",
      verbose: "boolean?"
    }
  }
};
```

### 5. IMPLEMENTAÇÃO DA BIBLIOTECA HÍBRIDA

#### A. Database Manager (src/pilares/modulo library/database/sqlite-manager.ts)
```typescript
export class SQLiteLibraryManager {
  private db: Database;
  
  constructor(dbPath: string) {
    // Inicializar SQLite com schema
  }
  
  async searchExact(criteria: SearchCriteria): Promise<ScoreMetadata[]> {
    // Busca SQL exata por compositor, estilo, tonalidade
  }
  
  async getFullScore(scoreId: string): Promise<MaestroFormat | null> {
    // Retorna partitura completa em formato maestro
  }
  
  async addScore(score: FullScore): Promise<void> {
    // Adiciona nova partitura
  }
}
```

#### B. Vector Search Engine (src/pilares/modulo library/search/vector-search.ts)
```typescript
export class VectorSearchEngine {
  private chromaClient: ChromaClient;
  
  constructor(vectorDbPath: string) {
    // Inicializar ChromaDB
  }
  
  async semanticSearch(query: string, limit: number): Promise<SearchResult[]> {
    // Busca semântica: "melancólica piano solo" → Chopin Nocturnes
  }
  
  async addEmbedding(scoreId: string, textContent: string): Promise<void> {
    // Adiciona embedding para nova partitura
  }
}
```

#### C. Library Manager Híbrido (src/pilares/modulo library/index.ts)
```typescript
export class HybridLibraryManager {
  private localManager: SQLiteLibraryManager;
  private onlineManager?: SupabaseLibraryManager;
  private vectorSearch: VectorSearchEngine;
  private cache: Map<string, MaestroFormat> = new Map();
  private config: LibraryConfig;
  
  constructor() {
    this.config = this.loadConfig();
    this.localManager = new SQLiteLibraryManager('./src/data/library.db');
    this.vectorSearch = new VectorSearchEngine('./src/data/vector_embeddings');
    
    if (this.config.onlineEnabled) {
      this.onlineManager = new SupabaseLibraryManager(this.config.supabase);
    }
  }
  
  async search(criteria: LibrarySearchCriteria): Promise<SearchResult[]> {
    // 1. Busca local primeiro (sempre rápida)
    const localResults = await this.localManager.search(criteria);
    
    // 2. Busca online se habilitada e resultados insuficientes
    let onlineResults: SearchResult[] = [];
    if (this.onlineManager && localResults.length < criteria.limit) {
      onlineResults = await this.onlineManager.search({
        ...criteria,
        limit: criteria.limit - localResults.length
      });
      
      // Cache resultados online localmente
      if (this.config.cacheOnlineResults) {
        this.cacheOnlineResults(onlineResults);
      }
    }
    
    // 3. Merge e rank dos resultados
    return this.mergeAndRankResults(localResults, onlineResults);
  }
  
  async getScore(scoreId: string): Promise<MaestroFormat | null> {
    // 1. Cache check
    if (this.cache.has(scoreId)) {
      return this.cache.get(scoreId)!;
    }
    
    // 2. Local database
    let score = await this.localManager.getScore(scoreId);
    
    // 3. Online fallback
    if (!score && this.onlineManager) {
      score = await this.onlineManager.getScore(scoreId);
      
      // Cache online result locally
      if (score && this.config.cacheOnlineResults) {
        await this.localManager.addScore(scoreId, score);
      }
    }
    
    // 4. Memory cache
    if (score) {
      this.cache.set(scoreId, score);
    }
    
    return score;
  }
  
  async syncWithOnline(): Promise<SyncResult> {
    // Sincronização periódica com biblioteca online
    if (!this.onlineManager) return { success: false, reason: 'Online disabled' };
    
    const newScores = await this.onlineManager.getUpdatedScores(
      this.localManager.getLastSyncTimestamp()
    );
    
    for (const score of newScores) {
      await this.localManager.addOrUpdateScore(score);
      await this.vectorSearch.addEmbedding(score.id, score.searchText);
    }
    
    return { success: true, addedScores: newScores.length };
  }
}

// Manager online específico para Supabase
export class SupabaseLibraryManager {
  private supabase: SupabaseClient;
  
  constructor(config: SupabaseConfig) {
    this.supabase = createClient(config.url, config.anonKey);
  }
  
  async search(criteria: LibrarySearchCriteria): Promise<SearchResult[]> {
    let query = this.supabase
      .from('music_scores')
      .select('*')
      .eq('is_public', true);
    
    if (criteria.composer) query = query.ilike('composer', `%${criteria.composer}%`);
    if (criteria.style) query = query.eq('style', criteria.style);
    if (criteria.year) query = query.eq('composition_year', criteria.year);
    if (criteria.yearRange) {
      query = query
        .gte('composition_year', criteria.yearRange[0])
        .lte('composition_year', criteria.yearRange[1]);
    }
    if (criteria.difficulty) query = query.eq('difficulty', criteria.difficulty);
    
    const { data, error } = await query.limit(criteria.limit || 10);
    
    if (error) throw new Error(`Supabase search error: ${error.message}`);
    
    return data?.map(this.convertToSearchResult) || [];
  }
  
  async getScore(scoreId: string): Promise<MaestroFormat | null> {
    const { data, error } = await this.supabase
      .from('music_scores')
      .select('maestro_format')
      .eq('id', scoreId)
      .eq('is_public', true)
      .single();
    
    if (error || !data) return null;
    
    return data.maestro_format as MaestroFormat;
  }
}
```

### 6. POPULAÇÃO INICIAL DA BIBLIOTECA

#### Script de Setup (scripts/setup-library.ts)
```typescript
// População inicial com:
const INITIAL_LIBRARY = {
  bach: {
    wtc_book1: "All 48 Preludes & Fugues",
    inventions: "15 Two-Part Inventions", 
    sinfonias: "15 Three-Part Inventions"
  },
  chopin: {
    nocturnes: "21 Nocturnes",
    waltzes: "19 Waltzes",
    etudes_op10: "12 Etudes Op. 10",
    etudes_op25: "12 Etudes Op. 25"
  },
  jazz_standards: {
    real_book_vol1: "100 Essential Standards"
  },
  patterns: {
    classical_accompaniment: "50 Classical Patterns",
    jazz_comping: "30 Jazz Comping Patterns",
    walking_bass: "25 Walking Bass Lines"
  }
};

// Converter tudo para formato maestro e popular database
```

### 7. INTEGRAÇÃO COM SISTEMA ATUAL

#### Modificar tools/index.ts para incluir library-tools:
```typescript
// MANTER TODAS as funções atuais
import { midiTools } from './midi-tools';
import { systemTools } from './system-tools';
import { libraryTools } from './library-tools'; // NOVO

export const tools = [
  ...midiTools,    // TODAS as funções MIDI atuais
  ...systemTools,  // TODAS as funções de sistema atuais  
  ...libraryTools  // NOVAS funções da biblioteca
];
```

#### Atualizar server.ts para inicializar biblioteca híbrida:
```typescript
// MANTER toda a inicialização atual + adicionar:
import { HybridLibraryManager } from './pilares/modulo library';

class MaestroMCPServer {
  private libraryManager: HybridLibraryManager;
  
  constructor() {
    // ... inicialização atual mantida ...
    this.libraryManager = new HybridLibraryManager();
    
    // Setup sincronização automática se online habilitado
    this.setupPeriodicSync();
  }
  
  private setupPeriodicSync() {
    const syncInterval = process.env.SYNC_INTERVAL_HOURS || 24;
    setInterval(async () => {
      try {
        await this.libraryManager.syncWithOnline();
        console.log('✅ Online library sync completed');
      } catch (error) {
        console.warn('⚠️ Online sync failed:', error.message);
      }
    }, syncInterval * 60 * 60 * 1000); // Convert to milliseconds
  }
  
  // MANTER todos os handlers atuais + adicionar novos
}
```

## CRITÉRIOS DE SUCESSO

### FUNCIONALIDADES MANTIDAS (100%)
- ✅ Todas as funções MIDI atuais funcionando identicamente
- ✅ Sistema de replay funcionando
- ✅ Notação híbrida funcionando
- ✅ Configuração de portas MIDI funcionando
- ✅ Zero breaking changes

### NOVAS FUNCIONALIDADES
- ✅ `maestro:search_library("bach fugue F#")` retorna resultados
- ✅ `maestro:search_library({composer: "chopin", year_range: [1830, 1840]})` busca por período
- ✅ `maestro:midi_play_from_library({query: "chopin nocturne"})` executa
- ✅ `maestro:midi_play_from_library({score_id: "bach_wtc1_01"})` executa
- ✅ `maestro:library_info()` retorna estatísticas
- ✅ Busca semântica: "melancólica piano" encontra Chopin
- ✅ Busca por ano: "compositor romântico 1840" encontra Chopin
- ✅ Modificações funcionam: `{modifications: {"channel_mapping": {"2": 4}}}`
- ✅ Database SQLite criado e populado (com anos)
- ✅ Supabase configurado e sincronizando
- ✅ Vector search inicializado
- ✅ Sistema híbrido (local + online) funcionando

### PERFORMANCE
- ✅ Busca biblioteca: < 100ms
- ✅ Execução de biblioteca: < 50ms  
- ✅ Database size: < 10MB
- ✅ Zero impacto nas funções atuais

## RESTRIÇÕES CRÍTICAS

1. **ZERO BREAKING CHANGES**: Todas as funções atuais devem funcionar identicamente
2. **MANTER ARQUITETURA**: Respeitar estrutura atual de pilares/módulos
3. **TYPESCRIPT STRICT**: Tipagem completa e rigorosa
4. **ZERO VERBOSIDADE**: Apenas código essencial, comentários mínimos
5. **PERFORMANCE FIRST**: Otimizar para velocidade
6. **PRODUCTION READY**: Código robusto com error handling

## ARQUITETURA FINAL (LOCAL + ONLINE)

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Local SQLite  │◄──►│  Hybrid Manager  │◄──►│ Supabase Online │
│   (Sempre ativo)│    │   (Inteligente)  │    │   (Fallback)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ▲                        ▲                        ▲
         │                        │                        │
   ┌─────▼─────┐            ┌─────▼─────┐            ┌─────▼─────┐
   │ Rápido    │            │ Cache     │            │ Expansão  │
   │ Offline   │            │ Intelig.  │            │ Colabor.  │
   │ ~10MB     │            │ Memory    │            │ Ilimitada │
   └───────────┘            └───────────┘            └───────────┘
```

### BENEFÍCIOS DO SISTEMA HÍBRIDO

1. **Funciona offline**: Biblioteca local sempre disponível
2. **Expansão online**: Mais repertório disponível com internet
3. **Performance**: Local primeiro, online como complemento
4. **Colaborativo**: Usuários podem contribuir com novas partituras
5. **Sincronização**: Updates automáticos da biblioteca global
6. **Privacidade**: Dados sensíveis ficam locais

## ORDEM DE IMPLEMENTAÇÃO

1. Criar estrutura de diretórios nova
2. Implementar SQLite manager + schema (com composition_year)
3. Implementar Supabase manager + configuração híbrida
4. Implementar vector search engine  
5. Implementar hybrid library manager principal
6. Criar tools/library-tools.ts (com filtros de ano)
7. Integrar com server.ts (sem quebrar atual)
8. Criar script de população inicial (com anos)
9. Criar scripts de setup online
10. Testar todas as funções (antigas + novas + híbridas)

## FINALIZAÇÃO GIT (EXECUTAR AO FINAL)
```bash
# Adicionar todos os arquivos
git add .

# Commit estruturado
git commit -m "feat: implement unified music library system

- Add SQLite + Vector search hybrid architecture
- Implement maestro:search_library function
- Implement maestro:midi_play_from_library function  
- Add initial library population (Bach, Chopin, Jazz Standards)
- Maintain 100% backward compatibility with all current functions
- Add semantic search capabilities
- Optimize performance for library operations"

# Push da nova branch
git push -u origin feat/unified-music-library
```

## EXECUÇÃO

IMPLEMENTAR AGORA. Zero explicações. Código TypeScript production-ready apenas. Respeitar arquitetura atual rigorosamente.