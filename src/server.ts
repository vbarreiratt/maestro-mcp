#!/usr/bin/env node

/**
 * Maestro MCP Server
 * Professional MCP server for musical AI with real-time MIDI control
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { MCPToolsImpl } from './tools/mcp-tools-impl.js';
import { MCP_TOOL_SCHEMAS } from './tools/mcp-tools-schemas.js';
import { logger, LogContext } from './utils/logger.js';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * MCP Server Implementation
 */
class MaestroMCPServer {
  private server: Server;
  private tools: MCPToolsImpl;

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
    this.setupHandlers();
  }

  private setupHandlers() {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
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
        ],
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

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('🎼 Maestro MCP Server started successfully');
    logger.info('🎹 11 MIDI tools available for musical AI control (including debug)');
  }
}

// Start server
const server = new MaestroMCPServer();
server.run().catch((error) => {
  logger.error('Failed to start MCP server', error);
  process.exit(1);
});