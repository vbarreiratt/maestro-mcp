/**
 * Transport Controller - Hybrid Timing System with Tone.js Fallback
 *
 * This module provides intelligent timing detection that works in both browser
 * and Node.js environments. It uses Tone.js Transport when available for
 * sample-accurate timing, and falls back to high-precision native timing
 * when Tone.js Transport is not functional (e.g., in Node.js).
 */
export declare class TransportController {
    private initialized;
    private useToneTransport;
    private nativeBPM;
    private nativePosition;
    private nativeState;
    private nativeStartTime;
    /**
     * Initializes the hybrid transport system with smart detection.
     * Tests Tone.js Transport availability and falls back to native timing.
     */
    initialize(): Promise<void>;
    private ensureInitialized;
    play(): void;
    pause(): void;
    stop(): void;
    setBPM(bpm: number): void;
    getBPM(): number;
    getCurrentTime(): number;
    getPosition(): string;
    getState(): "started" | "stopped" | "paused";
    getStatus(): {
        initialized: boolean;
        state: "paused" | "stopped" | "started";
        position: string;
        seconds: number;
        bpm: number;
        timingEngine: string;
        precision: string;
        targetLatency: string;
    };
    cleanup(): Promise<void>;
}
//# sourceMappingURL=transport.d.ts.map