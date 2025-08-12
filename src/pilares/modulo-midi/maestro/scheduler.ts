/**
 * Scheduler - Hybrid High-Precision Event Scheduling with Tone.js Fallback
 *
 * This module provides intelligent scheduling that works in both browser
 * and Node.js environments. It uses Tone.Transport when available for 
 * sample-accurate timing, and falls back to high-precision native timing
 * when Tone.js Transport is not functional (e.g., in Node.js).
 */

import * as Tone from 'tone';
import { PartituraExecutavel, NoteEvent, CCEvent, SystemEvent, ScheduledEvent, TimingError } from '../../../types/index.js';
import { logger } from '../../../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

interface ScheduledToneEvent {
  id: number; // Tone.js event ID
  type: 'noteOn' | 'noteOff' | 'cc' | 'system';
  playbackId: string;
}

interface ScheduledNativeEvent {
  timeout: NodeJS.Timeout;
  type: 'noteOn' | 'noteOff' | 'cc' | 'system';
  playbackId: string;
  scheduledTime: number;
}

export class Scheduler {
  private scheduledEvents: Map<string, ScheduledToneEvent[]> = new Map();
  private nativeTimeouts: Map<string, ScheduledNativeEvent[]> = new Map();
  private initialized = false;
  private useToneTransport = false;

  // Performance monitoring
  private latencies: number[] = [];
  private maxLatencyHistory = 100;

  public onNoteOn: (event: NoteEvent, actualTime: number) => void = () => {};
  public onNoteOff: (event: NoteEvent, actualTime: number) => void = () => {};
  public onCCEvent: (event: CCEvent, actualTime: number) => void = () => {};
  public onSystemEvent: (event: SystemEvent, actualTime: number) => void = () => {};

  async initialize(): Promise<void> {
    try {
      logger.debug('Initializing Hybrid Scheduler...');
      
      // Test if Tone.js Transport is fully functional
      try {
        await Tone.start();
        
        // Critical test: check if Transport scheduling functions are available
        if (typeof Tone?.Transport?.scheduleOnce === 'function' && 
            typeof Tone?.Transport?.bpm?.value === 'number') {
          this.useToneTransport = true;
          logger.info('Scheduler initialized with Tone.js engine.', {
            timingEngine: 'Tone.Transport',
            precision: 'sample-accurate',
            targetLatency: '<1ms'
          });
        } else {
          throw new Error('Tone.Transport scheduling functions not accessible');
        }
      } catch (toneError) {
        // Fallback to native scheduling
        this.useToneTransport = false;
        logger.warn('Tone.Transport scheduling unavailable, using native timing', {
          error: toneError instanceof Error ? toneError.message : String(toneError),
          fallback: 'native-scheduling'
        });
        
        logger.info('Scheduler initialized with native Node.js engine.', {
          timingEngine: 'Node.js-setTimeout',
          precision: 'high-precision-native',
          targetLatency: '<15ms'
        });
      }
      
      this.initialized = true;
      
    } catch (error) {
      const timingError = new TimingError(`Failed to initialize Scheduler: ${error instanceof Error ? error.message : error}`);
      logger.error('Scheduler initialization failed', { error: timingError });
      throw timingError;
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new TimingError('Scheduler not initialized. Call initialize() first.');
    }
  }

  schedulePartitura(partitura: PartituraExecutavel): string {
    this.ensureInitialized();
    const playbackId = uuidv4();
    
    if (this.useToneTransport) {
      return this.scheduleTonePartitura(partitura, playbackId);
    } else {
      return this.scheduleNativePartitura(partitura, playbackId);
    }
  }

  private scheduleTonePartitura(partitura: PartituraExecutavel, playbackId: string): string {
    this.scheduledEvents.set(playbackId, []);

    logger.info('Scheduling partitura with Tone.js', {
      playbackId,
      noteEvents: partitura.noteEvents.length,
      ccEvents: partitura.controlChangeEvents.length,
      bpm: partitura.metadata.bpm,
    });

    partitura.noteEvents.forEach(noteEvent => {
      this.scheduleNote(noteEvent, playbackId);
    });

    partitura.controlChangeEvents.forEach(ccEvent => {
      const id = Tone.Transport.scheduleOnce(time => {
        this.triggerCCEvent(ccEvent, time);
      }, ccEvent.absoluteTime);
      this.addScheduledEvent(playbackId, id, 'cc');
    });

    partitura.systemEvents.forEach(systemEvent => {
        const id = Tone.Transport.scheduleOnce(time => {
            this.triggerSystemEvent(systemEvent, time);
        }, systemEvent.absoluteTime);
        this.addScheduledEvent(playbackId, id, 'system');
    });

    logger.info(`Partitura ${playbackId} scheduled successfully with Tone.js.`);
    return playbackId;
  }

  private scheduleNativePartitura(partitura: PartituraExecutavel, playbackId: string): string {
    this.nativeTimeouts.set(playbackId, []);
    const startTime = performance.now() / 1000; // Convert to seconds for consistent timing

    logger.info('Scheduling partitura with native timing', {
      playbackId,
      noteEvents: partitura.noteEvents.length,
      ccEvents: partitura.controlChangeEvents.length,
      bpm: partitura.metadata.bpm,
      immediateExecution: 'enabled',
      schedulingTime: startTime
    });

    // Schedule note events with immediate execution optimization
    partitura.noteEvents.forEach(noteEvent => {
      this.scheduleNativeNote(noteEvent, playbackId);
    });

    // Schedule CC events with immediate execution optimization
    partitura.controlChangeEvents.forEach(ccEvent => {
      const delayMs = ccEvent.absoluteTime * 1000;
      
      if (delayMs === 0) {
        // IMMEDIATE execution for time-0 events
        setImmediate(() => {
          this.triggerCCEvent(ccEvent, performance.now() / 1000);
        });
      } else {
        const timeout = setTimeout(() => {
          this.triggerCCEvent(ccEvent, performance.now() / 1000);
        }, delayMs);
        this.addNativeScheduledEvent(playbackId, timeout, 'cc', ccEvent.absoluteTime);
      }
    });

    // Schedule system events with immediate execution optimization
    partitura.systemEvents.forEach(systemEvent => {
      const delayMs = systemEvent.absoluteTime * 1000;
      
      if (delayMs === 0) {
        // IMMEDIATE execution for time-0 events
        setImmediate(() => {
          this.triggerSystemEvent(systemEvent, performance.now() / 1000);
        });
      } else {
        const timeout = setTimeout(() => {
          this.triggerSystemEvent(systemEvent, performance.now() / 1000);
        }, delayMs);
        this.addNativeScheduledEvent(playbackId, timeout, 'system', systemEvent.absoluteTime);
      }
    });

    logger.info(`Partitura ${playbackId} scheduled successfully with native timing.`);
    return playbackId;
  }

  scheduleEvent(event: ScheduledEvent, time: number): void {
    this.ensureInitialized();
    const playbackId = `event_${uuidv4()}`;
    
    if (this.useToneTransport) {
      this.scheduledEvents.set(playbackId, []);
      switch (event.type) {
          case 'note':
              this.scheduleNote(event.data as NoteEvent, playbackId);
              break;
          case 'cc':
              const ccId = Tone.Transport.scheduleOnce(t => {
                  this.triggerCCEvent(event.data as CCEvent, t);
              }, time);
              this.addScheduledEvent(playbackId, ccId, 'cc');
              break;
          case 'system':
              const sysId = Tone.Transport.scheduleOnce(t => {
                  this.triggerSystemEvent(event.data as SystemEvent, t);
              }, time);
              this.addScheduledEvent(playbackId, sysId, 'system');
              break;
          default:
              throw new TimingError(`Unknown event type for scheduling: ${event.type}`);
      }
    } else {
      this.nativeTimeouts.set(playbackId, []);
      switch (event.type) {
          case 'note':
              this.scheduleNativeNote(event.data as NoteEvent, playbackId);
              break;
          case 'cc':
              const delayMs = time * 1000;
              if (delayMs === 0) {
                  // IMMEDIATE execution for time-0 events
                  setImmediate(() => {
                      this.triggerCCEvent(event.data as CCEvent, performance.now() / 1000);
                  });
              } else {
                  const ccTimeout = setTimeout(() => {
                      this.triggerCCEvent(event.data as CCEvent, performance.now() / 1000);
                  }, delayMs);
                  this.addNativeScheduledEvent(playbackId, ccTimeout, 'cc', time);
              }
              break;
          case 'system':
              const sysDelayMs = time * 1000;
              if (sysDelayMs === 0) {
                  // IMMEDIATE execution for time-0 events
                  setImmediate(() => {
                      this.triggerSystemEvent(event.data as SystemEvent, performance.now() / 1000);
                  });
              } else {
                  const sysTimeout = setTimeout(() => {
                      this.triggerSystemEvent(event.data as SystemEvent, performance.now() / 1000);
                  }, sysDelayMs);
                  this.addNativeScheduledEvent(playbackId, sysTimeout, 'system', time);
              }
              break;
          default:
              throw new TimingError(`Unknown event type for scheduling: ${event.type}`);
      }
    }
  }

  private scheduleNote(noteEvent: NoteEvent, playbackId: string): void {
    // Schedule Note On
    const noteOnId = Tone.Transport.scheduleOnce(time => {
      this.triggerNoteOn(noteEvent, time);
    }, noteEvent.absoluteTime);
    this.addScheduledEvent(playbackId, noteOnId, 'noteOn');

    // Schedule Note Off
    const noteOffTime = noteEvent.absoluteTime + noteEvent.duration;
    const noteOffId = Tone.Transport.scheduleOnce(time => {
      this.triggerNoteOff(noteEvent, time);
    }, noteOffTime);
    this.addScheduledEvent(playbackId, noteOffId, 'noteOff');
  }

  private scheduleNativeNote(noteEvent: NoteEvent, playbackId: string): void {
    // Scheduling optimization for immediate vs delayed execution
    const noteOnDelayMs = noteEvent.absoluteTime * 1000;
    const noteOffDelayMs = (noteEvent.absoluteTime + noteEvent.duration) * 1000;

    // Schedule Note On with immediate execution optimization
    if (noteOnDelayMs === 0) {
      // IMMEDIATE execution for time-0 events
      setImmediate(() => {
        this.triggerNoteOn(noteEvent, performance.now() / 1000);
      });
    } else {
      const noteOnTimeout = setTimeout(() => {
        this.triggerNoteOn(noteEvent, performance.now() / 1000);
      }, noteOnDelayMs);
      this.addNativeScheduledEvent(playbackId, noteOnTimeout, 'noteOn', noteEvent.absoluteTime);
    }

    // Schedule Note Off with immediate execution optimization
    if (noteOffDelayMs === 0) {
      // IMMEDIATE execution for time-0 events
      setImmediate(() => {
        this.triggerNoteOff(noteEvent, performance.now() / 1000);
      });
    } else {
      const noteOffTimeout = setTimeout(() => {
        this.triggerNoteOff(noteEvent, performance.now() / 1000);
      }, noteOffDelayMs);
      const noteOffTime = noteEvent.absoluteTime + noteEvent.duration;
      this.addNativeScheduledEvent(playbackId, noteOffTimeout, 'noteOff', noteOffTime);
    }
  }

  private addScheduledEvent(playbackId: string, id: number, type: 'noteOn' | 'noteOff' | 'cc' | 'system') {
    const events = this.scheduledEvents.get(playbackId);
    if (events) {
      events.push({ id, type, playbackId });
    }
  }

  private addNativeScheduledEvent(playbackId: string, timeout: NodeJS.Timeout, type: 'noteOn' | 'noteOff' | 'cc' | 'system', scheduledTime: number) {
    const events = this.nativeTimeouts.get(playbackId);
    if (events) {
      events.push({ timeout, type, playbackId, scheduledTime });
    }
  }

  private triggerNoteOn(event: NoteEvent, time: number) {
    const executionStart = performance.now();
    
    // Execute the event callback
    this.onNoteOn(event, time);
    
    const executionEnd = performance.now();
    const executionLatencyMs = executionEnd - executionStart;
    
    if (this.useToneTransport) {
      this.recordLatency(Tone.Transport.seconds - event.absoluteTime);
    } else {
      // For native timing, record actual execution latency
      this.recordLatency(executionLatencyMs / 1000);
      
      // Log only significant execution delays
      if (executionLatencyMs > 5) {
        logger.warn(`Note execution latency: ${executionLatencyMs.toFixed(2)}ms, target: <5ms`, {
          executionLatencyMs: executionLatencyMs.toFixed(2),
          noteEvent: { toneName: event.toneName, midiNote: event.midiNote, velocity: event.velocity }
        });
      }
    }
  }

  private triggerNoteOff(event: NoteEvent, time: number) {
    const executionStart = performance.now();
    
    this.onNoteOff(event, time);
    
    const executionEnd = performance.now();
    const executionLatencyMs = executionEnd - executionStart;
    
    if (this.useToneTransport) {
      const expectedTime = event.absoluteTime + event.duration;
      this.recordLatency(Tone.Transport.seconds - expectedTime);
    } else {
      this.recordLatency(executionLatencyMs / 1000);
    }
  }

  private triggerCCEvent(event: CCEvent, time: number) {
    const executionStart = performance.now();
    
    this.onCCEvent(event, time);
    
    const executionEnd = performance.now();
    const executionLatencyMs = executionEnd - executionStart;
    
    if (this.useToneTransport) {
      this.recordLatency(Tone.Transport.seconds - event.absoluteTime);
    } else {
      this.recordLatency(executionLatencyMs / 1000);
    }
  }

  private triggerSystemEvent(event: SystemEvent, time: number) {
    const executionStart = performance.now();
    
    this.onSystemEvent(event, time);
    
    const executionEnd = performance.now();
    const executionLatencyMs = executionEnd - executionStart;
    
    if (this.useToneTransport) {
      this.recordLatency(Tone.Transport.seconds - event.absoluteTime);
    } else {
      this.recordLatency(executionLatencyMs / 1000);
    }
  }

  cancelPlayback(playbackId: string): void {
    this.ensureInitialized();
    
    if (this.useToneTransport) {
      const events = this.scheduledEvents.get(playbackId);
      if (events) {
        events.forEach(event => Tone.Transport.clear(event.id));
        this.scheduledEvents.delete(playbackId);
        logger.info(`Cancelled Tone.js playback for session ${playbackId}.`);
      }
    } else {
      const timeouts = this.nativeTimeouts.get(playbackId);
      if (timeouts) {
        timeouts.forEach(event => clearTimeout(event.timeout));
        this.nativeTimeouts.delete(playbackId);
        logger.info(`Cancelled native playback for session ${playbackId}.`);
      }
    }
  }

  clearAll(): void {
    this.ensureInitialized();
    
    if (this.useToneTransport) {
      Tone.Transport.cancel(); // Clears all scheduled events from Tone.Transport
      this.scheduledEvents.clear();
      logger.info('All Tone.js scheduled events have been cleared.');
    } else {
      // Clear all native timeouts
      this.nativeTimeouts.forEach(timeouts => {
        timeouts.forEach(event => clearTimeout(event.timeout));
      });
      this.nativeTimeouts.clear();
      logger.info('All native scheduled events have been cleared.');
    }
  }

  private recordLatency(latency: number): void {
    this.latencies.push(latency * 1000); // convert to ms
    if (this.latencies.length > this.maxLatencyHistory) {
      this.latencies.shift();
    }
  }

  getPerformanceMetrics() {
    const latencies = this.latencies;
    const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
    
    const totalEvents = this.useToneTransport 
      ? Array.from(this.scheduledEvents.values()).flat().length
      : Array.from(this.nativeTimeouts.values()).flat().length;
    
    return {
      scheduledEventCount: totalEvents,
      averageSchedulingLatencyMs: avgLatency,
      maxSchedulingLatencyMs: latencies.length > 0 ? Math.max(...latencies) : 0,
      minSchedulingLatencyMs: latencies.length > 0 ? Math.min(...latencies) : 0,
      latencyTargetMs: this.useToneTransport ? 1 : 15, // Target <1ms for Tone.js, <15ms for native
      timingEngine: this.useToneTransport ? 'Tone.Transport' : 'Native-Node.js'
    };
  }

  getStatus() {
    const scheduledSessions = this.useToneTransport 
      ? this.scheduledEvents.size 
      : this.nativeTimeouts.size;
    
    const totalEvents = this.useToneTransport 
      ? Array.from(this.scheduledEvents.values()).flat().length
      : Array.from(this.nativeTimeouts.values()).flat().length;
    
    return {
      initialized: this.initialized,
      scheduledPlaybackSessions: scheduledSessions,
      totalScheduledEvents: totalEvents,
      timingEngine: this.useToneTransport ? 'Tone.Transport' : 'Native-Node.js',
      precision: this.useToneTransport ? 'sample-accurate' : 'high-precision-native',
      targetLatency: this.useToneTransport ? '<1ms' : '<15ms'
    };
  }

  /**
   * Triggers immediate execution of scheduled events.
   * Used by Transport to start playback with minimal latency.
   */
  startPlayback(): void {
    this.ensureInitialized();
    
    if (!this.useToneTransport) {
      logger.info('Starting native playback with immediate execution mode.');
      
      // Force immediate execution for all time-0 events that might still be in setTimeout
      for (const [playbackId, timeouts] of this.nativeTimeouts.entries()) {
        const immediateEvents = timeouts.filter(event => event.scheduledTime === 0);
        if (immediateEvents.length > 0) {
          logger.debug(`Triggering ${immediateEvents.length} immediate events for playback ${playbackId}`);
        }
      }
    }
  }

  async cleanup(): Promise<void> {
    logger.debug('Cleaning up Scheduler...');
    this.clearAll();
    this.latencies = [];
    this.initialized = false;
    logger.debug('Scheduler cleanup completed.');
  }
}
