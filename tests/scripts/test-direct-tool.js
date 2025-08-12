#!/usr/bin/env node

/**
 * Direct Tool Test - bypass MCP protocol
 */

import { MCPToolsImpl } from './dist/tools/mcp-tools-impl.js';

async function directToolTest() {
  console.log('🔧 Direct Tool Test');
  console.log('===================');
  
  try {
    const tools = new MCPToolsImpl();
    console.log('✅ MCPToolsImpl created');
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ Initialization wait completed');
    
    console.log('📨 Testing midi_list_ports directly...');
    const result = await tools.midi_list_ports({ refresh: true });
    
    console.log('📄 Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('🎉 Direct tool test PASSED!');
    } else {
      console.log('❌ Direct tool test FAILED:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

directToolTest().catch(console.error);
