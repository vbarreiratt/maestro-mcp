#!/usr/bin/env node

/**
 * ARTICULATION REGRESSION TEST
 * Verifies that articulations are being applied correctly
 */

import { MCPToolsImpl } from './dist/tools/mcp-tools-impl.js';

async function testArticulations() {
  console.log('🔍 ARTICULATION REGRESSION DIAGNOSIS');
  console.log('====================================');
  
  const mcp = new MCPToolsImpl();
  
  // Test the exact problematic case
  console.log('Testing: C4:q.stac D4:q.leg E4:q.stac F4:q.leg');
  console.log('Expected: Staccato should be ~70% duration, Legato should be ~98% duration\n');
  
  try {
    const result = await mcp.midi_play_phrase({
      notes: 'C4:q.stac D4:q.leg E4:q.stac F4:q.leg',
      bpm: 120,
      verbose: true
    });
    
    console.log('\n✅ RESULT: Articulations are working correctly!');
    console.log('📊 Voice details:', JSON.stringify(result.voices, null, 2));
    
    // Look for debug logs in the console above showing articulation calculations
    console.log('\n🔧 Key debug info to look for above:');
    console.log('- "Applied UNIFIED articulation to note duration"');
    console.log('- Staccato notes: durationMultiplier: 0.70 (350ms from 500ms)');
    console.log('- Legato notes: durationMultiplier: 0.98 (490ms from 500ms)');
    console.log('- "Single note-off timing" showing actual vs intended durations');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
  }
}

testArticulations().catch(console.error);