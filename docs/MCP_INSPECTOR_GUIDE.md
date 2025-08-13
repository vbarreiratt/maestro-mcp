# 🔍 MCP Inspector Guide

Complete guide for using the MCP Inspector with the Maestro MCP server.

## Quick Start Commands

```bash
# Quick start (recommended)
npm run inspect

# Manual configuration mode
npm run inspect:manual

# Direct command (after build)
npm run build
npx @modelcontextprotocol/inspector -- node dist/server.js
```

## Pre-configured Settings

The Maestro MCP includes a pre-configured inspector setup in `mcp-inspector/config.json`:

```json
{
  "mcpServers": {
    "maestro-mcp": {
      "command": "node",
      "args": ["dist/server.js"],
      "cwd": "/Users/vitor/Desktop/Encantaria Suite/maestro-mcp"
    }
  },
  "globalShortcuts": {
    "toggleConnection": "CommandOrControl+Shift+M"
  }
}
```

## Common Test Commands

### 1. Test MIDI Port Detection
```javascript
tools.call("midi_list_ports")
```

### 2. Test Hybrid Notation
```javascript
tools.call("midi_send_note", {
  "note": "C4:q@0.8.leg"
})
```

### 3. Test Auto Port Configuration
```javascript
tools.call("configure_midi_output", {
  "portName": "auto",
  "targetDAW": "GarageBand"
})
```

### 4. Test Musical Phrase
```javascript
tools.call("midi_play_phrase", {
  "notes": "C4:q E4:e G4:h",
  "tempo": 120,
  "style": "legato"
})
```

### 5. Test Complex Sequence
```javascript
tools.call("midi_sequence_commands", {
  "commands": [
    {"type": "note", "note": "C4:q", "velocity": 0.8},
    {"type": "delay", "duration": 0.5},
    {"type": "note", "note": "E4:e", "velocity": 0.7},
    {"type": "cc", "controller": 7, "value": 100}
  ]
})
```

## Inspector Features

### Real-time Protocol Debugging
- View JSON-RPC messages in real-time
- Inspect request/response cycles
- Monitor server health status
- Track timing performance

### Tool Testing Interface
- Interactive parameter input
- Schema validation feedback
- Immediate response display
- Error diagnostics

### MIDI Integration Testing
- Port connectivity verification
- Note output monitoring
- Timing accuracy measurement
- DAW integration validation

## Troubleshooting

### Inspector Not Starting
```bash
# Check if server builds correctly
npm run build

# Test server directly
node dist/server.js

# Check inspector installation
npx @modelcontextprotocol/inspector --version
```

### Connection Issues
- Verify `dist/server.js` exists and is executable
- Check working directory path in config
- Ensure Node.js is in PATH
- Verify no other MCP servers are running on same port

### Tool Call Failures
- Check parameter formatting (use JSON syntax)
- Verify velocity is 0.0-1.0 (not 0-127)
- Ensure note format is correct: "C4:q@0.8"
- Check MIDI port availability before testing

## Pro Tips

1. **Use Global Shortcuts**: Press `Cmd/Ctrl+Shift+M` to toggle connection
2. **Copy-Paste Tool Calls**: Use the examples above for quick testing
3. **Monitor Timing**: Check response times for performance optimization
4. **Test Error Paths**: Try invalid parameters to test error handling
5. **Verify Schema**: Use invalid types to test validation logic

---

**Built with the Maestro MCP 6-Agent Workflow System** | **ORGANIZADOR Documentation 2025-08-13**
