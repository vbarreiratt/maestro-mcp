/**
 * Integration test for Pilar 2 - Maestro
 * Tests the complete pipeline: PartituraExecutável -> Scheduled MIDI Events
 */

import { Maestro } from './index.js';
import { Mensageiro } from '../mensageiro/index.js';
import { PartituraExecutavel, NoteEvent, CCEvent, SystemEvent } from '../../../types/index.js';
// import { logger } from '../../../utils/logger.js';

// Mock MIDI output for testing
class MockMIDIOutput {
  private sentEvents: Array<{ type: string; data: any; timestamp: number }> = [];

  sendNoteOn(note: number, velocity: number, channel: number): void {
    this.sentEvents.push({
      type: 'noteOn',
      data: { note, velocity, channel },
      timestamp: Date.now()
    });
    console.log(`🎵 MOCK MIDI: Note ON - ${note} vel:${velocity} ch:${channel}`);
  }

  sendNoteOff(note: number, channel: number): void {
    this.sentEvents.push({
      type: 'noteOff',
      data: { note, channel },
      timestamp: Date.now()
    });
    console.log(`🎵 MOCK MIDI: Note OFF - ${note} ch:${channel}`);
  }

  sendCC(controller: number, value: number, channel: number): void {
    this.sentEvents.push({
      type: 'cc',
      data: { controller, value, channel },
      timestamp: Date.now()
    });
    console.log(`🎛️ MOCK MIDI: CC - ${controller} val:${value} ch:${channel}`);
  }

  sendProgramChange(program: number, channel: number): void {
    this.sentEvents.push({
      type: 'programChange',
      data: { program, channel },
      timestamp: Date.now()
    });
    console.log(`🎭 MOCK MIDI: Program Change - ${program} ch:${channel}`);
  }

  getEvents(): Array<{ type: string; data: any; timestamp: number }> {
    return [...this.sentEvents];
  }

  clear(): void {
    this.sentEvents = [];
  }
}

/**
 * Test the complete Maestro integration
 */
export async function testMaestroIntegration(): Promise<void> {
  console.log('🎼 Starting Maestro Integration Test...');
  
  const maestro = new Maestro();
  const mockOutput = new MockMIDIOutput();
  
  try {
    // Initialize Maestro
    await maestro.initialize();
    console.log('✅ Maestro initialized');

    // Connect Maestro to mock MIDI output
    maestro.onNoteEvent = (event: NoteEvent) => {
      if (event.velocity > 0) {
        mockOutput.sendNoteOn(
          event.midiNote, 
          Math.round(event.velocity * 127), 
          event.channel
        );
      } else {
        mockOutput.sendNoteOff(event.midiNote, event.channel);
      }
    };

    maestro.onCCEvent = (event: CCEvent) => {
      mockOutput.sendCC(event.controller, event.value, event.channel);
    };

    maestro.onSystemEvent = (event: SystemEvent) => {
      if (event.type === 'program_change') {
        mockOutput.sendProgramChange(event.value as number, event.channel || 1);
      }
    };

    // Create test partitura - Simple C major scale
    const testPartitura: PartituraExecutavel = {
      metadata: {
        bpm: 120,
        timeSignature: '4/4',
        key: 'C major',
        totalDuration: '2:0',
        eventCount: 4
      },
      noteEvents: [
        {
          absoluteTime: 0.0,
          toneName: 'C4',
          midiNote: 60,
          velocity: 0.8,
          duration: 0.5,
          channel: 1,
          articulation: 'legato',
          noteOffTime: 0.5
        },
        {
          absoluteTime: 0.5,
          toneName: 'D4', 
          midiNote: 62,
          velocity: 0.8,
          duration: 0.5,
          channel: 1,
          articulation: 'legato',
          noteOffTime: 1.0
        },
        {
          absoluteTime: 1.0,
          toneName: 'E4',
          midiNote: 64,
          velocity: 0.8,
          duration: 0.5,
          channel: 1,
          articulation: 'legato',
          noteOffTime: 1.5
        },
        {
          absoluteTime: 1.5,
          toneName: 'F4',
          midiNote: 65,
          velocity: 0.8,
          duration: 0.5,
          channel: 1,
          articulation: 'legato',
          noteOffTime: 2.0
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
          value: 1, // Piano
          channel: 1
        }
      ]
    };

    console.log('🎯 Scheduling test partitura...');
    
    // Schedule the partitura
    const playbackId = maestro.schedulePartitura(testPartitura);
    console.log(`✅ Partitura scheduled with ID: ${playbackId}`);

    // Set BPM
    maestro.setBPM(120);
    console.log('✅ BPM set to 120');

    // Start playback
    console.log('▶️ Starting playback...');
    maestro.play();
    
    // Let it play for a few seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Stop playback
    maestro.stop();
    console.log('⏹️ Playback stopped');

    // Check results
    const events = mockOutput.getEvents();
    console.log(`📊 Total MIDI events sent: ${events.length}`);
    
    // Validate events
    const noteOnEvents = events.filter(e => e.type === 'noteOn');
    const noteOffEvents = events.filter(e => e.type === 'noteOff');
    const ccEvents = events.filter(e => e.type === 'cc');
    const pcEvents = events.filter(e => e.type === 'programChange');

    console.log(`🎵 Note ON events: ${noteOnEvents.length}`);
    console.log(`🎵 Note OFF events: ${noteOffEvents.length}`);
    console.log(`🎛️ CC events: ${ccEvents.length}`);
    console.log(`🎭 Program Change events: ${pcEvents.length}`);

    // Performance metrics
    const metrics = maestro.getPerformanceMetrics();
    console.log('📈 Performance Metrics:', {
      scheduledEvents: metrics.scheduler.scheduledEventCount,
      averageLatency: `${metrics.scheduler.averageSchedulingLatencyMs.toFixed(2)}ms`,
      maxLatency: `${metrics.scheduler.maxSchedulingLatencyMs.toFixed(2)}ms`
    });

    // System status
    const status = maestro.getSystemStatus();
    console.log('📊 System Status:', {
      playbackState: status.playbackState,
      currentBPM: status.currentBPM,
      timingEngine: status.transport.timingEngine
    });

    console.log('✅ Integration test completed successfully!');

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    throw error;
  } finally {
    // Cleanup
    try {
      await maestro.cleanup();
      console.log('🧹 Maestro cleaned up');
    } catch (error) {
      console.error('⚠️ Cleanup failed:', error);
    }
  }
}

/**
 * Test real integration with Mensageiro (if available)
 */
export async function testMaestroWithMensageiro(): Promise<void> {
  console.log('🎼 Testing Maestro + Mensageiro integration...');
  
  const maestro = new Maestro();
  const mensageiro = new Mensageiro();
  
  try {
    // Initialize both systems
    await maestro.initialize();
    await mensageiro.initialize();
    
    console.log('✅ Both systems initialized');

    // Connect Maestro callbacks to Mensageiro
    maestro.onNoteEvent = (event: NoteEvent) => {
      if (event.velocity > 0) {
        mensageiro.sendNoteOn(
          event.midiNote,
          event.velocity, // Mensageiro expects 0-1
          event.channel
        );
      } else {
        mensageiro.sendNoteOff(event.midiNote, event.channel);
      }
    };

    maestro.onCCEvent = (event: CCEvent) => {
      mensageiro.sendCC(event.controller, event.value, event.channel);
    };

    maestro.onSystemEvent = (event: SystemEvent) => {
      if (event.type === 'program_change') {
        mensageiro.sendProgramChange(event.value as number, event.channel ?? 1);
      }
    };

    // Get available MIDI ports
    const ports = mensageiro.listPorts();
    console.log(`🎹 Available MIDI ports: ${ports.length}`);
    
    if (ports.length === 0) {
      console.log('⚠️ No MIDI ports available - skipping real MIDI test');
      return;
    }

    // Try to connect to the first available output port
    const outputPorts = ports.filter(p => p.type === 'output');
    if (outputPorts.length > 0) {
      const connected = await mensageiro.connectToPort(outputPorts[0]!.name);
      if (connected) {
        console.log(`🔗 Connected to MIDI port: ${outputPorts[0]!.name}`);
        
        // Test with a simple note
        const simplePartitura: PartituraExecutavel = {
          metadata: {
            bpm: 120,
            timeSignature: '4/4',
            key: 'C major',
            totalDuration: '1:0',
            eventCount: 1
          },
          noteEvents: [
            {
              absoluteTime: 0.0,
              toneName: 'C4',
              midiNote: 60,
              velocity: 0.7,
              duration: 1.0,
              channel: 1,
              articulation: 'legato',
              noteOffTime: 1.0
            }
          ],
          controlChangeEvents: [],
          systemEvents: []
        };

        maestro.schedulePartitura(simplePartitura);
        maestro.play();
        
        // Play for 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        maestro.stop();
        console.log('✅ Real MIDI test completed');
      }
    }

  } catch (error) {
    console.error('❌ Real MIDI integration test failed:', error);
  } finally {
    try {
      await maestro.cleanup();
      await mensageiro.cleanup();
      console.log('🧹 Systems cleaned up');
    } catch (error) {
      console.error('⚠️ Cleanup failed:', error);
    }
  }
}

// Export for use in other test files
export { MockMIDIOutput };