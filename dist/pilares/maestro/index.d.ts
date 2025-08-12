/**
 * Pilar 2: O Maestro - High-Precision Temporal Scheduling with Tone.js
 *
 * This is the core orchestrator for musical timing, synchronization, and playback control.
 * It has been refactored to use Tone.js as its backbone, providing sample-accurate
 * scheduling and resolving the critical performance issues of the previous implementation.
 */
import { MaestroEngine, PartituraExecutavel, NoteEvent, CCEvent, SystemEvent, ScheduledEvent } from '../../types/index.js';
export declare class Maestro implements MaestroEngine {
    private eventManager;
    private transportController;
    private scheduler;
    private initialized;
    onNoteEvent: (event: NoteEvent) => void;
    onCCEvent: (event: CCEvent) => void;
    onSystemEvent: (event: SystemEvent) => void;
    constructor();
    /**
     * Initializes the Maestro and all its components (Transport, Scheduler, EventManager).
     */
    initialize(): Promise<void>;
    /**
     * Wires up the callbacks between the internal components (Scheduler -> EventManager)
     * and from the EventManager to the external world (e.g., Pilar 3).
     */
    private setupEventCallbacks;
    private ensureInitialized;
    play(): void;
    pause(): void;
    stop(): void;
    setBPM(bpm: number): void;
    schedulePartitura(partitura: PartituraExecutavel): string;
    scheduleEvent(event: ScheduledEvent, time: number): void;
    getCurrentTime(): number;
    getPlaybackState(): "playing" | "paused" | "stopped";
    getSystemStatus(): {
        initialized: boolean;
        playbackState: "playing" | "paused" | "stopped";
        currentTime: number;
        currentBPM: number;
        transport: {
            initialized: boolean;
            state: "paused" | "stopped" | "started";
            position: string;
            seconds: number;
            bpm: number;
            timingEngine: string;
            precision: string;
            targetLatency: string;
        };
        scheduler: {
            initialized: boolean;
            scheduledPlaybackSessions: number;
            totalScheduledEvents: number;
            timingEngine: string;
            precision: string;
            targetLatency: string;
        };
        eventManager: {
            initialized: boolean;
            partituraRegistrations: number;
            eventCallbacks: number;
            callbackCounter: number;
            hasNoteCallback: boolean;
            hasCCCallback: boolean;
            hasSystemCallback: boolean;
        };
    };
    getPerformanceMetrics(): {
        scheduler: {
            scheduledEventCount: number;
            averageSchedulingLatencyMs: number;
            maxSchedulingLatencyMs: number;
            minSchedulingLatencyMs: number;
            latencyTargetMs: number;
            timingEngine: string;
        };
        eventManager: {
            totalCallbacks: number;
            registeredPartituras: number;
            averageExecutionLatency: number;
            maxExecutionLatency: number;
            minExecutionLatency: number;
            latencyTarget: number;
            latencyViolations: number;
        };
        transport: {
            timingEngine: string;
            initialized: boolean;
            state: "paused" | "stopped" | "started";
            position: string;
            seconds: number;
            bpm: number;
            precision: string;
            targetLatency: string;
        };
        overallLatencyTargetMs: number;
    };
    emergencyStop(): void;
    cleanup(): Promise<void>;
}
export declare const maestro: Maestro;
export default Maestro;
//# sourceMappingURL=index.d.ts.map