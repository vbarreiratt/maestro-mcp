# IMPLEMENTAÇÃO CIRÚRGICA: Biblioteca Musical Supabase-Only

## OBJETIVO
Adicionar sistema de biblioteca musical usando APENAS Supabase à versão estável atual. Zero quebra de funcionalidades existentes. Implementação minimalista e à prova de erros.

## PRÉ-REQUISITOS CONFIRMADOS
- ✅ Servidor estável funcionando
- ✅ Sistema replay funcional  
- ✅ Supabase configurado (.env + schema)
- ✅ Branch main estável

## PASSO 0: COMMIT DE SEGURANÇA
```bash
git add .
git commit -m "stable: backup before library implementation"
git checkout -b feat/clean-supabase-library
```

## IMPLEMENTAÇÃO MINIMALISTA

### 1. INSTALAR APENAS SUPABASE
```bash
npm install @supabase/supabase-js
```

### 2. CRIAR MÓDULO ÚNICO DA BIBLIOTECA

#### src/library/index.ts
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
  bpm?: number;
  preview_notes?: string;
}

export class SupabaseLibrary {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
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
```

### 3. ADICIONAR 3 FERRAMENTAS SIMPLES

#### src/tools/library-tools.ts
```typescript
export const libraryTools = [
  {
    name: "maestro:search_library",
    description: "🔍 Busca partituras na biblioteca musical online",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Busca geral" },
        composer: { type: "string", description: "Compositor específico" },
        style: { type: "string", description: "Estilo musical" },
        year: { type: "number", description: "Ano de composição" },
        limit: { type: "number", description: "Limite de resultados (padrão: 10)" },
        verbose: { type: "boolean", description: "Resposta detalhada" }
      }
    }
  },
  {
    name: "maestro:play_from_library",
    description: "🎼 Executa partitura da biblioteca",
    inputSchema: {
      type: "object",
      properties: {
        score_id: { type: "string", description: "ID da partitura" },
        query: { type: "string", description: "Busca por título/compositor" },
        modifications: { type: "object", description: "Modificações (channel_mapping, bpm, etc)" },
        verbose: { type: "boolean", description: "Resposta detalhada" }
      }
    }
  },
  {
    name: "maestro:library_stats",
    description: "📊 Estatísticas da biblioteca musical",
    inputSchema: {
      type: "object",
      properties: {
        verbose: { type: "boolean", description: "Resposta detalhada" }
      }
    }
  }
];
```

### 4. INTEGRAR NO SERVIDOR (MÍNIMO IMPACTO)

#### Modificar src/server.ts - APENAS ADICIONAR:
```typescript
// ADICIONAR no topo:
import { SupabaseLibrary } from './library/index.js';

// ADICIONAR na classe:
class MaestroMCPServer extends Server {
  private supabaseLibrary?: SupabaseLibrary;

  constructor() {
    super(/* config atual */);
    
    // Inicialização não-bloqueante
    try {
      this.supabaseLibrary = new SupabaseLibrary();
    } catch (error) {
      console.error('⚠️ Library unavailable:', error.message);
    }
  }

  // ADICIONAR handlers (no switch case existente):
  case 'maestro:search_library':
    result = await this.handleSearchLibrary(args);
    break;
  case 'maestro:play_from_library':
    result = await this.handlePlayFromLibrary(args);
    break;
  case 'maestro:library_stats':
    result = await this.handleLibraryStats(args);
    break;

  // ADICIONAR métodos:
  private async handleSearchLibrary(args: any) {
    if (!this.supabaseLibrary) return { success: false, error: "Library unavailable" };
    try {
      const results = await this.supabaseLibrary.search(args);
      return { success: true, results, count: results.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async handlePlayFromLibrary(args: any) {
    if (!this.supabaseLibrary) return { success: false, error: "Library unavailable" };
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

      if (!score) return { success: false, error: "Score not found" };

      if (args.modifications) {
        score = this.applyModifications(score, args.modifications);
      }

      return await this.handleMidiPlayPhrase(score);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async handleLibraryStats(args: any) {
    if (!this.supabaseLibrary) return { success: false, error: "Library unavailable" };
    try {
      const stats = await this.supabaseLibrary.getStats();
      return { success: true, ...stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
```

### 5. ADICIONAR AO EXPORT DE TOOLS

#### Modificar src/tools/index.ts:
```typescript
import { midiTools } from './midi-tools.js';
import { systemTools } from './system-tools.js';
import { libraryTools } from './library-tools.js';

export const tools = [
  ...midiTools,
  ...systemTools,
  ...libraryTools
];
```

### 6. VERIFICAR .env
```bash
# Confirmar que .env tem:
SUPABASE_URL=https://febomzftddvvohgohgep.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## TESTE E BUILD

### 7. COMPILAR E TESTAR
```bash
npm run build
npm start

# Em outro terminal - teste básico:
echo 'Servidor iniciado - teste no Claude Desktop'
```

### 8. POPULAÇÃO INICIAL (OPCIONAL)
Se quiser adicionar algumas partituras de teste no Supabase:
```sql
-- Executar no SQL Editor do Supabase:
INSERT INTO music_scores (id, title, composer, style, composition_year, key_signature, bpm, difficulty, maestro_format, preview_notes, is_public) VALUES 
('test_bach_001', 'Fuga em Dó Maior', 'J.S. Bach', 'fugue', 1722, 'C major', 120, 7, '{"bpm":120,"key":"C major","voices":[{"notes":"C4:q D4:q E4:q F4:q","channel":1,"velocity":0.8}]}', 'C4:q D4:q E4:q F4:q', true);
```

## VALIDAÇÃO DE SUCESSO

### TESTES OBRIGATÓRIOS:
1. ✅ Servidor inicia sem erros
2. ✅ Funções MIDI antigas funcionam identicamente
3. ✅ `maestro:search_library` retorna resultados
4. ✅ `maestro:library_stats` retorna estatísticas
5. ✅ `maestro:play_from_library` executa partituras
6. ✅ Sistema replay continua funcionando

## RESTRIÇÕES CRÍTICAS

1. **ZERO BREAKING CHANGES** - Todas as funções atuais devem funcionar identicamente
2. **GRACEFUL DEGRADATION** - Se Supabase falhar, resto continua funcionando
3. **MINIMAL FOOTPRINT** - Apenas 1 dependência nova
4. **NON-BLOCKING** - Inicialização não pode travar servidor
5. **ERROR BOUNDARIES** - Erros da biblioteca não derrubam servidor

## PASSO FINAL: COMMIT DE SUCESSO
```bash
git add .
git commit -m "feat: add clean supabase-only music library

- Add 3 library functions: search, play, stats
- Maintain 100% backward compatibility  
- Graceful degradation if library unavailable
- Zero breaking changes to existing MIDI functions"

git push origin feat/clean-supabase-library
```

## OBJETIVO FINAL

Sistema híbrido funcionando:
- ✅ Todas as funções MIDI atuais (inalteradas)
- ✅ Sistema replay (inalterado)
- ✅ 3 novas funções de biblioteca (adicionadas)
- ✅ Arquitetura limpa e minimalista

IMPLEMENTAR AGORA. Zero verbosidade. Código production-ready. Foco em estabilidade.