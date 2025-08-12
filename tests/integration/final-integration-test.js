#!/usr/bin/env node

/**
 * FINAL INTEGRATION TEST - Validate Complete Pilar 2 Performance Fix
 * 
 * Tests the complete Maestro system with immediate timing to ensure
 * we achieve real sub-15ms end-to-end performance without 500ms delays.
 */

import { performance } from 'perf_hooks';
import { Maestro } from './dist/pilares/modulo-midi/maestro/index.js';

// Create test data mimicking real musical events
function createTestPartitura() {
  return {
    metadata: {
      bpm: 120,
      timeSignature: '4/4',
      key: 'C major',
      totalDuration: '1:0',
      eventCount: 8
    },
    noteEvents: [
      {
        absoluteTime: 0.0,
        toneName: 'C4',
        midiNote: 60,
        velocity: 0.8,
        duration: 0.25,
        channel: 1,
        articulation: 'legato',
        noteOffTime: 0.25
      },
      {
        absoluteTime: 0.25,
        toneName: 'D4',
        midiNote: 62,
        velocity: 0.8,
        duration: 0.25,
        channel: 1,
        articulation: 'legato',
        noteOffTime: 0.5
      },
      {
        absoluteTime: 0.5,
        toneName: 'E4',
        midiNote: 64,
        velocity: 0.8,
        duration: 0.25,
        channel: 1,
        articulation: 'legato',
        noteOffTime: 0.75
      },
      {
        absoluteTime: 0.75,
        toneName: 'F4',
        midiNote: 65,
        velocity: 0.8,
        duration: 0.25,
        channel: 1,
        articulation: 'legato',
        noteOffTime: 1.0
      }
    ],
    controlChangeEvents: [
      {
        absoluteTime: 0.0,
        controller: 7, // Volume
        value: 100,
        channel: 1,
        description: 'Volume'
      }
    ],
    systemEvents: [
      {
        absoluteTime: 0.0,
        type: 'program_change',
        value: 1,
        channel: 1
      }
    ]
  };
}

async function runFinalIntegrationTest() {
  console.log('\n=== FINAL PILAR 2 INTEGRATION TEST ===');
  console.log('Testing complete Maestro system with immediate timing...\n');
  
  const maestro = new Maestro();
  const executionTimes = [];
  const eventLatencies = [];
  let totalEvents = 0;
  
  // Track event execution for performance measurement
  const originalNoteCallback = maestro.onNoteEvent;
  const originalCCCallback = maestro.onCCEvent;
  const originalSystemCallback = maestro.onSystemEvent;
  
  const testStartTime = performance.now();
  
  maestro.onNoteEvent = (event) => {
    const executionTime = performance.now() - testStartTime;
    executionTimes.push(executionTime);
    totalEvents++;
    console.log(`🎵 Note event executed at ${executionTime.toFixed(2)}ms: ${event.toneName} vel:${event.velocity}`);
    originalNoteCallback(event);
  };
  
  maestro.onCCEvent = (event) => {
    const executionTime = performance.now() - testStartTime;
    executionTimes.push(executionTime);
    totalEvents++;
    console.log(`🎛️ CC event executed at ${executionTime.toFixed(2)}ms: CC${event.controller} val:${event.value}`);
    originalCCCallback(event);
  };
  
  maestro.onSystemEvent = (event) => {
    const executionTime = performance.now() - testStartTime;
    executionTimes.push(executionTime);
    totalEvents++;
    console.log(`🎭 System event executed at ${executionTime.toFixed(2)}ms: ${event.type}`);
    originalSystemCallback(event);
  };
  
  try {
    // Test 1: System initialization timing
    console.log('🔄 Initializing Maestro system...');
    const initStart = performance.now();
    await maestro.initialize();
    const initTime = performance.now() - initStart;
    console.log(`✅ Initialization completed in ${initTime.toFixed(2)}ms`);
    
    // Test 2: Partitura scheduling timing
    console.log('\n🎯 Scheduling test partitura...');
    const testPartitura = createTestPartitura();
    const scheduleStart = performance.now();
    const playbackId = maestro.schedulePartitura(testPartitura);
    const scheduleTime = performance.now() - scheduleStart;
    console.log(`✅ Partitura scheduled in ${scheduleTime.toFixed(2)}ms (ID: ${playbackId})`);
    
    // Test 3: Performance metrics before playback
    const preMetrics = maestro.getPerformanceMetrics();
    console.log('\n📊 Pre-playback metrics:');
    console.log(`  Scheduled events: ${preMetrics.scheduledEventsCount}`);
    console.log(`  Timing engine: ${preMetrics.timingEngine}`);
    console.log(`  Latency target: <${preMetrics.overallLatencyTarget}ms`);
    
    // Test 4: Playback execution timing
    console.log('\n▶️ Starting playback...');
    const playStart = performance.now();
    maestro.play();
    
    // Let events execute
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    maestro.stop();
    const playTime = performance.now() - playStart;
    console.log(`⏹️ Playback completed in ${playTime.toFixed(2)}ms\n`);
    
    // Test 5: Analyze execution performance
    console.log('=== EXECUTION PERFORMANCE ANALYSIS ===');
    
    if (executionTimes.length > 0) {
      const firstEvent = Math.min(...executionTimes);
      const lastEvent = Math.max(...executionTimes);
      const totalExecutionSpan = lastEvent - firstEvent;
      const averageInterval = totalExecutionSpan / (executionTimes.length - 1);
      
      console.log(`First event executed: ${firstEvent.toFixed(2)}ms`);
      console.log(`Last event executed: ${lastEvent.toFixed(2)}ms`);
      console.log(`Total execution span: ${totalExecutionSpan.toFixed(2)}ms`);
      console.log(`Average event interval: ${averageInterval.toFixed(2)}ms`);
      console.log(`Total events executed: ${totalEvents}`);
      
      // Performance validation
      const success = firstEvent < 15 && totalExecutionSpan < 100 && averageInterval < 50;
      
      console.log('\n=== SUCCESS CRITERIA VALIDATION ===');
      console.log(`✓ First event <15ms: ${firstEvent.toFixed(2)}ms ${firstEvent < 15 ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Total span <100ms: ${totalExecutionSpan.toFixed(2)}ms ${totalExecutionSpan < 100 ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Avg interval <50ms: ${averageInterval.toFixed(2)}ms ${averageInterval < 50 ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Init time <50ms: ${initTime.toFixed(2)}ms ${initTime < 50 ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Schedule time <10ms: ${scheduleTime.toFixed(2)}ms ${scheduleTime < 10 ? 'PASS' : 'FAIL'}`);
      
      if (success && initTime < 50 && scheduleTime < 10) {
        console.log('\n🎯 SURGICAL FIX SUCCESS: Complete system achieves sub-15ms timing!');
        console.log('✅ No more 500ms delays - immediate processing working correctly');
        console.log('✅ Ready for MCP integration with real-time performance');
      } else {
        console.log('\n❌ SURGICAL FIX INCOMPLETE: Some components still have delays');
      }
    } else {
      console.log('⚠️ No events were executed - check event scheduling');
    }
    
    // Test 6: Final system metrics
    const postMetrics = maestro.getPerformanceMetrics();
    console.log('\n📈 Final performance metrics:');
    console.log(`  Average scheduling latency: ${postMetrics.averageSchedulingLatency.toFixed(2)}ms`);
    console.log(`  Max scheduling latency: ${postMetrics.maxSchedulingLatency.toFixed(2)}ms`);
    console.log(`  Average execution latency: ${postMetrics.averageExecutionLatency.toFixed(2)}ms`);
    console.log(`  Latency violations (>15ms): ${postMetrics.latencyViolations}`);
    
    const systemStatus = maestro.getSystemStatus();
    console.log('\n🔧 System status:');
    console.log(`  Transport precision: ${systemStatus.nativeTiming.transportPrecision}`);
    console.log(`  Scheduler precision: ${systemStatus.nativeTiming.schedulerPrecision}`);
    console.log(`  Timing engine: ${systemStatus.nativeTiming.timingEngine}`);
    console.log(`  Look-ahead: ${systemStatus.nativeTiming.lookAhead}ms`);
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    throw error;
  } finally {
    try {
      await maestro.cleanup();
      console.log('\n🧹 Maestro system cleaned up successfully');
    } catch (error) {
      console.error('⚠️ Cleanup error:', error);
    }
  }
}

// Run the comprehensive test
runFinalIntegrationTest().catch(console.error);