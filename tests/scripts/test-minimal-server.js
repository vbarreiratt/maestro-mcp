#!/usr/bin/env node

/**
 * Minimal MCP Server Test
 * Tests if the MCP server framework itself is working
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

async function createMinimalServer() {
  console.error('🚀 Starting minimal MCP server...');
  
  const server = new Server(
    {
      name: 'test-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Add a simple test tool
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error('📋 Received tools/list request');
    return {
      tools: [
        {
          name: 'test_tool',
          description: 'A simple test tool',
          inputSchema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'Test message'
              }
            },
            required: ['message']
          }
        }
      ]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    console.error('🔧 Received tool call:', request.params.name);
    
    if (request.params.name === 'test_tool') {
      return {
        content: [
          {
            type: 'text',
            text: `Test tool executed with: ${request.params.arguments?.message || 'no message'}`
          }
        ]
      };
    }
    
    throw new Error(`Unknown tool: ${request.params.name}`);
  });

  console.error('✅ Server configured, starting transport...');
  
  const transport = new StdioServerTransport();
  console.error('🔌 Connecting server to transport...');
  
  await server.connect(transport);
  console.error('🎉 Minimal MCP server is running!');
}

createMinimalServer().catch(err => {
  console.error('❌ Server failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});