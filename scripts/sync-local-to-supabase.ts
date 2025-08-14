#!/usr/bin/env tsx

/**
 * Sync Local Library to Supabase
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { HybridLibraryManager } from '../src/pilares/modulo-library/index.js';

async function syncLocalToSupabase() {
  console.log('🔄 Syncing local library to Supabase...');
  
  const supabaseUrl = process.env['SUPABASE_URL'];
  const supabaseKey = process.env['SUPABASE_ANON_KEY'];
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const libraryManager = new HybridLibraryManager();
    
    // Get all local scores
    console.log('📚 Reading local library...');
    const localScores = await libraryManager.search({ limit: 1000 });
    
    console.log(`📊 Found ${localScores.length} local scores`);
    
    let uploaded = 0;
    let errors = 0;
    
    for (const result of localScores) {
      try {
        const score = result.score;
        const maestroFormat = await libraryManager.getScore(score.id);
        
        if (!maestroFormat) {
          console.warn(`⚠️ No maestro format for ${score.id}`);
          continue;
        }
        
        // Prepare data for Supabase
        const supabaseScore = {
          id: score.id,
          title: score.title,
          composer: score.composer,
          style: score.style,
          composition_year: score.composition_year,
          key_signature: score.key_signature,
          bpm: score.bpm,
          time_signature: score.time_signature,
          difficulty: score.difficulty,
          duration_seconds: score.duration_seconds,
          voices_count: score.voices_count,
          instruments: score.instruments || [],
          tags: score.tags || [],
          maestro_format: maestroFormat,
          preview_notes: score.preview_notes,
          description: score.description,
          is_public: true
        };
        
        // Upload to Supabase
        const { error } = await supabase
          .from('music_scores')
          .upsert(supabaseScore, { onConflict: 'id' });
        
        if (error) {
          console.error(`❌ Failed to upload ${score.title}:`, error.message);
          errors++;
        } else {
          console.log(`✅ Uploaded: ${score.composer} - ${score.title}`);
          uploaded++;
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${result.score.title}:`, error);
        errors++;
      }
    }
    
    console.log(`\n🎉 Sync completed!`);
    console.log(`   ✅ Uploaded: ${uploaded} scores`);
    console.log(`   ❌ Errors: ${errors} scores`);
    
    libraryManager.close();
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

// Run sync
syncLocalToSupabase();