/**
 * Core type definitions for Maestro MCP Musical Server
 * Defines interfaces for the 3-pillar architecture
 */

// Pilar 1: Tradutor Types
export interface PlanoMusical {
  bpm: number;
  timeSignature?: string; // "4/4", "3/4", etc.
  key?: string; // "C major", "Am", etc.
  events: MusicEvent[];
}

export interface MusicEvent {
  time: string; // Musical notation: "0:0", "1:2:3", "4n", "8t"
  type: "note" | "chord" | "cc" | "sequence" | "rest";
  value: string | number | object;
  duration?: string; // "4n", "8n", "2n.", "16t"
  velocity?: number; // 0-1
  channel?: number; // 1-16
  articulation?: "legato" | "staccato" | "tenuto" | "marcato";
  [key: string]: any; // Type-specific properties
}

export interface PartituraExecutavel {
  metadata: {
    bpm: number;
    timeSignature: string;
    key: string;
    totalDuration: string;
    eventCount: number;
  };
  noteEvents: NoteEvent[];
  controlChangeEvents: CCEvent[];
  systemEvents: SystemEvent[];
}

export interface NoteEvent {
  absoluteTime: number; // Absolute time in seconds
  toneName: string; // "C4", "F#3", etc.
  midiNote: number; // 0-127
  velocity: number; // 0-1 (normalized)
  duration: number; // Duration in seconds
  channel: number; // 1-16
  articulation: ArticulationType;
  noteOffTime: number; // Calculated time for note-off
}

export interface CCEvent {
  absoluteTime: number;
  controller: number; // 0-127 (should be resolved to number by time of use)
  value: number; // 0-127
  channel: number;
  description?: string; // "Volume", "Pan", "Reverb", etc.
}

export interface SystemEvent {
  absoluteTime: number;
  type: "tempo_change" | "time_signature" | "program_change";
  value: any;
  channel?: number;
}

export type ArticulationType = "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando";

// Pilar 2: Maestro Types
export interface MaestroEngine {
  // Transport control
  play(): void;
  pause(): void;
  stop(): void;
  setBPM(bpm: number): void;
  
  // Scheduling
  schedulePartitura(partitura: PartituraExecutavel): string; // returns playbackId
  scheduleEvent(event: ScheduledEvent, time: number): void;
  
  // State
  getCurrentTime(): number;
  getPlaybackState(): "playing" | "paused" | "stopped";
  
  // Callbacks for Pilar 3
  onNoteEvent: (event: NoteEvent) => void;
  onCCEvent: (event: CCEvent) => void;
  onSystemEvent: (event: SystemEvent) => void;
}

export interface ScheduledEvent {
  type: "note" | "cc" | "system";
  data: NoteEvent | CCEvent | SystemEvent;
}

// Pilar 3: Mensageiro Types
export interface MensageiroMIDI {
  // Port management
  listPorts(): MidiPort[];
  connectToPort(portName: string): Promise<boolean>;
  disconnectPort(): void;
  getConnectedPort(): string | null;
  
  // Immediate sending
  sendNoteOn(note: number, velocity: number, channel: number): void;
  sendNoteOff(note: number, channel: number): void;
  sendCC(controller: number, value: number, channel: number): void;
  sendProgramChange(program: number, channel: number): void;
  
  // Utilities
  sendAllNotesOff(channel?: number): void;
  sendPanic(): void; // Emergency stop
}

export interface MidiPort {
  id: string;
  name: string;
  type: "input" | "output";
  connected: boolean;
  manufacturer?: string | undefined;
}

// MCP Tool Types
export interface MidiToolParameters {
  note?: string | number;
  velocity?: number;
  duration?: number;
  channel?: number;
  outputPort?: string;
}

export interface SequenceCommand {
  type: "note" | "cc" | "delay";
  time?: number;
  note?: string;
  duration?: number;
  velocity?: number;
  controller?: number;
  value?: number;
  channel?: number;
}

// Error Types
export class MidiError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'MidiError';
  }
}

export class MusicTheoryError extends Error {
  constructor(message: string, public invalidValue?: any) {
    super(message);
    this.name = 'MusicTheoryError';
  }
}

export class TimingError extends Error {
  constructor(message: string, public actualLatency?: number) {
    super(message);
    this.name = 'TimingError';
  }
}