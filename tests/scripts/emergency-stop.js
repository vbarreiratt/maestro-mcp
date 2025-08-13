#!/usr/bin/env node

/**
 * Script de emergência para parar todas as notas MIDI
 */

import { MCPToolsImpl } from './dist/tools/mcp-tools-impl.js';

async function emergencyStop() {
  console.log('🚨 PARANDO TODAS AS NOTAS MIDI...');
  
  const tools = new MCPToolsImpl();
  
  try {
    // Aguarda inicialização
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Para tudo imediatamente
    const panicResult = await tools.midi_panic({});
    console.log('🛑 Resultado do MIDI Panic:', JSON.stringify(panicResult, null, 2));
    
    console.log('✅ Todas as notas foram paradas!');
    
  } catch (error) {
    console.error('❌ Erro ao parar notas:', error.message);
  }
  
  process.exit(0);
}

emergencyStop();