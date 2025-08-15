#!/usr/bin/env node
/**
 * Automated Claude Desktop MCP Server Installation Script
 * Configures Maestro MCP server for Claude Desktop automatically
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const serverPath = resolve(__dirname, '..', 'dist', 'server.js');

// Platform-specific configuration paths
const configPaths = {
  darwin: join(homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
  win32: join(homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json'),
  linux: join(homedir(), '.config', 'Claude', 'claude_desktop_config.json')
};

const platform = process.platform;
const configPath = configPaths[platform];

if (!configPath) {
  console.error(`❌ Unsupported platform: ${platform}`);
  process.exit(1);
}

// Verify server file exists
if (!existsSync(serverPath)) {
  console.error(`❌ Server file not found: ${serverPath}`);
  console.log('💡 Run "npm run build" first to compile the server');
  process.exit(1);
}

// Create configuration directory if it doesn't exist
const configDir = configPath.replace(/\/[^/]*$/, '');
if (!existsSync(configDir)) {
  console.log(`📁 Creating Claude config directory: ${configDir}`);
  mkdirSync(configDir, { recursive: true });
}

// Configuration object
const config = {
  mcpServers: {
    maestro: {
      command: "node",
      args: [serverPath],
      env: {
        NODE_ENV: "production",
        MCP_MODE: "true"
      }
    }
  }
};

// Check if config exists and merge if needed
let existingConfig = {};
if (existsSync(configPath)) {
  try {
    const existingContent = JSON.parse(require('fs').readFileSync(configPath, 'utf8'));
    existingConfig = existingContent;
    console.log('📋 Found existing Claude Desktop configuration');
  } catch (error) {
    console.log('⚠️  Existing config file found but couldn\'t parse JSON, creating new one');
  }
}

// Merge configurations
const finalConfig = {
  ...existingConfig,
  mcpServers: {
    ...existingConfig.mcpServers,
    ...config.mcpServers
  }
};

// Write configuration
try {
  writeFileSync(configPath, JSON.stringify(finalConfig, null, 2));
  console.log('✅ Maestro MCP server successfully added to Claude Desktop configuration');
  console.log(`📁 Config file: ${configPath}`);
  console.log(`🎼 Server path: ${serverPath}`);
  console.log('');
  console.log('🚀 Next steps:');
  console.log('1. Restart Claude Desktop application');
  console.log('2. Start a new conversation');  
  console.log('3. Try running: midi_list_ports');
  console.log('');
  console.log('🎹 You should now have access to all 8 MIDI tools!');
  
} catch (error) {
  console.error(`❌ Failed to write configuration: ${error.message}`);
  process.exit(1);
}
