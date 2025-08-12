/**
 * Protocol Handler - MIDI protocol validation and utility functions
 * Handles MIDI message validation, conversions, and protocol compliance
 */

import { MidiError } from '@/types/index.js';
import { ErrorCodes } from '@/schemas/common-schemas.js';

/**
 * MIDI Protocol constants and validation
 */
export class ProtocolHandler {
  // MIDI Protocol Constants
  static readonly MIDI_NOTE_MIN = 0;
  static readonly MIDI_NOTE_MAX = 127;
  static readonly MIDI_VELOCITY_MIN = 0;
  static readonly MIDI_VELOCITY_MAX = 127;
  static readonly MIDI_CC_MIN = 0;
  static readonly MIDI_CC_MAX = 127;
  static readonly MIDI_CHANNEL_MIN = 1;
  static readonly MIDI_CHANNEL_MAX = 16;
  static readonly MIDI_PROGRAM_MIN = 0;
  static readonly MIDI_PROGRAM_MAX = 127;

  // Normalized ranges (for external API)
  static readonly VELOCITY_NORMALIZED_MIN = 0;
  static readonly VELOCITY_NORMALIZED_MAX = 1;

  constructor() {
    //console.log('[ProtocolHandler] Created');
  }

  /**
   * Validate MIDI note parameters
   */
  validateNoteParameters(note: number, velocity: number, channel: number): void {
    this.validateNote(note);
    this.validateNormalizedVelocity(velocity);
    this.validateChannel(channel);
  }

  /**
   * Validate MIDI Control Change parameters
   */
  validateCCParameters(controller: number, value: number, channel: number): void {
    this.validateController(controller);
    this.validateCCValue(value);
    this.validateChannel(channel);
  }

  /**
   * Validate MIDI Program Change parameters
   */
  validateProgramChangeParameters(program: number, channel: number): void {
    this.validateProgram(program);
    this.validateChannel(channel);
  }

  /**
   * Validate MIDI note number (0-127)
   */
  validateNote(note: number): void {
    if (!Number.isInteger(note) || note < ProtocolHandler.MIDI_NOTE_MIN || note > ProtocolHandler.MIDI_NOTE_MAX) {
      throw new MidiError(
        `Invalid MIDI note: ${note}. Must be integer between ${ProtocolHandler.MIDI_NOTE_MIN} and ${ProtocolHandler.MIDI_NOTE_MAX}`,
        ErrorCodes.MIDI_INVALID_NOTE
      );
    }
  }

  /**
   * Validate normalized velocity (0.0-1.0)
   */
  validateNormalizedVelocity(velocity: number): void {
    if (typeof velocity !== 'number' || velocity < ProtocolHandler.VELOCITY_NORMALIZED_MIN || velocity > ProtocolHandler.VELOCITY_NORMALIZED_MAX) {
      throw new MidiError(
        `Invalid velocity: ${velocity}. Must be number between ${ProtocolHandler.VELOCITY_NORMALIZED_MIN} and ${ProtocolHandler.VELOCITY_NORMALIZED_MAX}`,
        ErrorCodes.VALIDATION_FAILED
      );
    }
  }

  /**
   * Validate MIDI velocity (0-127) 
   */
  validateMidiVelocity(velocity: number): void {
    if (!Number.isInteger(velocity) || velocity < ProtocolHandler.MIDI_VELOCITY_MIN || velocity > ProtocolHandler.MIDI_VELOCITY_MAX) {
      throw new MidiError(
        `Invalid MIDI velocity: ${velocity}. Must be integer between ${ProtocolHandler.MIDI_VELOCITY_MIN} and ${ProtocolHandler.MIDI_VELOCITY_MAX}`,
        ErrorCodes.VALIDATION_FAILED
      );
    }
  }

  /**
   * Validate MIDI channel (1-16)
   */
  validateChannel(channel: number): void {
    if (!Number.isInteger(channel) || channel < ProtocolHandler.MIDI_CHANNEL_MIN || channel > ProtocolHandler.MIDI_CHANNEL_MAX) {
      throw new MidiError(
        `Invalid MIDI channel: ${channel}. Must be integer between ${ProtocolHandler.MIDI_CHANNEL_MIN} and ${ProtocolHandler.MIDI_CHANNEL_MAX}`,
        ErrorCodes.VALIDATION_FAILED
      );
    }
  }

  /**
   * Validate MIDI controller number (0-127)
   */
  validateController(controller: number): void {
    if (!Number.isInteger(controller) || controller < ProtocolHandler.MIDI_CC_MIN || controller > ProtocolHandler.MIDI_CC_MAX) {
      throw new MidiError(
        `Invalid MIDI controller: ${controller}. Must be integer between ${ProtocolHandler.MIDI_CC_MIN} and ${ProtocolHandler.MIDI_CC_MAX}`,
        ErrorCodes.MIDI_INVALID_CONTROLLER
      );
    }
  }

  /**
   * Validate MIDI CC value (0-127)
   */
  validateCCValue(value: number): void {
    if (!Number.isInteger(value) || value < ProtocolHandler.MIDI_CC_MIN || value > ProtocolHandler.MIDI_CC_MAX) {
      throw new MidiError(
        `Invalid MIDI CC value: ${value}. Must be integer between ${ProtocolHandler.MIDI_CC_MIN} and ${ProtocolHandler.MIDI_CC_MAX}`,
        ErrorCodes.VALIDATION_FAILED
      );
    }
  }

  /**
   * Validate MIDI program number (0-127)
   */
  validateProgram(program: number): void {
    if (!Number.isInteger(program) || program < ProtocolHandler.MIDI_PROGRAM_MIN || program > ProtocolHandler.MIDI_PROGRAM_MAX) {
      throw new MidiError(
        `Invalid MIDI program: ${program}. Must be integer between ${ProtocolHandler.MIDI_PROGRAM_MIN} and ${ProtocolHandler.MIDI_PROGRAM_MAX}`,
        ErrorCodes.VALIDATION_FAILED
      );
    }
  }

  /**
   * Validate channel parameter (used for utility functions)
   */
  validateChannelParameter(channel: number): void {
    this.validateChannel(channel);
  }

  /**
   * Convert normalized velocity (0-1) to MIDI velocity (0-127)
   */
  convertVelocity(normalizedVelocity: number): number {
    this.validateNormalizedVelocity(normalizedVelocity);
    
    // Convert 0-1 to 0-127, ensuring we never get 0 unless input was 0
    if (normalizedVelocity === 0) {
      return 0;
    }
    
    // Map 0.001-1.0 to 1-127 to avoid silent notes
    const midiVelocity = Math.max(1, Math.round(normalizedVelocity * ProtocolHandler.MIDI_VELOCITY_MAX));
    return Math.min(midiVelocity, ProtocolHandler.MIDI_VELOCITY_MAX);
  }

  /**
   * Convert MIDI velocity (0-127) to normalized velocity (0-1)
   */
  convertVelocityToNormalized(midiVelocity: number): number {
    this.validateMidiVelocity(midiVelocity);
    return midiVelocity / ProtocolHandler.MIDI_VELOCITY_MAX;
  }

  /**
   * Convert note name (e.g., "C4") to MIDI note number
   */
  convertNoteNameToMidi(noteName: string): number {
    const match = noteName.match(/^([A-G])([b#])?(\d+)$/);
    if (!match) {
      throw new MidiError(
        `Invalid note format: ${noteName}. Use format like C4, F#3, Bb5`,
        ErrorCodes.MIDI_INVALID_NOTE
      );
    }

    const [, noteChar, accidental = '', octave] = match;
    
    if (!noteChar || octave === undefined) {
      throw new MidiError(
        `Invalid note format: ${noteName}`,
        ErrorCodes.MIDI_INVALID_NOTE
      );
    }

    // Note to semitone mapping (C=0, D=2, E=4, F=5, G=7, A=9, B=11)
    const noteMap: Record<string, number> = {
      'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
    };

    const baseNote = noteMap[noteChar];
    if (baseNote === undefined) {
      throw new MidiError(`Invalid note name: ${noteChar}`, ErrorCodes.MIDI_INVALID_NOTE);
    }

    // Calculate MIDI note: octave * 12 + semitone + accidental
    // MIDI octave -1 is octave 0, so we add 1 to the octave
    let midiNote = baseNote + (parseInt(octave) + 1) * 12;

    // Apply accidental
    if (accidental === '#') {
      midiNote += 1;
    } else if (accidental === 'b') {
      midiNote -= 1;
    }

    // Validate result
    this.validateNote(midiNote);
    return midiNote;
  }

  /**
   * Convert MIDI note number to note name (e.g., 60 -> "C4")
   */
  convertMidiToNoteName(midiNote: number): string {
    this.validateNote(midiNote);

    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // Calculate octave (MIDI note 60 = C4, so subtract 12 to get proper octave)
    const octave = Math.floor(midiNote / 12) - 1;
    const noteIndex = midiNote % 12;
    
    const noteName = noteNames[noteIndex];
    if (!noteName) {
      throw new MidiError(`Unable to convert MIDI note ${midiNote}`, ErrorCodes.MIDI_INVALID_NOTE);
    }

    return `${noteName}${octave}`;
  }

  /**
   * Get controller name from CC number
   */
  getControllerName(controller: number): string {
    this.validateController(controller);

    const controllerNames: Record<number, string> = {
      0: 'Bank Select MSB',
      1: 'Modulation Wheel',
      2: 'Breath Controller',
      4: 'Foot Controller',
      5: 'Portamento Time',
      6: 'Data Entry MSB',
      7: 'Volume',
      8: 'Balance',
      10: 'Pan',
      11: 'Expression',
      12: 'Effect Control 1',
      13: 'Effect Control 2',
      16: 'General Purpose 1',
      17: 'General Purpose 2',
      18: 'General Purpose 3',
      19: 'General Purpose 4',
      32: 'Bank Select LSB',
      64: 'Sustain Pedal',
      65: 'Portamento',
      66: 'Sostenuto',
      67: 'Soft Pedal',
      68: 'Legato Footswitch',
      69: 'Hold 2',
      70: 'Sound Variation',
      71: 'Filter Resonance',
      72: 'Release Time',
      73: 'Attack Time',
      74: 'Filter Cutoff',
      75: 'Decay Time',
      76: 'Vibrato Rate',
      77: 'Vibrato Depth',
      78: 'Vibrato Delay',
      84: 'Portamento Control',
      91: 'Reverb Depth',
      92: 'Tremolo Depth',
      93: 'Chorus Depth',
      94: 'Celeste Depth',
      95: 'Phaser Depth',
      96: 'Data Increment',
      97: 'Data Decrement',
      98: 'NRPN LSB',
      99: 'NRPN MSB',
      100: 'RPN LSB',
      101: 'RPN MSB',
      120: 'All Sound Off',
      121: 'Reset All Controllers',
      122: 'Local Control',
      123: 'All Notes Off',
      124: 'Omni Off',
      125: 'Omni On',
      126: 'Mono On',
      127: 'Poly On'
    };

    return controllerNames[controller] || `Controller ${controller}`;
  }

  /**
   * Check if a controller is a continuous controller (0-127 range)
   */
  isContinuousController(controller: number): boolean {
    this.validateController(controller);
    
    // Switch-type controllers (on/off or specific values)
    const switchControllers = [64, 65, 66, 67, 68, 69, 84, 122, 124, 125, 126, 127];
    return !switchControllers.includes(controller);
  }

  /**
   * Check if a controller is a switch controller (on/off)
   */
  isSwitchController(controller: number): boolean {
    return !this.isContinuousController(controller);
  }

  /**
   * Get recommended value range for a controller
   */
  getControllerValueRange(controller: number): { min: number; max: number; type: 'continuous' | 'switch' } {
    this.validateController(controller);
    
    if (this.isSwitchController(controller)) {
      return { min: 0, max: 127, type: 'switch' };
    } else {
      return { min: 0, max: 127, type: 'continuous' };
    }
  }

  /**
   * Create a MIDI message byte array
   */
  createMidiMessage(status: number, data1?: number, data2?: number): number[] {
    const message: number[] = [status];
    
    if (data1 !== undefined) {
      if (data1 < 0 || data1 > 127) {
        throw new MidiError(`Invalid MIDI data byte 1: ${data1}`, ErrorCodes.VALIDATION_FAILED);
      }
      message.push(data1);
    }
    
    if (data2 !== undefined) {
      if (data2 < 0 || data2 > 127) {
        throw new MidiError(`Invalid MIDI data byte 2: ${data2}`, ErrorCodes.VALIDATION_FAILED);
      }
      message.push(data2);
    }
    
    return message;
  }

  /**
   * Create Note On message bytes
   */
  createNoteOnMessage(channel: number, note: number, velocity: number): number[] {
    this.validateChannel(channel);
    this.validateNote(note);
    this.validateMidiVelocity(velocity);
    
    const status = 0x90 | (channel - 1); // Note On + channel (0-based)
    return this.createMidiMessage(status, note, velocity);
  }

  /**
   * Create Note Off message bytes
   */
  createNoteOffMessage(channel: number, note: number): number[] {
    this.validateChannel(channel);
    this.validateNote(note);
    
    const status = 0x80 | (channel - 1); // Note Off + channel (0-based)
    return this.createMidiMessage(status, note, 0);
  }

  /**
   * Create Control Change message bytes
   */
  createCCMessage(channel: number, controller: number, value: number): number[] {
    this.validateChannel(channel);
    this.validateController(controller);
    this.validateCCValue(value);
    
    const status = 0xB0 | (channel - 1); // Control Change + channel (0-based)
    return this.createMidiMessage(status, controller, value);
  }

  /**
   * Create Program Change message bytes
   */
  createProgramChangeMessage(channel: number, program: number): number[] {
    this.validateChannel(channel);
    this.validateProgram(program);
    
    const status = 0xC0 | (channel - 1); // Program Change + channel (0-based)
    return this.createMidiMessage(status, program);
  }

  /**
   * Parse MIDI message bytes to readable format
   */
  parseMidiMessage(bytes: number[]): string {
    if (bytes.length === 0) {
      return 'Empty MIDI message';
    }

    const status = bytes[0];
    if (status === undefined) {
      return 'Invalid MIDI message';
    }

    const messageType = status & 0xF0;
    const channel = (status & 0x0F) + 1;

    switch (messageType) {
      case 0x80: // Note Off
        return `Note Off: Ch${channel} Note${bytes[1]} Vel${bytes[2]}`;
      case 0x90: // Note On
        return `Note On: Ch${channel} Note${bytes[1]} Vel${bytes[2]}`;
      case 0xA0: // Aftertouch
        return `Aftertouch: Ch${channel} Note${bytes[1]} Pressure${bytes[2]}`;
      case 0xB0: // Control Change
        return `CC: Ch${channel} ${this.getControllerName(bytes[1] || 0)} (${bytes[1]}) = ${bytes[2]}`;
      case 0xC0: // Program Change
        return `Program Change: Ch${channel} Program${bytes[1]}`;
      case 0xD0: // Channel Pressure
        return `Channel Pressure: Ch${channel} Pressure${bytes[1]}`;
      case 0xE0: // Pitch Bend
        const pitchValue = ((bytes[2] || 0) << 7) | (bytes[1] || 0);
        return `Pitch Bend: Ch${channel} Value${pitchValue}`;
      default:
        return `Unknown MIDI message: [${bytes.join(', ')}]`;
    }
  }
}