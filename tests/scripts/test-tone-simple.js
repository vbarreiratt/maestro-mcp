#!/usr/bin/env node

/**
 * Simple test to validate Tone.js functionality in the Maestro implementation
 * Tests basic Transport operations and scheduling
 */

import { Maestro } from './dist/pilares/modulo-midi/maestro/index.js';
import { Tradutor } from './dist/pilares/modulo-midi/tradutor/index.js';
import { Mensageiro } from './dist/pilares/modulo-midi/mensageiro/index.js';

async function testToneBasics() {
  console.log('🎵 Starting Tone.js validation test...\n');
  
  try {
    // Initialize all components
    const maestro = new Maestro();
    const tradutor = new Tradutor();  
    const mensageiro = new Mensageiro();
    
    console.log('📦 Initializing components...');
    await maestro.initialize();
    console.log('✅ Maestro initialized');
    
    console.log('✅ Tradutor ready (no initialization required)');
    
    await mensageiro.initialize();
    console.log('✅ Mensageiro initialized');
    
    // Connect Maestro callbacks to Mensageiro
    maestro.onNoteEvent = (event) => {
      console.log(`🎹 Note Event: ${event.toneName} vel:${event.velocity} ch:${event.channel}`);
      mensageiro.sendNoteOn(event.midiNote, event.velocity, event.channel);
    };
    
    maestro.onCCEvent = (event) => {
      console.log(`🎛️  CC Event: Controller ${event.controller} = ${event.value} on channel ${event.channel}`);
      mensageiro.sendCC(event.controller, event.value, event.channel);
    };
    
    console.log('🔗 Components connected\n');
    
    // Test basic musical plan
    const musicalPlan = {
      bpm: 120,
      timeSignature: "4/4",
      key: "C major",
      events: [
        {
          time: "0:0",
          type: "note",
          value: "C4",
          duration: "4n", 
          velocity: 0.8,
          channel: 1
        },
        {
          time: "0:1",
          type: "note", 
          value: "E4",
          duration: "4n",
          velocity: 0.7,
          channel: 1
        },
        {
          time: "0:2",
          type: "note",
          value: "G4", 
          duration: "4n",
          velocity: 0.8,
          channel: 1
        },
        {
          time: "0:3",
          type: "cc",
          value: { controller: 7, value: 100 }, // Volume
          channel: 1
        }
      ]
    };
    
    console.log('🎼 Processing musical plan...');
    const partitura = await tradutor.translateMusicalPlan(musicalPlan);
    console.log(`📝 Generated partitura with ${partitura.noteEvents.length} note events and ${partitura.controlChangeEvents.length} CC events`);
    
    // Schedule the partitura
    console.log('📅 Scheduling partitura...');
    const playbackId = maestro.schedulePartitura(partitura);
    console.log(`🆔 Playback ID: ${playbackId}`);
    
    // Get system status before playing
    const statusBefore = maestro.getSystemStatus();
    console.log('📊 System status:', {
      playbackState: statusBefore.playbackState,
      currentBPM: statusBefore.currentBPM,
      timingEngine: statusBefore.transport.timingEngine
    });
    
    // Start playback 
    console.log('\n▶️  Starting playback...');
    maestro.play();
    
    // Wait for execution
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Stop playback
    console.log('\n⏹️  Stopping playback...');
    maestro.stop();
    
    // Get performance metrics
    const metrics = maestro.getPerformanceMetrics();
    console.log('\n📈 Performance Metrics:');
    console.log(`   Scheduler Events: ${metrics.scheduler.scheduledEventCount}`);
    console.log(`   Average Latency: ${metrics.scheduler.averageSchedulingLatencyMs.toFixed(3)}ms`);
    console.log(`   Max Latency: ${metrics.scheduler.maxSchedulingLatencyMs.toFixed(3)}ms`);
    console.log(`   Min Latency: ${metrics.scheduler.minSchedulingLatencyMs.toFixed(3)}ms`);
    console.log(`   Target: <${metrics.overallLatencyTargetMs}ms`);
    
    // Check latency compliance
    const avgLatency = metrics.scheduler.averageSchedulingLatencyMs;
    const maxLatency = metrics.scheduler.maxSchedulingLatencyMs;
    const target = metrics.overallLatencyTargetMs;
    
    console.log('\n🎯 Latency Analysis:');
    console.log(`   Average: ${avgLatency <= target ? '✅' : '❌'} ${avgLatency.toFixed(3)}ms (target: <${target}ms)`);
    console.log(`   Maximum: ${maxLatency <= target ? '✅' : '❌'} ${maxLatency.toFixed(3)}ms (target: <${target}ms)`);
    
    // Cleanup
    await maestro.cleanup();
    console.log('✅ Maestro cleaned up');
    // Tradutor doesn't require cleanup
    await mensageiro.cleanup();
    console.log('✅ Mensageiro cleaned up');
    
    console.log('\n✅ Tone.js validation test completed successfully!');
    
    return {
      success: true,
      avgLatency,
      maxLatency,
      target,
      withinTarget: avgLatency <= target && maxLatency <= target
    };
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('Stack:', error.stack);
    return { success: false, error: error.message };
  }
}

// Run the test
testToneBasics().then(result => {
  console.log('\n🏁 Test Result:', result);
  process.exit(result.success ? 0 : 1);
}).catch(error => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});