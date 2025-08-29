/**
 * Hybrid Musical Notation Parser
 * Parses hybrid notation format: "A4:q@0.8.leg B4:e | C4:h"
 * Maintains full compatibility with legacy formats
 */
import Note from '@tonaljs/note';
import { logger } from './logger.js';
// Duration mapping (beats in 4/4 time)
const DURATION_MAP = {
    'w': 4.0, // whole
    'h': 2.0, // half
    'q': 1.0, // quarter
    'e': 0.5, // eighth
    's': 0.25, // sixteenth
    't': 0.125 // thirty-second
};
// Musical fluidity constants for natural sound
const MUSICAL_DEFAULTS = {
    dynamics: {
        pianissimo: 0.3, // Minimum audible level (instead of 0.01)
        piano: 0.5, // Soft but clear
        mezzoforte: 0.7, // Natural speaking level
        forte: 0.9, // Strong and present
        fortissimo: 1.0 // Maximum power
    },
    articulations: {
        legato: 0.85, // Natural connected playing
        normal: 0.75, // Standard separation
        tenuto: 0.8, // Held but not overly connected
        staccato: 0.4, // Clear separation (not extreme)
        staccatissimo: 0.2 // Very short but not inaudible
    },
    instruments: {
        violins: { defaultArticulation: 0.85, preferredRange: [0.4, 1.0] },
        cellos: { defaultArticulation: 0.8, preferredRange: [0.3, 0.9] },
        organ: { defaultArticulation: 0.6, preferredRange: [0.3, 0.8] },
        piano: { defaultArticulation: 0.75, preferredRange: [0.2, 0.9] },
        strings: { defaultArticulation: 0.85, preferredRange: [0.4, 1.0] },
        brass: { defaultArticulation: 0.7, preferredRange: [0.3, 0.9] },
        woodwinds: { defaultArticulation: 0.8, preferredRange: [0.4, 0.95] }
    }
};
// Articulation mapping
const ARTICULATION_MAP = {
    'leg': 1.0, // legato
    'stac': 0.0, // staccato
    'ten': 0.9, // tenuto
    'accent': 'velocity+0.2', // boost velocity
    'ghost': 'velocity-0.3' // reduce velocity
};
// Comprehensive chord definitions database for professional music notation
const CHORD_DEFINITIONS = {
    // ========================
    // MAJOR TRIADS (all 12 keys)
    // ========================
    'C': ['C', 'E', 'G'], 'C#': ['C#', 'E#', 'G#'], 'Db': ['Db', 'F', 'Ab'],
    'D': ['D', 'F#', 'A'], 'D#': ['D#', 'Fx', 'A#'], 'Eb': ['Eb', 'G', 'Bb'],
    'E': ['E', 'G#', 'B'], 'F': ['F', 'A', 'C'], 'F#': ['F#', 'A#', 'C#'],
    'Gb': ['Gb', 'Bb', 'Db'], 'G': ['G', 'B', 'D'], 'G#': ['G#', 'B#', 'D#'],
    'Ab': ['Ab', 'C', 'Eb'], 'A': ['A', 'C#', 'E'], 'A#': ['A#', 'Cx', 'E#'],
    'Bb': ['Bb', 'D', 'F'], 'B': ['B', 'D#', 'F#'],
    // ========================
    // MINOR TRIADS (all 12 keys)
    // ========================
    'Cm': ['C', 'Eb', 'G'], 'C#m': ['C#', 'E', 'G#'], 'Dbm': ['Db', 'E', 'Ab'],
    'Dm': ['D', 'F', 'A'], 'D#m': ['D#', 'F#', 'A#'], 'Ebm': ['Eb', 'Gb', 'Bb'],
    'Em': ['E', 'G', 'B'], 'Fm': ['F', 'Ab', 'C'], 'F#m': ['F#', 'A', 'C#'],
    'Gbm': ['Gb', 'A', 'Db'], 'Gm': ['G', 'Bb', 'D'], 'G#m': ['G#', 'B', 'D#'],
    'Abm': ['Ab', 'B', 'Eb'], 'Am': ['A', 'C', 'E'], 'A#m': ['A#', 'C#', 'E#'],
    'Bbm': ['Bb', 'Db', 'F'], 'Bm': ['B', 'D', 'F#'],
    // ========================
    // DOMINANT 7TH CHORDS
    // ========================
    'C7': ['C', 'E', 'G', 'Bb'], 'C#7': ['C#', 'E#', 'G#', 'B'],
    'Db7': ['Db', 'F', 'Ab', 'B'], 'D7': ['D', 'F#', 'A', 'C'],
    'D#7': ['D#', 'Fx', 'A#', 'C#'], 'Eb7': ['Eb', 'G', 'Bb', 'Db'],
    'E7': ['E', 'G#', 'B', 'D'], 'F7': ['F', 'A', 'C', 'Eb'],
    'F#7': ['F#', 'A#', 'C#', 'E'], 'Gb7': ['Gb', 'Bb', 'Db', 'E'],
    'G7': ['G', 'B', 'D', 'F'], 'G#7': ['G#', 'B#', 'D#', 'F#'],
    'Ab7': ['Ab', 'C', 'Eb', 'Gb'], 'A7': ['A', 'C#', 'E', 'G'],
    'A#7': ['A#', 'Cx', 'E#', 'G#'], 'Bb7': ['Bb', 'D', 'F', 'Ab'],
    'B7': ['B', 'D#', 'F#', 'A'],
    // ========================
    // MAJOR 7TH CHORDS
    // ========================
    'Cmaj7': ['C', 'E', 'G', 'B'], 'C#maj7': ['C#', 'E#', 'G#', 'B#'],
    'Dbmaj7': ['Db', 'F', 'Ab', 'C'], 'Dmaj7': ['D', 'F#', 'A', 'C#'],
    'D#maj7': ['D#', 'Fx', 'A#', 'Cx'], 'Ebmaj7': ['Eb', 'G', 'Bb', 'D'],
    'Emaj7': ['E', 'G#', 'B', 'D#'], 'Fmaj7': ['F', 'A', 'C', 'E'],
    'F#maj7': ['F#', 'A#', 'C#', 'E#'], 'Gbmaj7': ['Gb', 'Bb', 'Db', 'F'],
    'Gmaj7': ['G', 'B', 'D', 'F#'], 'G#maj7': ['G#', 'B#', 'D#', 'Fx'],
    'Abmaj7': ['Ab', 'C', 'Eb', 'G'], 'Amaj7': ['A', 'C#', 'E', 'G#'],
    'A#maj7': ['A#', 'Cx', 'E#', 'Gx'], 'Bbmaj7': ['Bb', 'D', 'F', 'A'],
    'Bmaj7': ['B', 'D#', 'F#', 'A#'],
    // ========================
    // MINOR 7TH CHORDS
    // ========================
    'Cm7': ['C', 'Eb', 'G', 'Bb'], 'C#m7': ['C#', 'E', 'G#', 'B'],
    'Dbm7': ['Db', 'E', 'Ab', 'B'], 'Dm7': ['D', 'F', 'A', 'C'],
    'D#m7': ['D#', 'F#', 'A#', 'C#'], 'Ebm7': ['Eb', 'Gb', 'Bb', 'Db'],
    'Em7': ['E', 'G', 'B', 'D'], 'Fm7': ['F', 'Ab', 'C', 'Eb'],
    'F#m7': ['F#', 'A', 'C#', 'E'], 'Gbm7': ['Gb', 'A', 'Db', 'E'],
    'Gm7': ['G', 'Bb', 'D', 'F'], 'G#m7': ['G#', 'B', 'D#', 'F#'],
    'Abm7': ['Ab', 'B', 'Eb', 'Gb'], 'Am7': ['A', 'C', 'E', 'G'],
    'A#m7': ['A#', 'C#', 'E#', 'G#'], 'Bbm7': ['Bb', 'Db', 'F', 'Ab'],
    'Bm7': ['B', 'D', 'F#', 'A'],
    // ========================
    // DIMINISHED & AUGMENTED
    // ========================
    'Cdim': ['C', 'Eb', 'Gb'], 'C#dim': ['C#', 'E', 'G'], 'Ddim': ['D', 'F', 'Ab'],
    'D#dim': ['D#', 'F#', 'A'], 'Edim': ['E', 'G', 'Bb'], 'Fdim': ['F', 'Ab', 'B'],
    'F#dim': ['F#', 'A', 'C'], 'Gdim': ['G', 'Bb', 'Db'], 'G#dim': ['G#', 'B', 'D'],
    'Adim': ['A', 'C', 'Eb'], 'A#dim': ['A#', 'C#', 'E'], 'Bdim': ['B', 'D', 'F'],
    'Caug': ['C', 'E', 'G#'], 'C#aug': ['C#', 'E#', 'A'], 'Daug': ['D', 'F#', 'A#'],
    'D#aug': ['D#', 'Fx', 'B'], 'Eaug': ['E', 'G#', 'C'], 'Faug': ['F', 'A', 'C#'],
    'F#aug': ['F#', 'A#', 'D'], 'Gaug': ['G', 'B', 'D#'], 'G#aug': ['G#', 'B#', 'E'],
    'Aaug': ['A', 'C#', 'F'], 'A#aug': ['A#', 'Cx', 'F#'], 'Baug': ['B', 'D#', 'G'],
    // ========================
    // SUSPENDED CHORDS
    // ========================
    'Csus2': ['C', 'D', 'G'], 'Csus4': ['C', 'F', 'G'], 'Dsus2': ['D', 'E', 'A'],
    'Dsus4': ['D', 'G', 'A'], 'Esus2': ['E', 'F#', 'B'], 'Esus4': ['E', 'A', 'B'],
    'Fsus2': ['F', 'G', 'C'], 'Fsus4': ['F', 'Bb', 'C'], 'Gsus2': ['G', 'A', 'D'],
    'Gsus4': ['G', 'C', 'D'], 'Asus2': ['A', 'B', 'E'], 'Asus4': ['A', 'D', 'E'],
    'Bsus2': ['B', 'C#', 'F#'], 'Bsus4': ['B', 'E', 'F#'],
    'Bbsus2': ['Bb', 'C', 'F'], 'Bbsus4': ['Bb', 'Eb', 'F'],
    // ========================
    // EXTENDED CHORDS (common ones)
    // ========================
    'C9': ['C', 'E', 'G', 'Bb', 'D'], 'Cmaj9': ['C', 'E', 'G', 'B', 'D'],
    'Cm9': ['C', 'Eb', 'G', 'Bb', 'D'], 'C11': ['C', 'E', 'G', 'Bb', 'D', 'F'],
    'C13': ['C', 'E', 'G', 'Bb', 'D', 'F', 'A'],
    'G9': ['G', 'B', 'D', 'F', 'A'], 'Am9': ['A', 'C', 'E', 'G', 'B'],
    // ========================
    // ALTERED CHORDS (common ones)
    // ========================
    'C7b5': ['C', 'E', 'Gb', 'Bb'], 'C7#5': ['C', 'E', 'G#', 'Bb'],
    'Cm7b5': ['C', 'Eb', 'Gb', 'Bb'], 'C7b9': ['C', 'E', 'G', 'Bb', 'Db'],
    'C7#9': ['C', 'E', 'G', 'Bb', 'D#'], 'G7alt': ['G', 'B', 'Db', 'F', 'Ab']
};
/**
 * Normalize enharmonic equivalents to avoid conflicts
 * @param note - note name that might have enharmonic issues
 * @returns normalized note name
 */
function normalizeEnharmonic(note) {
    const enharmonicMap = {
        'E#': 'F', 'B#': 'C', 'Cb': 'B', 'Fb': 'E',
        'Fx': 'G', 'Cx': 'D', 'Gx': 'A', 'Dx': 'E', 'Ax': 'B', 'Ex': 'F#', 'Bx': 'C#'
    };
    return enharmonicMap[note] || note;
}
/**
 * Expands a named chord to its constituent notes with advanced inversion support
 * @param chordName - e.g., "Cmaj7", "Am", "G7", "C/E", "F/A"
 * @param octave - octave for the root note (default: 4)
 * @returns Array of note names with octaves
 */
function expandNamedChord(chordName, octave = 4) {
    // Handle inversions like "C/E", "F/A", "G/B"
    const [baseChord, bassNote] = chordName.split('/');
    const chordKey = baseChord || chordName;
    let chordNotes = CHORD_DEFINITIONS[chordKey];
    if (!chordNotes) {
        throw new Error(`Unknown chord: ${chordName}`);
    }
    // Normalize enharmonic equivalents in chord notes
    const normalizedChordNotes = chordNotes.map(note => normalizeEnharmonic(note));
    // Add octaves to notes with intelligent voicing
    const notesWithOctaves = normalizedChordNotes.map((note, index) => {
        // Smart octave distribution: root in base octave, then spread upward
        let noteOctave = octave;
        // For larger chords (4+ notes), spread them across octaves more naturally
        if (normalizedChordNotes.length >= 4) {
            noteOctave = octave + Math.floor(index / 2);
        }
        else {
            // For triads, keep closer voicing
            noteOctave = octave + Math.floor(index / 3);
        }
        return `${note}${noteOctave}`;
    });
    // Handle bass note (inversion) with proper bass register
    if (bassNote) {
        const normalizedBassNote = normalizeEnharmonic(bassNote);
        // Put bass note in lower octave for proper bass register
        const bassWithOctave = `${normalizedBassNote}${octave - 1}`;
        // Remove the bass note from the upper voicing to avoid duplication
        const filteredUpperNotes = notesWithOctaves.filter((n) => {
            const noteName = n.replace(/\d+$/, ''); // Remove octave number
            return noteName !== normalizedBassNote;
        });
        return [bassWithOctave, ...filteredUpperNotes];
    }
    return notesWithOctaves;
}
/**
 * Parses chord notation from brackets
 * @param chordStr - e.g., "[C3 E3 G3]", "[Cmaj7]", "[C/E]"
 * @returns Array of note names
 */
function parseChordString(chordStr) {
    // Remove brackets
    const cleanStr = chordStr.replace(/[\[\]]/g, '').trim();
    // Check if it's a named chord (no spaces, contains letters)
    if (!cleanStr.includes(' ') && /[A-G]/.test(cleanStr)) {
        // Named chord like "Cmaj7", "Am", or inversion like "F/A"
        if (cleanStr.includes('/')) {
            // Check if it's an inversion (F/A) or octave specification (Cmaj7/4)
            const [chordPart, afterSlash] = cleanStr.split('/');
            // If afterSlash is a single digit, it's an octave specification
            if (afterSlash && /^\d$/.test(afterSlash)) {
                const octave = parseInt(afterSlash);
                return expandNamedChord(chordPart || '', octave);
            }
            else {
                // It's an inversion like "F/A"
                return expandNamedChord(cleanStr, 4);
            }
        }
        else {
            // Regular named chord without slash
            return expandNamedChord(cleanStr, 4);
        }
    }
    // Manual chord like "C3 E3 G3"
    return cleanStr.split(/\s+/).filter(note => note.length > 0);
}
/**
 * Parse rest/pause notation with duration support
 * Format: "r:q", "r:h", "rest:w", etc.
 */
function parseRestNotation(restStr, globalDefaults, measureIndex, beatPosition) {
    const context = {
        component: 'HybridParser',
        operation: 'parseRestNotation',
        restStr,
        measureIndex,
        beatPosition
    };
    try {
        // Extract duration part after the colon
        const colonIndex = restStr.indexOf(':');
        if (colonIndex === -1) {
            throw new Error(`Invalid rest notation: ${restStr}. Expected format: "r:q" or "rest:h"`);
        }
        const durationPart = restStr.substring(colonIndex + 1).trim();
        if (!durationPart) {
            throw new Error(`Missing duration in rest notation: ${restStr}`);
        }
        // Parse duration (default to quarter note if invalid)
        let duration = 1.0; // quarter note default
        if (DURATION_MAP[durationPart] !== undefined) {
            duration = DURATION_MAP[durationPart];
        }
        else {
            // Try parsing as decimal (for custom durations)
            const customDuration = parseFloat(durationPart);
            if (!isNaN(customDuration) && customDuration > 0) {
                duration = customDuration;
            }
            else {
                logger.warn('Invalid rest duration code, using quarter note', { ...context, durationPart });
                duration = 1.0; // Default to quarter note for rests
            }
        }
        // Calculate absolute time
        const beatsPerSecond = globalDefaults.bpm / 60;
        const absoluteTime = (measureIndex * getBeatsPerMeasure(globalDefaults.timeSignature) + beatPosition) / beatsPerSecond;
        // Create a rest note (MIDI note -1 indicates rest)
        const restNote = {
            note: 'rest',
            midiNote: -1, // Special value indicating rest
            duration,
            velocity: 0, // Rests have no velocity
            articulation: 0, // Rests have no articulation
            measureIndex,
            beatPosition,
            absoluteTime,
            isChord: false,
            chordNotes: undefined,
            chordMidiNotes: undefined
        };
        logger.debug('Successfully parsed rest notation', { ...context, restNote });
        return restNote;
    }
    catch (error) {
        logger.error('Failed to parse rest notation', { ...context, error });
        throw new Error(`Failed to parse rest "${restStr}": ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Parse a single note or chord string with full hybrid notation support
 * Format: "A4:q@0.8.leg" or "[C3 E3 G3]:q@0.8.leg" or "[Cmaj7]:h@0.9"
 */
function parseNoteString(noteStr, globalDefaults, measureIndex, beatPosition) {
    const context = {
        component: 'HybridParser',
        operation: 'parseNoteString',
        noteStr,
        measureIndex,
        beatPosition
    };
    try {
        // Check if this is a rest/pause notation (r:duration or rest:duration)
        const isRest = noteStr.toLowerCase().startsWith('r:') || noteStr.toLowerCase().startsWith('rest:');
        if (isRest) {
            // Handle rest/pause notation
            return parseRestNotation(noteStr, globalDefaults, measureIndex, beatPosition);
        }
        // Check if this is a chord (contains brackets)
        const isChord = noteStr.includes('[') && noteStr.includes(']');
        // Parse the notation: note:duration@velocity.articulation or [chord]:duration@velocity.articulation
        let notePart = noteStr;
        let durationPart = '';
        let velocityPart = '';
        let articulationPart = '';
        // Extract duration (after :)
        if (noteStr.includes(':')) {
            const colonSplit = noteStr.split(':');
            notePart = colonSplit[0] || '';
            if (colonSplit.length > 1) {
                const afterColon = colonSplit[1] || '';
                // Extract velocity and articulation (format: duration@velocity.articulation)
                if (afterColon.includes('@')) {
                    const atSplit = afterColon.split('@');
                    durationPart = atSplit[0] || '';
                    if (atSplit.length > 1) {
                        const afterAt = atSplit[1] || '';
                        // Extract articulation (after .)
                        // But first check if this is a decimal number vs articulation
                        if (afterAt.includes('.')) {
                            // Check if the entire afterAt is a simple decimal (like "0.7")
                            if (afterAt.match(/^\d+\.\d+$/)) {
                                // It's just a decimal number, no articulation
                                velocityPart = afterAt;
                            }
                            else {
                                // It has a dot but it's not just a decimal, so parse velocity.articulation
                                // For cases like "0.7.leg", we need to find where the number ends and articulation starts
                                const dotSplit = afterAt.split('.');
                                // Find the last non-numeric part as articulation
                                let articulationIndex = -1;
                                for (let i = dotSplit.length - 1; i >= 0; i--) {
                                    const part = dotSplit[i];
                                    if (part && !/^\d+$/.test(part)) {
                                        articulationIndex = i;
                                        break;
                                    }
                                }
                                if (articulationIndex > 0) {
                                    // Reconstruct velocity from parts before articulation
                                    velocityPart = dotSplit.slice(0, articulationIndex).join('.');
                                    const artPart = dotSplit[articulationIndex];
                                    articulationPart = artPart || '';
                                }
                                else {
                                    // No valid articulation found, treat as velocity
                                    velocityPart = afterAt;
                                }
                            }
                        }
                        else {
                            velocityPart = afterAt;
                        }
                    }
                }
                else {
                    // No velocity specified, check for articulation only
                    if (afterColon.includes('.')) {
                        const dotSplit = afterColon.split('.');
                        durationPart = dotSplit[0] || '';
                        articulationPart = dotSplit[1] || '';
                    }
                    else {
                        durationPart = afterColon;
                    }
                }
            }
        }
        // Process chord or single note
        let chordNotes = [];
        let chordMidiNotes = [];
        let finalMidiNote;
        if (isChord) {
            // Parse chord
            try {
                chordNotes = parseChordString(notePart);
                chordMidiNotes = chordNotes.map(note => {
                    const midiNum = Note.midi(note);
                    if (midiNum === null) {
                        throw new Error(`Invalid note in chord: ${note}`);
                    }
                    return Math.max(0, Math.min(127, midiNum + globalDefaults.transpose));
                });
                // Use the lowest note as the primary MIDI note for compatibility
                finalMidiNote = Math.min(...chordMidiNotes);
                // Update notePart to be comma-separated for display
                notePart = chordNotes.join(',');
            }
            catch (error) {
                throw new Error(`Failed to parse chord ${notePart}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        else {
            // Parse single note to MIDI
            const midiNote = Note.midi(notePart);
            if (midiNote === null) {
                throw new Error(`Invalid note name: ${notePart}`);
            }
            // Apply transpose
            finalMidiNote = Math.max(0, Math.min(127, midiNote + globalDefaults.transpose));
        }
        // Parse duration (default to quarter note)
        let duration = 1.0; // quarter note default
        if (durationPart && DURATION_MAP[durationPart] !== undefined) {
            duration = DURATION_MAP[durationPart];
        }
        else if (durationPart) {
            // Try parsing as decimal (for custom durations)
            const customDuration = parseFloat(durationPart);
            if (!isNaN(customDuration) && customDuration > 0) {
                duration = customDuration;
            }
            else {
                logger.warn('Invalid duration code, skipping note', { ...context, durationPart });
                return null; // Skip notes with invalid duration codes
            }
        }
        // Parse velocity (default to global)
        let velocity = globalDefaults.velocity;
        if (velocityPart) {
            const parsedVelocity = parseFloat(velocityPart);
            if (!isNaN(parsedVelocity) && parsedVelocity >= 0 && parsedVelocity <= 1) {
                velocity = parsedVelocity;
            }
            else {
                logger.warn('Invalid velocity value, using global default', { ...context, velocityPart, parsedVelocity });
            }
        }
        // Ensure velocity never falls below musical minimum (pianissimo)
        if (velocity < 0.3) {
            velocity = 0.3;
        }
        // Parse articulation (default to global)
        let articulation = globalDefaults.articulation;
        if (articulationPart) {
            const articulationEffect = ARTICULATION_MAP[articulationPart];
            if (typeof articulationEffect === 'number') {
                articulation = articulationEffect;
            }
            else if (typeof articulationEffect === 'string') {
                // Handle special articulations that modify velocity
                if (articulationEffect === 'velocity+0.2') {
                    velocity = Math.min(1.0, velocity + 0.2);
                }
                else if (articulationEffect === 'velocity-0.3') {
                    velocity = Math.max(0.3, velocity - 0.3); // Maintain musical minimum of 0.3 (pianissimo)
                }
            }
            else {
                logger.warn('Unknown articulation code, using global default', { ...context, articulationPart });
            }
        }
        // Calculate absolute time (considering BPM and position)
        const beatsPerSecond = globalDefaults.bpm / 60;
        const absoluteTime = (measureIndex * getBeatsPerMeasure(globalDefaults.timeSignature) + beatPosition) / beatsPerSecond;
        const parsedNote = {
            note: notePart,
            midiNote: finalMidiNote,
            duration,
            velocity,
            articulation,
            measureIndex,
            beatPosition,
            absoluteTime,
            isChord,
            chordNotes: isChord ? chordNotes : undefined,
            chordMidiNotes: isChord ? chordMidiNotes : undefined
        };
        logger.debug('Successfully parsed note', { ...context, parsedNote });
        return parsedNote;
    }
    catch (error) {
        logger.error('Failed to parse note string', { ...context, error });
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to parse note "${noteStr}": ${errorMessage}`);
    }
}
/**
 * Validate parsing results to catch common issues
 */
function validateParsingResults(originalNotation, parsedNotes, context) {
    const issues = [];
    // Count expected notes/tokens (excluding measure bars and obvious rests)
    const tokens = originalNotation.split(/[|\s]+/).filter(token => token.trim().length > 0 &&
        token !== '|' &&
        !token.match(/^r:/) &&
        !token.match(/^rest:/));
    const expectedCount = tokens.length;
    const actualMusicNotes = parsedNotes.filter(note => note.midiNote !== -1).length;
    // Issue 1: Zero notes parsed
    if (parsedNotes.length === 0) {
        issues.push('No notes parsed - possible syntax error in notation');
    }
    // Issue 2: Zero musical notes (all rests)
    if (actualMusicNotes === 0 && parsedNotes.length > 0) {
        issues.push('All parsed notes are rests - possible notation parsing issue');
    }
    // Issue 3: Significant difference in expected vs actual count
    const countDifference = Math.abs(expectedCount - actualMusicNotes);
    if (countDifference > 2 && expectedCount > 0) {
        issues.push(`Note count mismatch: expected ~${expectedCount}, got ${actualMusicNotes} (difference: ${countDifference})`);
    }
    // Issue 4: Excessive rests (more than 50% of total)
    const restPercentage = parsedNotes.length > 0 ? (parsedNotes.length - actualMusicNotes) / parsedNotes.length : 0;
    if (restPercentage > 0.5) {
        issues.push(`High rest percentage: ${Math.round(restPercentage * 100)}% - possible pause parsing issue`);
    }
    logger.debug('Parsing validation results', {
        ...context,
        expectedCount,
        actualCount: actualMusicNotes,
        totalParsed: parsedNotes.length,
        restCount: parsedNotes.length - actualMusicNotes,
        issues
    });
    return {
        isValid: issues.length === 0,
        issues,
        expectedCount,
        actualCount: actualMusicNotes
    };
}
/**
 * Get beats per measure from time signature
 */
function getBeatsPerMeasure(timeSignature) {
    const [numerator, denominator] = timeSignature.split('/').map(Number);
    if (!numerator || !denominator) {
        logger.warn('Invalid time signature, defaulting to 4/4', { timeSignature });
        return 4;
    }
    // Convert to quarter note beats
    return numerator * (4 / denominator);
}
/**
 * Smart split that preserves chord brackets
 * Splits "[C3 E3 G3]:q@0.8" as one unit, not three separate notes
 */
function smartSplitNotes(measure) {
    const notes = [];
    let current = '';
    let inBrackets = false;
    let i = 0;
    while (i < measure.length) {
        const char = measure[i];
        if (char === '[') {
            inBrackets = true;
            current += char;
        }
        else if (char === ']') {
            inBrackets = false;
            current += char;
        }
        else if (char === ' ' && !inBrackets) {
            // Space outside brackets - end current note
            if (current.trim().length > 0) {
                notes.push(current.trim());
                current = '';
            }
        }
        else {
            current += char;
        }
        i++;
    }
    // Add final note
    if (current.trim().length > 0) {
        notes.push(current.trim());
    }
    return notes;
}
/**
 * Normalize dynamics to musical range (0.3-1.0) for natural sound
 * @param velocity - raw velocity value
 * @returns normalized velocity in musical range
 */
function normalizeDynamics(velocity) {
    // Convert extreme values to musical minimums
    if (velocity < 0.3)
        return 0.3; // pianissimo minimum audible
    if (velocity > 1.0)
        return 1.0; // fortissimo maximum
    return velocity;
}
/**
 * Get musical term for dynamic level
 * @param velocity - normalized velocity
 * @returns musical dynamic term
 */
function getDynamicTerm(velocity) {
    if (velocity <= 0.35)
        return 'pianissimo (pp)';
    if (velocity <= 0.55)
        return 'piano (p)';
    if (velocity <= 0.75)
        return 'mezzoforte (mf)';
    if (velocity <= 0.95)
        return 'forte (f)';
    return 'fortissimo (ff)';
}
/**
 * Validate articulation for natural musical expression
 * @param articulation - articulation string
 * @param instrument - instrument type for context
 * @returns validated articulation suggestion
 */
function validateArticulation(articulation, instrument) {
    const instrumentDefaults = MUSICAL_DEFAULTS.instruments[instrument]
        || MUSICAL_DEFAULTS.instruments.piano;
    // Map known articulations to preferred ranges
    const articulationMap = {
        'leg': 0.85, // legato - natural for most instruments
        'stac': 0.4, // staccato - clear but not extreme
        'ten': 0.8, // tenuto - sustained but not overly long
        'accent': 0.75, // accent - emphasized but musical
        'ghost': 0.5 // ghost - subtle but audible
    };
    const targetValue = articulationMap[articulation];
    if (!targetValue) {
        return articulation; // Unknown articulation, keep as is
    }
    // Check if articulation fits instrument's preferred range
    const [min, max] = instrumentDefaults.preferredRange;
    if (targetValue < min || targetValue > max) {
        // Suggest alternative articulation within range
        if (targetValue < min) {
            return Object.keys(articulationMap).find(key => {
                const value = articulationMap[key];
                return value !== undefined && value >= min && value <= max;
            }) || articulation;
        }
        else {
            return Object.keys(articulationMap).find(key => {
                const value = articulationMap[key];
                return value !== undefined && value <= max && value >= min;
            }) || articulation;
        }
    }
    return articulation;
}
// Dynamic progression validation happens after parsing with parsed notes
/**
 * Validate rest density for musical fluidity
 * @param noteString - notation string
 * @returns validation result
 */
function validateRests(noteString) {
    const restCount = (noteString.match(/r:|rest:/g) || []).length;
    const totalNotes = (noteString.match(/[A-G][\d]:|[[].*?[]]:/g) || []).length;
    const restPercentage = totalNotes > 0 ? restCount / (restCount + totalNotes) : 0;
    return {
        isValid: restPercentage <= 0.3, // Maximum 30% rests for fluidity
        restCount,
        totalNotes,
        restPercentage: Math.round(restPercentage * 100) / 100
    };
}
/**
 * Provide musical guidance for composition improvements
 * @param context - logging context
 */
function provideMusicialGuidance(context) {
    logger.info('🎵 MUSICAL FLUIDITY GUIDANCE:', {
        ...context,
        tips: [
            '• Dynamics: Use 0.3-1.0 range for natural musical expression',
            '• Articulations: 0.6-0.9 range provides most natural sound',
            '• Progressions: Limit dynamic jumps to 0.4 for smooth transitions',
            '• Rests: Maximum 30% of total elements to maintain musical flow',
            '• Instruments: Each has preferred articulation ranges for authenticity'
        ],
        dynamicTerms: {
            'pp (0.3)': 'pianissimo - very soft',
            'p (0.5)': 'piano - soft',
            'mf (0.7)': 'mezzoforte - medium',
            'f (0.9)': 'forte - loud',
            'ff (1.0)': 'fortissimo - very loud'
        }
    });
}
// These functions are now integrated into the existing validation system
/**
 * Validate dynamic progression for smoothness
 */
function validateDynamicProgression(parsedNotes, context) {
    if (parsedNotes.length < 2)
        return;
    let abruptJumps = 0;
    for (let i = 1; i < parsedNotes.length; i++) {
        const currentNote = parsedNotes[i];
        const previousNote = parsedNotes[i - 1];
        if (!currentNote || !previousNote || currentNote.midiNote === -1 || previousNote.midiNote === -1)
            continue;
        const jump = Math.abs(currentNote.velocity - previousNote.velocity);
        if (jump > 0.4) {
            abruptJumps++;
            logger.warn('Abrupto salto dinâmico detectado para fluidez musical', {
                ...context,
                previous: { note: previousNote.note, velocity: previousNote.velocity },
                current: { note: currentNote.note, velocity: currentNote.velocity },
                jump,
                suggestion: 'Use progressão gradual para maior naturalidade musical'
            });
        }
    }
    if (abruptJumps > 0) {
        logger.info('Dica de fluidez musical', {
            ...context,
            abruptJumps,
            recommendation: 'Para composições mais naturais, evite saltos > 0.4 entre dinâmicas consecutivas'
        });
    }
}
/**
 * Validate rest percentage for musical flow
 */
function validateRestPercentage(noteString, context) {
    const restMatches = noteString.match(/r:|rest:/g);
    const noteMatches = noteString.match(/[A-G][#b]?\d+:|(\[[^\]]+\]):/g);
    const restCount = restMatches?.length || 0;
    const noteCount = noteMatches?.length || 0;
    const totalElements = restCount + noteCount;
    if (totalElements > 0) {
        const restPercentage = restCount / totalElements;
        if (restPercentage > 0.3) {
            logger.warn('Alto percentual de pausas detectado', {
                ...context,
                restCount,
                noteCount,
                restPercentage: Math.round(restPercentage * 100),
                recommendation: 'Para manter fluidez musical, considere máximo 30% de pausas'
            });
        }
    }
}
/**
 * Provide musical guidance for composition quality
 */
function provideMusicalGuidance(parsedNotes, context) {
    const actualNotes = parsedNotes.filter(note => note.midiNote !== -1);
    if (actualNotes.length > 0) {
        const velocities = actualNotes.map(note => note.velocity);
        const minVel = Math.min(...velocities);
        const maxVel = Math.max(...velocities);
        const avgVel = velocities.reduce((a, b) => a + b, 0) / velocities.length;
        logger.info('🎵 Análise de Fluidez Musical', {
            ...context,
            statistics: {
                noteCount: actualNotes.length,
                dynamicRange: { min: minVel, max: maxVel, average: Math.round(avgVel * 100) / 100 },
                dynamicSpread: Math.round((maxVel - minVel) * 100) / 100
            },
            tips: {
                dynamics: 'Use faixa 0.3-1.0 para naturalidade (pianissimo-fortissimo)',
                articulation: 'Faixa 0.6-0.9 oferece expressividade natural',
                progression: 'Evite saltos > 0.4 entre dinâmicas consecutivas',
                rests: 'Máximo 30% de pausas para manter fluxo musical'
            }
        });
    }
}
/**
 * Validate and fix problematic notation patterns before parsing
 */
function validateAndFixNotation(notes, _globalDefaults) {
    const context = {
        component: 'HybridParser',
        operation: 'validateAndFixNotation'
    };
    try {
        let fixedNotes = notes;
        let hasWarnings = false;
        // Fix 1: Limit excessive consecutive pauses
        const maxConsecutivePauses = 3;
        const pausePattern = /(r:|rest:)[whqest]\s*(?:(r:|rest:)[whqest]\s*){3,}/gi;
        fixedNotes = fixedNotes.replace(pausePattern, (match) => {
            hasWarnings = true;
            logger.warn('Excessive consecutive pauses detected, limiting to maximum', {
                ...context,
                original: match,
                maxAllowed: maxConsecutivePauses
            });
            // Extract the first 3 pauses and consolidate the rest into a single longer pause
            const pauses = match.match(/(r:|rest:)[whqest]/gi) || [];
            const firstThree = pauses.slice(0, maxConsecutivePauses);
            if (pauses.length > maxConsecutivePauses) {
                // Add one longer pause to compensate
                firstThree.push('r:w'); // Add whole note rest
            }
            return firstThree.join(' ');
        });
        // Fix 2: Musical dynamics normalization (natural range 0.3-1.0)
        const dynamicsPattern = /@([\d.]+)(\.([a-zA-Z]+))?/g;
        fixedNotes = fixedNotes.replace(dynamicsPattern, (match, velocityStr, fullArticulation) => {
            const velocity = parseFloat(velocityStr);
            const normalized = normalizeDynamics(velocity);
            if (normalized !== velocity) {
                hasWarnings = true;
                const musicalTerm = getDynamicTerm(normalized);
                logger.warn(`Musical dynamics normalization applied: ${velocity} → ${normalized} (${musicalTerm})`, {
                    ...context,
                    original: velocity,
                    normalized,
                    musicalTerm,
                    guidance: 'Use 0.3-1.0 range for natural musical expression'
                });
                // Preserve articulation part if it exists - properly format with dot
                return `@${normalized}${fullArticulation || ''}`;
            }
            return match;
        });
        // Fix 3: Validate articulations for natural musical expression
        const articulationPattern = /\.([a-zA-Z]+)/g;
        fixedNotes = fixedNotes.replace(articulationPattern, (match, articulationStr) => {
            const normalizedArticulation = validateArticulation(articulationStr, 'piano'); // Default instrument
            if (normalizedArticulation !== articulationStr) {
                hasWarnings = true;
                logger.warn(`Articulation guidance provided`, {
                    ...context,
                    original: articulationStr,
                    suggestion: `Consider .${normalizedArticulation} for more natural expression`
                });
            }
            return match; // Keep original for now, just provide guidance
        });
        // Fix 4: Dynamic progression validation will happen after parsing
        // Fix 5: Detect and fix mixed chord/note syntax issues
        const tokens = fixedNotes.split(/\s+/).filter(token => token.trim().length > 0);
        let hasChords = false;
        let hasIndividualNotes = false;
        for (const token of tokens) {
            if (token.includes('[') && token.includes(']')) {
                hasChords = true;
            }
            else if (token.match(/^[A-Ga-g][#b]?\d+:/)) {
                hasIndividualNotes = true;
            }
        }
        // If mixing chords and individual notes, warn and separate them properly
        if (hasChords && hasIndividualNotes) {
            hasWarnings = true;
            logger.warn('Mixed chord and individual note syntax detected. This may cause parsing inconsistencies.', {
                ...context,
                hasChords,
                hasIndividualNotes,
                suggestion: 'Consider using either all chords [Am] or all individual notes (A4 C5 E5) for consistency'
            });
            // No automatic fix for this - it requires musical understanding
            // Just log the warning and let the parser handle it as best it can
        }
        // Fix 6: Validate rest density for musical fluidity
        const restValidation = validateRests(fixedNotes);
        if (!restValidation.isValid) {
            hasWarnings = true;
            logger.warn('Rest density validation', {
                ...context,
                ...restValidation,
                guidance: 'Maximum 30% rests recommended for musical fluidity'
            });
        }
        // Fix 7: Provide musical guidance summary
        if (hasWarnings) {
            provideMusicialGuidance(context);
        }
        if (hasWarnings) {
            logger.info('Fixed problematic notation patterns', {
                ...context,
                original: notes.substring(0, 50) + '...',
                fixed: fixedNotes.substring(0, 50) + '...'
            });
        }
        return fixedNotes;
    }
    catch (error) {
        logger.error('Failed to validate notation, using original', { ...context, error });
        return notes; // Return original if fixing fails
    }
}
/**
 * Main parser function for hybrid notation
 * Parses full notation string with measures, notes, and all parameters
 */
export function parseHybridNotation(notes, globalDefaults) {
    const context = {
        component: 'HybridParser',
        operation: 'parseHybridNotation',
        notesLength: notes.length
    };
    try {
        logger.info('Starting hybrid notation parsing', { ...context, notes: notes.substring(0, 100) + (notes.length > 100 ? '...' : '') });
        // Pre-validate and fix problematic patterns
        const validatedNotes = validateAndFixNotation(notes, globalDefaults);
        const parsedNotes = [];
        // Split by measures (|)
        const measures = validatedNotes.split('|').map(m => m.trim()).filter(m => m.length > 0);
        logger.debug('Split into measures', { ...context, measureCount: measures.length });
        for (let measureIndex = 0; measureIndex < measures.length; measureIndex++) {
            const measure = measures[measureIndex];
            if (!measure)
                continue;
            let beatPosition = 0;
            // Split measure by notes, preserving chord brackets
            const noteStrings = smartSplitNotes(measure);
            for (const noteStr of noteStrings) {
                const parsedNote = parseNoteString(noteStr, globalDefaults, measureIndex, beatPosition);
                // Skip notes with invalid notation (null return)
                if (parsedNote !== null) {
                    parsedNotes.push(parsedNote);
                    // Advance beat position by note duration
                    beatPosition += parsedNote.duration;
                }
            }
        }
        // Apply swing if specified
        if (globalDefaults.swing > 0) {
            applySwing(parsedNotes, globalDefaults.swing);
        }
        // Validate parsing results
        const validationResult = validateParsingResults(validatedNotes, parsedNotes, context);
        if (!validationResult.isValid) {
            logger.warn('Parsing validation failed', validationResult);
        }
        // Musical fluidity validations
        validateDynamicProgression(parsedNotes, context);
        validateRestPercentage(validatedNotes, context);
        provideMusicalGuidance(parsedNotes, context);
        logger.info('Hybrid notation parsing completed', {
            ...context,
            totalNotes: parsedNotes.length,
            actualNotes: parsedNotes.filter(n => n.midiNote !== -1).length, // Exclude rests
            rests: parsedNotes.filter(n => n.midiNote === -1).length,
            totalDuration: parsedNotes.length > 0 && parsedNotes[parsedNotes.length - 1]
                ? parsedNotes[parsedNotes.length - 1].absoluteTime + parsedNotes[parsedNotes.length - 1].duration * 60 / globalDefaults.bpm
                : 0,
            validation: validationResult
        });
        return parsedNotes;
    }
    catch (error) {
        logger.error('Failed to parse hybrid notation', { ...context, error });
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to parse hybrid notation: ${errorMessage}`);
    }
}
/**
 * Apply swing timing to parsed notes
 * Modifies the timing of eighth notes and shorter durations
 */
function applySwing(parsedNotes, swingAmount) {
    const context = {
        component: 'HybridParser',
        operation: 'applySwing',
        swingAmount,
        noteCount: parsedNotes.length
    };
    try {
        logger.debug('Applying swing timing', context);
        for (let i = 0; i < parsedNotes.length; i++) {
            const note = parsedNotes[i];
            if (!note)
                continue;
            // Apply swing to eighth notes and shorter
            if (note.duration <= 0.5) {
                const beatInMeasure = note.beatPosition % 1;
                // Apply swing to off-beats (2nd, 4th eighth note in each beat)
                if (beatInMeasure >= 0.5) {
                    const swingDelay = (note.duration * swingAmount * 0.5);
                    note.absoluteTime += swingDelay;
                }
            }
        }
        logger.debug('Swing timing applied successfully', context);
    }
    catch (error) {
        logger.error('Failed to apply swing timing', { ...context, error });
        // Don't throw - swing is an enhancement, not critical
    }
}
/**
 * Detect input format automatically
 */
export function detectInputFormat(input) {
    // If has "bpm" and "notes" as string with ":" = hybrid
    if (input.bpm && typeof input.notes === 'string' && input.notes.includes(':')) {
        return 'hybrid';
    }
    // If has "notes" as string with ":" but no bpm = treat as hybrid with default bpm
    if (typeof input.notes === 'string' && input.notes.includes(':')) {
        return 'hybrid';
    }
    // If has "rhythm" array = legacy
    if (input.rhythm && Array.isArray(input.rhythm)) {
        return 'legacy';
    }
    // If has "notes" as array = legacy
    if (Array.isArray(input.notes)) {
        return 'legacy';
    }
    // If has "tempo" instead of "bpm" = legacy
    if (input.tempo && !input.bpm) {
        return 'legacy';
    }
    // Default to legacy for safety (maintains compatibility)
    return 'legacy';
}
/**
 * Calculate total duration of parsed notes
 */
export function calculateTotalDuration(parsedNotes, bpm) {
    if (parsedNotes.length === 0)
        return 0;
    const lastNote = parsedNotes[parsedNotes.length - 1];
    if (!lastNote)
        return 0;
    const lastNoteEndTime = lastNote.absoluteTime + (lastNote.duration * 60 / bpm);
    return lastNoteEndTime;
}
/**
 * Apply audio effects to parsed notes
 */
export function applyEffects(parsedNotes, effects) {
    // Create deep copy to avoid mutating original
    const processedNotes = parsedNotes.map(note => ({ ...note }));
    // Apply transpose if specified and not already applied
    if (effects.transpose && effects.transpose !== 0) {
        for (const note of processedNotes) {
            note.midiNote = Math.max(0, Math.min(127, note.midiNote + effects.transpose));
        }
    }
    // Swing is applied during parsing, but could be re-applied here if needed
    // Reverb affects articulation (more reverb = more legato)
    if (effects.reverb && effects.reverb > 0) {
        for (const note of processedNotes) {
            note.articulation = Math.min(1.0, note.articulation + (effects.reverb * 0.2));
        }
    }
    return processedNotes;
}
// ========================
// MULTI-VOICE SUPPORT
// ========================
/**
 * Detects if input uses multi-voice format
 * @param input - input object to analyze
 * @returns true if multi-voice format detected
 */
export function isMultiVoiceInput(input) {
    return input && Array.isArray(input.voices) && input.voices.length > 0;
}
/**
 * Parses multi-voice notation with independent channels
 * @param multiVoiceInput - input with voices array
 * @returns array of voice results with parsed notes per channel
 */
export function parseMultiVoice(multiVoiceInput) {
    const context = {
        component: 'HybridParser',
        operation: 'parseMultiVoice',
        voiceCount: multiVoiceInput.voices.length
    };
    try {
        logger.info('Starting multi-voice parsing', context);
        const results = [];
        // Global defaults
        const globalDefaults = {
            bpm: multiVoiceInput.bpm,
            timeSignature: multiVoiceInput.timeSignature || '4/4',
            velocity: multiVoiceInput.velocity || 0.7,
            articulation: multiVoiceInput.articulation || 0.75,
            reverb: multiVoiceInput.reverb || 0.4,
            swing: multiVoiceInput.swing || 0,
            transpose: multiVoiceInput.transpose || 0
        };
        // Parse each voice independently
        for (const voice of multiVoiceInput.voices) {
            const voiceDefaults = {
                ...globalDefaults,
                velocity: voice.velocity || globalDefaults.velocity,
                articulation: voice.articulation || globalDefaults.articulation,
                transpose: (voice.transpose || 0) + globalDefaults.transpose
            };
            try {
                const parsedNotes = parseHybridNotation(voice.notes, voiceDefaults);
                const totalDuration = calculateTotalDuration(parsedNotes, voiceDefaults.bpm);
                results.push({
                    channel: voice.channel,
                    parsedNotes,
                    totalDuration
                });
                logger.debug('Voice parsed successfully', {
                    ...context,
                    channel: voice.channel,
                    noteCount: parsedNotes.length,
                    duration: totalDuration
                });
            }
            catch (error) {
                logger.error('Failed to parse voice', {
                    ...context,
                    channel: voice.channel,
                    error: error instanceof Error ? error.message : error
                });
                // Continue parsing other voices even if one fails
                results.push({
                    channel: voice.channel,
                    parsedNotes: [],
                    totalDuration: 0
                });
            }
        }
        logger.info('Multi-voice parsing completed', {
            ...context,
            successfulVoices: results.filter(r => r.parsedNotes.length > 0).length,
            totalChannels: results.length
        });
        return results;
    }
    catch (error) {
        logger.error('Failed to parse multi-voice input', { ...context, error });
        throw new Error(`Multi-voice parsing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Enhanced detection that supports both single-voice and multi-voice formats
 */
export function detectNotationFormat(input) {
    // Multi-voice format detection
    if (isMultiVoiceInput(input)) {
        return 'multi-voice';
    }
    // Existing single-voice detection
    if (input.bpm && typeof input.notes === 'string' && input.notes.includes(':')) {
        return 'hybrid';
    }
    if (typeof input.notes === 'string' && input.notes.includes(':')) {
        return 'hybrid';
    }
    if (input.rhythm && Array.isArray(input.rhythm)) {
        return 'legacy';
    }
    if (Array.isArray(input.notes)) {
        return 'legacy';
    }
    if (input.tempo && !input.bpm) {
        return 'legacy';
    }
    return 'legacy';
}
/**
 * Unified parsing function that handles both single-voice and multi-voice inputs
 */
export function parseUnifiedNotation(input) {
    const format = detectNotationFormat(input);
    switch (format) {
        case 'multi-voice':
            return parseMultiVoice(input);
        case 'hybrid':
            // Convert single-voice to multi-voice format
            const globalDefaults = {
                bpm: input.bpm || 120,
                timeSignature: input.timeSignature || '4/4',
                velocity: input.velocity || 0.7,
                articulation: input.articulation || 0.75,
                reverb: input.reverb || 0.4,
                swing: input.swing || 0,
                transpose: input.transpose || 0
            };
            const parsedNotes = parseHybridNotation(input.notes, globalDefaults);
            const totalDuration = calculateTotalDuration(parsedNotes, globalDefaults.bpm);
            return [{
                    channel: 1,
                    parsedNotes,
                    totalDuration
                }];
        case 'legacy':
        default:
            // For legacy format, return empty result or handle conversion
            logger.warn('Legacy format detected, limited support', { input });
            return [{
                    channel: 1,
                    parsedNotes: [],
                    totalDuration: 0
                }];
    }
}
//# sourceMappingURL=hybrid-notation-parser.js.map