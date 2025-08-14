#!/usr/bin/env tsx

/**
 * Initial Library Population Script
 * Populates the local SQLite database with classical repertoire
 */

import { HybridLibraryManager } from '../src/pilares/modulo-library/index.js';
import type { FullScore } from '../src/schemas/library-schemas.js';

const INITIAL_LIBRARY_DATA: FullScore[] = [
  // Bach - Well-Tempered Clavier Book 1
  {
    metadata: {
      id: 'bach_wtc1_prelude_01_c_major',
      title: 'Prelude No. 1 in C Major',
      composer: 'Johann Sebastian Bach',
      style: 'Prelude',
      composition_year: 1722,
      key_signature: 'C major',
      bpm: 80,
      time_signature: '4/4',
      difficulty: 4,
      duration_seconds: 120,
      voices_count: 1,
      instruments: ['piano'],
      tags: ['baroque', 'well-tempered-clavier', 'arpeggios'],
      preview_notes: 'C4:e E4:e G4:e C5:e E5:e G4:e C5:e E5:e',
      description: 'Famous opening prelude with flowing arpeggiated patterns'
    },
    maestro_format: {
      bpm: 80,
      timeSignature: '4/4',
      key: 'C major',
      notes: 'C4:e E4:e G4:e C5:e E5:e G4:e C5:e E5:e C4:e E4:e G4:e C5:e E5:e G4:e C5:e E5:e F4:e A4:e C5:e F5:e A5:e C5:e F5:e A5:e F4:e A4:e C5:e F5:e A5:e C5:e F5:e A5:e',
      velocity: 0.7,
      articulation: 0.9
    }
  },
  {
    metadata: {
      id: 'bach_wtc1_fugue_01_c_major',
      title: 'Fugue No. 1 in C Major',
      composer: 'Johann Sebastian Bach',
      style: 'Fugue',
      composition_year: 1722,
      key_signature: 'C major',
      bpm: 90,
      time_signature: '4/4',
      difficulty: 6,
      duration_seconds: 180,
      voices_count: 4,
      instruments: ['piano'],
      tags: ['baroque', 'well-tempered-clavier', 'counterpoint'],
      preview_notes: 'C4:q D4:q E4:e F4:e G4:q',
      description: 'Four-voice fugue with clear subject entries'
    },
    maestro_format: {
      bpm: 90,
      timeSignature: '4/4',
      key: 'C major',
      voices: [
        {
          channel: 1,
          notes: 'C4:q D4:q E4:e F4:e G4:q A4:q G4:h',
          velocity: 0.8
        },
        {
          channel: 2, 
          notes: 'R:h C5:q D5:q E5:e F5:e G5:q',
          velocity: 0.7
        }
      ]
    }
  },

  // Bach - Inventions
  {
    metadata: {
      id: 'bach_invention_01_c_major',
      title: 'Invention No. 1 in C Major',
      composer: 'Johann Sebastian Bach',
      style: 'Invention',
      composition_year: 1723,
      key_signature: 'C major',
      bpm: 100,
      time_signature: '4/4',
      difficulty: 3,
      duration_seconds: 90,
      voices_count: 2,
      instruments: ['piano'],
      tags: ['baroque', 'two-part', 'didactic'],
      preview_notes: 'C4:s D4:s E4:s F4:s G4:e A4:e',
      description: 'Pedagogical two-part invention with scalar passages'
    },
    maestro_format: {
      bpm: 100,
      timeSignature: '4/4',
      key: 'C major',
      voices: [
        {
          channel: 1,
          notes: 'C4:s D4:s E4:s F4:s G4:e A4:e G4:e F4:e E4:q',
          velocity: 0.8
        },
        {
          channel: 2,
          notes: 'R:e C5:s D5:s E5:s F5:s G5:e A5:e G5:e',
          velocity: 0.7
        }
      ]
    }
  },

  // Chopin - Nocturnes
  {
    metadata: {
      id: 'chopin_nocturne_op9_no2_eb_major',
      title: 'Nocturne in E♭ Major, Op. 9 No. 2',
      composer: 'Frédéric Chopin',
      style: 'Nocturne',
      composition_year: 1832,
      key_signature: 'E♭ major',
      bpm: 60,
      time_signature: '12/8',
      difficulty: 7,
      duration_seconds: 300,
      voices_count: 2,
      instruments: ['piano'],
      tags: ['romantic', 'lyrical', 'ornamental'],
      preview_notes: 'Eb4:q. G4:q Bb4:q Eb5:h.',
      description: 'Most famous nocturne with elaborate ornamental melody'
    },
    maestro_format: {
      bpm: 60,
      timeSignature: '12/8',
      key: 'E♭ major',
      voices: [
        {
          channel: 1,
          notes: 'Eb4:q. G4:q Bb4:q Eb5:h. D5:e Eb5:e F5:e',
          velocity: 0.6,
          articulation: 0.9
        },
        {
          channel: 2,
          notes: '[Eb2/Bb2/Eb3]:q. [Eb2/Bb2/Eb3]:q. [Eb2/Bb2/Eb3]:q.',
          velocity: 0.4,
          articulation: 0.8
        }
      ]
    }
  },

  // Chopin - Waltzes
  {
    metadata: {
      id: 'chopin_waltz_op64_no2_c_sharp_minor',
      title: 'Waltz in C# Minor, Op. 64 No. 2',
      composer: 'Frédéric Chopin',
      style: 'Waltz',
      composition_year: 1847,
      key_signature: 'C# minor',
      bpm: 120,
      time_signature: '3/4',
      difficulty: 6,
      duration_seconds: 240,
      voices_count: 2,
      instruments: ['piano'],
      tags: ['romantic', 'dance', 'melancholic'],
      preview_notes: 'C#5:q E5:q G#5:q',
      description: 'Melancholic waltz with flowing melodic lines'
    },
    maestro_format: {
      bpm: 120,
      timeSignature: '3/4',
      key: 'C# minor',
      voices: [
        {
          channel: 1,
          notes: 'C#5:q E5:q G#5:q A5:q G#5:q F#5:q',
          velocity: 0.7
        },
        {
          channel: 2,
          notes: '[C#3]:q [G#3/C#4]:q [G#3/C#4]:q [C#3]:q [G#3/C#4]:q [G#3/C#4]:q',
          velocity: 0.5
        }
      ]
    }
  },

  // Jazz Standards
  {
    metadata: {
      id: 'jazz_autumn_leaves',
      title: 'Autumn Leaves',
      composer: 'Joseph Kosma',
      style: 'Jazz Standard',
      composition_year: 1945,
      key_signature: 'G minor',
      bpm: 120,
      time_signature: '4/4',
      difficulty: 5,
      duration_seconds: 200,
      voices_count: 3,
      instruments: ['piano', 'bass', 'drums'],
      tags: ['jazz', 'standard', 'ballad'],
      preview_notes: 'Bb4:q C5:q D5:q G5:h',
      description: 'Classic jazz ballad with rich harmonic progressions'
    },
    maestro_format: {
      bpm: 120,
      timeSignature: '4/4',
      key: 'G minor',
      voices: [
        {
          channel: 1,
          notes: 'Bb4:q C5:q D5:q G5:h F5:q Eb5:q',
          velocity: 0.8
        },
        {
          channel: 2,
          notes: '[Gm]:q [C7]:q [F]:q [Bb]:q [Eb]:q [Am7b5]:q',
          velocity: 0.6
        },
        {
          channel: 10,
          notes: 'C2:q R:e C2:e R:q C2:q R:e C2:e',
          velocity: 0.7
        }
      ]
    }
  },

  // Classical Patterns
  {
    metadata: {
      id: 'pattern_alberti_bass_c_major',
      title: 'Alberti Bass Pattern - C Major',
      composer: 'Classical Pattern',
      style: 'Accompaniment Pattern',
      composition_year: 1750,
      key_signature: 'C major',
      bpm: 120,
      time_signature: '4/4',
      difficulty: 2,
      duration_seconds: 16,
      voices_count: 1,
      instruments: ['piano'],
      tags: ['classical', 'pattern', 'accompaniment', 'alberti-bass'],
      preview_notes: 'C3:s E3:s G3:s E3:s',
      description: 'Classic broken chord accompaniment pattern'
    },
    maestro_format: {
      bpm: 120,
      timeSignature: '4/4',
      key: 'C major',
      notes: 'C3:s E3:s G3:s E3:s C3:s E3:s G3:s E3:s C3:s E3:s G3:s E3:s C3:s E3:s G3:s E3:s',
      velocity: 0.5,
      articulation: 0.8
    }
  },

  {
    metadata: {
      id: 'pattern_walking_bass_c_major',
      title: 'Walking Bass Pattern - C Major',
      composer: 'Jazz Pattern',
      style: 'Bass Pattern',
      composition_year: 1940,
      key_signature: 'C major',
      bpm: 120,
      time_signature: '4/4',
      difficulty: 3,
      duration_seconds: 8,
      voices_count: 1,
      instruments: ['bass'],
      tags: ['jazz', 'pattern', 'bass', 'walking'],
      preview_notes: 'C2:q D2:q E2:q F2:q',
      description: 'Classic jazz walking bass line pattern'
    },
    maestro_format: {
      bpm: 120,
      timeSignature: '4/4',
      key: 'C major',
      notes: 'C2:q D2:q E2:q F2:q G2:q A2:q B2:q C3:q',
      velocity: 0.7,
      articulation: 0.8
    }
  }
];

async function populateLibrary() {
  console.log('🎼 Starting library population...');
  
  const libraryManager = new HybridLibraryManager();
  
  try {
    let addedCount = 0;
    
    for (const score of INITIAL_LIBRARY_DATA) {
      try {
        await libraryManager.addScore(score);
        console.log(`✅ Added: ${score.metadata.composer} - ${score.metadata.title}`);
        addedCount++;
      } catch (error) {
        console.warn(`⚠️ Failed to add ${score.metadata.title}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    console.log(`\n🎉 Library population completed!`);
    console.log(`📚 Added ${addedCount}/${INITIAL_LIBRARY_DATA.length} scores`);
    
    const stats = await libraryManager.getStatistics();
    console.log(`📊 Library Statistics:`);
    console.log(`   - Total scores: ${stats.total}`);
    console.log(`   - Composers: ${stats.composers}`);
    console.log(`   - Styles: ${stats.styles}`);
    
  } catch (error) {
    console.error('❌ Library population failed:', error);
    process.exit(1);
  } finally {
    libraryManager.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  populateLibrary();
}