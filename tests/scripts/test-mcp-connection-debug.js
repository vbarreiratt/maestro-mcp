#!/usr/bin/env node

/**
 * Debug MCP Connection
 * Tests direct connection to the MCP server to identify issues
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testMCPConnection() {
    console.log('🔍 Testing direct MCP connection...');
    
    const serverPath = join(__dirname, 'dist', 'server.js');
    console.log('Server path:', serverPath);
    
    const server = spawn('node', [serverPath], {
        env: {
            ...process.env,
            NODE_ENV: 'production',
            MCP_MODE: 'true'
        },
        stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let serverReady = false;
    let initResponse = null;
    
    // Capture server output
    server.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('📤 Server stdout:', output.trim());
        
        if (output.includes('started successfully')) {
            serverReady = true;
            console.log('✅ Server is ready, sending initialize...');
            sendInitialize();
        }
        
        // Try to parse JSON responses
        try {
            const lines = output.split('\n').filter(line => line.trim());
            for (const line of lines) {
                if (line.startsWith('{')) {
                    const response = JSON.parse(line);
                    console.log('📨 JSON Response:', JSON.stringify(response, null, 2));
                    
                    if (response.result && response.result.capabilities) {
                        initResponse = response;
                    }
                }
            }
        } catch (e) {
            // Not JSON, ignore
        }
    });
    
    server.stderr.on('data', (data) => {
        console.error('📤 Server stderr:', data.toString().trim());
    });
    
    server.on('close', (code) => {
        console.log(`🏁 Server process exited with code ${code}`);
        if (initResponse) {
            console.log('✅ Successfully received capabilities');
            console.log('Tools count:', initResponse.result.capabilities.tools ? 'Available' : 'Missing');
        } else {
            console.log('❌ No valid MCP response received');
        }
    });
    
    function sendInitialize() {
        const initMessage = {
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
                protocolVersion: "2025-06-18",
                capabilities: {},
                clientInfo: {
                    name: "test-client",
                    version: "1.0.0"
                }
            }
        };
        
        console.log('📬 Sending initialize:', JSON.stringify(initMessage));
        server.stdin.write(JSON.stringify(initMessage) + '\n');
        
        // Wait a bit then ask for tools
        setTimeout(() => {
            const toolsMessage = {
                jsonrpc: "2.0",
                id: 2,
                method: "tools/list",
                params: {}
            };
            
            console.log('📬 Sending tools/list:', JSON.stringify(toolsMessage));
            server.stdin.write(JSON.stringify(toolsMessage) + '\n');
            
            // Close after getting response
            setTimeout(() => {
                server.kill();
            }, 2000);
        }, 1000);
    }
    
    // Timeout after 10 seconds
    setTimeout(() => {
        if (!serverReady) {
            console.log('⏰ Timeout: Server did not start in time');
            server.kill();
        }
    }, 10000);
}

testMCPConnection().catch(console.error);