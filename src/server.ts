#!/usr/bin/env node

/**
 * Maestro MCP Server
 * Professional MCP server for musical AI with real-time MIDI control
 */

import dotenv from 'dotenv';
dotenv.config();

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { MCPToolsImpl } from './tools/mcp-tools-impl.js';
import { MCP_TOOL_SCHEMAS } from './tools/mcp-tools-schemas.js';
import { SupabaseLibrary } from './library/supabase-library.js';
import { SUPABASE_LIBRARY_TOOL_SCHEMAS } from './tools/supabase-library-tools.js';
import { logger, LogContext } from './utils/logger.js';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * MCP Server Implementation
 */
class MaestroMCPServer {
  private server: Server;
  private tools: MCPToolsImpl;
  private supabaseLibrary: SupabaseLibrary;

  constructor() {
    this.server = new Server(
      {
        name: 'maestro-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.tools = new MCPToolsImpl();
    this.supabaseLibrary = new SupabaseLibrary(); // Instantâneo - não bloqueia
    this.setupHandlers();
    console.log('🎼 Maestro MCP initialized with Supabase library');
  }

  // private setupPeriodicSync() {
  //   const syncInterval = parseInt(process.env['SYNC_INTERVAL_HOURS'] || '24');
  //   setInterval(async () => {
  //     try {
  //       const libraryManager = getLibraryManager();
  //       await libraryManager.syncWithOnline();
  //       logger.info('✅ Online library sync completed');
  //     } catch (error) {
  //       const message = error instanceof Error ? error.message : 'Unknown error';
  //       logger.warn('⚠️ Online sync failed:', { error: message });
  //     }
  //   }, syncInterval * 60 * 60 * 1000);
  // } // COMENTADO TEMPORARIAMENTE

  private setupHandlers() {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const midiTools = [
        {
          name: 'midi_list_ports',
          description: '🎹 Lista todas as portas MIDI disponíveis (entrada e saída) no sistema',
          inputSchema: zodToJsonSchema(MCP_TOOL_SCHEMAS.midi_list_ports),
        },
        {
          name: 'configure_midi_output',
          description: '🔧 Configura a porta MIDI de saída padrão para todas as operações',
          inputSchema: zodToJsonSchema(MCP_TOOL_SCHEMAS.configure_midi_output),
        },
        {
          name: 'midi_send_note',
          description: '🎵 Envia uma nota MIDI individual com controle completo de parâmetros',
          inputSchema: zodToJsonSchema(MCP_TOOL_SCHEMAS.midi_send_note),
        },
        {
          name: 'midi_play_phrase',
          description: '🎼 Toca uma frase musical com articulação e expressão natural',
          inputSchema: zodToJsonSchema(MCP_TOOL_SCHEMAS.midi_play_phrase),
        },
        {
          name: 'midi_sequence_commands',
          description: '🎭 Executa uma sequência complexa de comandos MIDI com timing preciso',
          inputSchema: zodToJsonSchema(MCP_TOOL_SCHEMAS.midi_sequence_commands),
        },
        {
          name: 'midi_send_cc',
          description: '🎛️ Envia mensagem MIDI Control Change para modificar parâmetros do instrumento',
          inputSchema: zodToJsonSchema(MCP_TOOL_SCHEMAS.midi_send_cc),
        },
        {
          name: 'midi_set_tempo',
          description: '⏱️ Define o BPM (Beats Per Minute) global para todas as operações musicais',
          inputSchema: zodToJsonSchema(MCP_TOOL_SCHEMAS.midi_set_tempo),
        },
        {
          name: 'midi_transport_control',
          description: '▶️ Controla o transport musical (play, pause, stop) do sistema',
          inputSchema: zodToJsonSchema(MCP_TOOL_SCHEMAS.midi_transport_control),
        },
        {
          name: 'midi_panic',
          description: '🚨 Para imediatamente toda a reprodução MIDI (All Notes Off + Reset Controllers)',
          inputSchema: zodToJsonSchema(MCP_TOOL_SCHEMAS.midi_panic),
        },
        {
          name: 'midi_import_score',
          description: '🎼 Importa e executa partituras/tablaturas em vários formatos',
          inputSchema: zodToJsonSchema(MCP_TOOL_SCHEMAS.midi_import_score),
        },
        {
          name: 'maestro_debug_last',
          description: '🔍 Mostra detalhes completos da última operação MIDI executada',
          inputSchema: zodToJsonSchema(MCP_TOOL_SCHEMAS.maestro_debug_last),
        },
        {
          name: 'maestro_replay_last',
          description: '🔄 Repete a última operação MIDI com modificações opcionais',
          inputSchema: zodToJsonSchema(MCP_TOOL_SCHEMAS.maestro_replay_last),
        },
      ];

      const libraryTools = [
        {
          name: 'maestro_search_library',
          description: '🔍 Busca partituras na biblioteca online (Supabase)',
          inputSchema: zodToJsonSchema(SUPABASE_LIBRARY_TOOL_SCHEMAS.maestro_search_library),
        },
        {
          name: 'maestro_midi_play_from_library',
          description: '🎼 Executa partitura da biblioteca online',
          inputSchema: zodToJsonSchema(SUPABASE_LIBRARY_TOOL_SCHEMAS.maestro_midi_play_from_library),
        },
        {
          name: 'maestro_library_info',
          description: '📊 Informações da biblioteca online',
          inputSchema: zodToJsonSchema(SUPABASE_LIBRARY_TOOL_SCHEMAS.maestro_library_info),
        },
      ];

      return {
        tools: [...midiTools, ...libraryTools],
      };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        logger.info(`🔧 Executing tool: ${name}`, args as LogContext);

        // Validate and parse arguments using Zod schemas
        let result;
        switch (name) {
          case 'midi_list_ports': {
            const validArgs = MCP_TOOL_SCHEMAS.midi_list_ports.parse(args || {});
            result = await this.tools.midi_list_ports(validArgs);
            break;
          }
          case 'configure_midi_output': {
            const validArgs = MCP_TOOL_SCHEMAS.configure_midi_output.parse(args || {});
            result = await this.tools.configure_midi_output(validArgs);
            break;
          }
          case 'midi_send_note': {
            const validArgs = MCP_TOOL_SCHEMAS.midi_send_note.parse(args || {});
            result = await this.tools.midi_send_note(validArgs);
            break;
          }
          case 'midi_play_phrase': {
            const validArgs = MCP_TOOL_SCHEMAS.midi_play_phrase.parse(args || {});
            result = await this.tools.midi_play_phrase(validArgs);
            break;
          }
          case 'midi_sequence_commands': {
            const validArgs = MCP_TOOL_SCHEMAS.midi_sequence_commands.parse(args || {});
            result = await this.tools.midi_sequence_commands(validArgs);
            break;
          }
          case 'midi_send_cc': {
            const validArgs = MCP_TOOL_SCHEMAS.midi_send_cc.parse(args || {});
            result = await this.tools.midi_send_cc(validArgs);
            break;
          }
          case 'midi_set_tempo': {
            const validArgs = MCP_TOOL_SCHEMAS.midi_set_tempo.parse(args || {});
            result = await this.tools.midi_set_tempo(validArgs);
            break;
          }
          case 'midi_transport_control': {
            const validArgs = MCP_TOOL_SCHEMAS.midi_transport_control.parse(args || {});
            result = await this.tools.midi_transport_control(validArgs);
            break;
          }
          case 'midi_panic': {
            const validArgs = MCP_TOOL_SCHEMAS.midi_panic.parse(args || {});
            result = await this.tools.midi_panic(validArgs);
            break;
          }
          case 'midi_import_score': {
            const validArgs = MCP_TOOL_SCHEMAS.midi_import_score.parse(args || {});
            result = await this.tools.midi_import_score(validArgs);
            break;
          }
          case 'maestro_debug_last': {
            MCP_TOOL_SCHEMAS.maestro_debug_last.parse(args || {});
            result = await this.tools.maestro_debug_last();
            break;
          }
          case 'maestro_replay_last': {
            const validArgs = MCP_TOOL_SCHEMAS.maestro_replay_last.parse(args || {});
            result = await this.tools.maestro_replay_last(validArgs.modifications);
            break;
          }
          case 'maestro_search_library': {
            const validArgs = SUPABASE_LIBRARY_TOOL_SCHEMAS.maestro_search_library.parse(args || {});
            result = await this.handleSearchLibrary(validArgs);
            break;
          }
          case 'maestro_midi_play_from_library': {
            const validArgs = SUPABASE_LIBRARY_TOOL_SCHEMAS.maestro_midi_play_from_library.parse(args || {});
            result = await this.handlePlayFromLibrary(validArgs);
            break;
          }
          case 'maestro_library_info': {
            const validArgs = SUPABASE_LIBRARY_TOOL_SCHEMAS.maestro_library_info.parse(args || {});
            result = await this.handleLibraryInfo(validArgs);
            break;
          }
          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        logger.info(`✅ Tool ${name} executed successfully`);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`❌ Tool ${name} failed: ${errorMessage}`, { error: error instanceof Error ? error.message : error });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: errorMessage,
                tool: name,
                timestamp: new Date().toISOString(),
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async handleSearchLibrary(args: any) {
    try {
      const results = await this.supabaseLibrary.search(args);
      return {
        success: true,
        results,
        count: results.length,
        verbose: args.verbose || false
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }

  private async handlePlayFromLibrary(args: any) {
    try {
      let score;
      
      if (args.score_id) {
        score = await this.supabaseLibrary.getScore(args.score_id);
      } else if (args.query) {
        const results = await this.supabaseLibrary.search({ query: args.query, limit: 1 });
        if (results.length > 0) {
          score = await this.supabaseLibrary.getScore(results[0]!.id);
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
      const midiResult = await this.tools.midi_play_phrase(score);
      
      return {
        success: true,
        executed_score: score,
        midi_result: midiResult,
        preview_only: args.preview_only || false,
        verbose: args.verbose || false
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Play failed'
      };
    }
  }

  private async handleLibraryInfo(args: any) {
    try {
      const info = await this.supabaseLibrary.getLibraryInfo();
      return {
        success: true,
        ...info,
        verbose: args.verbose || false
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Info retrieval failed'
      };
    }
  }

  private applyModifications(score: any, modifications: any): any {
    // Deep copy para evitar mutação
    const modifiedScore = JSON.parse(JSON.stringify(score));
    
    // Aplicar modificações usando path notation
    Object.entries(modifications).forEach(([path, value]) => {
      const keys = path.split('.');
      let current = modifiedScore;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]!;
        if (key.includes('[') && key.includes(']')) {
          const [arrayKey, indexStr] = key.split('[');
          const index = parseInt(indexStr!.replace(']', ''));
          current = current[arrayKey!][index];
        } else {
          current = current[key];
        }
      }
      
      const finalKey = keys[keys.length - 1]!;
      if (finalKey.includes('[') && finalKey.includes(']')) {
        const [arrayKey, indexStr] = finalKey.split('[');
        const index = parseInt(indexStr!.replace(']', ''));
        current[arrayKey!][index] = value;
      } else {
        current[finalKey] = value;
      }
    });
    
    return modifiedScore;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('🎼 Maestro MCP Server started successfully');
    logger.info('🎹 12 MIDI tools + 3 Library tools available for musical AI control');
    logger.info('📚 Supabase-only Music Library System active');
  }
}

// Start server
const server = new MaestroMCPServer();
server.run().catch((error) => {
  logger.error('Failed to start MCP server', error);
  process.exit(1);
});