/**
 * Pilar 2: O Maestro - High-Precision Temporal Scheduling with Tone.js
 *
 * This is the core orchestrator for musical timing, synchronization, and playback control.
 * It has been refactored to use Tone.js as its backbone, providing sample-accurate
 * scheduling and resolving the critical performance issues of the previous implementation.
 */

import { MaestroEngine, PartituraExecutavel, NoteEvent, CCEvent, SystemEvent, ScheduledEvent, TimingError } from '../../../types/index.js';
import { EventManager } from './event-manager.js';
import { TransportController } from './transport.js';
import { Scheduler } from './scheduler.js';
import { logger } from '../../../utils/logger.js';

export class Maestro implements MaestroEngine {
  private eventManager: EventManager;
  private transportController: TransportController;
  private scheduler: Scheduler;
  private initialized = false;

  // Callbacks for Pilar 3 (Mensageiro) integration
  public onNoteEvent: (event: NoteEvent) => void = () => {};
  public onCCEvent: (event: CCEvent) => void = () => {};
  public onSystemEvent: (event: SystemEvent) => void = () => {};

  constructor() {
    this.eventManager = new EventManager();
    this.transportController = new TransportController();
    this.scheduler = new Scheduler();
  }

  /**
   * Initializes the Maestro and all its components (Transport, Scheduler, EventManager).
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Maestro with Tone.js engine...');

      await this.transportController.initialize();
      await this.scheduler.initialize();
      await this.eventManager.initialize();

      this.setupEventCallbacks();

      this.initialized = true;
      logger.info('Maestro system initialized successfully with Tone.js.', {
        timingEngine: 'Tone.Transport',
        precision: 'sample-accurate'
      });
    } catch (error) {
      const timingError = new TimingError(`Failed to initialize Maestro system: ${error instanceof Error ? error.message : error}`);
      logger.error('Maestro initialization failed', { error: timingError });
      throw timingError;
    }
  }

  /**
   * Wires up the callbacks between the internal components (Scheduler -> EventManager)
   * and from the EventManager to the external world (e.g., Pilar 3).
   */
  private setupEventCallbacks(): void {
    // Connect scheduler callbacks to event manager
    this.scheduler.onNoteOn = (event: NoteEvent, actualTime: number) => {
      this.eventManager.executeNoteEvent(event, actualTime);
    };

    this.scheduler.onNoteOff = (event: NoteEvent, actualTime: number) => {
      const noteOffEvent = { ...event, velocity: 0 }; // Create a note-off version
      this.eventManager.executeNoteEvent(noteOffEvent, actualTime);
    };

    this.scheduler.onCCEvent = (event: CCEvent, actualTime: number) => {
      this.eventManager.executeCCEvent(event, actualTime);
    };

    this.scheduler.onSystemEvent = (event: SystemEvent, actualTime: number) => {
      this.eventManager.executeSystemEvent(event, actualTime);
    };

    // Connect event manager callbacks to external listeners (Pilar 3)
    this.eventManager.onNoteEvent = (event: NoteEvent) => this.onNoteEvent(event);
    this.eventManager.onCCEvent = (event: CCEvent) => this.onCCEvent(event);
    this.eventManager.onSystemEvent = (event: SystemEvent) => this.onSystemEvent(event);
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new TimingError('Maestro not initialized. Call initialize() first.');
    }
  }

  // --- Transport Control ---
  play(): void {
    this.ensureInitialized();
    this.transportController.play();
    
    // Trigger scheduler for immediate execution of time-0 events
    this.scheduler.startPlayback();
    
    logger.info('Maestro playback started with immediate execution optimization.');
  }

  pause(): void {
    this.ensureInitialized();
    this.transportController.pause();
  }

  stop(): void {
    this.ensureInitialized();
    this.transportController.stop();
    // The scheduler's clearAll is called by transport.stop() via Tone.Transport.cancel()
  }

  setBPM(bpm: number): void {
    this.ensureInitialized();
    this.transportController.setBPM(bpm);
  }

  // --- Scheduling ---
  schedulePartitura(partitura: PartituraExecutavel): string {
    this.ensureInitialized();
    logger.info('Scheduling partitura in Maestro...', {
        eventCount: partitura.noteEvents.length + partitura.controlChangeEvents.length,
        bpm: partitura.metadata.bpm
    });
    
    if (partitura.metadata.bpm !== this.transportController.getBPM()) {
        this.setBPM(partitura.metadata.bpm);
    }

    const playbackId = this.scheduler.schedulePartitura(partitura);
    this.eventManager.registerPartitura(playbackId, partitura);
    return playbackId;
  }

  scheduleEvent(event: ScheduledEvent, time: number): void {
    this.ensureInitialized();
    this.scheduler.scheduleEvent(event, time);
  }

  // --- State Management ---
  getCurrentTime(): number {
    this.ensureInitialized();
    return this.transportController.getCurrentTime();
  }

  getPlaybackState(): "playing" | "paused" | "stopped" {
    const state = this.transportController.getState();
    // Adapt Tone.js 'started' state to our 'playing' state
    return state === 'started' ? 'playing' : state;
  }

  getSystemStatus() {
    this.ensureInitialized();
    return {
      initialized: this.initialized,
      playbackState: this.getPlaybackState(),
      currentTime: this.getCurrentTime(),
      currentBPM: this.transportController.getBPM(),
      transport: this.transportController.getStatus(),
      scheduler: this.scheduler.getStatus(),
      eventManager: this.eventManager.getStatus(),
    };
  }

  getPerformanceMetrics() {
    this.ensureInitialized();
    return {
      scheduler: this.scheduler.getPerformanceMetrics(),
      eventManager: this.eventManager.getPerformanceMetrics(),
      transport: {
          ...this.transportController.getStatus(),
          timingEngine: 'Tone.Transport'
      },
      overallLatencyTargetMs: 15,
    };
  }

  emergencyStop(): void {
    logger.warn('Emergency stop initiated in Maestro.');
    this.stop(); // This now also cancels all scheduled events
    this.eventManager.clearAll();
    logger.warn('Emergency stop completed.');
  }

  async cleanup(): Promise<void> {
    logger.info('Starting Maestro cleanup...');
    if (this.initialized) {
      await this.transportController.cleanup();
      await this.scheduler.cleanup();
      await this.eventManager.cleanup();
    }
    this.initialized = false;
    logger.info('Maestro cleanup completed.');
  }
}

export const maestro = new Maestro();
export default Maestro;
