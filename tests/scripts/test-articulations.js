#!/usr/bin/env node

/**
 * Test all articulation types to verify they work correctly
 */

const { parseHybridNotation } = await import('./dist/utils/hybrid-notation-parser.js');

console.log('🎼 Testing all articulation types...\n');

const testCases = [
  { name: 'Legato', note: 'C4:q@0.8.leg', expected: { articulation: 1.0, velocity: 0.8 } },
  { name: 'Staccato', note: 'C4:q@0.8.stac', expected: { articulation: 0.0, velocity: 0.8 } },
  { name: 'Tenuto', note: 'C4:q@0.8.ten', expected: { articulation: 0.9, velocity: 0.8 } },
  { name: 'Accent', note: 'C4:q@0.8.accent', expected: { articulation: 0.8, velocity: 1.0 } }, // velocity boosted
  { name: 'Ghost Note', note: 'C4:q@0.8.ghost', expected: { articulation: 0.8, velocity: 0.5 } }, // velocity reduced
  { name: 'No Articulation', note: 'C4:q@0.8', expected: { articulation: 0.8, velocity: 0.8 } }, // global defaults
];

const globalDefaults = {
  bpm: 120,
  velocity: 0.8,
  articulation: 0.8,
  timeSignature: "4/4"
};

for (const testCase of testCases) {
  try {
    console.log(`📝 Testing: ${testCase.name}`);
    console.log(`   Input: "${testCase.note}"`);
    
    const result = parseHybridNotation(testCase.note, globalDefaults);
    const parsedNote = result[0]; // First note
    
    console.log(`   Parsed: vel=${parsedNote.velocity} art=${parsedNote.articulation}`);
    console.log(`   Expected: vel=${testCase.expected.velocity} art=${testCase.expected.articulation}`);
    
    // Check if values match (with small tolerance for floating point)
    const velMatch = Math.abs(parsedNote.velocity - testCase.expected.velocity) < 0.01;
    const artMatch = Math.abs(parsedNote.articulation - testCase.expected.articulation) < 0.01;
    
    if (velMatch && artMatch) {
      console.log(`   ✅ ${testCase.name}: PASSED\n`);
    } else {
      console.log(`   ❌ ${testCase.name}: FAILED`);
      console.log(`      Velocity mismatch: ${parsedNote.velocity} vs ${testCase.expected.velocity}`);
      console.log(`      Articulation mismatch: ${parsedNote.articulation} vs ${testCase.expected.articulation}\n`);
    }
    
  } catch (error) {
    console.log(`   ❌ ${testCase.name}: ERROR - ${error.message}\n`);
  }
}

// Test complex example with multiple articulations
console.log('🎭 Testing mixed articulations in sequence...');
const mixedNotes = 'C4:q.leg D4:e.stac E4:e.ten F4:q.accent G4:h.ghost';
try {
  const result = parseHybridNotation(mixedNotes, globalDefaults);
  console.log('📊 Mixed articulation results:');
  result.forEach((note, i) => {
    console.log(`   ${i+1}. ${note.note} - vel:${note.velocity} art:${note.articulation}`);
  });
  console.log('✅ Mixed articulations: PASSED\n');
} catch (error) {
  console.log(`❌ Mixed articulations: ERROR - ${error.message}\n`);
}

console.log('📋 Articulation Support Summary:');
console.log('- .leg (Legato): Testing...');
console.log('- .stac (Staccato): Testing...');  
console.log('- .ten (Tenuto): Testing...');
console.log('- .accent (Accent): Testing...');
console.log('- .ghost (Ghost): Testing...');
console.log('- Mixed sequences: Testing...');