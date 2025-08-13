#!/usr/bin/env node

/**
 * Teste específico para verificar se conseguimos acessar o servidor maestro
 * que está sendo executado pelo Claude Desktop
 */

import { spawn } from 'child_process';

console.log('🎵 TESTE DE CONEXÃO COM SERVIDOR MAESTRO (processo do Claude Desktop)');
console.log('='.repeat(80));

// Tenta conectar ao servidor que o Claude está executando
const serverPath = '/Users/vitor/Desktop/Encantaria Suite/maestro-mcp/dist/server.js';

const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
        ...process.env,
        NODE_ENV: 'production',
        MCP_MODE: 'true'
    }
});

let responseReceived = false;
let fullResponse = '';

// Configurar timeout
const timeout = setTimeout(() => {
    if (!responseReceived) {
        console.log('❌ Timeout - servidor não respondeu em 5 segundos');
        server.kill();
    }
}, 5000);

server.stdout.on('data', (data) => {
    const chunk = data.toString();
    fullResponse += chunk;
    
    console.log('📦 Recebido chunk:', chunk);
    
    // Procura por uma resposta JSON completa
    try {
        const lines = fullResponse.split('\n').filter(line => line.trim());
        for (const line of lines) {
            if (line.startsWith('{') || line.startsWith('[')) {
                const response = JSON.parse(line);
                console.log('\n✅ RESPOSTA DO SERVIDOR MAESTRO:');
                console.log(JSON.stringify(response, null, 2));
                responseReceived = true;
                clearTimeout(timeout);
                
                if (response.result && response.result.tools) {
                    console.log('\n🎼 FERRAMENTAS DISPONÍVEIS:');
                    response.result.tools.forEach((tool, i) => {
                        console.log(`${i + 1}. ${tool.name} - ${tool.description.substring(0, 60)}...`);
                    });
                }
                
                server.kill();
                return;
            }
        }
    } catch (e) {
        // Não é JSON válido ainda, continua acumulando
    }
});

server.stderr.on('data', (data) => {
    console.log('⚠️  STDERR:', data.toString());
});

server.on('error', (err) => {
    console.log('❌ Erro ao executar servidor:', err.message);
    clearTimeout(timeout);
});

server.on('close', (code) => {
    console.log(`\n🔚 Servidor finalizado com código: ${code}`);
    clearTimeout(timeout);
    
    if (!responseReceived) {
        console.log('❌ Nenhuma resposta válida recebida');
    }
});

// Enviar requisição para listar ferramentas
const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
};

console.log('\n📤 ENVIANDO REQUISIÇÃO:');
console.log(JSON.stringify(request, null, 2));

server.stdin.write(JSON.stringify(request) + '\n');
