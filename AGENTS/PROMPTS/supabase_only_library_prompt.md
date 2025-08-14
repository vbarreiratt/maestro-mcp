# OBJETIVO: Biblioteca Musical Supabase-Only (Limpar e Reimplementar)

## CONTEXTO
Abandonar implementação local problemática. Implementar biblioteca musical APENAS com Supabase - simples, não-bloqueante, sempre disponível. Supabase já configurado com .env e schema.

## PASSO 0: SETUP GIT
```bash
git checkout -b feat/supabase-only-library
git branch
```

## LIMPEZA COMPLETA

### 1. REMOVER TODOS OS VESTÍGIOS DA BIBLIOTECA LOCAL
```bash
# Deletar diretórios da tentativa anterior
rm -rf src/pilares/modulo-library/
rm -rf src/data/
rm -rf src/schemas/library-schemas.ts
rm -rf src/tools/library-tools.ts

# Limpar dependências problemáticas do package.json
npm uninstall sqlite3 chromadb fuse.js sentence-transformers
```

### 2. LIMPAR IMPORTS NO server.ts
Remover TODAS as referências à biblioteca local:
```typescript
// REMOVER estas linhas do server.ts:
// import { HybridLibraryManager } from './pilares/modulo-library';
// private libraryManager: HybridLibraryManager;
// this.libraryManager = new HybridLibraryManager();
// this.setupPeriodicSync();
// private setupPeriodicSync() { ... }
```

### 3. LIMPAR tools/index.ts
```typescript
// REMOVER:
// import { libraryTools } from './library-tools';
// ...libraryTools,

// MANTER APENAS:
export const tools = [
  ...midiTools,    
  ...systemTools   
];
```

## IMPLEMENTAÇÃO SUPABASE-ONLY

### 1. INSTALAR APENAS SUPABASE
```bash
npm install @supabase/supabase-js
```

### 2. CRIAR MÓDULO SUPABASE SIMPLES

#### src/library/supabase-library.ts
```typescript
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
  preview_notes?: string;
}

export class SupabaseLibrary {
  private supabase: SupabaseClient;

  constructor() {
    // Instantâneo - apenas cria client HTTP
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }

  async search(criteria: {
    query?: string;
    composer?: string;
    style?: string;
    year?: number;
    year_range?: [number, number];
    key?: string;
    difficulty?: number;
    limit?: number;
  }): Promise<SearchResult[]> {
    let query = this.supabase
      .from('music_scores')
      .select('id, title, composer, style, composition_year, key_signature, difficulty, preview_notes')
      .eq('is_public', true);

    if (criteria.composer) query = query.ilike('composer', `%${criteria.composer}%`);
    if (criteria.style) query = query.eq('style', criteria.style);
    if (criteria.year) query = query.eq('composition_year', criteria.year);
    if (criteria.year_range) {
      query = query
        .gte('composition_year', criteria.year_range[0])
        .lte('composition_year', criteria.year_range[1]);
    }
    if (criteria.key) query = query.ilike('key_signature', `%${criteria.key}%`);
    if (criteria.difficulty) query = query.eq('difficulty', criteria.difficulty);
    if (criteria.query) {
      query = query.or(`title.ilike.%${criteria.query}%,composer.ilike.%${criteria.query}%,style.ilike.%${criteria.query}%`);
    }

    const { data, error } = await query.limit(criteria.limit || 10);
    
    if (error) throw new Error(`Search error: ${error.message}`);
    
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
    
    return data.maestro_format as MaestroFormat;
  }

  async getLibraryInfo(): Promise<{
    total_scores: number;
    composers: string[];
    styles: string[];
  }> {
    const { data, error } = await this.supabase
      .from('music_scores')
      .select('composer, style')
      .eq('is_public', true);

    if (error) throw new Error(`Library info error: ${error.message}`);

    const composers = [...new Set(data?.map(d => d.composer) || [])];
    const styles = [...new Set(data?.map(d => d.style) || [])];

    return {
      total_scores: data?.length || 0,
      composers: composers.sort(),
      styles: styles.sort()
    };
  }
}
```

### 3. CRIAR FERRAMENTAS SUPABASE

#### src/tools/supabase-library-tools.ts
```typescript
import { SupabaseLibrary } from '../library/supabase-library.js';

export const supabaseLibraryTools = [
  {
    name: "maestro:search_library",
    description: "🔍 Busca partituras na biblioteca online (Supabase)",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Busca geral: 'bach fugue F# major'" },
        composer: { type: "string", description: "Compositor: 'bach', 'chopin'" },
        style: { type: "string", description: "Estilo: 'fugue', 'nocturne', 'waltz'" },
        year: { type: "number", description: "Ano específico: 1850, 1740" },
        year_range: { 
          type: "array", 
          items: { type: "number" },
          minItems: 2,
          maxItems: 2,
          description: "Período: [1800, 1850]" 
        },
        key: { type: "string", description: "Tonalidade: 'F# major', 'C minor'" },
        difficulty: { type: "number", minimum: 1, maximum: 10, description: "Dificuldade 1-10" },
        limit: { type: "number", description: "Limite de resultados (padrão: 10)" },
        verbose: { type: "boolean", description: "Resposta detalhada" }
      }
    }
  },

  {
    name: "maestro:play_from_library",
    description: "🎼 Executa partitura da biblioteca online",
    inputSchema: {
      type: "object",
      properties: {
        score_id: { type: "string", description: "ID específico da partitura" },
        query: { type: "string", description: "ou busca: 'bach fugue F# major'" },
        modifications: { 
          type: "object", 
          description: "Modificações: channel_mapping, bpm, etc." 
        },
        preview_only: { type: "boolean", description: "Apenas preview (8 compassos)" },
        verbose: { type: "boolean", description: "Resposta detalhada" }
      }
    }
  },

  {
    name: "maestro:library_info", 
    description: "📊 Informações da biblioteca online",
    inputSchema: {
      type: "object",
      properties: {
        verbose: { type: "boolean", description: "Resposta detalhada" }
      }
    }
  }
];
```

### 4. INTEGRAR NO SERVIDOR

#### Modificar src/server.ts:
```typescript
import { SupabaseLibrary } from './library/supabase-library.js';

class MaestroMCPServer extends Server {
  private supabaseLibrary: SupabaseLibrary;

  constructor() {
    super(/* config atual */);
    
    // Instantâneo - não bloqueia
    this.supabaseLibrary = new SupabaseLibrary();
  }

  // Adicionar handlers para as novas funções:
  async handleSearchLibrary(args: any) {
    try {
      const results = await this.supabaseLibrary.search(args);
      return {
        success: true,
        results,
        count: results.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async handlePlayFromLibrary(args: any) {
    try {
      let score;
      
      if (args.score_id) {
        score = await this.supabaseLibrary.getScore(args.score_id);
      } else if (args.query) {
        const results = await this.supabaseLibrary.search({ query: args.query, limit: 1 });
        if (results.length > 0) {
          score = await this.supabaseLibrary.getScore(results[0].id);
        }
      }

      if (!score) {
        return { success: false, error: "Score not found" };
      }

      // Aplicar modificações se existirem
      if (args.modifications) {
        score = this.applyModifications(score, args.modifications);
      }

      // Executar usando sistema MIDI existente
      return await this.handleMidiPlayPhrase(score);
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async handleLibraryInfo(args: any) {
    try {
      const info = await this.supabaseLibrary.getLibraryInfo();
      return {
        success: true,
        ...info
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
```

#### Modificar src/tools/index.ts:
```typescript
import { midiTools } from './midi-tools.js';
import { systemTools } from './system-tools.js';
import { supabaseLibraryTools } from './supabase-library-tools.js';

export const tools = [
  ...midiTools,
  ...systemTools,
  ...supabaseLibraryTools  // Apenas Supabase
];
```

## POPULAÇÃO INICIAL DO SUPABASE

### Script para popular biblioteca (scripts/populate-supabase.ts):
```typescript
// Criar algumas partituras iniciais diretamente no Supabase
const INITIAL_SCORES = [
  {
    id: "bach_wtc1_fugue_01",
    title: "Fugue No. 1 in C Major BWV 846",
    composer: "Johann Sebastian Bach",
    style: "fugue",
    composition_year: 1722,
    key_signature: "C major",
    difficulty: 7,
    maestro_format: {
      bpm: 120,
      key: "C major",
      voices: [
        { notes: "C4:q D4:q E4:q F4:q | G4:h F4:q E4:q", channel: 1, velocity: 0.8 }
      ]
    },
    preview_notes: "C4:q D4:q E4:q F4:q",
    is_public: true
  }
  // ... mais partituras
];
```

## CRITÉRIOS DE SUCESSO

### FUNCIONALIDADES MANTIDAS (100%)
- ✅ Todas as funções MIDI atuais funcionando identicamente
- ✅ Sistema de replay funcionando
- ✅ Zero breaking changes

### NOVAS FUNCIONALIDADES SUPABASE
- ✅ `maestro:search_library("bach fugue")` busca online
- ✅ `maestro:play_from_library({query: "chopin nocturne"})` executa
- ✅ `maestro:library_info()` retorna estatísticas
- ✅ Modificações funcionam: `{modifications: {"channel_mapping": {"2": 4}}}`
- ✅ Inicialização instantânea (não-bloqueante)
- ✅ Sempre disponível (com internet)

### PERFORMANCE
- ✅ Inicialização: < 10ms
- ✅ Busca online: < 500ms
- ✅ Zero dependências problemáticas
- ✅ Zero impacto nas funções atuais

## RESTRIÇÕES CRÍTICAS

1. **ZERO BREAKING CHANGES**: Todas as funções atuais devem funcionar identicamente
2. **INICIALIZAÇÃO INSTANTÂNEA**: Sem operações bloqueantes no constructor
3. **APENAS SUPABASE**: Sem SQLite, ChromaDB, ou operações locais
4. **TYPESCRIPT STRICT**: Tipagem completa
5. **PRODUCTION READY**: Error handling robusto

## FINALIZAÇÃO GIT
```bash
git add .
git commit -m "feat: implement supabase-only music library

- Remove all local library dependencies and code
- Implement clean Supabase-only library system
- Add maestro:search_library function
- Add maestro:play_from_library function  
- Add maestro:library_info function
- Maintain 100% backward compatibility
- Non-blocking initialization (instantaneous)
- Clean architecture with zero local dependencies"

git push -u origin feat/supabase-only-library
```

IMPLEMENTAR AGORA. Zero verbosidade. Limpar tudo, implementar apenas Supabase. Simples e funcional.