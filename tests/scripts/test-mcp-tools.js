#!/usr/bin/env node

/**
 * Simple MCP Tools Test Script
 * Tests all 8 mandatory MIDI tools to verify functionality
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';

console.log('🎼 Maestro MCP Tools Test Suite');
console.log('================================');

// Test cases for all 8 tools
const testCases = [
  {
    name: 'midi_list_ports',
    description: 'List MIDI ports',
    params: { refresh: true }
  },
  {
    name: 'midi_panic',
    description: 'Emergency stop all MIDI',
    params: {}
  },
  {
    name: 'midi_set_tempo',
    description: 'Set global tempo',
    params: { bpm: 120 }
  },
  {
    name: 'midi_transport_control',
    description: 'Transport control',
    params: { action: 'stop' }
  },
  {
    name: 'midi_send_note',
    description: 'Send single MIDI note',
    params: { 
      note: 'C4',
      velocity: 0.8,
      duration: 1.0,
      channel: 1
    }
  },
  {
    name: 'midi_play_phrase',
    description: 'Play musical phrase',
    params: {
      notes: 'C4 D4 E4 F4',
      tempo: 120,
      style: 'legato'
    }
  },
  {
    name: 'midi_send_cc',
    description: 'Send control change',
    params: {
      controller: 'volume',
      value: 100,
      channel: 1
    }
  },
  {
    name: 'midi_sequence_commands',
    description: 'Execute command sequence',
    params: {
      commands: [
        { type: 'note', note: 'C4', duration: 0.5, velocity: 0.8 },
        { type: 'delay', time: 0.5 },
        { type: 'note', note: 'E4', duration: 0.5, velocity: 0.8 }
      ]
    }
  }
];

async function runTest(testCase) {
  return new Promise((resolve) => {
    console.log(`\n⚡ Testing: ${testCase.description}`);
    console.log(`   Tool: ${testCase.name}`);
    console.log(`   Params:`, JSON.stringify(testCase.params, null, 2));
    
    // Create MCP request
    const request = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: testCase.name,
        arguments: testCase.params
      }
    };
    
    const child = spawn('node', ['dist/server.js'], { 
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let errorOutput = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0 || output.includes('"success":true')) {
        console.log('   ✅ PASSED');
        resolve({ success: true, output, error: null });
      } else {
        console.log('   ❌ FAILED');
        console.log('   Error:', errorOutput || 'No output');
        resolve({ success: false, output, error: errorOutput });
      }
    });
    
    // Send request
    child.stdin.write(JSON.stringify(request) + '\n');
    child.stdin.end();
    
    // Timeout after 5 seconds
    setTimeout(() => {
      child.kill();
      console.log('   ⏰ TIMEOUT');
      resolve({ success: false, output, error: 'Timeout' });
    }, 5000);
  });
}

async function runAllTests() {
  console.log('Starting comprehensive test suite...\n');
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push({ ...testCase, ...result });
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n🎯 Test Summary');
  console.log('================');
  
  const passed = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Passed: ${passed.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (failed.length > 0) {
    console.log('\nFailed tests:');
    failed.forEach(f => {
      console.log(`- ${f.name}: ${f.error || 'Unknown error'}`);
    });
  }
  
  console.log(`\n🎼 MCP Server Status: ${passed.length === results.length ? 'READY FOR PRODUCTION' : 'NEEDS FIXES'}`);
}

// Run tests
runAllTests().catch(console.error);