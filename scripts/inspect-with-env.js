#!/usr/bin/env node

/**
 * Script para iniciar o inspector com variáveis de ambiente carregadas
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';

// Carregar variáveis do .env
config();

// Verificar se as variáveis obrigatórias estão definidas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Erro: Variáveis SUPABASE_URL e SUPABASE_ANON_KEY devem estar definidas no arquivo .env');
  process.exit(1);
}

// Iniciar inspector com as variáveis carregadas
const inspector = spawn('npx', ['@modelcontextprotocol/inspector', '--', 'node', 'dist/server.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Garantir que as variáveis estão disponíveis
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
  }
});

inspector.on('error', (error) => {
  console.error('❌ Erro ao iniciar inspector:', error);
  process.exit(1);
});

inspector.on('close', (code) => {
  console.log(`🔍 Inspector encerrado com código: ${code}`);
  process.exit(code);
});
