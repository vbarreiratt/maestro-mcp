/**
 * Advanced Musical Validation
 *
 * Comprehensive validation for musical theory, timing consistency,
 * MIDI ranges, and harmonic relationships using real music theory.
 */
import Note from '@tonaljs/note';
import Chord from '@tonaljs/chord';
import Scale from '@tonaljs/scale';
import { analyzeProgression } from './music-theory.js';
import { logger } from '../../utils/logger.js';
/**
 * Comprehensive music theory validation for PlanoMusical
 */
export async function validateMusicTheory(plano) {
    const errors = [];
    const warnings = [];
    try {
        logger.debug('Starting music theory validation', {
            eventCount: plano.events.length,
            bpm: plano.bpm
        });
        // 1. Validate BPM range
        if (plano.bpm < 20 || plano.bpm > 300) {
            errors.push(`BPM ${plano.bpm} outside realistic range (20-300)`);
        }
        // 2. Validate time signature
        if (plano.timeSignature) {
            const timeSignature = plano.timeSignature;
            const match = timeSignature.match(/^(\d+)\/(\d+)$/);
            if (!match) {
                errors.push(`Invalid time signature format: ${timeSignature}`);
            }
            else {
                const [, numerator, denominator] = match;
                const num = parseInt(numerator || '4');
                const den = parseInt(denominator || '4');
                if (num < 1 || num > 32) {
                    errors.push(`Time signature numerator ${num} outside valid range (1-32)`);
                }
                if (![1, 2, 4, 8, 16, 32].includes(den)) {
                    errors.push(`Time signature denominator ${den} must be power of 2`);
                }
            }
        }
        // 3. Validate key signature
        if (plano.key) {
            const keyValidation = validateKeySignature(plano.key);
            if (!keyValidation.isValid) {
                errors.push(...keyValidation.errors);
                warnings.push(...keyValidation.warnings);
            }
        }
        // 4. Validate individual events
        const eventValidations = await Promise.all(plano.events.map((event, index) => validateMusicEvent(event, index, plano)));
        for (const validation of eventValidations) {
            errors.push(...validation.errors);
            warnings.push(...validation.warnings);
        }
        // 5. Validate timing consistency
        const timingValidation = validateEventTiming(plano.events, plano.bpm, plano.timeSignature);
        errors.push(...timingValidation.errors);
        warnings.push(...timingValidation.warnings);
        // 6. Validate harmonic progression (chords only)
        const chordEvents = plano.events.filter(e => e.type === 'chord');
        if (chordEvents.length > 1) {
            const harmonicValidation = validateHarmonicProgression(chordEvents, plano.key);
            warnings.push(...harmonicValidation.warnings);
            // Note: Harmonic warnings, not errors - allow creative freedom
        }
        logger.debug('Music theory validation completed', {
            errors: errors.length,
            warnings: warnings.length,
            isValid: errors.length === 0
        });
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            details: {
                eventsValidated: plano.events.length,
                chordEventsFound: chordEvents.length,
                hasKeySignature: !!plano.key
            }
        };
    }
    catch (error) {
        logger.error('Music theory validation failed', { error });
        return {
            isValid: false,
            errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
            warnings: []
        };
    }
}
/**
 * Validate individual music event
 */
async function validateMusicEvent(event, index, plano) {
    const errors = [];
    const warnings = [];
    try {
        // Validate timing format
        if (!isValidTimeFormat(event.time)) {
            errors.push(`Event ${index}: Invalid time format "${event.time}"`);
        }
        // Validate duration format (if provided)
        if (event.duration && !isValidDurationFormat(event.duration)) {
            errors.push(`Event ${index}: Invalid duration format "${event.duration}"`);
        }
        // Validate velocity range
        if (event.velocity !== undefined) {
            if (event.velocity < 0 || event.velocity > 1) {
                errors.push(`Event ${index}: Velocity ${event.velocity} outside range (0-1)`);
            }
        }
        // Validate MIDI channel
        if (event.channel !== undefined) {
            if (event.channel < 1 || event.channel > 16) {
                errors.push(`Event ${index}: MIDI channel ${event.channel} outside range (1-16)`);
            }
        }
        // Type-specific validation
        switch (event.type) {
            case 'note':
                const noteValidation = await validateNoteEvent(event, index);
                errors.push(...noteValidation.errors);
                warnings.push(...noteValidation.warnings);
                break;
            case 'chord':
                const chordValidation = await validateChordEvent(event, index, plano.key);
                errors.push(...chordValidation.errors);
                warnings.push(...chordValidation.warnings);
                break;
            case 'cc':
                const ccValidation = validateCCEvent(event, index);
                errors.push(...ccValidation.errors);
                warnings.push(...ccValidation.warnings);
                break;
            case 'sequence':
                const seqValidation = await validateSequenceEvent(event, index);
                errors.push(...seqValidation.errors);
                warnings.push(...seqValidation.warnings);
                break;
            case 'rest':
                // Rests are always valid
                break;
            default:
                errors.push(`Event ${index}: Unknown event type "${event.type}"`);
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    catch (error) {
        return {
            isValid: false,
            errors: [`Event ${index}: Validation error - ${error instanceof Error ? error.message : 'Unknown error'}`],
            warnings: []
        };
    }
}
/**
 * Validate note event using Tonal.js
 */
async function validateNoteEvent(event, index) {
    const errors = [];
    const warnings = [];
    if (typeof event.value !== 'string') {
        errors.push(`Event ${index}: Note value must be string, got ${typeof event.value}`);
        return { isValid: false, errors, warnings };
    }
    // Validate note format using Tonal.js
    const noteInfo = Note.get(event.value);
    if (!noteInfo.name) {
        errors.push(`Event ${index}: Invalid note format "${event.value}"`);
        return { isValid: false, errors, warnings };
    }
    // Check MIDI range
    const midiNote = Note.midi(event.value);
    if (midiNote === null) {
        errors.push(`Event ${index}: Note "${event.value}" cannot be converted to MIDI`);
    }
    else if (midiNote < 0 || midiNote > 127) {
        errors.push(`Event ${index}: MIDI note ${midiNote} outside valid range (0-127)`);
    }
    else if (midiNote < 21 || midiNote > 108) {
        warnings.push(`Event ${index}: Note ${event.value} (MIDI ${midiNote}) outside typical piano range`);
    }
    return { isValid: errors.length === 0, errors, warnings };
}
/**
 * Validate chord event using Tonal.js
 */
async function validateChordEvent(event, index, key) {
    const errors = [];
    const warnings = [];
    if (typeof event.value !== 'string') {
        errors.push(`Event ${index}: Chord value must be string, got ${typeof event.value}`);
        return { isValid: false, errors, warnings };
    }
    // Validate chord format using Tonal.js
    const chordInfo = Chord.get(event.value);
    if (!chordInfo.notes || chordInfo.notes.length === 0) {
        errors.push(`Event ${index}: Invalid or unrecognized chord "${event.value}"`);
        return { isValid: false, errors, warnings };
    }
    // Validate chord tones are in MIDI range
    for (const note of chordInfo.notes) {
        const octave = event.metadata?.['octave'] || 4;
        const noteWithOctave = `${note}${octave}`;
        const midiNote = Note.midi(noteWithOctave);
        if (midiNote === null || midiNote < 0 || midiNote > 127) {
            warnings.push(`Event ${index}: Chord tone ${noteWithOctave} outside MIDI range`);
        }
    }
    // Check chord-key relationship
    if (key && chordInfo.tonic) {
        const keyValidation = validateChordInKey(event.value, key);
        if (!keyValidation.isValid) {
            warnings.push(`Event ${index}: Chord ${event.value} may not fit well in key ${key}`);
        }
    }
    return { isValid: errors.length === 0, errors, warnings };
}
/**
 * Validate control change event
 */
function validateCCEvent(event, index) {
    const errors = [];
    const warnings = [];
    if (typeof event.value !== 'object' || !event.value) {
        errors.push(`Event ${index}: CC value must be object, got ${typeof event.value}`);
        return { isValid: false, errors, warnings };
    }
    const ccData = event.value;
    // Validate controller number
    if (typeof ccData['controller'] !== 'number') {
        errors.push(`Event ${index}: CC controller must be number, got ${typeof ccData['controller']}`);
    }
    else if (ccData['controller'] < 0 || ccData['controller'] > 127) {
        errors.push(`Event ${index}: CC controller ${ccData['controller']} outside range (0-127)`);
    }
    // Validate CC value (can be 0-1 or 0-127, we'll normalize)
    if (typeof ccData['value'] !== 'number') {
        errors.push(`Event ${index}: CC value must be number, got ${typeof ccData['value']}`);
    }
    else if (ccData['value'] < 0 || ccData['value'] > 127) {
        // Allow both 0-1 and 0-127 ranges
        if (ccData['value'] < 0 || ccData['value'] > 1) {
            errors.push(`Event ${index}: CC value ${ccData['value']} outside valid ranges (0-1 or 0-127)`);
        }
    }
    return { isValid: errors.length === 0, errors, warnings };
}
/**
 * Validate sequence event
 */
async function validateSequenceEvent(event, index) {
    const errors = [];
    const warnings = [];
    if (!Array.isArray(event.value)) {
        errors.push(`Event ${index}: Sequence value must be array, got ${typeof event.value}`);
        return { isValid: false, errors, warnings };
    }
    const sequenceEvents = event.value;
    if (sequenceEvents.length === 0) {
        warnings.push(`Event ${index}: Empty sequence event`);
    }
    // Validate each sub-event
    for (let i = 0; i < sequenceEvents.length; i++) {
        const subEvent = sequenceEvents[i];
        if (!subEvent)
            continue;
        if (!subEvent.time || !subEvent.type) {
            errors.push(`Event ${index}.${i}: Sequence sub-event missing required fields`);
            continue;
        }
        // Recursively validate sub-events (simplified)
        if (subEvent.type === 'note' && typeof subEvent.value === 'string') {
            const noteInfo = Note.get(subEvent.value);
            if (!noteInfo.name) {
                errors.push(`Event ${index}.${i}: Invalid note in sequence "${subEvent.value}"`);
            }
        }
    }
    return { isValid: errors.length === 0, errors, warnings };
}
/**
 * Validate key signature
 */
function validateKeySignature(key) {
    const errors = [];
    const warnings = [];
    try {
        // Parse key components
        const keyMatch = key.match(/^([A-G][b#]?)\s*(major|minor|maj|min|m|M)?$/i);
        if (!keyMatch) {
            errors.push(`Invalid key format: ${key}`);
            return { isValid: false, errors, warnings };
        }
        const [, root, quality] = keyMatch;
        if (!root) {
            errors.push(`Invalid key root: ${key}`);
            return { isValid: false, errors, warnings };
        }
        // Validate root note
        const rootNote = Note.get(root);
        if (!rootNote.name) {
            errors.push(`Invalid key root note: ${root}`);
        }
        // Validate quality
        const normalizedQuality = quality?.toLowerCase();
        if (normalizedQuality && !['major', 'minor', 'maj', 'min', 'm'].includes(normalizedQuality)) {
            errors.push(`Invalid key quality: ${quality}`);
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    catch (error) {
        return {
            isValid: false,
            errors: [`Key validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
            warnings: []
        };
    }
}
/**
 * Validate timing consistency across events
 */
function validateEventTiming(events, bpm, timeSignature) {
    const errors = [];
    const warnings = [];
    try {
        const timeSig = timeSignature || '4/4';
        const [numerator] = timeSig.split('/').map(Number);
        if (!numerator) {
            errors.push(`Invalid time signature for timing validation: ${timeSig}`);
            return { isValid: false, errors, warnings };
        }
        let lastTime = 0;
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            if (!event)
                continue;
            // Parse event time to seconds (simplified)
            let eventTime = 0;
            if (event.time.includes(':')) {
                // Format: "bar:beat" or "bar:beat:subdivision"
                const parts = event.time.split(':').map(Number);
                if (parts.length >= 2 && parts[0] !== undefined && parts[1] !== undefined) {
                    eventTime = (parts[0] * numerator + parts[1]) * (60 / bpm);
                }
            }
            else if (event.time.match(/^\d+[ndt]\.?$/)) {
                // Musical notation - simplified calculation
                const match = event.time.match(/^(\d+)([ndt])/);
                if (match && match[1]) {
                    const noteValue = parseInt(match[1]);
                    eventTime = (60 / bpm) * (4 / noteValue);
                }
            }
            // Check for negative time progression
            if (eventTime < lastTime) {
                warnings.push(`Event ${i}: Time ${event.time} occurs before previous event`);
            }
            lastTime = eventTime;
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    catch (error) {
        return {
            isValid: false,
            errors: [`Timing validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
            warnings: []
        };
    }
}
/**
 * Validate harmonic progression
 */
function validateHarmonicProgression(chordEvents, key) {
    const warnings = [];
    try {
        const chords = chordEvents
            .filter(e => typeof e.value === 'string')
            .map(e => e.value);
        if (chords.length < 2) {
            return { isValid: true, errors: [], warnings };
        }
        const analysis = analyzeProgression(chords, key);
        if (!analysis.isValid) {
            warnings.push('Chord progression contains unusual harmonic relationships');
        }
        // Check for common voice leading issues
        for (let i = 1; i < chords.length; i++) {
            const prevChord = chords[i - 1];
            const currentChord = chords[i];
            if (prevChord && currentChord && prevChord === currentChord) {
                warnings.push(`Repeated chord at position ${i}: ${currentChord}`);
            }
        }
        return { isValid: true, errors: [], warnings };
    }
    catch (error) {
        return {
            isValid: true,
            errors: [],
            warnings: [`Harmonic analysis warning: ${error instanceof Error ? error.message : 'Unknown error'}`]
        };
    }
}
/**
 * Validate chord fits in key
 */
function validateChordInKey(chord, key) {
    try {
        const chordInfo = Chord.get(chord);
        const keyInfo = Scale.get(`${key} major`); // Simplified to major scales
        if (!chordInfo.tonic || !keyInfo.notes) {
            return { isValid: true, errors: [], warnings: [] }; // Can't analyze, assume valid
        }
        const isInKey = keyInfo.notes.includes(chordInfo.tonic);
        return {
            isValid: isInKey,
            errors: [],
            warnings: isInKey ? [] : [`Chord ${chord} not diatonic to key ${key}`]
        };
    }
    catch (error) {
        return { isValid: true, errors: [], warnings: [] }; // Default to valid if can't analyze
    }
}
/**
 * Validate final executable score consistency
 */
export async function validateMusicalConsistency(score) {
    const errors = [];
    const warnings = [];
    try {
        // Check metadata consistency
        if (score.metadata.eventCount !==
            score.noteEvents.length + score.controlChangeEvents.length + score.systemEvents.length) {
            warnings.push('Metadata event count does not match actual events');
        }
        // Check timing consistency
        const allTimes = [
            ...score.noteEvents.map(e => e.absoluteTime),
            ...score.controlChangeEvents.map(e => e.absoluteTime),
            ...score.systemEvents.map(e => e.absoluteTime)
        ];
        if (allTimes.some(time => time < 0)) {
            errors.push('Found events with negative absolute times');
        }
        // Check MIDI ranges
        for (const noteEvent of score.noteEvents) {
            if (noteEvent.midiNote < 0 || noteEvent.midiNote > 127) {
                errors.push(`MIDI note ${noteEvent.midiNote} outside valid range (0-127)`);
            }
            if (noteEvent.velocity < 0 || noteEvent.velocity > 1) {
                errors.push(`Velocity ${noteEvent.velocity} outside normalized range (0-1)`);
            }
            if (noteEvent.channel < 1 || noteEvent.channel > 16) {
                errors.push(`MIDI channel ${noteEvent.channel} outside valid range (1-16)`);
            }
        }
        logger.debug('Musical consistency validation completed', {
            noteEvents: score.noteEvents.length,
            ccEvents: score.controlChangeEvents.length,
            systemEvents: score.systemEvents.length,
            errors: errors.length,
            warnings: warnings.length
        });
        return { isValid: errors.length === 0, errors, warnings };
    }
    catch (error) {
        logger.error('Musical consistency validation failed', { error });
        return {
            isValid: false,
            errors: [`Consistency validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
            warnings: []
        };
    }
}
/**
 * Helper functions for format validation
 */
function isValidTimeFormat(time) {
    // Musical time formats: "0:0", "1:2:3", "4n", "8t", etc.
    return /^(\d+:)?\d+(:\d+)?$|^\d+[ndt]\.?$/.test(time);
}
function isValidDurationFormat(duration) {
    // Musical duration formats: "4n", "8n", "2n.", "16t"
    return /^\d+[ndt]\.?$/.test(duration);
}
//# sourceMappingURL=validators.js.map