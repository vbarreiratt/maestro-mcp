#!/usr/bin/env node

/**
 * Script específico para parar GarageBand
 */

import JZZ from 'jzz';

async function stopGarageBand() {
  console.log('🎛️ PARANDO ESPECIFICAMENTE O GARAGEBAND...');
  
  try {
    await new Promise((resolve, reject) => {
      JZZ().and(() => {
        console.log('✅ JZZ conectado');
        resolve();
      }).or(reject);
    });

    // Conecta especificamente ao GarageBand Virtual In
    const garageBandPort = JZZ().openMidiOut('GarageBand Virtual In');
    console.log('🔌 Conectado ao GarageBand Virtual In');
    
    // Envia comandos de parada mais agressivos
    for (let channel = 0; channel < 16; channel++) {
      console.log(`📢 Parando canal ${channel + 1}...`);
      
      // Sistema Exclusive Reset (se suportado)
      garageBandPort.send([0xF0, 0x7E, 0x7F, 0x09, 0x01, 0xF7]); // GM System On
      
      // All Sound Off - comando mais forte que All Notes Off
      garageBandPort.send([0xB0 + channel, 120, 0]);
      
      // All Notes Off
      garageBandPort.send([0xB0 + channel, 123, 0]);
      
      // Reset All Controllers
      garageBandPort.send([0xB0 + channel, 121, 0]);
      
      // Sustain Pedal Off
      garageBandPort.send([0xB0 + channel, 64, 0]);
      
      // Expression to minimum
      garageBandPort.send([0xB0 + channel, 11, 0]);
      
      // Volume to zero temporariamente
      garageBandPort.send([0xB0 + channel, 7, 0]);
      
      // Note OFF para notas comuns que podem estar presas
      const commonNotes = [60, 64, 67, 72, 48, 52, 55]; // C4, E4, G4, C5, C3, E3, G3
      for (const note of commonNotes) {
        garageBandPort.send([0x80 + channel, note, 0]);
      }
    }
    
    // Aguarda um pouco e restaura volumes
    setTimeout(() => {
      for (let channel = 0; channel < 16; channel++) {
        garageBandPort.send([0xB0 + channel, 7, 100]); // Restore volume
      }
      
      garageBandPort.close();
      console.log('🛑 GarageBand parado e volumes restaurados!');
      process.exit(0);
    }, 500);
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

stopGarageBand();