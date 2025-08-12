#!/usr/bin/env node

/**
 * Tool-specific MCP Test
 * Tests a specific tool with proper MCP communication
 */

import { spawn } from 'child_process';

async function testSpecificTool() {
  console.log('🎯 Tool-Specific MCP Test');
  console.log('==========================');
  
  const child = spawn('node', ['dist/server.js'], {
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let initialized = false;
  let response = '';
  
  child.stdout.on('data', (data) => {
    const output = data.toString();
    
    if (output.includes('Maestro MCP Server started successfully') && !initialized) {
      initialized = true;
      console.log('✅ Server ready');
      
      // Test midi_list_ports
      const toolRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'midi_list_ports',
          arguments: { refresh: true }
        }
      };
      
      console.log('📨 Testing midi_list_ports...');
      child.stdin.write(JSON.stringify(toolRequest) + '\n');
    }
    
    // Look for response with "success": true
    if (output.includes('"success":true') && output.includes('ports')) {
      console.log('✅ Tool executed successfully!');
      
      try {
        const jsonMatch = output.match(/\{.*"success":true.*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          console.log('🎯 Result:', {
            success: result.success,
            portCount: result.ports ? result.ports.length : 0,
            currentOutput: result.currentOutput
          });
        }
      } catch (e) {
        console.log('⚠️ Could not parse result JSON');
      }
      
      console.log('🎉 MCP tools are working correctly!');
      child.kill();
      process.exit(0);
    }
    
    if (output.includes('"success":false')) {
      console.log('❌ Tool failed');
      console.log('📄 Response:', output);
      child.kill();
      process.exit(1);
    }
  });
  
  child.stderr.on('data', (data) => {
    // Suppress warnings for this test
    // console.log('📥 Server stderr:', data.toString().trim());
  });
  
  setTimeout(() => {
    console.log('⏰ Test timeout');
    child.kill();
    process.exit(1);
  }, 8000);
}

testSpecificTool().catch(console.error);
