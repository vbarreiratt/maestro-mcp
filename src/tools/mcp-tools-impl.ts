/**
 * MCP Tools Implementation
 * Real implementations for all 8 mandatory MIDI tools
 */

import { z } from 'zod';
import { 
  MCP_TOOL_SCHEMAS,
  CC_MAPPINGS 
} from './mcp-tools-schemas.js';
import { Mensageiro } from '../pilares/modulo-midi/mensageiro/index.js';
import { Maestro } from '../pilares/modulo-midi/maestro/index.js';
import Note from '@tonaljs/note';
import { logger, LogContext } from '../utils/logger.js';
import { 
  parseHybridNotation, 
  applyEffects,
  parseUnifiedNotation,
  detectNotationFormat,
  type ParsedNote 
} from '../utils/hybrid-notation-parser.js';

/**
 * Core MCP Tools Class
 * Orchestrates the 3 Pilares for MCP tool execution
 */
export class MCPToolsImpl {
  private mensageiro: Mensageiro;
  private maestro: Maestro;
  private defaultOutputPort: string | null = null;
  private globalBPM: number = 120;
  private lastOperationDetails: any = null;
  private lastOperation: any = null;

  constructor() {
    this.mensageiro = new Mensageiro();
    this.maestro = new Maestro();
    
    // Initialize the Pilares
    this.initializePilares();
    
    // Setup Maestro callbacks to Mensageiro
    this.setupMaestroCallbacks();
  }

  // ========================
  // VERBOSE OPTIMIZATION SYSTEM
  // ========================

  /**
   * Capture operation for replay system
   */
  private captureOperation(functionName: string, params: any): void {
    this.lastOperation = {
      function: functionName,
      params: JSON.parse(JSON.stringify(params)), // Deep copy
      timestamp: Date.now()
    };
  }

  /**
   * Format response based on verbose flag
   * Resumido by default, detailed when requested
   */
  private formatResponse(success: boolean, data: any, verbose: boolean = false, operationType: string = ''): any {
    // Store details for debug function
    this.lastOperationDetails = {
      success,
      operationType,
      timestamp: new Date().toISOString(),
      fullData: data
    };

    const baseResponse = {
      success,
      summary: this.generateSummary(success, data, operationType)
    };

    if (verbose) {
      // Return full response data (DEBUG mode)
      return { ...baseResponse, ...data };
    } else {
      // Return condensed response (RESUMIDO mode) - only essential info
      return this.createCondensedResponse(baseResponse, data, operationType);
    }
  }

  /**
   * Create condensed response with only essential information
   */
  private createCondensedResponse(baseResponse: any, data: any, operationType: string): any {
    const condensed = { ...baseResponse };
    
    // Add essential fields based on operation type
    switch (operationType) {
      case 'midi_play_phrase':
        if (data.message) condensed.message = data.message;
        if (data.duration !== undefined) condensed.duration = data.duration;
        if (data.bpm !== undefined) condensed.bpm = data.bpm;
        break;
        
      case 'midi_send_note':
        if (data.message) condensed.message = data.message;
        if (data.duration !== undefined) condensed.duration = data.duration / 1000; // Convert ms to seconds
        break;
        
      case 'midi_sequence_commands':
        condensed.message = data.message;
        condensed.totalCommands = data.totalCommands;
        condensed.successfulCommands = data.successfulCommands;
        break;
        
      case 'midi_list_ports':
        condensed.count = data.count;
        condensed.currentOutput = data.currentOutput;
        break;
        
      case 'configure_midi_output':
        condensed.message = data.message;
        condensed.portName = data.portName;
        break;
        
      case 'midi_send_cc':
        condensed.message = data.message;
        condensed.controller = data.controller;
        condensed.value = data.value;
        condensed.channel = data.channel;
        break;
        
      case 'midi_set_tempo':
        condensed.message = data.message;
        condensed.bpm = data.bpm;
        break;
        
      case 'midi_transport_control':
        condensed.message = data.message;
        condensed.action = data.action;
        break;
        
      case 'midi_panic':
        condensed.message = data.message;
        break;
        
      case 'midi_import_score':
        condensed.message = data.message;
        condensed.source = data.source;
        condensed.totalDuration = data.totalDuration;
        condensed.noteCount = data.noteCount;
        break;
        
      default:
        // For other operations, include message and basic error info
        if (data.message) condensed.message = data.message;
        if (data.error) condensed.error = data.error;
        break;
    }
    
    return condensed;
  }

  /**
   * Generate concise summary for operations
   */
  private generateSummary(success: boolean, data: any, operationType: string): string {
    if (!success) {
      return `❌ ${operationType}: ${data.error || 'Erro desconhecido'}`;
    }

    switch (operationType) {
      case 'midi_list_ports':
        return `📋 ${data.count || 0} portas MIDI encontradas`;
      
      case 'configure_midi_output':
        return `🔧 Porta configurada: ${data.portName}`;
      
      case 'midi_send_note':
        const noteInfo = data.isChord 
          ? `acorde ${data.notes?.length || 0} notas`
          : `nota ${data.notes?.[0] || 'desconhecida'}`;
        return `🎵 ${noteInfo}, ${(data.duration/1000).toFixed(1)}s`;
      
      case 'midi_play_phrase':
        return `▶️ midi_play_phrase: ${data.voiceCount || 1} ${data.voiceCount === 1 ? 'voz' : 'vozes'}, ${data.bpm}BPM, ${data.duration?.toFixed(1)}s`;
      
      case 'midi_sequence_commands':
        return `🎭 Sequência: ${data.successfulCommands}/${data.totalCommands} comandos executados`;
      
      case 'midi_send_cc':
        return `🎛️ CC${data.controller}: ${data.value} → canal ${data.channel}`;
      
      case 'midi_set_tempo':
        return `⏱️ BPM: ${data.bpm}`;
      
      case 'midi_transport_control':
        return `${this.getTransportIcon(data.action)} Transport: ${data.action}`;
      
      case 'midi_panic':
        return `🚨 MIDI PANIC executado - tudo parado`;
      
      case 'midi_import_score':
        return `🎼 Partitura ${data.source}: ${data.noteCount} notas, ${data.totalDuration}`;
      
      case 'maestro_debug_last':
        return `🔍 Debug da última operação: ${this.lastOperationDetails?.operationType || 'nenhuma'}`;
      
      default:
        return success ? '✅ Operação concluída' : '❌ Operação falhou';
    }
  }

  /**
   * Get appropriate transport icon
   */
  private getTransportIcon(action: string): string {
    switch (action) {
      case 'play': return '▶️';
      case 'pause': return '⏸️';
      case 'stop': return '⏹️';
      case 'rewind': return '⏪';
      default: return '🎵';
    }
  }

  // ========================
  // CHORD SUPPORT HELPERS
  // ========================

  /**
   * Play a chord or single note with proper timing
   * Handles both chord and single note from ParsedNote
   * Applies articulation to modify actual MIDI note duration
   */
  private playParsedNote(parsedNote: ParsedNote, velocity: number, channel: number, durationMs: number): void {
    // Calculate actual MIDI note duration based on articulation
    // Articulation values: 0.0 = staccato, 1.0 = legato, 0.8 = default
    const articulatedDuration = this.calculateArticulatedDuration(durationMs, parsedNote.articulation, parsedNote.isChord);
    
    if (parsedNote.isChord && parsedNote.chordMidiNotes) {
      // Play all notes in the chord simultaneously
      for (const midiNote of parsedNote.chordMidiNotes) {
        this.mensageiro.sendNoteOn(midiNote, velocity, channel);
      }
      
      // Schedule note offs for all chord notes with articulated duration
      setTimeout(() => {
        for (const midiNote of parsedNote.chordMidiNotes!) {
          this.mensageiro.sendNoteOff(midiNote, channel);
        }
      }, articulatedDuration);
    } else {
      // Single note
      this.mensageiro.sendNoteOn(parsedNote.midiNote, velocity, channel);
      setTimeout(() => {
        this.mensageiro.sendNoteOff(parsedNote.midiNote, channel);
      }, articulatedDuration);
    }
  }

  /**
   * Calculate the actual MIDI note duration based on articulation value
   * @param baseDurationMs - The base note duration in milliseconds
   * @param articulation - Articulation value (0.0 = staccato, 1.0 = legato)
   * @param isChord - Whether this is a chord (affects legato expression)
   * @returns Adjusted duration in milliseconds
   */
  private calculateArticulatedDuration(baseDurationMs: number, articulation: number, isChord: boolean = false): number {
    // Articulation mapping for realistic musical expression:
    // 0.0 (staccato): 50% of duration - short, detached notes
    // 0.2-0.4: 60-70% of duration - moderately detached
    // 0.6-0.8: 70-90% of duration - normal playing 
    // 1.0 (legato): Enhanced for chords - longer duration for better connection
    
    let durationMultiplier: number;
    
    if (articulation <= 0.1) {
      // Staccato: very short notes (50% of duration)
      durationMultiplier = 0.5;
    } else if (articulation <= 0.3) {
      // Short staccato: interpolate between 50% and 65%
      durationMultiplier = 0.5 + (articulation - 0.0) / 0.3 * 0.15;
    } else if (articulation <= 0.7) {
      // Normal range: interpolate between 65% and 85%
      durationMultiplier = 0.65 + (articulation - 0.3) / 0.4 * 0.2;
    } else if (articulation < 1.0) {
      // Approaching legato: interpolate between 85% and target legato
      const legatoTarget = isChord ? 1.05 : 0.95; // Chords get slight overlap for better legato
      durationMultiplier = 0.85 + (articulation - 0.7) / 0.3 * (legatoTarget - 0.85);
    } else {
      // Full legato: Enhanced duration for chords to create better connection
      if (isChord) {
        // Chords: 105% duration for slight overlap - creates true legato connection
        durationMultiplier = 1.05;
      } else {
        // Single notes: 98% duration for minimal gap
        durationMultiplier = 0.98;
      }
    }
    
    const articulatedDuration = Math.max(50, baseDurationMs * durationMultiplier); // Minimum 50ms duration
    
    // Log articulation application for debugging
    logger.debug('Applied articulation to note duration', {
      component: 'MCPToolsImpl',
      operation: 'calculateArticulatedDuration',
      baseDurationMs,
      articulation,
      isChord,
      durationMultiplier: durationMultiplier.toFixed(2),
      articulatedDuration: Math.round(articulatedDuration),
      enhancement: isChord && articulation >= 1.0 ? 'Chord legato enhanced with overlap' : 'Standard articulation'
    });
    
    return articulatedDuration;
  }

  // ========================
  // UNIFIED NOTE PARSER
  // ========================

  /**
   * Parse single note with unified notation support
   * Supports both simple (C4) and musical (C4:q) notation formats
   */
  private async parseUnifiedNote(noteInput: string | number, defaultDuration: number = 1.0): Promise<{
    midiNote: number;
    duration: number;
    originalInput: string | number;
  }> {
    try {
      // Handle numeric input (already MIDI note)
      if (typeof noteInput === 'number') {
        return {
          midiNote: noteInput,
          duration: defaultDuration,
          originalInput: noteInput
        };
      }

      // Handle string input - check for musical notation
      if (noteInput.includes(':')) {
        // Musical notation format: "C4:q"
        const [noteName, durationCode] = noteInput.split(':');
        if (!noteName || !durationCode) {
          throw new Error(`Invalid musical notation: ${noteInput}`);
        }

        // Convert note name to MIDI
        const midiFromNote = Note.midi(noteName);
        if (midiFromNote === null) {
          throw new Error(`Invalid note name: ${noteName}`);
        }

        // Convert duration code to seconds using current BPM
        const durationInSeconds = this.convertDurationCodeToSeconds(durationCode, this.globalBPM);

        return {
          midiNote: midiFromNote,
          duration: durationInSeconds,
          originalInput: noteInput
        };
      } else {
        // Simple notation format: "C4"
        const midiFromNote = Note.midi(noteInput);
        if (midiFromNote === null) {
          throw new Error(`Invalid note: ${noteInput}`);
        }

        return {
          midiNote: midiFromNote,
          duration: defaultDuration,
          originalInput: noteInput
        };
      }

    } catch (error) {
      logger.error('Failed to parse unified note', { noteInput, defaultDuration, error });
      throw new Error(`Note parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert duration code (q, h, w, e, s) to seconds based on BPM
   */
  private convertDurationCodeToSeconds(durationCode: string, bpm: number): number {
    const quarterNoteDuration = 60 / bpm;
    
    const durationMap: Record<string, number> = {
      'w': quarterNoteDuration * 4,     // whole
      'h': quarterNoteDuration * 2,     // half
      'q': quarterNoteDuration,         // quarter
      'e': quarterNoteDuration / 2,     // eighth
      's': quarterNoteDuration / 4,     // sixteenth
      't': quarterNoteDuration / 8,     // thirty-second
    };

    // Handle dotted notes
    const isDotted = durationCode.endsWith('.');
    const cleanCode = isDotted ? durationCode.slice(0, -1) : durationCode;
    
    const baseDuration = durationMap[cleanCode];
    if (baseDuration === undefined) {
      logger.warn(`Unknown duration code: ${durationCode}, using quarter note`);
      return quarterNoteDuration;
    }

    // Apply dotted duration (adds half the original duration)
    return isDotted ? baseDuration * 1.5 : baseDuration;
  }

  private async initializePilares() {
    try {
      await this.mensageiro.initialize();
      await this.maestro.initialize();
      
      // Auto-connect to first available MIDI output port
      await this.autoConnectMidiOutput();
      
      logger.info('All 3 Pilares initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Pilares', error as LogContext);
    }
  }

  /**
   * Auto-connect to first available MIDI output port
   */
  private async autoConnectMidiOutput(): Promise<void> {
    try {
      const ports = this.mensageiro.listPorts();
      const outputPort = ports.find(port => port.type === 'output');
      
      if (outputPort) {
        const success = await this.mensageiro.connectToPort(outputPort.name);
        if (success) {
          this.defaultOutputPort = outputPort.name;
          logger.info(`Auto-connected to MIDI output: ${outputPort.name}`);
        } else {
          logger.warn(`Failed to auto-connect to port: ${outputPort.name}`);
        }
      } else {
        logger.warn('No MIDI output ports available for auto-connection');
      }
    } catch (error) {
      logger.warn('Auto-connection failed, MIDI operations will require manual port configuration', error as LogContext);
    }
  }

  private setupMaestroCallbacks() {
    this.maestro.onNoteEvent = (event: any) => {
      const midiNote = typeof event.midiNote === 'number' ? event.midiNote : 60;
      // Keep normalized velocity (0-1) for consistency with MCP tools
      
      this.mensageiro.sendNoteOn(midiNote, event.velocity, event.channel);
      
      // Schedule note off
      setTimeout(() => {
        this.mensageiro.sendNoteOff(midiNote, event.channel);
      }, event.duration * 1000);
    };

    this.maestro.onCCEvent = (event: any) => {
      this.mensageiro.sendCC(event.controller, event.value, event.channel);
    };

    this.maestro.onSystemEvent = (event: any) => {
      if (event.type === 'program_change' && event.channel) {
        this.mensageiro.sendProgramChange(event.value, event.channel);
      }
    };
  }

  // ========================
  // HYBRID NOTATION SUPPORT
  // ========================

  /**
   * Convert legacy input to unified format for hybrid processing
   */
  /*
  // Legacy conversion method - temporarily unused but kept for backward compatibility
  private convertLegacyToCommon(legacyInput: any): ParsedNote[] {
    try {
      const notes: string[] = Array.isArray(legacyInput.notes) 
        ? legacyInput.notes 
        : legacyInput.notes.split(/\s+/);
      
      const rhythm = legacyInput.rhythm || [];
      const globalDefaults: GlobalDefaults = {
        bpm: legacyInput.tempo || legacyInput.bpm || 120,
        velocity: legacyInput.velocity || 0.8,
        articulation: this.convertStyleToArticulation(legacyInput.style || 'legato'),
        timeSignature: '4/4',
        swing: 0,
        reverb: 0.4,
        transpose: 0
      };

      const parsedNotes: ParsedNote[] = [];
      let currentTime = 0;
      const beatsPerSecond = globalDefaults.bpm / 60;

      for (let i = 0; i < notes.length; i++) {
        const noteName = notes[i];
        if (!noteName) continue;

        const midiNote = Note.midi(noteName);
        if (midiNote === null) {
          logger.warn(`Invalid legacy note: ${noteName}, skipping`);
          continue;
        }

        // Convert legacy rhythm to duration
        const rhythmValue = rhythm[i] || 'quarter';
        const duration = this.convertLegacyRhythmToBeat(rhythmValue);

        const parsedNote: ParsedNote = {
          note: noteName,
          midiNote,
          duration,
          velocity: globalDefaults.velocity,
          articulation: globalDefaults.articulation,
          measureIndex: Math.floor(currentTime / 4), // Assuming 4/4 time
          beatPosition: currentTime % 4,
          absoluteTime: currentTime / beatsPerSecond,
          isChord: false,
          chordNotes: undefined,
          chordMidiNotes: undefined
        };

        parsedNotes.push(parsedNote);
        currentTime += duration;
      }

      return parsedNotes;
    } catch (error) {
      logger.error('Failed to convert legacy input', { error, legacyInput });
      return [];
    }
  }
  */

  /*
  // Convert legacy style to articulation value
  private convertStyleToArticulation(style: string): number {
    const styleMap: Record<string, number> = {
      'legato': 1.0,
      'staccato': 0.0,
      'tenuto': 0.9,
      'marcato': 0.1
    };
    return styleMap[style] || 0.8;
  }

  // Convert legacy rhythm string to beat duration
  private convertLegacyRhythmToBeat(rhythm: string): number {
    const rhythmMap: Record<string, number> = {
      'whole': 4.0,
      'half': 2.0,
      'quarter': 1.0,
      'eighth': 0.5,
      'sixteenth': 0.25,
      'thirty-second': 0.125
    };
    return rhythmMap[rhythm] || 1.0;
  }
  */

  /**
   * Execute MIDI from parsed notes with timing precision
   */
  private async executeMIDI(parsedNotes: ParsedNote[], channel: number): Promise<any> {
    try {
      const results: any[] = [];

      for (const note of parsedNotes) {
        // Schedule note with precise timing
        const durationSeconds = (note.duration * 60) / this.globalBPM;
        const durationMs = durationSeconds * 1000;
        
        // Use playParsedNote for both single notes and chords with proper timing
        setTimeout(() => {
          this.playParsedNote(note, note.velocity, channel, durationMs);
        }, note.absoluteTime * 1000); // Convert to milliseconds for setTimeout

        results.push({
          note: note.note,
          timing: note.absoluteTime,
          duration: note.duration,
          isChord: note.isChord,
          chordNotes: note.isChord ? note.chordNotes : undefined
        });
      }

      return {
        success: true,
        notesPlayed: results.length,
        totalDuration: parsedNotes.length > 0 
          ? parsedNotes[parsedNotes.length - 1]!.absoluteTime + parsedNotes[parsedNotes.length - 1]!.duration * 60 / this.globalBPM
          : 0
      };
    } catch (error) {
      logger.error('Failed to execute MIDI from parsed notes', { error });
      throw error;
    }
  }

  // ========================
  // DEBUG FUNCTION
  // ========================
  
  /**
   * Debug function to show details of the last MIDI operation
   */
  /**
   * Universal replay system - replays last operation with optional modifications
   */
  async maestro_replay_last(modifications: any = null): Promise<any> {
    logger.info('🔄 Replaying last operation', { modifications });
    
    if (!this.lastOperation) {
      return {
        success: false,
        error: 'Nenhuma operação anterior encontrada',
        hint: 'Execute alguma função MIDI primeiro'
      };
    }

    try {
      // Apply modifications to parameters
      let params = JSON.parse(JSON.stringify(this.lastOperation.params));
      
      if (modifications) {
        params = this.applyModifications(params, modifications);
      }

      // Execute the original function with modified parameters
      const functionName = this.lastOperation.function;
      let result;

      switch (functionName) {
        case 'midi_send_note':
          result = await this.midi_send_note(params);
          break;
        case 'midi_play_phrase':
          result = await this.midi_play_phrase(params);
          break;
        case 'midi_sequence_commands':
          result = await this.midi_sequence_commands(params);
          break;
        case 'midi_send_cc':
          result = await this.midi_send_cc(params);
          break;
        case 'midi_set_tempo':
          result = await this.midi_set_tempo(params);
          break;
        case 'midi_transport_control':
          result = await this.midi_transport_control(params);
          break;
        case 'midi_panic':
          result = await this.midi_panic(params);
          break;
        case 'midi_import_score':
          result = await this.midi_import_score(params);
          break;
        default:
          throw new Error(`Função não suportada para replay: ${functionName}`);
      }

      return {
        success: true,
        message: `Replay executado: ${functionName}`,
        originalFunction: functionName,
        modifications: modifications || {},
        result: result
      };

    } catch (error) {
      logger.error('Falha no replay', { error: error instanceof Error ? error.message : error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        originalFunction: this.lastOperation.function
      };
    }
  }

  /**
   * Apply path-based modifications to parameters
   */
  private applyModifications(params: any, modifications: any): any {
    const result = JSON.parse(JSON.stringify(params));
    
    for (const [path, value] of Object.entries(modifications)) {
      this.setNestedValue(result, path, value);
    }
    
    return result;
  }

  /**
   * Set nested value using path notation (e.g., "voices[0].channel")
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = obj;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]!;
      
      // Handle array notation: "voices[0]"
      if (part.includes('[')) {
        const [key, indexPart] = part.split('[');
        const index = parseInt(indexPart!.replace(']', ''));
        
        if (!current[key!]) current[key!] = [];
        if (!current[key!][index]) current[key!][index] = {};
        current = current[key!][index];
      } else {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    }
    
    // Set final value
    const lastPart = parts[parts.length - 1]!;
    if (lastPart.includes('[')) {
      const [key, indexPart] = lastPart.split('[');
      const index = parseInt(indexPart!.replace(']', ''));
      
      if (!current[key!]) current[key!] = [];
      current[key!][index] = value;
    } else {
      current[lastPart] = value;
    }
  }

  async maestro_debug_last(): Promise<any> {
    logger.info('🔍 Debug: retrieving last operation details');
    
    if (!this.lastOperationDetails) {
      return this.formatResponse(true, {
        message: 'Nenhuma operação MIDI foi executada ainda',
        hint: 'Execute alguma função MIDI primeiro para ver os detalhes aqui'
      }, true, 'maestro_debug_last');
    }

    return this.formatResponse(true, {
      message: 'Detalhes da última operação MIDI executada',
      lastOperation: this.lastOperationDetails.operationType,
      timestamp: this.lastOperationDetails.timestamp,
      success: this.lastOperationDetails.success,
      fullDetails: this.lastOperationDetails.fullData,
      replayAvailable: this.lastOperation !== null,
      note: 'Esta função sempre retorna detalhes completos (verbose=true automático)'
    }, true, 'maestro_debug_last');
  }

  // ========================
  // 1. SYSTEM MANAGEMENT
  // ========================

  async midi_list_ports(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_list_ports>) {
    this.captureOperation('midi_list_ports', params);
    logger.info('🎹 Listing MIDI ports', { refresh: params.refresh });
    
    try {
      const ports = await this.mensageiro.listPorts();
      
      logger.info(`Found ${ports.length} MIDI ports`);
      
      const data = {
        ports: ports.map(port => ({
          id: port.id,
          name: port.name,
          type: port.type,
          connected: port.connected,
          manufacturer: port.manufacturer || 'Unknown'
        })),
        count: ports.length,
        currentOutput: this.defaultOutputPort
      };

      return this.formatResponse(true, data, params.verbose, 'midi_list_ports');
    } catch (error) {
      logger.error('Failed to list MIDI ports', { error: error instanceof Error ? error.message : error });
      const errorData = {
        error: error instanceof Error ? error.message : 'Unknown error',
        ports: [],
        count: 0
      };
      return this.formatResponse(false, errorData, params.verbose, 'midi_list_ports');
    }
  }

  async configure_midi_output(params: z.infer<typeof MCP_TOOL_SCHEMAS.configure_midi_output>) {
    this.captureOperation('configure_midi_output', params);
    logger.info('🔧 Configuring MIDI output', { portName: params.portName });
    
    try {
      const success = await this.mensageiro.connectToPort(params.portName);
      
      if (success) {
        this.defaultOutputPort = params.portName;
        logger.info(`Successfully configured output port: ${params.portName}`);
        
        const data = {
          message: `Successfully configured MIDI output to: ${params.portName}`,
          portName: params.portName
        };
        return this.formatResponse(true, data, params.verbose, 'configure_midi_output');
      } else {
        logger.warn(`Failed to connect to port: ${params.portName}`);
        const errorData = {
          error: `Could not connect to MIDI port: ${params.portName}`,
          availablePorts: (await this.mensageiro.listPorts()).map(p => p.name)
        };
        return this.formatResponse(false, errorData, params.verbose, 'configure_midi_output');
      }
    } catch (error) {
      logger.error('Failed to configure MIDI output', { error: error instanceof Error ? error.message : error });
      const errorData = {
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      return this.formatResponse(false, errorData, params.verbose, 'configure_midi_output');
    }
  }

  // ========================
  // 2. BASIC MUSICAL CONTROL
  // ========================

  async midi_send_note(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_send_note>) {
    this.captureOperation('midi_send_note', params);
    logger.info('🎵 Sending MIDI note with unified parser', params);
    
    try {
      // Handle port override
      if (params.outputPort) {
        await this.mensageiro.connectToPort(params.outputPort);
      }

      // Check if input contains hybrid notation (chords or complex syntax)
      const noteInput = typeof params.note === 'string' ? params.note : params.note.toString();
      const isHybridNotation = noteInput.includes('[') || noteInput.includes(':');
      
      if (isHybridNotation) {
        // Use hybrid parser for chord/complex notation
        const globalDefaults = {
          bpm: params.bpm || 120,
          velocity: params.velocity,
          articulation: 0.8,
          timeSignature: "4/4",
          transpose: 0,
          swing: 0,
          reverb: 0.4
        };
        
        const parsedNotes = parseHybridNotation(noteInput, globalDefaults);
        if (parsedNotes.length === 0) {
          throw new Error('No valid notes parsed from input');
        }
        
        const parsedNote = parsedNotes[0]!; // Take first note/chord (guaranteed to exist by check above)
        const finalDuration = parsedNote.duration * (60 / globalDefaults.bpm) * 1000; // Convert to ms
        
        logger.info('🎵 Parsed hybrid notation', {
          input: noteInput,
          isChord: parsedNote.isChord,
          notes: parsedNote.isChord ? parsedNote.chordNotes : [parsedNote.note],
          duration: finalDuration,
          velocity: parsedNote.velocity,
          channel: params.channel
        });

        // Use the new chord-aware playback function
        this.playParsedNote(parsedNote, parsedNote.velocity, params.channel, finalDuration);

        const data = {
          message: parsedNote.isChord 
            ? `Chord sent: ${parsedNote.chordNotes?.join(', ')} on channel ${params.channel}`
            : `Note sent: ${parsedNote.note} (MIDI ${parsedNote.midiNote}) on channel ${params.channel}`,
          isChord: parsedNote.isChord,
          notes: parsedNote.isChord ? parsedNote.chordNotes : [parsedNote.note],
          midiNotes: parsedNote.isChord ? parsedNote.chordMidiNotes : [parsedNote.midiNote],
          velocity: parsedNote.velocity,
          duration: finalDuration,
          channel: params.channel,
          notationUsed: 'hybrid'
        };
        return this.formatResponse(true, data, params.verbose, 'midi_send_note');
      } else {
        // Use legacy parser for simple notation
        const defaultDuration = 'duration' in params ? params.duration : 1.0;
        const parsedNote = await this.parseUnifiedNote(params.note, defaultDuration);
        const finalDuration = parsedNote.duration * 1000; // Convert to ms
        
        logger.info('🎵 Parsed simple notation', {
          original: parsedNote.originalInput,
          midiNote: parsedNote.midiNote,
          duration: finalDuration,
          velocity: params.velocity,
          channel: params.channel
        });

        // Send single note
        this.mensageiro.sendNoteOn(parsedNote.midiNote, params.velocity, params.channel);
        setTimeout(() => {
          this.mensageiro.sendNoteOff(parsedNote.midiNote, params.channel);
        }, finalDuration);

        const data = {
          message: `Note sent: ${parsedNote.originalInput} (MIDI ${parsedNote.midiNote}) on channel ${params.channel}`,
          isChord: false,
          notes: [parsedNote.originalInput.toString()],
          midiNotes: [parsedNote.midiNote],
          velocity: params.velocity,
          duration: finalDuration,
          channel: params.channel,
          notationUsed: typeof params.note === 'string' && params.note.includes(':') ? 'musical' : 'simple'
        };
        return this.formatResponse(true, data, params.verbose, 'midi_send_note');
      }
    } catch (error) {
      logger.error('Failed to send MIDI note', { error: error instanceof Error ? error.message : error });
      const errorData = {
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      return this.formatResponse(false, errorData, params.verbose, 'midi_send_note');
    }
  }

  async midi_play_phrase(params: any) {
    this.captureOperation('midi_play_phrase', params);
    logger.info('🎼 Playing musical phrase with POLYPHONIC support', params);
    
    try {
      // Handle port override
      if (params.outputPort) {
        await this.mensageiro.connectToPort(params.outputPort);
      }

      // Enhanced format detection supporting multi-voice
      const format = detectNotationFormat(params);
      logger.info(`Detected notation format: ${format}`);

      // Parse using unified notation system
      const voiceResults = parseUnifiedNotation(params);
      
      if (voiceResults.length === 0) {
        throw new Error('No valid voices found in input');
      }

      // Set global BPM
      this.globalBPM = params.bpm || 120;

      // Execute all voices simultaneously using channels
      const playbackPromises = voiceResults.map(async (voiceResult) => {
        if (voiceResult.parsedNotes.length === 0) {
          logger.warn(`Voice on channel ${voiceResult.channel} has no notes, skipping`);
          return;
        }

        // Apply effects to each voice independently
        const processedNotes = applyEffects(voiceResult.parsedNotes, {
          reverb: params.reverb || 0.4,
          swing: params.swing || 0.0,
          transpose: params.transpose || 0
        });

        // Execute this voice on its assigned channel
        await this.executeMIDI(processedNotes, voiceResult.channel);
      });

      // Wait for all voices to complete
      await Promise.all(playbackPromises);

      // Calculate statistics
      const totalNotes = voiceResults.reduce((sum, voice) => sum + voice.parsedNotes.length, 0);
      const maxDuration = Math.max(...voiceResults.map(voice => voice.totalDuration));
      const channelsUsed = voiceResults.map(voice => voice.channel);

      logger.info('Polyphonic phrase played successfully', { 
        format, 
        voices: voiceResults.length,
        totalNotes,
        channels: channelsUsed,
        duration: `${maxDuration.toFixed(2)}s`
      });

      const data = {
        message: `Playing ${format} notation with ${voiceResults.length} voice(s)`,
        format: format,
        voiceCount: voiceResults.length,
        totalNotes: totalNotes,
        channels: channelsUsed,
        duration: maxDuration,
        bpm: this.globalBPM,
        // Voice details for debugging (limit output for large pieces)
        voices: voiceResults.length <= 8 ? voiceResults.map(voice => ({
          channel: voice.channel,
          noteCount: voice.parsedNotes.length,
          duration: voice.totalDuration,
          // Include first few notes as sample
          sampleNotes: voice.parsedNotes.slice(0, 3).map(note => ({
            note: note.note,
            isChord: note.isChord,
            velocity: note.velocity,
            articulation: note.articulation
          }))
        })) : undefined,
        effects: {
          reverb: params.reverb || 0.4,
          swing: params.swing || 0.0,
          transpose: params.transpose || 0
        }
      };

      return this.formatResponse(true, data, params.verbose, 'midi_play_phrase');

    } catch (error) {
      logger.error('Failed to play polyphonic phrase', { error: error instanceof Error ? error.message : error });
      const errorData = {
        error: error instanceof Error ? error.message : 'Unknown error',
        format: 'unknown'
      };
      return this.formatResponse(false, errorData, params.verbose, 'midi_play_phrase');
    }
  }

  // ========================
  // 3. ADVANCED CONTROL
  // ========================

  async midi_sequence_commands(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_sequence_commands>) {
    this.captureOperation('midi_sequence_commands', params);
    logger.info('🎭 Executing MIDI sequence', { commandCount: params.commands.length });
    
    try {
      // Handle port override
      if (params.outputPort) {
        await this.mensageiro.connectToPort(params.outputPort);
      }

      const results = [];
      
      for (const command of params.commands) {
        const result = await this.executeSequenceCommand(command);
        results.push(result);
        
        if (!result.success) {
          logger.warn('Command failed in sequence', { command, error: result.error });
        }
      }

      const successCount = results.filter(r => r.success).length;
      
      const data = {
        message: `Executed ${successCount}/${results.length} commands successfully`,
        results,
        totalCommands: params.commands.length,
        successfulCommands: successCount
      };
      return this.formatResponse(successCount === results.length, data, params.verbose, 'midi_sequence_commands');
    } catch (error) {
      logger.error('Failed to execute MIDI sequence', { error: error instanceof Error ? error.message : error });
      const errorData = {
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      return this.formatResponse(false, errorData, params.verbose, 'midi_sequence_commands');
    }
  }

  private async executeSequenceCommand(command: z.infer<typeof MCP_TOOL_SCHEMAS.midi_sequence_commands>['commands'][0]) {
    try {
      const delay = command.time ? command.time * 1000 : 0;
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      switch (command.type) {
        case 'note':
          if (!command.note) throw new Error('Note parameter required for note command');
          
          // Check if it's hybrid notation with chord support
          if (typeof command.note === 'string' && (command.note.includes('[') || command.note.includes(':'))) {
            // Use hybrid parser for chord and advanced notation support
            const globalDefaults = {
              bpm: this.globalBPM,
              timeSignature: '4/4',
              velocity: command.velocity || 0.8,
              articulation: 0.8,
              reverb: 0.4,
              swing: 0,
              transpose: 0
            };
            
            const parsedNotes = parseHybridNotation(command.note, globalDefaults);
            if (parsedNotes.length === 0) throw new Error('No valid notes parsed');
            
            const parsedNote = parsedNotes[0]!; // Use first note for sequence timing (guaranteed to exist)
            const velocity = command.velocity || parsedNote.velocity;
            const channel = command.channel || 1;
            const finalDuration = (parsedNote.duration * 60 / this.globalBPM) * 1000; // Convert to ms
            
            logger.info('🎵 Sequence hybrid note parsed', {
              original: command.note,
              isChord: parsedNote.isChord,
              notes: parsedNote.isChord ? parsedNote.chordNotes : [parsedNote.note],
              midiNotes: parsedNote.isChord ? parsedNote.chordMidiNotes : [parsedNote.midiNote],
              duration: finalDuration,
              velocity,
              channel
            });
            
            // Play the parsed note (handles both single notes and chords)
            this.playParsedNote(parsedNote, velocity, channel, finalDuration);
            
            return { 
              success: true, 
              type: 'note', 
              isChord: parsedNote.isChord,
              notes: parsedNote.isChord ? parsedNote.chordNotes : [parsedNote.note],
              midiNotes: parsedNote.isChord ? parsedNote.chordMidiNotes : [parsedNote.midiNote],
              velocity,
              duration: finalDuration / 1000,
              notationUsed: 'hybrid'
            };
          } else {
            // Use unified parser for simple notation
            const parsedNote = await this.parseUnifiedNote(command.note, command.duration || 1.0);
            const finalDuration = parsedNote.duration * 1000; // Convert to ms
            
            // Use normalized velocity directly (0-1)
            const velocity = command.velocity || 0.8;
            const channel = command.channel || 1;
            
            logger.info('🎵 Sequence note parsed', {
              original: parsedNote.originalInput,
              midiNote: parsedNote.midiNote,
              duration: parsedNote.duration,
              velocity,
              channel
            });
            
            this.mensageiro.sendNoteOn(parsedNote.midiNote, velocity, channel);
            setTimeout(() => {
              this.mensageiro.sendNoteOff(parsedNote.midiNote, channel);
            }, finalDuration);
            
            return { 
              success: true, 
              type: 'note', 
              midiNote: parsedNote.midiNote, 
              velocity: command.velocity,
              duration: parsedNote.duration,
              notationUsed: typeof command.note === 'string' && command.note.includes(':') ? 'musical' : 'simple'
            };
          }

        case 'cc':
          if (command.controller === undefined || command.value === undefined) {
            throw new Error('Controller and value required for CC command');
          }
          
          this.mensageiro.sendCC(command.controller, command.value, command.channel || 1);
          return { success: true, type: 'cc', controller: command.controller, value: command.value };

        case 'delay':
          // Delay already handled above
          return { success: true, type: 'delay', duration: command.time };

        default:
          throw new Error(`Unknown command type: ${command.type}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        command
      };
    }
  }

  async midi_send_cc(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_send_cc>) {
    this.captureOperation('midi_send_cc', params);
    logger.info('🎛️ Sending MIDI CC', params);
    
    try {
      // Handle port override
      if (params.outputPort) {
        await this.mensageiro.connectToPort(params.outputPort);
      }

      // Convert controller name to number if needed
      let controllerNumber: number;
      if (typeof params.controller === 'string') {
        if (params.controller in CC_MAPPINGS) {
          controllerNumber = CC_MAPPINGS[params.controller as keyof typeof CC_MAPPINGS];
        } else {
          throw new Error(`Unknown controller name: ${params.controller}`);
        }
      } else {
        controllerNumber = params.controller;
      }

      this.mensageiro.sendCC(controllerNumber, params.value, params.channel);

      return {
        success: true,
        message: `CC sent: Controller ${controllerNumber} = ${params.value} on channel ${params.channel}`,
        controller: controllerNumber,
        controllerName: typeof params.controller === 'string' ? params.controller : 'Custom',
        value: params.value,
        channel: params.channel
      };
    } catch (error) {
      logger.error('Failed to send MIDI CC', { error: error instanceof Error ? error.message : error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ========================
  // 4. TIME & STATE MANAGEMENT  
  // ========================

  async midi_set_tempo(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_set_tempo>) {
    this.captureOperation('midi_set_tempo', params);
    logger.info('⏱️ Setting global tempo', params);
    
    try {
      this.globalBPM = params.bpm;
      this.maestro.setBPM(params.bpm);
      
      return {
        success: true,
        message: `Global tempo set to ${params.bpm} BPM`,
        bpm: params.bpm,
        previousBPM: this.globalBPM
      };
    } catch (error) {
      logger.error('Failed to set tempo', { error: error instanceof Error ? error.message : error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async midi_transport_control(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_transport_control>) {
    this.captureOperation('midi_transport_control', params);
    logger.info('▶️ Transport control', params);
    
    try {
      switch (params.action) {
        case 'play':
          this.maestro.play();
          break;
        case 'pause':
          this.maestro.pause();
          break;
        case 'stop':
          this.maestro.stop();
          break;
        case 'rewind':
          this.maestro.stop();
          // Rewind to beginning (implementation depends on Maestro capabilities)
          break;
        default:
          throw new Error(`Unknown transport action: ${params.action}`);
      }

      return {
        success: true,
        message: `Transport ${params.action} executed`,
        action: params.action,
        currentState: this.maestro.getPlaybackState(),
        currentTime: this.maestro.getCurrentTime()
      };
    } catch (error) {
      logger.error('Failed to control transport', { error: error instanceof Error ? error.message : error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async midi_panic(_params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_panic>) {
    this.captureOperation('midi_panic', _params);
    logger.info('🚨 MIDI PANIC - Emergency stop');
    
    try {
      // Stop all transport
      this.maestro.stop();
      
      // Send All Notes Off and Reset Controllers on all channels
      for (let channel = 1; channel <= 16; channel++) {
        this.mensageiro.sendAllNotesOff(channel);
      }
      
      // Send panic to Mensageiro
      this.mensageiro.sendPanic();

      return {
        success: true,
        message: 'MIDI PANIC executed - all notes stopped, controllers reset',
        timestamp: new Date().toISOString(),
        actionsPerformed: [
          'Transport stopped',
          'All Notes Off (channels 1-16)',
          'Reset Controllers (channels 1-16)',
          'Mensageiro panic'
        ]
      };
    } catch (error) {
      logger.error('Failed to execute MIDI panic', { error: error instanceof Error ? error.message : error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ========================
  // NEW: SCORE IMPORT
  // ========================

  async midi_import_score(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_import_score>) {
    this.captureOperation('midi_import_score', params);
    logger.info('🎼 Importing and executing musical score', { 
      source: params.source, 
      tempo: params.tempo,
      preview: params.preview 
    });
    
    try {
      let sequence;
      
      switch (params.source) {
        case 'text_notation':
          sequence = this.parseTextNotation(params.data);
          break;
        case 'guitar_tab':
          sequence = this.parseGuitarTab(params.data);
          break;
        case 'musicxml':
          return {
            success: false,
            error: 'MusicXML import not yet implemented. Use text_notation format instead.',
            supportedFormats: ['text_notation', 'guitar_tab']
          };
        default:
          return {
            success: false,
            error: `Unsupported source format: ${params.source}`,
            supportedFormats: ['text_notation', 'guitar_tab', 'musicxml']
          };
      }

      if (!sequence || sequence.notes.length === 0) {
        return {
          success: false,
          error: 'No musical content found in the provided data'
        };
      }

      // Calculate total duration
      const totalDuration = this.calculateTotalDuration(sequence, params.tempo);
      
      if (params.preview) {
        return {
          success: true,
          preview: true,
          sequence: sequence,
          totalDuration: `${totalDuration.toFixed(2)} seconds`,
          noteCount: sequence.notes.length,
          estimatedBars: Math.ceil(totalDuration / (240 / params.tempo)), // Rough bar estimate
          message: 'Preview calculated - use preview: false to execute'
        };
      }

      // Execute using existing midi_play_phrase functionality with enhanced options
      const executeParams = {
        notes: sequence.notes.join(' '),
        rhythm: sequence.rhythms.join(' '),
        tempo: params.tempo,
        channel: params.channel,
        quantize: params.quantize,
        notation: 'auto' as const,
        outputPort: params.outputPort,
        style: 'legato' as const,
        gap: 100,
        timeSignature: [4, 4] as [number, number]
      };

      // Use the enhanced midi_play_phrase with the new notation system  
      const result = await this.midi_play_phrase(executeParams);
      
      return {
        success: true,
        imported: true,
        source: params.source,
        totalDuration: `${totalDuration.toFixed(2)} seconds`,
        noteCount: sequence.notes.length,
        executionResult: result,
        message: `Successfully imported and executed ${params.source} score`
      };

    } catch (error) {
      logger.error('Failed to import/execute score', { 
        source: params.source,
        error: error instanceof Error ? error.message : error 
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: params.source
      };
    }
  }

  // ========================
  // HELPER METHODS FOR SCORE PARSING
  // ========================

  private parseTextNotation(data: string): { notes: string[]; rhythms: string[] } {
    try {
      // Handle bar lines and clean up input
      const cleanData = data
        .replace(/\|/g, ' ') // Remove bar lines
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();

      const tokens = cleanData.split(' ').filter(token => token.length > 0);
      const notes: string[] = [];
      const rhythms: string[] = [];

      for (const token of tokens) {
        if (token.includes(':')) {
          // Musical notation format: "C4:q"
          const [note, durationCode] = token.split(':');
          if (note && durationCode) {
            notes.push(note);
            
            // Convert duration codes to full names
            const durationMap: Record<string, string> = {
              'w': 'whole', 'h': 'half', 'q': 'quarter', 
              'e': 'eighth', 's': 'sixteenth', 't': 'thirty-second'
            };
            
            // Handle dotted notes
            const isDotted = durationCode.endsWith('.');
            const cleanCode = isDotted ? durationCode.slice(0, -1) : durationCode;
            const baseDuration = durationMap[cleanCode] || 'quarter';
            const finalDuration = isDotted ? `dotted-${baseDuration}` : baseDuration;
            
            rhythms.push(finalDuration);
          }
        } else if (token.toLowerCase() === 'rest' || token === 'r') {
          notes.push('rest');
          rhythms.push('quarter');
        } else {
          // Simple note format: "C4"
          notes.push(token);
          rhythms.push('quarter'); // Default to quarter notes
        }
      }

      return { notes, rhythms };

    } catch (error) {
      throw new Error(`Failed to parse text notation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseGuitarTab(data: string): { notes: string[]; rhythms: string[] } {
    try {
      // Basic guitar tablature parser
      // Format: "3-0-2-3" (frets on strings) or more complex tab notation
      const lines = data.split('\n').filter(line => line.trim().length > 0);
      const notes: string[] = [];
      const rhythms: string[] = [];

      // Standard guitar tuning (low to high): E2, A2, D3, G3, B3, E4
      const stringTuning = [
        Note.get('E2').midi || 40,  // 6th string (lowest)
        Note.get('A2').midi || 45,  // 5th string  
        Note.get('D3').midi || 50,  // 4th string
        Note.get('G3').midi || 55,  // 3rd string
        Note.get('B3').midi || 59,  // 2nd string
        Note.get('E4').midi || 64   // 1st string (highest)
      ];

      for (const line of lines) {
        // Simple fret notation: "3-0-2-3" etc.
        if (line.includes('-')) {
          const frets = line.split('-');
          
          frets.forEach((fret, stringIndex) => {
            const fretNum = parseInt(fret.trim());
            
            if (!isNaN(fretNum) && fretNum >= 0 && stringIndex < stringTuning.length) {
              const midiNote = stringTuning[5 - stringIndex]! + fretNum; // Reverse string order
              const noteName = Note.fromMidi(midiNote);
              
              if (noteName) {
                notes.push(noteName);
                rhythms.push('quarter');
              }
            }
          });
        }
      }

      if (notes.length === 0) {
        throw new Error('No valid guitar tablature found. Expected format: "3-0-2-3" (fret numbers separated by dashes)');
      }

      return { notes, rhythms };

    } catch (error) {
      throw new Error(`Failed to parse guitar tablature: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private calculateTotalDuration(
    sequence: { notes: string[]; rhythms: string[] }, 
    bpm: number
  ): number {
    try {
      const quarterNoteDuration = 60 / bpm;
      
      const durationMap: Record<string, number> = {
        'whole': 4, 'half': 2, 'quarter': 1, 'eighth': 0.5, 'sixteenth': 0.25,
        'dotted-whole': 6, 'dotted-half': 3, 'dotted-quarter': 1.5, 'dotted-eighth': 0.75
      };

      let totalQuarterNotes = 0;
      
      for (const rhythm of sequence.rhythms) {
        totalQuarterNotes += durationMap[rhythm] || 1;
      }

      return totalQuarterNotes * quarterNoteDuration;

    } catch (error) {
      logger.warn('Failed to calculate duration, using default', { error });
      return sequence.notes.length * (60 / bpm); // Fallback: quarter notes
    }
  }
}