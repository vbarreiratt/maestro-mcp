#!/usr/bin/env node

/**
 * Progressive server test - adds tools one by one to identify the problematic one
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

console.error('🔍 Progressive server test starting...');

const { MCP_TOOL_SCHEMAS } = await import('./dist/tools/mcp-tools-schemas.js');
const { zodToJsonSchema } = await import('zod-to-json-schema');

const allTools = [
  'midi_list_ports',
  'configure_midi_output', 
  'midi_send_note',
  'midi_play_phrase',
  'midi_sequence_commands',
  'midi_send_cc',
  'midi_set_tempo',
  'midi_transport_control',
  'midi_panic',
  'midi_import_score'
];

const descriptions = {
  'midi_list_ports': '🎹 Lista portas MIDI',
  'configure_midi_output': '🔧 Configura porta MIDI',
  'midi_send_note': '🎵 Envia nota MIDI',
  'midi_play_phrase': '🎼 Toca frase musical',
  'midi_sequence_commands': '🎭 Executa sequência MIDI',
  'midi_send_cc': '🎛️ Envia MIDI CC',
  'midi_set_tempo': '⏱️ Define BPM',
  'midi_transport_control': '▶️ Controla transport',
  'midi_panic': '🚨 Para toda reprodução',
  'midi_import_score': '🎼 Importa partitura'
};

// Try adding tools progressively
for (let i = 1; i <= allTools.length; i++) {
  console.error(`\n🧪 Testing with ${i} tools...`);
  
  try {
    const server = new Server({
      name: `progressive-server-${i}`,
      version: '1.0.0',
    }, {
      capabilities: { tools: {} },
    });
    
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.error(`📋 Building tool list with ${i} tools`);
      
      const tools = [];
      for (let j = 0; j < i; j++) {
        const toolName = allTools[j];
        console.error(`  Adding ${toolName}...`);
        
        try {
          const schema = zodToJsonSchema(MCP_TOOL_SCHEMAS[toolName]);
          tools.push({
            name: toolName,
            description: descriptions[toolName],
            inputSchema: schema,
          });
          console.error(`  ✅ ${toolName} added`);
        } catch (err) {
          console.error(`  ❌ ${toolName} failed: ${err.message}`);
          throw err;
        }
      }
      
      console.error(`📋 Returning ${tools.length} tools`);
      return { tools };
    });
    
    console.error(`🔌 Testing server with ${i} tools...`);
    const transport = new StdioServerTransport();
    
    // Test if connection works
    const connectPromise = server.connect(transport);
    
    // Use a timeout to detect if it hangs
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 3000);
    });
    
    await Promise.race([connectPromise, timeoutPromise]);
    console.error(`✅ Server with ${i} tools connected successfully`);
    
    // Test initialization 
    const testInput = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "test", version: "1.0.0" }
      }
    });
    
    break; // If we get here, this configuration works
    
  } catch (err) {
    console.error(`❌ Failed with ${i} tools: ${err.message}`);
    if (i > 1) {
      console.error(`🎯 Problem tool is likely: ${allTools[i-1]}`);
    }
    break;
  }
}

console.error('Progressive test completed');