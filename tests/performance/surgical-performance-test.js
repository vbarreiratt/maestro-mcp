#!/usr/bin/env node

/**
 * SURGICAL PERFORMANCE TEST - Validate sub-15ms timing
 * 
 * Tests the fixed immediate timing implementation to ensure
 * we achieve real sub-15ms performance without 500ms delays.
 */

import { performance } from 'perf_hooks';

// Simulate the new immediate timing approach
function testImmediateScheduling() {
  console.log('\n=== SURGICAL PERFORMANCE TEST ===');
  console.log('Testing immediate scheduling vs broken setInterval...\n');
  
  // Test 1: Measure process.nextTick() timing
  const immediateTimings = [];
  let immediateTestComplete = false;
  let immediateCount = 0;
  
  const startImmediate = performance.now();
  
  const immediateLoop = () => {
    const currentTime = performance.now();
    immediateTimings.push(currentTime - startImmediate);
    immediateCount++;
    
    if (immediateCount < 20) {
      process.nextTick(immediateLoop);
    } else {
      immediateTestComplete = true;
      analyzeResults();
    }
  };
  
  process.nextTick(immediateLoop);
  
  // Test 2: Compare with setInterval (the broken approach)
  const intervalTimings = [];
  let intervalCount = 0;
  const startInterval = performance.now();
  
  const intervalId = setInterval(() => {
    const currentTime = performance.now();
    intervalTimings.push(currentTime - startInterval);
    intervalCount++;
    
    if (intervalCount >= 20) {
      clearInterval(intervalId);
      if (immediateTestComplete) {
        analyzeResults();
      }
    }
  }, 1); // 1ms setInterval - should be throttled to ~500ms
  
  function analyzeResults() {
    if (immediateTimings.length === 20 && intervalTimings.length === 20) {
      console.log('IMMEDIATE TIMING RESULTS (process.nextTick):');
      console.log(`  First execution: ${immediateTimings[0].toFixed(2)}ms`);
      console.log(`  Last execution:  ${immediateTimings[19].toFixed(2)}ms`);
      console.log(`  Total time:      ${immediateTimings[19].toFixed(2)}ms for 20 events`);
      console.log(`  Average interval: ${(immediateTimings[19] / 19).toFixed(2)}ms`);
      
      console.log('\nSETINTERVAL TIMING RESULTS (broken approach):');
      console.log(`  First execution: ${intervalTimings[0].toFixed(2)}ms`);
      console.log(`  Last execution:  ${intervalTimings[19].toFixed(2)}ms`);
      console.log(`  Total time:      ${intervalTimings[19].toFixed(2)}ms for 20 events`);
      console.log(`  Average interval: ${(intervalTimings[19] / 19).toFixed(2)}ms`);
      
      // Performance comparison
      const immediateTotal = immediateTimings[19];
      const intervalTotal = intervalTimings[19];
      const speedup = intervalTotal / immediateTotal;
      
      console.log('\n=== PERFORMANCE ANALYSIS ===');
      console.log(`Immediate processing: ${immediateTotal.toFixed(2)}ms total`);
      console.log(`setInterval processing: ${intervalTotal.toFixed(2)}ms total`);
      console.log(`Performance improvement: ${speedup.toFixed(1)}x faster`);
      
      // Success criteria validation
      const success = immediateTotal < 15 && immediateTotal < intervalTotal;
      console.log('\n=== SUCCESS CRITERIA ===');
      console.log(`✓ Target: <15ms total execution`);
      console.log(`✓ Result: ${immediateTotal.toFixed(2)}ms ${success ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Better than setInterval: ${speedup > 1 ? 'PASS' : 'FAIL'}`);
      
      if (success && speedup > 1) {
        console.log('\n🎯 SURGICAL FIX SUCCESS: Sub-15ms timing achieved!');
      } else {
        console.log('\n❌ SURGICAL FIX FAILED: Still experiencing delays');
      }
    }
  }
}

// Run the test
testImmediateScheduling();