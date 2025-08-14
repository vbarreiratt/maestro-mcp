#!/usr/bin/env tsx

/**
 * Test Supabase Connection and Setup
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase connection...');
  
  const supabaseUrl = process.env['SUPABASE_URL'];
  const supabaseKey = process.env['SUPABASE_ANON_KEY'];
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    return;
  }
  
  console.log(`📡 Connecting to: ${supabaseUrl}`);
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic connection
    console.log('⏳ Testing connection...');
    const { data, error } = await supabase.from('music_scores').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      
      if (error.message.includes('relation "music_scores" does not exist')) {
        console.log('\n🛠️  Table does not exist. Need to create it!');
        console.log('\n📋 Run this SQL in your Supabase dashboard:');
        console.log(`
CREATE TABLE public.music_scores (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    composer TEXT NOT NULL,
    style TEXT NOT NULL,
    composition_year INTEGER,
    key_signature TEXT,
    bpm INTEGER,
    time_signature TEXT DEFAULT '4/4',
    difficulty INTEGER CHECK(difficulty BETWEEN 1 AND 10),
    duration_seconds INTEGER,
    voices_count INTEGER,
    instruments JSONB,
    tags JSONB,
    maestro_format JSONB NOT NULL,
    preview_notes TEXT,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_music_composer ON public.music_scores(composer);
CREATE INDEX idx_music_style ON public.music_scores(style);
CREATE INDEX idx_music_year ON public.music_scores(composition_year);

ALTER TABLE public.music_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.music_scores FOR SELECT USING (is_public = true);
        `);
      }
      return;
    }
    
    console.log('✅ Connection successful!');
    
    // Check if table has data
    const { data: countData, error: countError } = await supabase
      .from('music_scores')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Count query failed:', countError.message);
      return;
    }
    
    const count = countData?.length || 0;
    console.log(`📊 Found ${count} scores in online database`);
    
    if (count === 0) {
      console.log('\n📝 Database is empty. You can:');
      console.log('1. Add scores manually via maestro_add_to_library');
      console.log('2. Upload your local scores to Supabase');
    } else {
      console.log('🎵 Online library is ready to use!');
      
      // Show sample data
      const { data: sampleData } = await supabase
        .from('music_scores')
        .select('title, composer, style')
        .limit(3);
        
      console.log('\n🎼 Sample scores:');
      sampleData?.forEach(score => {
        console.log(`  - ${score.composer}: ${score.title} (${score.style})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run test
testSupabaseConnection();