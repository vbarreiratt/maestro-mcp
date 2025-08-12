#!/usr/bin/env node

/**
 * Teste completo de integração MCP com GarageBand
 */

import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

async function testMCPGarageBandIntegration() {
  console.log('🎼 Testando integração completa MCP + GarageBand...');
  
  // Cria um script de teste MCP
  const mcpTestScript = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "configure_midi_output",
      arguments: {
        portName: "GarageBand Virtual In"
      }
    }
  }) + '\n' + JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "midi_send_note",
      arguments: {
        note: "C4",
        velocity: 0.8,
        duration: 1000,
        channel: 1
      }
    }
  }) + '\n';
  
  console.log('📝 Script MCP criado');
  console.log('🚀 Iniciando servidor MCP...');
  
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['dist/server.js'], {
      cwd: process.cwd(),
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'production', MCP_MODE: 'true' }
    });
    
    let output = '';
    let responseCount = 0;
    
    server.stdout.on('data', (data) => {
      output += data.toString();
      console.log('📄 Resposta MCP:', data.toString().trim());
      
      responseCount++;
      if (responseCount >= 2) {
        server.kill();
        resolve(output);
      }
    });
    
    server.stderr.on('data', (data) => {
      console.log('🔧 Log servidor:', data.toString().trim());
    });
    
    server.on('error', (error) => {
      console.error('❌ Erro no servidor:', error);
      reject(error);
    });
    
    // Aguarda inicialização e envia comandos
    setTimeout(() => {
      console.log('📤 Enviando comandos MCP...');
      server.stdin.write(mcpTestScript);
      server.stdin.end();
    }, 2000);
    
    // Timeout de segurança
    setTimeout(() => {
      if (!server.killed) {
        server.kill();
        resolve(output);
      }
    }, 10000);
  });
}

testMCPGarageBandIntegration()
  .then((output) => {
    console.log('\n✅ Teste de integração MCP + GarageBand completado!');
    console.log('\n📊 Resultado completo:');
    console.log(output);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro durante teste de integração:', error);
    process.exit(1);
  });