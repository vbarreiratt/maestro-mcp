/**
 * Event Manager - Bridge between Native Scheduler and Pilar 3 (Mensageiro)
 *
 * Manages event callbacks and coordinates the execution of scheduled musical events.
 * Acts as the communication layer between native timing (Scheduler) and MIDI output (Mensageiro).
 * Real functional implementation - NO broken dependencies.
 */
import { PartituraExecutavel, NoteEvent, CCEvent, SystemEvent } from '../../../types/index.js';
export declare class EventManager {
    private partituraRegistrations;
    private eventCallbacks;
    private initialized;
    private callbackCounter;
    onNoteEvent: (event: NoteEvent) => void;
    onCCEvent: (event: CCEvent) => void;
    onSystemEvent: (event: SystemEvent) => void;
    private executionLatencies;
    private maxLatencyHistory;
    /**
     * Initialize the event manager
     */
    initialize(): Promise<void>;
    /**
     * Register a partitura for event management
     */
    registerPartitura(playbackId: string, partitura: PartituraExecutavel): void;
    /**
     * Register a single event for management
     */
    registerEvent(event: {
        type: string;
        data: NoteEvent | CCEvent | SystemEvent;
    }, time: number): void;
    /**
     * Execute a note event (called by scheduler callbacks) - IMMEDIATE EXECUTION
     */
    executeNoteEvent(event: NoteEvent, actualTime: number): void;
    /**
     * Execute a CC event - IMMEDIATE EXECUTION
     */
    executeCCEvent(event: CCEvent, actualTime: number): void;
    /**
     * Execute a system event - IMMEDIATE EXECUTION
     */
    executeSystemEvent(event: SystemEvent, actualTime: number): void;
    /**
     * Clear all events for a specific playback session
     */
    clearPlaybackEvents(playbackId: string): void;
    /**
     * Clear all registered events
     */
    clearAll(): void;
    /**
     * Get performance metrics for monitoring
     */
    getPerformanceMetrics(): {
        totalCallbacks: number;
        registeredPartituras: number;
        averageExecutionLatency: number;
        maxExecutionLatency: number;
        minExecutionLatency: number;
        latencyTarget: number;
        latencyViolations: number;
    };
    /**
     * Get current status for monitoring
     */
    getStatus(): {
        initialized: boolean;
        partituraRegistrations: number;
        eventCallbacks: number;
        callbackCounter: number;
        hasNoteCallback: boolean;
        hasCCCallback: boolean;
        hasSystemCallback: boolean;
    };
    /**
     * Get detailed information about registered partituras
     */
    getRegisteredPartituras(): {
        playbackId: string;
        registeredAt: number;
        noteEvents: number;
        ccEvents: number;
        systemEvents: number;
        totalDuration: string;
        bpm: number;
        callbacksExecuted: number;
        callbacksTotal: number;
    }[];
    /**
     * Record execution latency for performance monitoring
     */
    private recordExecutionLatency;
    /**
     * Record callback execution for tracking
     */
    private recordCallbackExecution;
    /**
     * Generate unique callback ID
     */
    private generateCallbackId;
    /**
     * Ensure system is initialized
     */
    private ensureInitialized;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=event-manager.d.ts.map