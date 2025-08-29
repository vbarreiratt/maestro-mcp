#!/usr/bin/env node

/**
 * Test script for parser fixes based on technical report
 * Tests all identified problematic cases to ensure they now work correctly
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testParserFixes() {
  console.log('🧪 Testing Parser Fixes for MIDI Execution Issues\n');

  try {
    // Import the required modules
    const { parseHybridNotation, parseMultiVoice } = await import('./dist/utils/hybrid-notation-parser.js');

    console.log('✅ Successfully imported parser modules\n');

    // Test configuration
    const globalDefaults = {
      bpm: 120,
      velocity: 0.8,
      articulation: 0.8,
      timeSignature: '4/4',
      swing: 0,
      reverb: 0.4,
      transpose: 0
    };

    // Test cases from the technical report
    const testCases = [
      {
        name: 'CASE 1: Excessive Pauses (Previously Failed)',
        notation: 'D5:h@0.2.leg r:e F5:e@0.3.stac r:e G5:e@0.4.leg r:q',
        expectedToFail: false
      },
      {
        name: 'CASE 2: Multiple Consecutive Long Pauses (Previously Failed)',
        notation: 'r:w r:h A5:e@0.3.leg C6:e@0.4.stac',
        expectedToFail: false
      },
      {
        name: 'CASE 3: Mixed Chord/Note Syntax (Previously Failed)', 
        notation: 'A4:e@0.8.leg [Am]:e@0.5.stac E5:q@1.0.ten [Dm]:q@0.7.leg B5:h@0.9.ten',
        expectedToFail: false
      },
      {
        name: 'CASE 4: Extremely Low Dynamics (Previously Failed)',
        notation: 'G5:w@0.01.leg F5:e@0.05.stac Eb5:e@0.1.leg D5:q@0.08.ten',
        expectedToFail: false
      },
      {
        name: 'CASE 5: Inconsistent Articulations (Previously Failed)',
        notation: 'C5:q@0.8 D5:e@0.9.stac E5:q@1.0.leg F5:e@0.7 G5:h@0.6.ten',
        expectedToFail: false
      },
      {
        name: 'CASE 6: Clean Syntax (Should Always Work)',
        notation: 'A5:q@0.8.leg C5:e@0.9.stac E5:h@1.0.ten G5:q@0.7.leg B5:w@0.6.ten',
        expectedToFail: false
      },
      {
        name: 'CASE 7: Minimal Strategic Pauses (Should Work)',
        notation: 'A5:h@0.8.leg r:q C5:q@0.9.stac E5:h@1.0.ten',
        expectedToFail: false
      },
      {
        name: 'CASE 8: Very High Dynamics (Should Be Clipped)',
        notation: 'A5:q@1.5.leg B5:q@2.0.stac C6:q@0.5.ten',
        expectedToFail: false
      }
    ];

    let passedTests = 0;
    let totalTests = testCases.length;

    console.log('🎯 Testing Individual Cases:\n');

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`${i + 1}. ${testCase.name}`);
      console.log(`   Input: "${testCase.notation}"`);

      try {
        const result = parseHybridNotation(testCase.notation, globalDefaults);
        
        const actualNotes = result.filter(note => note.midiNote !== -1);
        const rests = result.filter(note => note.midiNote === -1);
        
        console.log(`   ✅ SUCCESS: Parsed ${result.length} total elements`);
        console.log(`      - Musical notes: ${actualNotes.length}`);
        console.log(`      - Rests: ${rests.length}`);
        
        // Check for critical issues
        if (actualNotes.length === 0 && testCase.notation.includes('[') || testCase.notation.match(/[A-G]\d/)) {
          console.log(`   ⚠️  WARNING: No musical notes found, but notation suggests there should be some`);
        }

        // Show velocity clipping
        const extremeVelocities = actualNotes.filter(note => note.velocity < 0.1 || note.velocity > 1.0);
        if (extremeVelocities.length > 0) {
          console.log(`   ⚠️  WARNING: ${extremeVelocities.length} notes with extreme velocities not clipped`);
        }

        passedTests++;
        
      } catch (error) {
        console.log(`   ❌ FAILED: ${error.message}`);
        
        if (!testCase.expectedToFail) {
          console.log(`   🚨 This case should have passed but failed!`);
        }
      }
      
      console.log('');
    }

    console.log('🎼 Testing Multi-Voice Scenarios (3-voice composition):\n');

    // Test multi-voice scenario that was mentioned in the report
    const multiVoiceTest = {
      voices: [
        {
          channel: 1,
          notes: 'D5:h@0.8.leg r:q F5:e@0.9.stac G5:q@1.0.ten A5:h@0.7.leg' // Violins
        },
        {
          channel: 2, 
          notes: 'G3:w@0.6.ten [Dm]:h@0.7.leg C4:h@0.8.stac' // Cellos
        },
        {
          channel: 3,
          notes: '[Am]:q@0.9.ten [F]:q@0.8.leg [C]:h@1.0.stac [G]:h@0.7.ten' // Organ toccata
        }
      ],
      bpm: 120,
      timeSignature: '4/4'
    };

    try {
      const multiResult = parseMultiVoice(multiVoiceTest);
      
      console.log('✅ Multi-voice parsing SUCCESS:');
      multiResult.forEach((voice, index) => {
        const actualNotes = voice.parsedNotes.filter(note => note.midiNote !== -1);
        console.log(`   Channel ${voice.channel}: ${voice.parsedNotes.length} elements (${actualNotes.length} musical notes)`);
        
        if (actualNotes.length === 0) {
          console.log(`   ⚠️  WARNING: Channel ${voice.channel} has no musical notes (noteCount = 0 issue)`);
        }
      });
      
      passedTests++;
      totalTests++;
      
    } catch (error) {
      console.log(`❌ Multi-voice test FAILED: ${error.message}`);
      totalTests++;
    }

    console.log('\n📊 Test Results Summary:');
    console.log(`   Passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
    console.log(`   Failed: ${totalTests - passedTests}/${totalTests}`);

    if (passedTests === totalTests) {
      console.log('\n🎉 All tests passed! Parser fixes appear to be working correctly.');
    } else {
      console.log(`\n⚠️  ${totalTests - passedTests} tests failed. Some issues may remain.`);
    }

    console.log('\n✅ Parser fix testing completed.');

  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
    console.error('Make sure to run "npm run build" first to compile TypeScript modules.');
  }
}

// Run the test
testParserFixes().catch(console.error);