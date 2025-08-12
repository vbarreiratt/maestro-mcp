#!/usr/bin/env node

/**
 * Latency Performance Test - Validates <15ms timing requirement
 */

import { Maestro } from './dist/pilares/maestro/index.js';
import { Tradutor } from './dist/pilares/tradutor/index.js';

async function testLatencyPerformance() {
  console.log('⏱️  Starting latency performance test...\n');
  
  try {
    // Initialize components
    const maestro = new Maestro();
    const tradutor = new Tradutor();
    
    await maestro.initialize();
    console.log('✅ Maestro initialized with hybrid timing');
    
    // Track execution metrics
    const executionMetrics = [];
    
    // Connect callback to measure execution time
    maestro.onNoteEvent = (event) => {
      const executionTime = performance.now();
      executionMetrics.push({
        note: event.toneName,
        velocity: event.velocity,
        executionTime,
        expectedTime: event.absoluteTime * 1000  // Convert to ms
      });
      console.log(`🎵 Executed: ${event.toneName} vel:${event.velocity}`);
    };
    
    // Create test musical plan with immediate and scheduled events
    const musicalPlan = {
      bpm: 120,
      timeSignature: "4/4", 
      key: "C major",
      events: [
        // Immediate execution tests
        { time: "0:0", type: "note", value: "C4", duration: "8n", velocity: 0.8, channel: 1 },
        { time: "0:0", type: "note", value: "E4", duration: "8n", velocity: 0.7, channel: 1 },
        
        // Short delay tests
        { time: "0:0:240", type: "note", value: "G4", duration: "8n", velocity: 0.8, channel: 1 }, // 5ms delay
        { time: "0:0:480", type: "note", value: "C5", duration: "8n", velocity: 0.9, channel: 1 }, // 10ms delay
        
        // Precise timing tests
        { time: "0:1", type: "note", value: "D4", duration: "16n", velocity: 0.6, channel: 1 },
        { time: "0:2", type: "note", value: "F4", duration: "16n", velocity: 0.7, channel: 1 }
      ]
    };
    
    console.log('🎼 Processing musical plan...');
    const partitura = await tradutor.translateMusicalPlan(musicalPlan);
    console.log(`📝 Generated ${partitura.noteEvents.length} note events`);
    
    // Schedule and execute
    console.log('📅 Scheduling partitura...');
    const playbackId = maestro.schedulePartitura(partitura);
    
    console.log('▶️  Starting playback...');
    const playbackStart = performance.now();
    maestro.play();
    
    // Wait for execution to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('⏹️  Stopping playback...');
    maestro.stop();
    
    // Calculate performance metrics
    const playbackEnd = performance.now();
    const totalPlaybackTime = playbackEnd - playbackStart;
    
    console.log('\n📊 LATENCY ANALYSIS:');
    
    if (executionMetrics.length > 0) {
      // Calculate execution latencies
      const firstExecution = executionMetrics[0].executionTime;
      const latencies = executionMetrics.map(metric => 
        metric.executionTime - playbackStart
      );
      
      const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
      const maxLatency = Math.max(...latencies);
      const minLatency = Math.min(...latencies);
      
      console.log(`Events executed: ${executionMetrics.length}`);
      console.log(`Average latency: ${avgLatency.toFixed(2)}ms`);
      console.log(`Maximum latency: ${maxLatency.toFixed(2)}ms`);
      console.log(`Minimum latency: ${minLatency.toFixed(2)}ms`);
      console.log(`Total playback time: ${totalPlaybackTime.toFixed(2)}ms`);
      
      // Target compliance analysis
      const target = 15; // 15ms target
      const underTarget = latencies.filter(lat => lat <= target).length;
      const compliance = (underTarget / latencies.length) * 100;
      
      console.log('\n🎯 TARGET COMPLIANCE:');
      console.log(`Target: <${target}ms`);
      console.log(`Events under target: ${underTarget}/${latencies.length} (${compliance.toFixed(1)}%)`);
      console.log(`Average: ${avgLatency <= target ? '✅' : '❌'} ${avgLatency.toFixed(2)}ms`);
      console.log(`Maximum: ${maxLatency <= target ? '✅' : '❌'} ${maxLatency.toFixed(2)}ms`);
      
      // Success determination
      const success = avgLatency <= target && maxLatency <= target;
      console.log(`\n${success ? '✅' : '❌'} LATENCY TEST: ${success ? 'PASSED' : 'FAILED'}`);
      
      if (success) {
        console.log('🎉 System meets professional musical timing requirements!');
      } else {
        console.log('⚠️  System requires further latency optimization.');
      }
      
      // Get Maestro performance metrics
      const metrics = maestro.getPerformanceMetrics();
      console.log('\n📈 MAESTRO METRICS:');
      console.log(`Scheduler average latency: ${metrics.scheduler.averageSchedulingLatencyMs.toFixed(3)}ms`);
      console.log(`Scheduler max latency: ${metrics.scheduler.maxSchedulingLatencyMs.toFixed(3)}ms`);
      console.log(`Scheduler min latency: ${metrics.scheduler.minSchedulingLatencyMs.toFixed(3)}ms`);
      
      await maestro.cleanup();
      
      return {
        success,
        avgLatency,
        maxLatency,
        minLatency,
        compliance,
        totalPlaybackTime,
        eventsExecuted: executionMetrics.length,
        target
      };
      
    } else {
      console.log('❌ No events were executed - callback system failed');
      await maestro.cleanup();
      return { success: false, error: 'No events executed' };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
testLatencyPerformance().then(result => {
  console.log('\n🏁 FINAL RESULT:', result);
  process.exit(result.success ? 0 : 1);
}).catch(error => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});