#!/usr/bin/env node

/**
 * Script para forçar parada de todas as notas em todas as portas MIDI
 */

import JZZ from 'jzz';

async function forceStopAll() {
  console.log('🚨 FORÇANDO PARADA DE TODAS AS NOTAS MIDI...');
  
  try {
    console.log('Inicializando JZZ...');
    await new Promise((resolve, reject) => {
      JZZ().and(() => {
        console.log('✅ JZZ inicializado com sucesso');
        resolve();
      }).or((err) => {
        console.error('❌ Erro ao inicializar JZZ:', err);
        reject(err);
      });
    });

    // Pega todas as portas de saída
    const outputs = JZZ().info().outputs;
    console.log(`📋 Encontradas ${outputs.length} portas de saída MIDI`);
    
    for (let i = 0; i < outputs.length; i++) {
      const portInfo = outputs[i];
      console.log(`🔧 Parando porta: ${portInfo.name || portInfo.id}`);
      
      try {
        const port = JZZ().openMidiOut(i);
        
        // Para cada canal MIDI (1-16)
        for (let channel = 0; channel < 16; channel++) {
          // All Notes Off (CC 123)
          port.send([0xB0 + channel, 123, 0]);
          
          // All Sound Off (CC 120)
          port.send([0xB0 + channel, 120, 0]);
          
          // Reset All Controllers (CC 121)
          port.send([0xB0 + channel, 121, 0]);
          
          // Note OFF para todas as notas possíveis
          for (let note = 0; note < 128; note++) {
            port.send([0x80 + channel, note, 0]);
          }
        }
        
        port.close();
        console.log(`✅ Porta ${portInfo.name || portInfo.id} parada`);
        
      } catch (portError) {
        console.log(`⚠️  Erro na porta ${portInfo.name || portInfo.id}:`, portError.message);
      }
    }
    
    console.log('🛑 TODAS AS PORTAS MIDI FORAM PARADAS!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
  
  // Força saída
  setTimeout(() => {
    process.exit(0);
  }, 1000);
}

forceStopAll();