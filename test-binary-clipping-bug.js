#!/usr/bin/env node

/**
 * Test script to reproduce the binary clipping bug
 * Problem: F5:q@0.01.leg should return velocity 0.3, not 0
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testBinaryClippingBug() {
  console.log('🐛 Testing Binary Clipping Bug\n');

  try {
    // Import the parser
    const { parseHybridNotation } = await import('./dist/utils/hybrid-notation-parser.js');

    console.log('✅ Successfully imported parser\n');

    const globalDefaults = {
      bpm: 120,
      velocity: 0.7,
      articulation: 0.75,
      timeSignature: '4/4',
      swing: 0,
      reverb: 0.4,
      transpose: 0
    };

    // The EXACT problematic case reported
    console.log('🎯 Testing the EXACT problematic case:');
    const problemInput = "F5:q@0.01.leg G5:q@5.0.stac A5:q@0.05.ten";
    console.log(`Input: "${problemInput}"`);
    console.log('Expected: velocity: 0.3 (pp), velocity: 1.0 (ff), velocity: 0.3 (pp)');
    console.log('Bug: velocity: 0, velocity: 1, velocity: 0\n');

    const result = parseHybridNotation(problemInput, globalDefaults);
    const actualNotes = result.filter(note => note.midiNote !== -1);
    
    console.log('📊 ACTUAL RESULTS:');
    actualNotes.forEach((note, i) => {
      const expectedVel = i === 1 ? 1.0 : 0.3; // Middle note should be 1.0, others 0.3
      const isCorrect = note.velocity === expectedVel;
      const status = isCorrect ? '✅' : '❌';
      
      console.log(`   ${i + 1}. ${note.note}: velocity = ${note.velocity} ${status}`);
      if (!isCorrect) {
        console.log(`      Expected: ${expectedVel} | Got: ${note.velocity}`);
        if (note.velocity === 0) {
          console.log(`      🐛 BUG CONFIRMED: Binary clipping to 0 (inaudible)`);
        }
      }
    });

    // Check if bug is present
    const hasBinaryClipping = actualNotes.some(note => note.velocity === 0);
    const hasCorrectMinimum = actualNotes.every(note => note.velocity >= 0.3);

    console.log('\n🔍 BUG ANALYSIS:');
    if (hasBinaryClipping) {
      console.log('❌ BUG CONFIRMED: Binary clipping to 0 detected');
      console.log('   Impact: Creates inaudible notes (liga/desliga effect)');
    } else {
      console.log('✅ NO BINARY CLIPPING: All velocities > 0');
    }

    if (hasCorrectMinimum) {
      console.log('✅ MUSICAL MINIMUM: All velocities >= 0.3 (pianissimo)');
    } else {
      console.log('❌ BELOW MUSICAL MINIMUM: Some velocities < 0.3');
      console.log('   Problem: Values below pianissimo level are not musical');
    }

    // Test additional edge cases
    console.log('\n🧪 Testing Additional Edge Cases:');
    
    const edgeCases = [
      { input: "C5:q@0.0.leg", expected: 0.3, name: "Zero velocity" },
      { input: "C5:q@0.001.leg", expected: 0.3, name: "Extremely low" },
      { input: "C5:q@0.05.leg", expected: 0.3, name: "Very quiet" },
      { input: "C5:q@10.0.leg", expected: 1.0, name: "Extremely high" }
    ];

    let edgeCaseFailures = 0;
    
    for (const testCase of edgeCases) {
      try {
        const edgeResult = parseHybridNotation(testCase.input, globalDefaults);
        const edgeNote = edgeResult.find(note => note.midiNote !== -1);
        
        if (edgeNote) {
          const isCorrect = edgeNote.velocity === testCase.expected;
          const status = isCorrect ? '✅' : '❌';
          console.log(`   ${testCase.name}: ${edgeNote.velocity} ${status}`);
          
          if (!isCorrect) {
            edgeCaseFailures++;
            console.log(`     Expected: ${testCase.expected} | Got: ${edgeNote.velocity}`);
          }
        }
      } catch (error) {
        console.log(`   ${testCase.name}: ERROR - ${error.message}`);
        edgeCaseFailures++;
      }
    }

    console.log('\n📋 SUMMARY:');
    console.log(`Main Bug Test: ${hasBinaryClipping ? '❌ FAILED' : '✅ PASSED'}`);
    console.log(`Musical Minimum: ${hasCorrectMinimum ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Edge Cases: ${edgeCaseFailures === 0 ? '✅ ALL PASSED' : `❌ ${edgeCaseFailures} FAILED`}`);

    if (hasBinaryClipping || !hasCorrectMinimum || edgeCaseFailures > 0) {
      console.log('\n🔧 FIXES NEEDED:');
      console.log('1. Replace binary clipping (0.1-1.0) with musical normalization (0.3-1.0)');
      console.log('2. Ensure minimum velocity is 0.3 (pianissimo) not 0 (inaudible)');
      console.log('3. Add educational logging for normalized dynamics');
      console.log('4. Maintain maximum at 1.0 (fortissimo)');
    } else {
      console.log('\n🎉 ALL TESTS PASSED: Binary clipping bug has been fixed!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testBinaryClippingBug().catch(console.error);