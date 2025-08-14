#!/usr/bin/env tsx

/**
 * Direct Supabase Test - Raw Query
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function directTest() {
  console.log('🔍 Direct Supabase test...');
  
  const supabaseUrl = process.env['SUPABASE_URL'];
  const supabaseKey = process.env['SUPABASE_ANON_KEY'];
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing credentials');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('📋 Testing direct SELECT...');
    
    // Try raw select
    const { data, error } = await supabase
      .from('music_scores')
      .select('id, title, composer')
      .limit(10);
    
    if (error) {
      console.error('❌ SELECT failed:', error.message);
      console.log('\n🛠️  Add this policy in Supabase:');
      console.log(`
CREATE POLICY "Allow all selects for anon key"
ON public.music_scores
FOR SELECT
TO anon
USING (true);
      `);
      return;
    }
    
    console.log('✅ SELECT successful!');
    console.log(`📊 Found ${data?.length || 0} scores`);
    
    if (data && data.length > 0) {
      console.log('\n🎼 Scores in Supabase:');
      data.forEach((score, i) => {
        console.log(`  ${i + 1}. ${score.composer}: ${score.title}`);
      });
      
      console.log('\n🎉 SUPABASE LIBRARY IS WORKING! 🎉');
      console.log('\nYou can now use:');
      console.log('- maestro_search_library (searches both local + online)');
      console.log('- maestro_midi_play_from_library (plays from both sources)');
      
    } else {
      console.log('📭 No scores found (but connection works)');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

directTest();