#!/usr/bin/env node

/**
 * Debug version of the server to identify blocking issues
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

console.error('🔍 Debug server starting...');

try {
  console.error('📦 Importing MCPToolsImpl...');
  const { MCPToolsImpl } = await import('./dist/tools/mcp-tools-impl.js');
  console.error('✅ MCPToolsImpl imported');
  
  console.error('🏗️ Creating MCPToolsImpl instance...');
  const tools = new MCPToolsImpl();
  console.error('✅ MCPToolsImpl instance created');
  
  console.error('📦 Importing schemas...');
  const { MCP_TOOL_SCHEMAS } = await import('./dist/tools/mcp-tools-schemas.js');
  console.error('✅ Schemas imported');
  
  console.error('📦 Importing zodToJsonSchema...');
  const { zodToJsonSchema } = await import('zod-to-json-schema');
  console.error('✅ zodToJsonSchema imported');
  
  console.error('🏗️ Creating Server...');
  const server = new Server(
    {
      name: 'debug-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );
  console.error('✅ Server created');
  
  console.error('🔧 Setting up handlers...');
  
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error('📋 Handling tools/list request');
    
    const toolList = [
      {
        name: 'midi_list_ports',
        description: '🎹 Lista todas as portas MIDI disponíveis',
        inputSchema: zodToJsonSchema(MCP_TOOL_SCHEMAS.midi_list_ports),
      },
      {
        name: 'configure_midi_output', 
        description: '🔧 Configura porta MIDI',
        inputSchema: zodToJsonSchema(MCP_TOOL_SCHEMAS.configure_midi_output),
      }
    ];
    
    console.error(`📋 Returning ${toolList.length} tools`);
    return { tools: toolList };
  });
  
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    console.error(`🔧 Handling tool call: ${request.params.name}`);
    return {
      content: [
        {
          type: 'text',
          text: `Debug: ${request.params.name} called`
        }
      ]
    };
  });
  
  console.error('✅ Handlers set up');
  
  console.error('🔌 Creating transport...');
  const transport = new StdioServerTransport();
  console.error('✅ Transport created');
  
  console.error('🔗 Connecting server to transport...');
  await server.connect(transport);
  console.error('🎉 Debug server connected and running!');
  
} catch (error) {
  console.error('❌ Debug server error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}