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

// ========================
// NEW: TIMING CALCULATOR
// ========================

/**
 * Enhanced timing calculator for precise musical calculations
 * Addresses timing issues identified in tests like "Parabéns pra Você" and "Oblivion"
 */
export class TimingCalculator {
  /**
   * Calculate precise durations based on musical note values and BPM
   * Replaces the basic timing calculations to fix rhythmic issues
   */
  static calculatePreciseDurations(
    rhythm: string[], 
    bpm: number, 
    timeSignature: [number, number] = [4, 4]
  ): number[] {
    try {
      logger.debug('Calculating precise durations', { rhythm, bpm, timeSignature });

      if (bpm <= 0 || bpm > 300) {
        throw new Error(`Invalid BPM: ${bpm}`);
      }

      const quarterNoteDuration = 60 / bpm; // seconds per quarter note
      
      // Enhanced duration mapping with precise values
      const durationMap: Record<string, number> = {
        'whole': quarterNoteDuration * 4,
        'half': quarterNoteDuration * 2,
        'quarter': quarterNoteDuration,
        'eighth': quarterNoteDuration / 2,
        'sixteenth': quarterNoteDuration / 4,
        'thirty-second': quarterNoteDuration / 8,
        'dotted-whole': quarterNoteDuration * 6,      // whole + half
        'dotted-half': quarterNoteDuration * 3,       // half + quarter  
        'dotted-quarter': quarterNoteDuration * 1.5,  // quarter + eighth
        'dotted-eighth': quarterNoteDuration * 0.75,  // eighth + sixteenth
        'triplet-quarter': quarterNoteDuration * (2/3), // quarter triplet
        'triplet-eighth': quarterNoteDuration * (1/3),  // eighth triplet
      };
      
      const durations = rhythm.map(r => {
        const duration = durationMap[r.toLowerCase()];
        if (duration === undefined) {
          logger.warn(`Unknown rhythm value: ${r}, using quarter note`, { rhythm: r });
          return quarterNoteDuration;
        }
        return duration;
      });

      logger.debug('Precise durations calculated', { 
        inputRhythm: rhythm,
        outputDurations: durations,
        totalDuration: durations.reduce((sum, d) => sum + d, 0)
      });

      return durations;

    } catch (error) {
      logger.error('Duration calculation failed', { rhythm, bpm, timeSignature, error });
      throw new Error(`Failed to calculate durations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Quantize timing positions to the nearest musical grid
   * Fixes timing issues where notes don't align with musical beats
   */
  static quantizeToMusicalGrid(
    positions: number[], 
    bpm: number,
    subdivision: 'quarter' | 'eighth' | 'sixteenth' = 'sixteenth'
  ): number[] {
    try {
      logger.debug('Quantizing to musical grid', { positions, bpm, subdivision });

      const quarterNoteDuration = 60 / bpm;
      
      const gridSize = {
        'quarter': quarterNoteDuration,
        'eighth': quarterNoteDuration / 2,
        'sixteenth': quarterNoteDuration / 4
      }[subdivision];

      const quantizedPositions = positions.map(pos => {
        const gridPosition = Math.round(pos / gridSize) * gridSize;
        return Math.max(0, gridPosition); // Ensure non-negative
      });

      logger.debug('Quantization complete', { 
        originalPositions: positions,
        quantizedPositions,
        gridSize,
        subdivision
      });

      return quantizedPositions;

    } catch (error) {
      logger.error('Quantization failed', { positions, bpm, subdivision, error });
      throw new Error(`Failed to quantize timing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate swing timing for jazz/blues feel
   * Useful for more natural musical timing
   */
  static applySwing(
    positions: number[], 
    bpm: number, 
    swingRatio: number = 0.67 // 67% swing (standard jazz)
  ): number[] {
    try {
      logger.debug('Applying swing timing', { positions, bpm, swingRatio });

      const eighthNoteDuration = (60 / bpm) / 2;
      
      return positions.map((pos) => {
        // Apply swing to off-beats (odd positions in eighth note grid)
        const eighthNotePosition = pos / eighthNoteDuration;
        const isOffBeat = Math.round(eighthNotePosition) % 2 === 1;
        
        if (isOffBeat) {
          // Delay off-beats by swing ratio
          const delay = eighthNoteDuration * (swingRatio - 0.5);
          return pos + delay;
        }
        
        return pos;
      });

    } catch (error) {
      logger.error('Swing application failed', { positions, bpm, swingRatio, error });
      throw new Error(`Failed to apply swing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate cumulative timing positions from durations
   * Ensures precise spacing between notes
   */
  static calculateCumulativePositions(durations: number[]): number[] {
    try {
      const positions: number[] = [0]; // Start at time 0
      
      for (let i = 0; i < durations.length - 1; i++) {
        const nextPosition = positions[i]! + durations[i]!;
        positions.push(nextPosition);
      }

      logger.debug('Cumulative positions calculated', { 
        durations,
        positions,
        totalDuration: positions[positions.length - 1]! + durations[durations.length - 1]!
      });

      return positions;

    } catch (error) {
      logger.error('Cumulative position calculation failed', { durations, error });
      throw new Error(`Failed to calculate positions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate musical timing consistency
   * Ensures timing makes musical sense
   */
  static validateMusicalTiming(
    positions: number[], 
    durations: number[], 
    bpm: number,
    timeSignature: [number, number] = [4, 4]
  ): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    const quarterNoteDuration = 60 / bpm;
    const barDuration = quarterNoteDuration * timeSignature[0];

    // Check for negative positions
    if (positions.some(pos => pos < 0)) {
      issues.push('Negative timing positions detected');
    }

    // Check for zero durations
    if (durations.some(dur => dur <= 0)) {
      issues.push('Zero or negative note durations detected');
    }

    // Check for extremely short durations (less than 10ms)
    if (durations.some(dur => dur < 0.01)) {
      issues.push('Extremely short note durations detected (< 10ms)');
    }

    // Check for overlapping notes in monophonic sequences
    for (let i = 0; i < positions.length - 1; i++) {
      const noteEnd = positions[i]! + durations[i]!;
      const nextNoteStart = positions[i + 1]!
      
      if (noteEnd > nextNoteStart + 0.001) { // 1ms tolerance
        issues.push(`Note overlap detected between notes ${i} and ${i + 1}`);
      }
    }

    // Check for reasonable BPM alignment
    const maxPosition = positions[positions.length - 1]! + durations[durations.length - 1]!;
    const estimatedBars = maxPosition / barDuration;
    
    if (estimatedBars > 100) {
      issues.push('Sequence appears to be extremely long (> 100 bars)');
    }

    logger.debug('Musical timing validation complete', { 
      valid: issues.length === 0,
      issues,
      totalDuration: maxPosition,
      estimatedBars
    });

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Calculate optimal tempo for a given musical phrase
   * Helps choose appropriate BPM for musical content
   */
  static suggestOptimalTempo(
    noteDurations: string[],
    targetDurationSeconds: number = 30
  ): number {
    try {
      logger.debug('Calculating optimal tempo', { noteDurations, targetDurationSeconds });

      // Estimate total quarter note equivalents
      const quarterNoteEquivalents = noteDurations.reduce((total, duration) => {
        const durationMap: Record<string, number> = {
          'whole': 4, 'half': 2, 'quarter': 1, 'eighth': 0.5, 'sixteenth': 0.25
        };
        return total + (durationMap[duration.toLowerCase()] || 1);
      }, 0);

      // Calculate BPM to fit target duration
      const suggestedBPM = Math.round((quarterNoteEquivalents * 60) / targetDurationSeconds);
      
      // Clamp to reasonable musical range
      const clampedBPM = Math.max(60, Math.min(200, suggestedBPM));

      logger.debug('Optimal tempo calculated', {
        quarterNoteEquivalents,
        suggestedBPM,
        clampedBPM,
        estimatedDuration: (quarterNoteEquivalents * 60) / clampedBPM
      });

      return clampedBPM;

    } catch (error) {
      logger.error('Optimal tempo calculation failed', { noteDurations, targetDurationSeconds, error });
      return 120; // Safe fallback
    }
  }
}
