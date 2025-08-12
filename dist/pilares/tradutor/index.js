/**
 * Pilar 1: O Tradutor - Musical Intelligence and Validation
 *
 * Core orchestrator for musical intelligence, validation, interpretation and expansion.
 * Transforms abstract musical plans into executable MIDI scores with precise timing.
 */
import { validateMusicTheory } from './validators.js';
import { expandChord, parseMusicalTime, normalizeVelocity, calculateArticulation, validateMusicalConsistency } from './transformers.js';
import Note from '@tonaljs/note';
import { logger } from '../../utils/logger.js';
export class Tradutor {
    defaultKey = 'C major';
    defaultTimeSignature = '4/4';
    /**
     * Main transformation method: PlanoMusical → PartituraExecutável
     */
    async translateMusicalPlan(plano) {
        logger.info('Starting musical translation', {
            eventCount: plano.events.length,
            bpm: plano.bpm
        });
        // 1. Validate input musical consistency
        const validationResult = await validateMusicTheory(plano);
        if (!validationResult.isValid) {
            throw new Error(`Musical validation failed: ${validationResult.errors.join(', ')}`);
        }
        // 2. Initialize metadata
        const metadata = {
            bpm: plano.bpm,
            timeSignature: plano.timeSignature || this.defaultTimeSignature,
            key: plano.key || this.defaultKey,
            totalDuration: '0:0',
            eventCount: plano.events.length,
            generatedAt: new Date(),
            version: '1.0.0'
        };
        // 3. Transform events by type
        const noteEvents = [];
        const controlChangeEvents = [];
        const systemEvents = [];
        for (const event of plano.events) {
            const absoluteTime = parseMusicalTime(event.time, plano.bpm, metadata.timeSignature);
            switch (event.type) {
                case 'note':
                    noteEvents.push(...await this.processNoteEvent(event, absoluteTime, plano.bpm));
                    break;
                case 'chord':
                    noteEvents.push(...await this.processChordEvent(event, absoluteTime, plano.bpm));
                    break;
                case 'cc':
                    controlChangeEvents.push(await this.processCCEvent(event, absoluteTime));
                    break;
                case 'sequence':
                    const sequenceEvents = await this.processSequenceEvent(event, absoluteTime, plano.bpm);
                    noteEvents.push(...sequenceEvents.notes);
                    controlChangeEvents.push(...sequenceEvents.ccs);
                    break;
                case 'rest':
                    // Rests don't generate events but affect timing calculations
                    logger.debug('Processing rest event', { time: event.time, absoluteTime });
                    break;
                default:
                    logger.warn('Unknown event type', { type: event.type, event });
            }
        }
        // 4. Calculate total duration
        const allEventTimes = [
            ...noteEvents.map(e => e.noteOffTime),
            ...controlChangeEvents.map(e => e.absoluteTime),
            ...systemEvents.map(e => e.absoluteTime)
        ];
        const totalDurationSeconds = Math.max(0, ...allEventTimes);
        metadata.totalDuration = this.secondsToMusicalTime(totalDurationSeconds, plano.bpm);
        // 5. Sort events by time
        noteEvents.sort((a, b) => a.absoluteTime - b.absoluteTime);
        controlChangeEvents.sort((a, b) => a.absoluteTime - b.absoluteTime);
        systemEvents.sort((a, b) => a.absoluteTime - b.absoluteTime);
        // 6. Final validation
        const executableScore = {
            metadata,
            noteEvents,
            controlChangeEvents,
            systemEvents
        };
        const finalValidation = await validateMusicalConsistency(executableScore);
        if (!finalValidation.isValid) {
            throw new Error(`Final validation failed: ${finalValidation.errors.join(', ')}`);
        }
        logger.info('Musical translation completed', {
            noteEvents: noteEvents.length,
            ccEvents: controlChangeEvents.length,
            systemEvents: systemEvents.length,
            totalDuration: metadata.totalDuration
        });
        return executableScore;
    }
    /**
     * Process individual note events
     */
    async processNoteEvent(event, absoluteTime, bpm) {
        if (typeof event.value !== 'string') {
            throw new Error(`Note event value must be string, got ${typeof event.value}`);
        }
        const duration = event.duration ?
            parseMusicalTime(event.duration, bpm) :
            parseMusicalTime('4n', bpm); // Default quarter note
        const velocity = normalizeVelocity(event.velocity || 0.8);
        const articulation = calculateArticulation(event.articulation || 'legato', duration);
        // Convert note name to MIDI number using Tonal.js (implemented in transformers)
        const midiNote = Note.midi(event.value);
        if (midiNote === null) {
            throw new Error(`Invalid note: ${event.value}`);
        }
        return [{
                absoluteTime,
                toneName: event.value,
                midiNote,
                velocity,
                duration: articulation.effectiveDuration,
                channel: event.channel || 1,
                articulation: articulation.type,
                noteOffTime: absoluteTime + articulation.effectiveDuration
            }];
    }
    /**
     * Process chord events by expanding to individual notes
     */
    async processChordEvent(event, absoluteTime, bpm) {
        if (typeof event.value !== 'string') {
            throw new Error(`Chord event value must be string, got ${typeof event.value}`);
        }
        const duration = event.duration ?
            parseMusicalTime(event.duration, bpm) :
            parseMusicalTime('4n', bpm);
        // Extract voicing from metadata if available
        const voicing = event.metadata?.['voicing'] || 'close';
        const octave = event.metadata?.['octave'] || 4;
        // Expand chord using real Tonal.js implementation
        const chordNotes = expandChord(event.value, voicing, octave);
        const velocity = normalizeVelocity(event.velocity || 0.8);
        const articulation = calculateArticulation(event.articulation || 'legato', duration);
        const noteEvents = [];
        for (const noteName of chordNotes) {
            const midiNote = Note.midi(noteName);
            if (midiNote === null) {
                logger.warn('Invalid chord note', { noteName, chord: event.value });
                continue;
            }
            noteEvents.push({
                absoluteTime,
                toneName: noteName,
                midiNote,
                velocity,
                duration: articulation.effectiveDuration,
                channel: event.channel || 1,
                articulation: articulation.type,
                noteOffTime: absoluteTime + articulation.effectiveDuration
            });
        }
        return noteEvents;
    }
    /**
     * Process control change events
     */
    async processCCEvent(event, absoluteTime) {
        if (typeof event.value !== 'object' || !event.value) {
            throw new Error(`CC event value must be object, got ${typeof event.value}`);
        }
        const ccData = event.value;
        return {
            absoluteTime,
            controller: ccData.controller,
            value: Math.round(ccData.value * 127), // Convert 0-1 to 0-127
            channel: event.channel || 1,
            description: ccData.description
        };
    }
    /**
     * Process sequence events (multiple notes/chords with timing)
     */
    async processSequenceEvent(event, baseTime, bpm) {
        if (typeof event.value !== 'object' || !Array.isArray(event.value)) {
            throw new Error(`Sequence event value must be array, got ${typeof event.value}`);
        }
        const notes = [];
        const ccs = [];
        for (const seqEvent of event.value) {
            const eventTime = baseTime + parseMusicalTime(seqEvent.time, bpm);
            if (seqEvent.type === 'note') {
                notes.push(...await this.processNoteEvent(seqEvent, eventTime, bpm));
            }
            else if (seqEvent.type === 'chord') {
                notes.push(...await this.processChordEvent(seqEvent, eventTime, bpm));
            }
            else if (seqEvent.type === 'cc') {
                ccs.push(await this.processCCEvent(seqEvent, eventTime));
            }
        }
        return { notes, ccs };
    }
    /**
     * Convert seconds back to musical time notation
     */
    secondsToMusicalTime(seconds, bpm) {
        const beatsPerSecond = bpm / 60;
        const totalBeats = seconds * beatsPerSecond;
        const measures = Math.floor(totalBeats / 4);
        const beats = Math.floor(totalBeats % 4);
        const subdivisions = Math.round((totalBeats % 1) * 100);
        return `${measures}:${beats}:${subdivisions}`;
    }
}
// Singleton instance for use throughout the application
export const tradutor = new Tradutor();
// Export main transform function for direct use
export async function translateMusicalPlan(plano) {
    return tradutor.translateMusicalPlan(plano);
}
//# sourceMappingURL=index.js.map