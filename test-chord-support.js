#!/usr/bin/env node

/**
 * Test chord support in hybrid notation parser
 */

const { parseHybridNotation, detectInputFormat } = await import('./dist/utils/hybrid-notation-parser.js');

console.log('🎼 Testing chord support in hybrid notation...\n');

const testCases = [
  {
    name: 'Manual Chord',
    input: '[C3 E3 G3]:q@0.8.leg',
    description: 'Manual chord specification with duration and articulation'
  },
  {
    name: 'Named Chord - Major',
    input: '[C]:h@0.9',
    description: 'Named major chord'
  },
  {
    name: 'Named Chord - Minor',
    input: '[Am]:q@0.7.stac',
    description: 'Named minor chord with staccato'
  },
  {
    name: 'Named Chord - 7th',
    input: '[Cmaj7]:w@0.8',
    description: 'Named 7th chord'
  },
  {
    name: 'Chord Progression',
    input: '[C]:q [Am]:q [F]:q [G]:q',
    description: 'Simple chord progression'
  },
  {
    name: 'Mixed Chord and Melody',
    input: '[C]:h C4:q@0.9.leg E4:q@0.8',
    description: 'Chord followed by melody notes'
  },
  {
    name: 'Complex Example',
    input: '[Cmaj7]:h@0.8.leg [Am7]:h@0.7 | [F]:q [G7]:q [C]:h@0.9',
    description: 'Complex progression with measures'
  }
];

const globalDefaults = {
  bpm: 120,
  velocity: 0.8,
  articulation: 0.8,
  timeSignature: "4/4"
};

for (const testCase of testCases) {
  console.log(`📝 ${testCase.name}: ${testCase.description}`);
  console.log(`   Input: "${testCase.input}"`);
  
  try {
    const format = detectInputFormat({ notes: testCase.input });
    console.log(`   Format detected: ${format}`);
    
    const result = parseHybridNotation(testCase.input, globalDefaults);
    console.log(`   ✅ Parsed ${result.length} note(s)/chord(s):`);
    
    result.forEach((note, i) => {
      if (note.isChord) {
        console.log(`      ${i+1}. CHORD: ${note.chordNotes?.join(', ')} - dur:${note.duration}b vel:${note.velocity} art:${note.articulation}`);
        console.log(`         MIDI: [${note.chordMidiNotes?.join(', ')}]`);
      } else {
        console.log(`      ${i+1}. NOTE: ${note.note} - dur:${note.duration}b vel:${note.velocity} art:${note.articulation}`);
      }
    });
    
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }
  
  console.log('');
}

console.log('🎯 Testing specific chord types...');

const chordTypes = ['C', 'Am', 'F7', 'Gmaj7', 'Dm7', 'B7'];
for (const chord of chordTypes) {
  try {
    const result = parseHybridNotation(`[${chord}]:q`, globalDefaults);
    const parsedChord = result[0];
    if (parsedChord.isChord) {
      console.log(`✅ ${chord}: ${parsedChord.chordNotes?.join(', ')}`);
    }
  } catch (error) {
    console.log(`❌ ${chord}: ${error.message}`);
  }
}

console.log('\n📊 Chord Support Summary:');
console.log('- Manual chords: [C3 E3 G3]:q@0.8');
console.log('- Named chords: [Cmaj7]:h@0.9.leg');
console.log('- Chord progressions: [C]:q [Am]:q [F]:q [G]:q');
console.log('- Mixed content: [C]:h C4:q E4:q');
console.log('- All articulations supported on chords');