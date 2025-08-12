/**
 * Scheduler - Hybrid High-Precision Event Scheduling with Tone.js Fallback
 *
 * This module provides intelligent scheduling that works in both browser
 * and Node.js environments. It uses Tone.Transport when available for
 * sample-accurate timing, and falls back to high-precision native timing
 * when Tone.js Transport is not functional (e.g., in Node.js).
 */
import { PartituraExecutavel, NoteEvent, CCEvent, SystemEvent, ScheduledEvent } from '../../../types/index.js';
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
/**
 * Enhanced timing calculator for precise musical calculations
 * Addresses timing issues identified in tests like "Parabéns pra Você" and "Oblivion"
 */
export declare class TimingCalculator {
    /**
     * Calculate precise durations based on musical note values and BPM
     * Replaces the basic timing calculations to fix rhythmic issues
     */
    static calculatePreciseDurations(rhythm: string[], bpm: number, timeSignature?: [number, number]): number[];
    /**
     * Quantize timing positions to the nearest musical grid
     * Fixes timing issues where notes don't align with musical beats
     */
    static quantizeToMusicalGrid(positions: number[], bpm: number, subdivision?: 'quarter' | 'eighth' | 'sixteenth'): number[];
    /**
     * Calculate swing timing for jazz/blues feel
     * Useful for more natural musical timing
     */
    static applySwing(positions: number[], bpm: number, swingRatio?: number): number[];
    /**
     * Calculate cumulative timing positions from durations
     * Ensures precise spacing between notes
     */
    static calculateCumulativePositions(durations: number[]): number[];
    /**
     * Validate musical timing consistency
     * Ensures timing makes musical sense
     */
    static validateMusicalTiming(positions: number[], durations: number[], bpm: number, timeSignature?: [number, number]): {
        valid: boolean;
        issues: string[];
    };
    /**
     * Calculate optimal tempo for a given musical phrase
     * Helps choose appropriate BPM for musical content
     */
    static suggestOptimalTempo(noteDurations: string[], targetDurationSeconds?: number): number;
}
//# sourceMappingURL=scheduler.d.ts.map