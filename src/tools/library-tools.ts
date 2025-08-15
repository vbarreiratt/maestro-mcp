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