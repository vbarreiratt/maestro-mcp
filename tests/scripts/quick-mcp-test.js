#!/usr/bin/env node

/**
 * Quick MCP Server Test
 * Tests basic MCP communication without timeout issues
 */

import { spawn } from 'child_process';

async function quickTest() {
  console.log('🚀 Quick MCP Server Test');
  console.log('========================');
  
  const child = spawn('node', ['dist/server.js'], {
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let output = '';
  let initialized = false;
  
  child.stdout.on('data', (data) => {
    output += data.toString();
    console.log('📤 Server output:', data.toString().trim());
    
    if (data.toString().includes('Maestro MCP Server started successfully')) {
      initialized = true;
      console.log('✅ Server initialized successfully');
      
      // Send list tools request
      const listToolsRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list'
      };
      
      console.log('📨 Sending list tools request...');
      child.stdin.write(JSON.stringify(listToolsRequest) + '\n');
    }
    
    // Look for JSON response
    if (data.toString().includes('"tools"')) {
      console.log('✅ Received tools list response');
      console.log('🎯 MCP communication working!');
      process.exit(0);
    }
  });
  
  child.stderr.on('data', (data) => {
    console.log('📥 Server stderr:', data.toString().trim());
  });
  
  child.on('close', (code) => {
    console.log(`🏁 Server closed with code: ${code}`);
  });
  
  // Kill after reasonable time
  setTimeout(() => {
    console.log('⏰ Test timeout - killing server');
    child.kill();
    process.exit(1);
  }, 10000);
}

quickTest().catch(console.error);
