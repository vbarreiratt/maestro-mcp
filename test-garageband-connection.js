#!/usr/bin/env node

/**
 * Test script para conectar com GarageBand
 */

import { MCPToolsImpl } from './dist/tools/mcp-tools-impl.js';

async function testGarageBandConnection() {
  console.log('🎹 Iniciando teste de conexão com GarageBand...');
  
  const tools = new MCPToolsImpl();
  
  try {
    // Aguarda um pouco para inicialização completa
    console.log('\n⏳ Aguardando inicialização do sistema MIDI...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 1. Listar portas MIDI
    console.log('\n📋 Listando portas MIDI disponíveis...');
    const ports = await tools.midi_list_ports({});
    console.log(JSON.stringify(ports, null, 2));
    
    // 2. Configurar saída para GarageBand
    console.log('\n🔧 Configurando saída para GarageBand...');
    const configResult = await tools.configure_midi_output({
      portName: 'GarageBand Virtual In'
    });
    console.log(JSON.stringify(configResult, null, 2));
    
    // 3. Enviar nota teste
    console.log('\n🎵 Enviando nota teste para GarageBand...');
    const noteResult = await tools.midi_send_note({
      note: 'C4',
      velocity: 0.8,
      duration: 1000,
      channel: 1
    });
    console.log(JSON.stringify(noteResult, null, 2));
    
    // Aguarda um pouco entre as notas
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // 4. Tocar uma sequência de notas individuais
    console.log('\n🎼 Tocando sequência teste...');
    const notes = ['C4', 'E4', 'G4', 'C5'];
    for (const note of notes) {
      const singleNoteResult = await tools.midi_send_note({
        note: note,
        velocity: 0.7,
        duration: 500,
        channel: 1
      });
      console.log(`Nota ${note}:`, singleNoteResult.success ? '✅' : '❌');
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    
    console.log('\n✅ Teste de conexão com GarageBand completado com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro durante teste de conexão:', error.message);
    console.error('Stack:', error.stack);
  }
  
  // Aguarda um pouco antes de finalizar
  await new Promise(resolve => setTimeout(resolve, 2000));
  process.exit(0);
}

testGarageBandConnection();