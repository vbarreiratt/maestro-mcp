/**
 * Scheduler - Hybrid High-Precision Event Scheduling with Tone.js Fallback
 *
 * This module provides intelligent scheduling that works in both browser
 * and Node.js environments. It uses Tone.Transport when available for
 * sample-accurate timing, and falls back to high-precision native timing
 * when Tone.js Transport is not functional (e.g., in Node.js).
 */
import { PartituraExecutavel, NoteEvent, CCEvent, SystemEvent, ScheduledEvent } from '../../types/index.js';
export declare class Scheduler {
    private scheduledEvents;
    private nativeTimeouts;
    private initialized;
    private useToneTransport;
    private latencies;
    private maxLatencyHistory;
    onNoteOn: (event: NoteEvent, actualTime: number) => void;
    onNoteOff: (event: NoteEvent, actualTime: number) => void;
    onCCEvent: (event: CCEvent, actualTime: number) => void;
    onSystemEvent: (event: SystemEvent, actualTime: number) => void;
    initialize(): Promise<void>;
    private ensureInitialized;
    schedulePartitura(partitura: PartituraExecutavel): string;
    private scheduleTonePartitura;
    private scheduleNativePartitura;
    scheduleEvent(event: ScheduledEvent, time: number): void;
    private scheduleNote;
    private scheduleNativeNote;
    private addScheduledEvent;
    private addNativeScheduledEvent;
    private triggerNoteOn;
    private triggerNoteOff;
    private triggerCCEvent;
    private triggerSystemEvent;
    cancelPlayback(playbackId: string): void;
    clearAll(): void;
    private recordLatency;
    getPerformanceMetrics(): {
        scheduledEventCount: number;
        averageSchedulingLatencyMs: number;
        maxSchedulingLatencyMs: number;
        minSchedulingLatencyMs: number;
        latencyTargetMs: number;
        timingEngine: string;
    };
    getStatus(): {
        initialized: boolean;
        scheduledPlaybackSessions: number;
        totalScheduledEvents: number;
        timingEngine: string;
        precision: string;
        targetLatency: string;
    };
    /**
     * Triggers immediate execution of scheduled events.
     * Used by Transport to start playback with minimal latency.
     */
    startPlayback(): void;
    cleanup(): Promise<void>;
}
//# sourceMappingURL=scheduler.d.ts.map