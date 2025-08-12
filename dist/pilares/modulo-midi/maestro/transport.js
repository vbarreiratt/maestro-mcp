/**
 * Transport Controller - Hybrid Timing System with Tone.js Fallback
 *
 * This module provides intelligent timing detection that works in both browser
 * and Node.js environments. It uses Tone.js Transport when available for
 * sample-accurate timing, and falls back to high-precision native timing
 * when Tone.js Transport is not functional (e.g., in Node.js).
 */
import * as Tone from 'tone';
import { logger } from '../../../utils/logger.js';
import { TimingError } from '../../../types/index.js';
export class TransportController {
    initialized = false;
    useToneTransport = false;
    // Native timing state (when Tone.js Transport is unavailable)
    nativeBPM = 120;
    nativePosition = 0;
    nativeState = "stopped";
    nativeStartTime = 0;
    /**
     * Initializes the hybrid transport system with smart detection.
     * Tests Tone.js Transport availability and falls back to native timing.
     */
    async initialize() {
        try {
            logger.debug('Initializing Hybrid Transport Controller...');
            // Test if Tone.js Transport is fully functional
            try {
                await Tone.start();
                // Critical test: check if Transport.bpm is accessible
                if (typeof Tone?.Transport?.bpm?.value === 'number') {
                    Tone.Transport.bpm.value = 120;
                    Tone.Transport.timeSignature = 4;
                    this.useToneTransport = true;
                    logger.info('Tone.js Transport Controller initialized successfully.', {
                        bpm: Tone.Transport.bpm.value,
                        timeSignature: Tone.Transport.timeSignature,
                        precision: 'sample-accurate',
                        timingEngine: 'Tone.Transport',
                    });
                }
                else {
                    throw new Error('Tone.Transport.bpm is not accessible');
                }
            }
            catch (toneError) {
                // Fallback to native timing
                this.useToneTransport = false;
                this.nativeBPM = 120;
                this.nativePosition = 0;
                this.nativeState = 'stopped';
                logger.warn('Tone.Transport not available, using native Node.js timing', {
                    error: toneError instanceof Error ? toneError.message : String(toneError),
                    fallback: 'native-timing'
                });
                logger.info('Native Transport Controller initialized successfully.', {
                    bpm: this.nativeBPM,
                    precision: 'high-precision-native',
                    timingEngine: 'Node.js-performance',
                    targetLatency: '<15ms'
                });
            }
            this.initialized = true;
        }
        catch (error) {
            const timingError = new TimingError(`Failed to initialize Transport Controller: ${error instanceof Error ? error.message : error}`);
            logger.error('TransportController initialization failed', { error: timingError });
            throw timingError;
        }
    }
    ensureInitialized() {
        if (!this.initialized) {
            throw new TimingError('TransportController not initialized. Call initialize() first.');
        }
    }
    play() {
        this.ensureInitialized();
        if (this.useToneTransport) {
            Tone.Transport.start();
            logger.info('Tone.Transport started.');
        }
        else {
            this.nativeState = 'started';
            this.nativeStartTime = performance.now() / 1000;
            logger.info('Native transport started.');
        }
    }
    pause() {
        this.ensureInitialized();
        if (this.useToneTransport) {
            Tone.Transport.pause();
            logger.info('Tone.Transport paused.');
        }
        else {
            this.nativeState = 'paused';
            // Update position to current time
            if (this.nativeStartTime > 0) {
                this.nativePosition += (performance.now() / 1000) - this.nativeStartTime;
            }
            logger.info('Native transport paused.');
        }
    }
    stop() {
        this.ensureInitialized();
        if (this.useToneTransport) {
            Tone.Transport.stop();
            Tone.Transport.cancel(); // Also cancel all scheduled events
            logger.info('Tone.Transport stopped and all events cancelled.');
        }
        else {
            this.nativeState = 'stopped';
            this.nativePosition = 0;
            this.nativeStartTime = 0;
            logger.info('Native transport stopped and position reset.');
        }
    }
    setBPM(bpm) {
        this.ensureInitialized();
        if (bpm < 20 || bpm > 300) {
            throw new TimingError(`Invalid BPM: ${bpm}. Must be between 20-300`);
        }
        if (this.useToneTransport && Tone.Transport.bpm?.value !== undefined) {
            Tone.Transport.bpm.value = bpm;
            logger.info(`Tone.Transport BPM set to ${bpm}`);
        }
        else {
            this.nativeBPM = bpm;
            logger.info(`Native transport BPM set to ${bpm}`);
        }
    }
    getBPM() {
        this.ensureInitialized();
        return this.useToneTransport && Tone.Transport.bpm?.value !== undefined
            ? Tone.Transport.bpm.value
            : this.nativeBPM;
    }
    getCurrentTime() {
        this.ensureInitialized();
        if (this.useToneTransport) {
            return Tone.Transport.seconds;
        }
        else {
            // Native timing calculation
            if (this.nativeState === 'started' && this.nativeStartTime > 0) {
                return this.nativePosition + (performance.now() / 1000) - this.nativeStartTime;
            }
            return this.nativePosition;
        }
    }
    getPosition() {
        this.ensureInitialized();
        if (this.useToneTransport) {
            return String(Tone.Transport.position);
        }
        else {
            // Convert seconds to bars:beats:sixteenths format
            const currentTime = this.getCurrentTime();
            const beatsPerSecond = this.nativeBPM / 60;
            const totalBeats = currentTime * beatsPerSecond;
            const bars = Math.floor(totalBeats / 4);
            const beats = Math.floor(totalBeats % 4);
            const sixteenths = Math.floor((totalBeats % 1) * 4);
            return `${bars}:${beats}:${sixteenths}`;
        }
    }
    getState() {
        this.ensureInitialized();
        return this.useToneTransport ? Tone.Transport.state : this.nativeState;
    }
    getStatus() {
        this.ensureInitialized();
        return {
            initialized: this.initialized,
            state: this.getState(),
            position: this.getPosition(),
            seconds: this.getCurrentTime(),
            bpm: this.getBPM(),
            timingEngine: this.useToneTransport ? 'Tone.Transport' : 'Native-Node.js',
            precision: this.useToneTransport ? 'sample-accurate' : 'high-precision-native',
            targetLatency: this.useToneTransport ? '<1ms' : '<15ms',
        };
    }
    async cleanup() {
        logger.debug('Cleaning up TransportController...');
        if (this.initialized) {
            this.stop();
        }
        this.initialized = false;
        logger.debug('TransportController cleanup completed.');
    }
}
//# sourceMappingURL=transport.js.map