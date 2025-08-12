/**
 * Integration tests for real MIDI hardware/software
 * These tests will only run if MIDI ports are available
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Mensageiro } from '../../src/pilares/modulo-midi/mensageiro/index.js';

describe('Mensageiro Real MIDI Integration', () => {
  let mensageiro: Mensageiro;
  let hasAvailablePorts = false;

  beforeAll(async () => {
    mensageiro = new Mensageiro();
    await mensageiro.initialize();
    
    // Check if we have any output ports available
    const ports = mensageiro.listPorts();
    const outputPorts = ports.filter(p => p.type === 'output');
    hasAvailablePorts = outputPorts.length > 0;
    
    if (hasAvailablePorts) {
      console.log('\nAvailable MIDI output ports:');
      outputPorts.forEach(port => {
        console.log(`  - ${port.name} (ID: ${port.id})`);
      });
    } else {
      console.log('\nNo MIDI output ports available - some tests will be skipped');
    }
  });

  afterAll(async () => {
    await mensageiro.cleanup();
  });

  it('should list real MIDI ports', () => {
    const ports = mensageiro.listPorts();
    expect(ports).toBeInstanceOf(Array);
    
    // Each port should have required properties
    ports.forEach(port => {
      expect(port).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        type: expect.stringMatching(/^(input|output)$/),
        connected: expect.any(Boolean)
      });
    });
  });

  it('should connect to first available output port', async () => {
    if (!hasAvailablePorts) {
      console.log('Skipping connection test - no ports available');
      return;
    }

    const ports = mensageiro.listPorts();
    const outputPort = ports.find(p => p.type === 'output');
    
    if (outputPort) {
      const success = await mensageiro.connectToPort(outputPort.name);
      expect(success).toBe(true);
      expect(mensageiro.getConnectedPort()).toBe(outputPort.name);
      
      console.log(`Successfully connected to: ${outputPort.name}`);
    }
  });

  it('should send a test MIDI note', async () => {
    if (!hasAvailablePorts) {
      console.log('Skipping MIDI note test - no ports available');
      return;
    }

    // Connect to first available port
    const ports = mensageiro.listPorts();
    const outputPort = ports.find(p => p.type === 'output');
    
    if (outputPort) {
      await mensageiro.connectToPort(outputPort.name);
      
      // Send a middle C note
      expect(() => {
        mensageiro.sendNoteOn(60, 0.8, 1); // C4, velocity 0.8, channel 1
      }).not.toThrow();
      
      // Wait a bit, then send note off
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(() => {
        mensageiro.sendNoteOff(60, 1); // C4, channel 1
      }).not.toThrow();
      
      console.log('MIDI note test completed successfully');
    }
  });

  it('should handle system status reporting', () => {
    const status = mensageiro.getSystemStatus();
    
    expect(status).toMatchObject({
      initialized: true,
      connectedPort: expect.any(String),
      availablePorts: expect.any(Number),
      portManagerStatus: expect.objectContaining({
        totalPorts: expect.any(Number),
        outputPorts: expect.any(Number),
        inputPorts: expect.any(Number)
      }),
      midiInterfaceStatus: expect.objectContaining({
        hasActivePort: expect.any(Boolean),
        messagesSent: expect.any(Number),
        errorsCount: expect.any(Number)
      })
    });
    
    console.log('System status:', JSON.stringify(status, null, 2));
  });

  it('should perform latency measurement', async () => {
    if (!hasAvailablePorts) {
      console.log('Skipping latency test - no ports available');
      return;
    }

    const ports = mensageiro.listPorts();
    const outputPort = ports.find(p => p.type === 'output');
    
    if (outputPort) {
      await mensageiro.connectToPort(outputPort.name);
      
      // Test the MIDI interface latency measurement
      const midiInterface = (mensageiro as any).midiInterface;
      const latency = await midiInterface.measureLatency();
      
      expect(latency).toBeGreaterThan(0);
      expect(latency).toBeLessThan(100); // Should be less than 100ms
      
      console.log(`Measured MIDI latency: ${latency.toFixed(2)}ms`);
    }
  });
});