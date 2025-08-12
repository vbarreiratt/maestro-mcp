/**
 * Unit tests for Mensageiro MIDI implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Mensageiro } from '../../src/pilares/modulo-midi/mensageiro/index.js';
import { MidiError } from '../../src/types/index.js';

// Mock JZZ to avoid requiring actual MIDI hardware
vi.mock('jzz', () => {
  const mockPort = {
    close: vi.fn(),
    noteOn: vi.fn(),
    noteOff: vi.fn(),
    control: vi.fn(),
    program: vi.fn(),
    send: vi.fn(),
  };
  
  const mockJZZ = vi.fn(() => ({
    then: vi.fn((callback) => callback && callback()),
    openMidiOut: vi.fn().mockResolvedValue(mockPort),
  }));
  
  mockJZZ.info = vi.fn(() => ({
    outputs: [
      { name: 'Test Output Port', manufacturer: 'Test' },
      { name: 'Software Synth' }
    ],
    inputs: [
      { name: 'Test Input Port', manufacturer: 'Test' }
    ]
  }));
  
  return { default: mockJZZ };
});

describe('Mensageiro MIDI Interface', () => {
  let mensageiro: Mensageiro;

  beforeEach(async () => {
    mensageiro = new Mensageiro();
    await mensageiro.initialize();
  });

  afterEach(async () => {
    await mensageiro.cleanup();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const newMensageiro = new Mensageiro();
      await expect(newMensageiro.initialize()).resolves.not.toThrow();
      await newMensageiro.cleanup();
    });

    it('should throw error when using methods before initialization', () => {
      const uninitializedMensageiro = new Mensageiro();
      expect(() => uninitializedMensageiro.listPorts()).toThrow(MidiError);
    });
  });

  describe('Port Management', () => {
    it('should list available ports', () => {
      const ports = mensageiro.listPorts();
      expect(ports).toBeInstanceOf(Array);
      expect(ports.length).toBeGreaterThan(0);
      
      // Check port structure
      const outputPort = ports.find(p => p.type === 'output');
      expect(outputPort).toBeDefined();
      expect(outputPort).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        type: 'output',
        connected: expect.any(Boolean)
      });
    });

    it('should connect to a valid port', async () => {
      const ports = mensageiro.listPorts();
      const outputPort = ports.find(p => p.type === 'output');
      
      if (outputPort) {
        const success = await mensageiro.connectToPort(outputPort.name);
        expect(success).toBe(true);
        expect(mensageiro.getConnectedPort()).toBe(outputPort.name);
      }
    });

    it('should return false when connecting to non-existent port', async () => {
      const success = await mensageiro.connectToPort('Non-existent Port');
      expect(success).toBe(false);
    });

    it('should disconnect from port', async () => {
      const ports = mensageiro.listPorts();
      const outputPort = ports.find(p => p.type === 'output');
      
      if (outputPort) {
        await mensageiro.connectToPort(outputPort.name);
        mensageiro.disconnectPort();
        expect(mensageiro.getConnectedPort()).toBe(null);
      }
    });
  });

  describe('MIDI Message Sending', () => {
    beforeEach(async () => {
      // Connect to first available output port
      const ports = mensageiro.listPorts();
      const outputPort = ports.find(p => p.type === 'output');
      if (outputPort) {
        await mensageiro.connectToPort(outputPort.name);
      }
    });

    it('should send note on message', () => {
      expect(() => {
        mensageiro.sendNoteOn(60, 0.8, 1); // C4, velocity 0.8, channel 1
      }).not.toThrow();
    });

    it('should send note off message', () => {
      expect(() => {
        mensageiro.sendNoteOff(60, 1); // C4, channel 1
      }).not.toThrow();
    });

    it('should send control change message', () => {
      expect(() => {
        mensageiro.sendCC(7, 100, 1); // Volume, value 100, channel 1
      }).not.toThrow();
    });

    it('should send program change message', () => {
      expect(() => {
        mensageiro.sendProgramChange(0, 1); // Program 0, channel 1
      }).not.toThrow();
    });

    it('should validate MIDI parameters', () => {
      // Invalid note
      expect(() => {
        mensageiro.sendNoteOn(128, 0.8, 1); // Note > 127
      }).toThrow(MidiError);

      // Invalid velocity
      expect(() => {
        mensageiro.sendNoteOn(60, 1.5, 1); // Velocity > 1.0
      }).toThrow(MidiError);

      // Invalid channel
      expect(() => {
        mensageiro.sendNoteOn(60, 0.8, 17); // Channel > 16
      }).toThrow(MidiError);
    });
  });

  describe('Utility Functions', () => {
    beforeEach(async () => {
      const ports = mensageiro.listPorts();
      const outputPort = ports.find(p => p.type === 'output');
      if (outputPort) {
        await mensageiro.connectToPort(outputPort.name);
      }
    });

    it('should send all notes off to specific channel', () => {
      expect(() => {
        mensageiro.sendAllNotesOff(1);
      }).not.toThrow();
    });

    it('should send all notes off to all channels', () => {
      expect(() => {
        mensageiro.sendAllNotesOff();
      }).not.toThrow();
    });

    it('should send panic (emergency stop)', () => {
      expect(() => {
        mensageiro.sendPanic();
      }).not.toThrow();
    });
  });

  describe('System Status', () => {
    it('should return system status', () => {
      const status = mensageiro.getSystemStatus();
      expect(status).toMatchObject({
        initialized: true,
        connectedPort: expect.anything(), // Can be string or null
        availablePorts: expect.any(Number),
        portManagerStatus: expect.any(Object),
        midiInterfaceStatus: expect.any(Object)
      });
    });
  });
});