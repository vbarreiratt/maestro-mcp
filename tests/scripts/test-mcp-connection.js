#!/usr/bin/env node
/**
 * Test MCP Connection
 * Simula uma conexão MCP para verificar se o servidor responde
 */

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

async function testMCPConnection() {
    console.log('🧪 Testando conexão MCP com servidor Maestro...');
    
    const serverPath = '/Users/vitor/Desktop/Encantaria Suite/maestro-mcp/dist/server.js';
    
    try {
        // Spawn o servidor como subprocess
        const server = spawn('node', [serverPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
                ...process.env,
                NODE_ENV: 'production',
                MCP_MODE: 'true'
            }
        });

        // Espera um pouco para o servidor inicializar
        await setTimeout(2000);

        // Envia requisição para listar ferramentas
        const listToolsRequest = JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/list',
            params: {}
        }) + '\n';

        console.log('📤 Enviando requisição tools/list...');
        server.stdin.write(listToolsRequest);

        // Configura timeout para resposta
        let responseReceived = false;
        
        server.stdout.on('data', (data) => {
            try {
                const response = JSON.parse(data.toString().trim());
                console.log('📥 Resposta recebida:', JSON.stringify(response, null, 2));
                
                if (response.result?.tools) {
                    console.log(`✅ Servidor funcional! ${response.result.tools.length} ferramentas encontradas:`);
                    response.result.tools.forEach(tool => {
                        console.log(`  - ${tool.name}: ${tool.description.substring(0, 50)}...`);
                    });
                }
                responseReceived = true;
            } catch (e) {
                console.log('📄 Dados recebidos (não JSON):', data.toString());
            }
        });

        server.stderr.on('data', (data) => {
            console.log('🟡 Stderr:', data.toString());
        });

        server.on('error', (error) => {
            console.error('❌ Erro no servidor:', error);
        });

        // Espera resposta ou timeout
        await setTimeout(5000);
        
        if (!responseReceived) {
            console.log('⚠️  Nenhuma resposta em 5 segundos');
        }
        
        server.kill();
        console.log('🔚 Teste concluído');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executa teste
testMCPConnection().catch(console.error);
