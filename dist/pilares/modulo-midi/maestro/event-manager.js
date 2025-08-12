/**
 * Event Manager - Bridge between Native Scheduler and Pilar 3 (Mensageiro)
 *
 * Manages event callbacks and coordinates the execution of scheduled musical events.
 * Acts as the communication layer between native timing (Scheduler) and MIDI output (Mensageiro).
 * Real functional implementation - NO broken dependencies.
 */
import { logger } from '../../../utils/logger.js';
import { TimingError } from '../../../types/index.js';
export class EventManager {
    partituraRegistrations = new Map();
    eventCallbacks = new Map();
    initialized = false;
    callbackCounter = 0;
    // Callbacks to Pilar 3 - will be set by Maestro
    onNoteEvent = () => { };
    onCCEvent = () => { };
    onSystemEvent = () => { };
    // Performance monitoring
    executionLatencies = [];
    maxLatencyHistory = 100;
    /**
     * Initialize the event manager
     */
    async initialize() {
        try {
            logger.debug('Initializing event manager...');
            this.initialized = true;
            logger.info('Event manager initialized successfully');
        }
        catch (error) {
            throw new TimingError(`Failed to initialize event manager: ${error}`);
        }
    }
    /**
     * Register a partitura for event management
     */
    registerPartitura(playbackId, partitura) {
        this.ensureInitialized();
        const registration = {
            playbackId,
            partitura,
            registeredAt: Date.now(),
            callbacks: []
        };
        this.partituraRegistrations.set(playbackId, registration);
        logger.debug('Partitura registered for event management', {
            playbackId,
            noteEvents: partitura.noteEvents.length,
            ccEvents: partitura.controlChangeEvents.length,
            systemEvents: partitura.systemEvents.length
        });
    }
    /**
     * Register a single event for management
     */
    registerEvent(event, time) {
        this.ensureInitialized();
        const callbackId = this.generateCallbackId();
        const callback = {
            id: callbackId,
            event: event.data
        };
        this.eventCallbacks.set(callbackId, callback);
        logger.debug('Event registered for management', {
            callbackId,
            type: event.type,
            time
        });
    }
    /**
     * Execute a note event (called by scheduler callbacks) - IMMEDIATE EXECUTION
     */
    executeNoteEvent(event, actualTime) {
        this.ensureInitialized();
        const startTime = performance.now();
        try {
            // Calculate execution latency
            const expectedTime = event.absoluteTime;
            const latency = (actualTime - expectedTime) * 1000; // Convert to milliseconds
            this.recordExecutionLatency(latency);
            // Log execution with timing metrics
            logger.debug('Executing note event IMMEDIATELY', {
                note: event.toneName,
                velocity: event.velocity,
                channel: event.channel,
                expectedTime,
                actualTime,
                latency: `${latency.toFixed(2)}ms`
            });
            // Call Pilar 3 through callback IMMEDIATELY - no delays
            this.onNoteEvent(event);
            // Record callback execution
            this.recordCallbackExecution('note', event, actualTime, latency);
        }
        catch (error) {
            logger.error('Failed to execute note event', { event, actualTime, error });
            throw new TimingError(`Failed to execute note event: ${error}`);
        }
        const executionTime = performance.now() - startTime;
        logger.debug('Note event execution completed IMMEDIATELY', {
            executionTime: `${executionTime.toFixed(2)}ms`
        });
    }
    /**
     * Execute a CC event - IMMEDIATE EXECUTION
     */
    executeCCEvent(event, actualTime) {
        this.ensureInitialized();
        const startTime = performance.now();
        try {
            const expectedTime = event.absoluteTime;
            const latency = (actualTime - expectedTime) * 1000;
            this.recordExecutionLatency(latency);
            logger.debug('Executing CC event IMMEDIATELY', {
                controller: event.controller,
                value: event.value,
                channel: event.channel,
                description: event.description,
                expectedTime,
                actualTime,
                latency: `${latency.toFixed(2)}ms`
            });
            // Call Pilar 3 through callback IMMEDIATELY - no delays
            this.onCCEvent(event);
            this.recordCallbackExecution('cc', event, actualTime, latency);
        }
        catch (error) {
            logger.error('Failed to execute CC event', { event, actualTime, error });
            throw new TimingError(`Failed to execute CC event: ${error}`);
        }
        const executionTime = performance.now() - startTime;
        logger.debug('CC event execution completed IMMEDIATELY', {
            executionTime: `${executionTime.toFixed(2)}ms`
        });
    }
    /**
     * Execute a system event - IMMEDIATE EXECUTION
     */
    executeSystemEvent(event, actualTime) {
        this.ensureInitialized();
        const startTime = performance.now();
        try {
            const expectedTime = event.absoluteTime;
            const latency = (actualTime - expectedTime) * 1000;
            this.recordExecutionLatency(latency);
            logger.debug('Executing system event IMMEDIATELY', {
                type: event.type,
                value: event.value,
                channel: event.channel,
                expectedTime,
                actualTime,
                latency: `${latency.toFixed(2)}ms`
            });
            // Call Pilar 3 through callback IMMEDIATELY - no delays
            this.onSystemEvent(event);
            this.recordCallbackExecution('system', event, actualTime, latency);
        }
        catch (error) {
            logger.error('Failed to execute system event', { event, actualTime, error });
            throw new TimingError(`Failed to execute system event: ${error}`);
        }
        const executionTime = performance.now() - startTime;
        logger.debug('System event execution completed IMMEDIATELY', {
            executionTime: `${executionTime.toFixed(2)}ms`
        });
    }
    /**
     * Clear all events for a specific playback session
     */
    clearPlaybackEvents(playbackId) {
        this.ensureInitialized();
        const registration = this.partituraRegistrations.get(playbackId);
        if (registration) {
            // Clear callbacks associated with this registration
            for (const callback of registration.callbacks) {
                this.eventCallbacks.delete(callback.id);
            }
            this.partituraRegistrations.delete(playbackId);
            logger.debug('Playback events cleared', {
                playbackId,
                callbacksCleared: registration.callbacks.length
            });
        }
    }
    /**
     * Clear all registered events
     */
    clearAll() {
        this.ensureInitialized();
        this.partituraRegistrations.clear();
        this.eventCallbacks.clear();
        this.executionLatencies = [];
        logger.debug('All event registrations cleared');
    }
    /**
     * Get performance metrics for monitoring
     */
    getPerformanceMetrics() {
        const latencies = this.executionLatencies;
        return {
            totalCallbacks: this.eventCallbacks.size,
            registeredPartituras: this.partituraRegistrations.size,
            averageExecutionLatency: latencies.length > 0
                ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length
                : 0,
            maxExecutionLatency: latencies.length > 0 ? Math.max(...latencies) : 0,
            minExecutionLatency: latencies.length > 0 ? Math.min(...latencies) : 0,
            latencyTarget: 15, // Target < 15ms
            latencyViolations: latencies.filter(lat => Math.abs(lat) > 15).length
        };
    }
    /**
     * Get current status for monitoring
     */
    getStatus() {
        return {
            initialized: this.initialized,
            partituraRegistrations: this.partituraRegistrations.size,
            eventCallbacks: this.eventCallbacks.size,
            callbackCounter: this.callbackCounter,
            hasNoteCallback: typeof this.onNoteEvent === 'function',
            hasCCCallback: typeof this.onCCEvent === 'function',
            hasSystemCallback: typeof this.onSystemEvent === 'function'
        };
    }
    /**
     * Get detailed information about registered partituras
     */
    getRegisteredPartituras() {
        return Array.from(this.partituraRegistrations.values()).map(reg => ({
            playbackId: reg.playbackId,
            registeredAt: reg.registeredAt,
            noteEvents: reg.partitura.noteEvents.length,
            ccEvents: reg.partitura.controlChangeEvents.length,
            systemEvents: reg.partitura.systemEvents.length,
            totalDuration: reg.partitura.metadata.totalDuration,
            bpm: reg.partitura.metadata.bpm,
            callbacksExecuted: reg.callbacks.filter(c => c.executedAt).length,
            callbacksTotal: reg.callbacks.length
        }));
    }
    /**
     * Record execution latency for performance monitoring
     */
    recordExecutionLatency(latency) {
        this.executionLatencies.push(latency);
        // Keep only recent latencies
        if (this.executionLatencies.length > this.maxLatencyHistory) {
            this.executionLatencies.shift();
        }
        // Log warning if latency exceeds target
        if (Math.abs(latency) > 15) {
            logger.warn('Execution latency exceeds target', {
                latency: `${latency.toFixed(2)}ms`,
                target: '15ms'
            });
        }
    }
    /**
     * Record callback execution for tracking
     */
    recordCallbackExecution(_type, event, actualTime, latency) {
        const callbackId = this.generateCallbackId();
        const callback = {
            id: callbackId,
            event,
            executedAt: actualTime,
            latency
        };
        this.eventCallbacks.set(callbackId, callback);
    }
    /**
     * Generate unique callback ID
     */
    generateCallbackId() {
        return `callback_${++this.callbackCounter}_${Date.now()}`;
    }
    /**
     * Ensure system is initialized
     */
    ensureInitialized() {
        if (!this.initialized) {
            throw new TimingError('Event manager not initialized. Call initialize() first.');
        }
    }
    /**
     * Cleanup resources
     */
    async cleanup() {
        try {
            logger.debug('Cleaning up event manager...');
            this.clearAll();
            // Reset callbacks to no-op functions
            this.onNoteEvent = () => { };
            this.onCCEvent = () => { };
            this.onSystemEvent = () => { };
            this.initialized = false;
            logger.debug('Event manager cleanup completed');
        }
        catch (error) {
            logger.error('Event manager cleanup failed', { error });
        }
    }
}
//# sourceMappingURL=event-manager.js.map