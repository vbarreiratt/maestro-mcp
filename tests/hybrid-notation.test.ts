/**
 * Tests for Hybrid Musical Notation Parser
 * Validates parsing, format detection, and compatibility
 */

import { test, expect, describe } from 'vitest';
import { 
  parseHybridNotation, 
  detectInputFormat, 
  calculateTotalDuration,
  applyEffects,
  type GlobalDefaults 
} from '../src/utils/hybrid-notation-parser.js';

// Global test defaults
const globalDefaults: GlobalDefaults = {
  bpm: 120,
  velocity: 0.8,
  articulation: 0.8,
  timeSignature: '4/4',
  swing: 0.0,
  reverb: 0.4,
  transpose: 0
};

describe('Hybrid Musical Notation Parser', () => {

  test('should parse simple hybrid notation', () => {
    const notes = "C4:q D4:e E4:h";
    const parsed = parseHybridNotation(notes, globalDefaults);
    
    expect(parsed).toHaveLength(3);
    expect(parsed[0]).toMatchObject({
      note: 'C4',
      duration: 1.0,
      velocity: 0.8,
      articulation: 0.8
    });
    expect(parsed[1]).toMatchObject({
      note: 'D4', 
      duration: 0.5
    });
    expect(parsed[2]).toMatchObject({
      note: 'E4',
      duration: 2.0
    });
  });

  test('should parse hybrid notation with velocity', () => {
    const notes = "C4:q@0.9 D4:e@0.5";
    const parsed = parseHybridNotation(notes, globalDefaults);
    
    expect(parsed[0].velocity).toBe(0.9);
    expect(parsed[1].velocity).toBe(0.5);
  });

  test('should parse hybrid notation with articulation', () => {
    const notes = "C4:q.leg D4:e.stac E4:h.accent";
    const parsed = parseHybridNotation(notes, globalDefaults);
    
    expect(parsed[0].articulation).toBe(1.0); // legato
    expect(parsed[1].articulation).toBe(0.0); // staccato
    expect(parsed[2].velocity).toBeGreaterThan(globalDefaults.velocity); // accent boosts velocity
  });

  test('should parse complex hybrid notation', () => {
    const notes = "A4:q@0.7.leg B4:e@0.8 A4:e@0.9.stac | G4:h@0.85.leg F#4:h@0.8";
    const parsed = parseHybridNotation(notes, globalDefaults);
    
    expect(parsed).toHaveLength(5);
    
    // First measure
    expect(parsed[0]).toMatchObject({
      note: 'A4',
      duration: 1.0,
      velocity: 0.7,
      articulation: 1.0,
      measureIndex: 0
    });
    
    // Second measure (after |)
    expect(parsed[3].measureIndex).toBe(1);
    expect(parsed[4].note).toBe('F#4');
  });

  test('should handle measures correctly', () => {
    const notes = "C4:q D4:q | E4:h F4:q | G4:w";
    const parsed = parseHybridNotation(notes, globalDefaults);
    
    expect(parsed[0].measureIndex).toBe(0);
    expect(parsed[1].measureIndex).toBe(0);
    expect(parsed[2].measureIndex).toBe(1);
    expect(parsed[3].measureIndex).toBe(1);  
    expect(parsed[4].measureIndex).toBe(2);
  });

  test('should calculate absolute timing correctly', () => {
    const notes = "C4:q D4:q E4:q F4:q"; // 4 quarter notes
    const parsed = parseHybridNotation(notes, globalDefaults);
    
    const beatsPerSecond = 120 / 60; // 2 beats per second
    
    expect(parsed[0].absoluteTime).toBe(0);
    expect(parsed[1].absoluteTime).toBe(1 / beatsPerSecond); // 0.5s
    expect(parsed[2].absoluteTime).toBe(2 / beatsPerSecond); // 1.0s
    expect(parsed[3].absoluteTime).toBe(3 / beatsPerSecond); // 1.5s
  });
});

describe('Format Detection', () => {
  test('should detect hybrid format', () => {
    const hybridInput = {
      bpm: 120,
      notes: "C4:q D4:e"
    };
    
    expect(detectInputFormat(hybridInput)).toBe('hybrid');
  });

  test('should detect legacy format with rhythm array', () => {
    const legacyInput = {
      notes: "C4 D4 E4",
      rhythm: ["quarter", "eighth", "half"],
      tempo: 120
    };
    
    expect(detectInputFormat(legacyInput)).toBe('legacy');
  });

  test('should detect legacy format with tempo field', () => {
    const legacyInput = {
      notes: "C4 D4 E4",
      tempo: 120
    };
    
    expect(detectInputFormat(legacyInput)).toBe('legacy');
  });

  test('should detect legacy format with notes array', () => {
    const legacyInput = {
      notes: ["C4", "D4", "E4"]
    };
    
    expect(detectInputFormat(legacyInput)).toBe('legacy');
  });
});

describe('Duration Calculation', () => {
  test('should calculate total duration correctly', () => {
    const notes = "C4:q D4:q E4:q F4:q"; // 4 quarter notes = 4 beats
    const parsed = parseHybridNotation(notes, globalDefaults);
    
    const totalDuration = calculateTotalDuration(parsed, 120);
    expect(totalDuration).toBe(2.0); // 4 beats at 120 BPM = 2 seconds
  });

  test('should handle empty notes array', () => {
    const totalDuration = calculateTotalDuration([], 120);
    expect(totalDuration).toBe(0);
  });
});

describe('Effects Application', () => {
  test('should apply transpose effect', () => {
    const notes = "C4:q D4:q";
    const parsed = parseHybridNotation(notes, globalDefaults);
    
    const transposed = applyEffects(parsed, { transpose: 2 });
    
    expect(transposed[0].midiNote).toBe(62); // C4 (60) + 2 = D4 (62)
    expect(transposed[1].midiNote).toBe(64); // D4 (62) + 2 = E4 (64)
  });

  test('should apply reverb effect to articulation', () => {
    const notes = "C4:q D4:q";
    const parsed = parseHybridNotation(notes, globalDefaults);
    
    const withReverb = applyEffects(parsed, { reverb: 0.8 });
    
    // High reverb should increase articulation (more legato)
    expect(withReverb[0].articulation).toBeGreaterThan(globalDefaults.articulation);
  });

  test('should not mutate original notes', () => {
    const notes = "C4:q D4:q";
    const parsed = parseHybridNotation(notes, globalDefaults);
    const originalMidiNote = parsed[0].midiNote;
    
    applyEffects(parsed, { transpose: 5 });
    
    // Original should be unchanged
    expect(parsed[0].midiNote).toBe(originalMidiNote);
  });
});

describe('Error Handling', () => {
  test('should handle invalid note names gracefully', () => {
    const notes = "H4:q C4:q"; // H is not valid, should be B
    
    expect(() => {
      parseHybridNotation(notes, globalDefaults);
    }).toThrow();
  });

  test('should handle invalid duration codes', () => {
    const notes = "C4:x D4:q"; // x is not a valid duration
    const parsed = parseHybridNotation(notes, globalDefaults);
    
    // Should continue parsing valid notes
    expect(parsed).toHaveLength(1);
    expect(parsed[0].note).toBe('D4');
  });

  test('should handle empty notes string', () => {
    const notes = "";
    const parsed = parseHybridNotation(notes, globalDefaults);
    
    expect(parsed).toHaveLength(0);
  });

  test('should handle malformed hybrid notation', () => {
    const notes = "C4: D4:q:extra";
    const parsed = parseHybridNotation(notes, globalDefaults);
    
    // Should parse what it can
    expect(parsed.length).toBeGreaterThan(0);
  });
});

describe('Compatibility Tests', () => {
  test('should maintain timing precision', () => {
    const notes = "C4:s C4:s C4:s C4:s"; // 4 sixteenth notes
    const parsed = parseHybridNotation(notes, { ...globalDefaults, bpm: 120 });
    
    // Each sixteenth note should be 0.25 beats = 0.125 seconds at 120 BPM
    const expectedGap = 0.25 * (60 / 120); // 0.125s
    
    expect(parsed[1].absoluteTime - parsed[0].absoluteTime).toBeCloseTo(expectedGap, 4);
    expect(parsed[2].absoluteTime - parsed[1].absoluteTime).toBeCloseTo(expectedGap, 4);
  });

  test('should handle extreme BPM values', () => {
    const notes = "C4:q";
    const fastBpm = { ...globalDefaults, bpm: 200 };
    const slowBpm = { ...globalDefaults, bpm: 60 };
    
    const fastParsed = parseHybridNotation(notes, fastBpm);
    const slowParsed = parseHybridNotation(notes, slowBpm);
    
    expect(fastParsed[0].duration).toBe(1.0); // Duration in beats should be same
    expect(slowParsed[0].duration).toBe(1.0);
  });
});
