#!/usr/bin/env node

/**
 * QUICK TIMING TEST - Verify optimized performance without infinite loops
 */

import { performance } from 'perf_hooks';
import { Maestro } from './dist/pilares/maestro/index.js';

async function quickTimingTest() {
  console.log('\n=== QUICK OPTIMIZED TIMING TEST ===');
  
  const maestro = new Maestro();
  const testStart = performance.now();
  let eventCount = 0;
  
  // Track first few events only
  const originalNoteCallback = maestro.onNoteEvent;
  maestro.onNoteEvent = (event) => {
    eventCount++;
    const executionTime = performance.now() - testStart;
    console.log(`Event ${eventCount} at ${executionTime.toFixed(2)}ms: ${event.toneName} vel:${event.velocity}`);
    originalNoteCallback(event);
  };
  
  try {
    // Quick initialization test
    console.log('🔄 Initializing...');
    const initStart = performance.now();
    await maestro.initialize();
    const initTime = performance.now() - initStart;
    console.log(`✅ Init: ${initTime.toFixed(2)}ms`);
    
    // Simple partitura - single note to test timing
    const simplePartitura = {
      metadata: { bpm: 120, timeSignature: '4/4', key: 'C', totalDuration: '0:1', eventCount: 1 },
      noteEvents: [{
        absoluteTime: 0.0, toneName: 'C4', midiNote: 60, velocity: 0.8,
        duration: 0.1, channel: 1, articulation: 'legato', noteOffTime: 0.1
      }],
      controlChangeEvents: [],
      systemEvents: []
    };
    
    console.log('🎯 Scheduling...');
    const scheduleStart = performance.now();
    maestro.schedulePartitura(simplePartitura);
    const scheduleTime = performance.now() - scheduleStart;
    console.log(`✅ Schedule: ${scheduleTime.toFixed(2)}ms`);
    
    console.log('▶️ Playing...');
    maestro.play();
    
    // Wait only 500ms to see first events
    await new Promise(resolve => setTimeout(resolve, 500));
    
    maestro.stop();
    const totalTime = performance.now() - testStart;
    
    console.log('\n📊 RESULTS:');
    console.log(`Total test time: ${totalTime.toFixed(2)}ms`);
    console.log(`Events executed: ${eventCount}`);
    console.log(`Init time: ${initTime.toFixed(2)}ms`);
    console.log(`Schedule time: ${scheduleTime.toFixed(2)}ms`);
    
    const metrics = maestro.getPerformanceMetrics();
    console.log(`Avg latency: ${metrics.averageSchedulingLatency.toFixed(2)}ms`);
    
    // Success criteria
    const success = initTime < 10 && scheduleTime < 5 && eventCount > 0;
    console.log(`\n${success ? '🎯 SUCCESS' : '❌ FAILED'}: Optimized timing working`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    try {
      await maestro.cleanup();
      console.log('🧹 Cleaned up');
    } catch (e) {
      console.error('Cleanup error:', e);
    }
    
    // Force exit after cleanup
    setTimeout(() => process.exit(0), 100);
  }
}

quickTimingTest().catch(console.error);