/**
 * Core type definitions for Maestro MCP Musical Server
 * Defines interfaces for the 3-pillar architecture
 */
export interface PlanoMusical {
    bpm: number;
    timeSignature?: string;
    key?: string;
    events: MusicEvent[];
}
export interface MusicEvent {
    time: string;
    type: "note" | "chord" | "cc" | "sequence" | "rest";
    value: string | number | object;
    duration?: string;
    velocity?: number;
    channel?: number;
    articulation?: "legato" | "staccato" | "tenuto" | "marcato";
    [key: string]: any;
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
    absoluteTime: number;
    toneName: string;
    midiNote: number;
    velocity: number;
    duration: number;
    channel: number;
    articulation: ArticulationType;
    noteOffTime: number;
}
export interface CCEvent {
    absoluteTime: number;
    controller: number;
    value: number;
    channel: number;
    description?: string;
}
export interface SystemEvent {
    absoluteTime: number;
    type: "tempo_change" | "time_signature" | "program_change";
    value: any;
    channel?: number;
}
export type ArticulationType = "legato" | "staccato" | "tenuto" | "marcato" | "accent" | "sforzando";
export interface MaestroEngine {
    play(): void;
    pause(): void;
    stop(): void;
    setBPM(bpm: number): void;
    schedulePartitura(partitura: PartituraExecutavel): string;
    scheduleEvent(event: ScheduledEvent, time: number): void;
    getCurrentTime(): number;
    getPlaybackState(): "playing" | "paused" | "stopped";
    onNoteEvent: (event: NoteEvent) => void;
    onCCEvent: (event: CCEvent) => void;
    onSystemEvent: (event: SystemEvent) => void;
}
export interface ScheduledEvent {
    type: "note" | "cc" | "system";
    data: NoteEvent | CCEvent | SystemEvent;
}
export interface MensageiroMIDI {
    listPorts(): MidiPort[];
    connectToPort(portName: string): Promise<boolean>;
    disconnectPort(): void;
    getConnectedPort(): string | null;
    sendNoteOn(note: number, velocity: number, channel: number): void;
    sendNoteOff(note: number, channel: number): void;
    sendCC(controller: number, value: number, channel: number): void;
    sendProgramChange(program: number, channel: number): void;
    sendAllNotesOff(channel?: number): void;
    sendPanic(): void;
}
export interface MidiPort {
    id: string;
    name: string;
    type: "input" | "output";
    connected: boolean;
    manufacturer?: string | undefined;
}
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
export declare class MidiError extends Error {
    code?: string | undefined;
    constructor(message: string, code?: string | undefined);
}
export declare class MusicTheoryError extends Error {
    invalidValue?: any | undefined;
    constructor(message: string, invalidValue?: any | undefined);
}
export declare class TimingError extends Error {
    actualLatency?: number | undefined;
    constructor(message: string, actualLatency?: number | undefined);
}
//# sourceMappingURL=index.d.ts.map