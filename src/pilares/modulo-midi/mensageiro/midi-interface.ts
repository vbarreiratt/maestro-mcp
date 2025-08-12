/**
 * MIDI Interface - Direct communication with MIDI hardware/software
 * Handles low-level MIDI message sending using jzz library
 */

import JZZ from 'jzz';
import { MidiError } from '@/types/index.js';
import { ErrorCodes } from '@/schemas/common-schemas.js';

export interface MidiInterfaceStatus {
  hasActivePort: boolean;
  portName: string | null;
  lastMessageTime: number | null;
  messagesSent: number;
  errorsCount: number;
}

/**
 * Handles direct MIDI communication through jzz library
 */
export class MidiInterface {
  private activePort: any = null; // JZZ MIDI port instance
  private activePortName: string | null = null;
  private messagesSent = 0;
  private errorsCount = 0;
  private lastMessageTime: number | null = null;

  constructor() {
    //console.log('[MidiInterface] Created');
  }

  async initialize(): Promise<void> {
    //console.log('[MidiInterface] Initialization complete');
  }

  /**
   * Set the active MIDI output port
   */
  async setActivePort(portName: string): Promise<void> {
    try {
      //console.log(`[MidiInterface] Setting active port: ${portName}`);

      // Close existing port if any
      if (this.activePort) {
        await this.clearActivePort();
      }

      // Open new port using jzz
      this.activePort = await JZZ().openMidiOut(portName);
      this.activePortName = portName;

      //console.log(`[MidiInterface] Active port set: ${portName}`);
    } catch (error) {
      this.errorsCount++;
      const midiError = new MidiError(
        `Failed to set active port '${portName}': ${error}`,
        ErrorCodes.MIDI_CONNECTION_FAILED
      );
      //console.error('[MidiInterface] Set active port failed:', midiError);
      throw midiError;
    }
  }

  /**
   * Clear the active port and close connection
   */
  async clearActivePort(): Promise<void> {
    if (this.activePort) {
      try {
        //console.log(`[MidiInterface] Clearing active port: ${this.activePortName}`);
        this.activePort.close();
        this.activePort = null;
        this.activePortName = null;
        //console.log('[MidiInterface] Active port cleared');
      } catch (error) {
        //console.error('[MidiInterface] Error clearing active port:', error);
      }
    }
  }

  /**
   * Ensure we have an active port for sending messages
   */
  private ensureActivePort(): void {
    if (!this.activePort) {
      throw new MidiError(
        'No active MIDI port. Connect to a port first using connectToPort()',
        ErrorCodes.MIDI_CONNECTION_FAILED
      );
    }
  }

  /**
   * Send MIDI Note On message
   */
  sendNoteOn(note: number, velocity: number, channel: number): void {
    this.ensureActivePort();

    try {
      // Convert to 0-based channel for MIDI protocol
      const midiChannel = channel - 1;
      
      // Send MIDI note on message: [144 + channel, note, velocity]
      this.activePort.noteOn(midiChannel, note, velocity);
      
      this.messagesSent++;
      this.lastMessageTime = Date.now();
      
      //console.log(`[MidiInterface] Note ON sent: note=${note} vel=${velocity} ch=${channel}`);
    } catch (error) {
      this.errorsCount++;
      throw new MidiError(
        `Failed to send MIDI Note On: ${error}`,
        ErrorCodes.MIDI_SEND_FAILED
      );
    }
  }

  /**
   * Send MIDI Note Off message
   */
  sendNoteOff(note: number, channel: number): void {
    this.ensureActivePort();

    try {
      const midiChannel = channel - 1;
      
      // Send MIDI note off message: [128 + channel, note, 0]
      this.activePort.noteOff(midiChannel, note);
      
      this.messagesSent++;
      this.lastMessageTime = Date.now();
      
      //console.log(`[MidiInterface] Note OFF sent: note=${note} ch=${channel}`);
    } catch (error) {
      this.errorsCount++;
      throw new MidiError(
        `Failed to send MIDI Note Off: ${error}`,
        ErrorCodes.MIDI_SEND_FAILED
      );
    }
  }

  /**
   * Send MIDI Control Change message
   */
  sendCC(controller: number, value: number, channel: number): void {
    this.ensureActivePort();

    try {
      const midiChannel = channel - 1;
      
      // Send MIDI CC message: [176 + channel, controller, value]
      this.activePort.control(midiChannel, controller, value);
      
      this.messagesSent++;
      this.lastMessageTime = Date.now();
      
      //console.log(`[MidiInterface] CC sent: cc=${controller} val=${value} ch=${channel}`);
    } catch (error) {
      this.errorsCount++;
      throw new MidiError(
        `Failed to send MIDI CC: ${error}`,
        ErrorCodes.MIDI_SEND_FAILED
      );
    }
  }

  /**
   * Send MIDI Program Change message
   */
  sendProgramChange(program: number, channel: number): void {
    this.ensureActivePort();

    try {
      const midiChannel = channel - 1;
      
      // Send MIDI program change: [192 + channel, program]
      this.activePort.program(midiChannel, program);
      
      this.messagesSent++;
      this.lastMessageTime = Date.now();
      
      //console.log(`[MidiInterface] Program Change sent: program=${program} ch=${channel}`);
    } catch (error) {
      this.errorsCount++;
      throw new MidiError(
        `Failed to send MIDI Program Change: ${error}`,
        ErrorCodes.MIDI_SEND_FAILED
      );
    }
  }

  /**
   * Send raw MIDI message (for advanced use cases)
   */
  sendRawMidiMessage(data: number[]): void {
    this.ensureActivePort();

    try {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('MIDI data must be a non-empty array');
      }

      // Validate MIDI bytes (0-255)
      for (const byte of data) {
        if (byte < 0 || byte > 255 || !Number.isInteger(byte)) {
          throw new Error(`Invalid MIDI byte: ${byte}. Must be integer 0-255`);
        }
      }

      this.activePort.send(data);
      
      this.messagesSent++;
      this.lastMessageTime = Date.now();
      
      //console.log(`[MidiInterface] Raw MIDI sent: [${data.join(', ')}]`);
    } catch (error) {
      this.errorsCount++;
      throw new MidiError(
        `Failed to send raw MIDI message: ${error}`,
        ErrorCodes.MIDI_SEND_FAILED
      );
    }
  }

  /**
   * Send System Exclusive (SysEx) message
   */
  sendSysEx(data: number[]): void {
    this.ensureActivePort();

    try {
      if (!Array.isArray(data) || data.length < 2) {
        throw new Error('SysEx data must be array with at least 2 bytes');
      }

      // Ensure SysEx format: starts with 0xF0, ends with 0xF7
      let sysexData = [...data];
      if (sysexData[0] !== 0xF0) {
        sysexData = [0xF0, ...sysexData];
      }
      if (sysexData[sysexData.length - 1] !== 0xF7) {
        sysexData = [...sysexData, 0xF7];
      }

      this.activePort.send(sysexData);
      
      this.messagesSent++;
      this.lastMessageTime = Date.now();
      
      //console.log(`[MidiInterface] SysEx sent: ${sysexData.length} bytes`);
    } catch (error) {
      this.errorsCount++;
      throw new MidiError(
        `Failed to send SysEx message: ${error}`,
        ErrorCodes.MIDI_SEND_FAILED
      );
    }
  }

  /**
   * Get current interface status
   */
  getStatus(): MidiInterfaceStatus {
    return {
      hasActivePort: !!this.activePort,
      portName: this.activePortName,
      lastMessageTime: this.lastMessageTime,
      messagesSent: this.messagesSent,
      errorsCount: this.errorsCount
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.messagesSent = 0;
    this.errorsCount = 0;
    this.lastMessageTime = null;
    //console.log('[MidiInterface] Statistics reset');
  }

  /**
   * Test the connection by sending a harmless message
   */
  async testConnection(): Promise<boolean> {
    if (!this.activePort) {
      return false;
    }

    try {
      // Send a harmless CC message (CC 121 - Reset All Controllers with value 0)
      this.sendCC(121, 0, 1);
      return true;
    } catch (error) {
      //console.error('[MidiInterface] Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get latency estimate (basic implementation)
   */
  async measureLatency(): Promise<number> {
    if (!this.activePort) {
      throw new MidiError('No active port for latency measurement', ErrorCodes.MIDI_CONNECTION_FAILED);
    }

    const startTime = performance.now();
    
    try {
      // Send a test message and measure time
      this.sendCC(121, 0, 1); // Reset controllers - harmless
      const endTime = performance.now();
      
      return endTime - startTime;
    } catch (error) {
      throw new MidiError(`Latency measurement failed: ${error}`, ErrorCodes.MIDI_SEND_FAILED);
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    //console.log('[MidiInterface] Starting cleanup...');
    await this.clearActivePort();
    //console.log('[MidiInterface] Cleanup complete');
  }
}