/**
 * MCP Tools Implementation
 * Real implementations for all 8 mandatory MIDI tools
 */
import { z } from 'zod';
import { MCP_TOOL_SCHEMAS } from './mcp-tools-schemas.js';
/**
 * Core MCP Tools Class
 * Orchestrates the 3 Pilares for MCP tool execution
 */
export declare class MCPToolsImpl {
    private mensageiro;
    private maestro;
    private defaultOutputPort;
    private globalBPM;
    constructor();
    /**
     * Play a chord or single note with proper timing
     * Handles both chord and single note from ParsedNote
     */
    private playParsedNote;
    /**
     * Parse single note with unified notation support
     * Supports both simple (C4) and musical (C4:q) notation formats
     */
    private parseUnifiedNote;
    /**
     * Convert duration code (q, h, w, e, s) to seconds based on BPM
     */
    private convertDurationCodeToSeconds;
    private initializePilares;
    /**
     * Auto-connect to first available MIDI output port
     */
    private autoConnectMidiOutput;
    private setupMaestroCallbacks;
    /**
     * Convert legacy input to unified format for hybrid processing
     */
    private convertLegacyToCommon;
    /**
     * Convert legacy style to articulation value
     */
    private convertStyleToArticulation;
    /**
     * Convert legacy rhythm string to beat duration
     */
    private convertLegacyRhythmToBeat;
    /**
     * Execute MIDI from parsed notes with timing precision
     */
    private executeMIDI;
    midi_list_ports(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_list_ports>): Promise<{
        success: boolean;
        ports: {
            id: string;
            name: string;
            type: "input" | "output";
            connected: boolean;
            manufacturer: string;
        }[];
        count: number;
        currentOutput: string | null;
        error?: never;
    } | {
        success: boolean;
        error: string;
        ports: never[];
        count: number;
        currentOutput?: never;
    }>;
    configure_midi_output(params: z.infer<typeof MCP_TOOL_SCHEMAS.configure_midi_output>): Promise<{
        success: boolean;
        message: string;
        portName: string;
        error?: never;
        availablePorts?: never;
    } | {
        success: boolean;
        error: string;
        availablePorts: string[];
        message?: never;
        portName?: never;
    } | {
        success: boolean;
        error: string;
        message?: never;
        portName?: never;
        availablePorts?: never;
    }>;
    midi_send_note(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_send_note>): Promise<{
        success: boolean;
        message: string;
        isChord: boolean;
        notes: string[] | undefined;
        midiNotes: number[] | undefined;
        velocity: number;
        duration: number;
        channel: number;
        notationUsed: string;
        error?: never;
    } | {
        success: boolean;
        error: string;
        message?: never;
        isChord?: never;
        notes?: never;
        midiNotes?: never;
        velocity?: never;
        duration?: never;
        channel?: never;
        notationUsed?: never;
    }>;
    midi_play_phrase(params: any): Promise<{
        success: boolean;
        message: string;
        noteCount: number;
        format: "hybrid" | "legacy";
        duration: number;
        bpm: number;
        channel: any;
        parsedNotes: {
            note: string;
            duration: number;
            velocity: number;
            articulation: number;
            timing: number;
        }[] | undefined;
        effects: {
            reverb: any;
            swing: any;
            transpose: any;
        };
        error?: never;
    } | {
        success: boolean;
        error: string;
        format: string;
        message?: never;
        noteCount?: never;
        duration?: never;
        bpm?: never;
        channel?: never;
        parsedNotes?: never;
        effects?: never;
    }>;
    midi_sequence_commands(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_sequence_commands>): Promise<{
        success: boolean;
        message: string;
        results: ({
            success: boolean;
            type: string;
            isChord: boolean;
            notes: string[] | undefined;
            midiNotes: number[] | undefined;
            velocity: number;
            duration: number;
            notationUsed: string;
            midiNote?: never;
            controller?: never;
            value?: never;
            error?: never;
            command?: never;
        } | {
            success: boolean;
            type: string;
            midiNote: number;
            velocity: number | undefined;
            duration: number;
            notationUsed: string;
            isChord?: never;
            notes?: never;
            midiNotes?: never;
            controller?: never;
            value?: never;
            error?: never;
            command?: never;
        } | {
            success: boolean;
            type: string;
            controller: number;
            value: number;
            isChord?: never;
            notes?: never;
            midiNotes?: never;
            velocity?: never;
            duration?: never;
            notationUsed?: never;
            midiNote?: never;
            error?: never;
            command?: never;
        } | {
            success: boolean;
            type: string;
            duration: number | undefined;
            isChord?: never;
            notes?: never;
            midiNotes?: never;
            velocity?: never;
            notationUsed?: never;
            midiNote?: never;
            controller?: never;
            value?: never;
            error?: never;
            command?: never;
        } | {
            success: boolean;
            error: string;
            command: {
                type: "note" | "cc" | "delay";
                value?: number | undefined;
                velocity?: number | undefined;
                channel?: number | undefined;
                note?: string | number | undefined;
                duration?: number | undefined;
                time?: number | undefined;
                controller?: number | undefined;
            };
            type?: never;
            isChord?: never;
            notes?: never;
            midiNotes?: never;
            velocity?: never;
            duration?: never;
            notationUsed?: never;
            midiNote?: never;
            controller?: never;
            value?: never;
        })[];
        totalCommands: number;
        successfulCommands: number;
        error?: never;
    } | {
        success: boolean;
        error: string;
        message?: never;
        results?: never;
        totalCommands?: never;
        successfulCommands?: never;
    }>;
    private executeSequenceCommand;
    midi_send_cc(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_send_cc>): Promise<{
        success: boolean;
        message: string;
        controller: number;
        controllerName: string;
        value: number;
        channel: number;
        error?: never;
    } | {
        success: boolean;
        error: string;
        message?: never;
        controller?: never;
        controllerName?: never;
        value?: never;
        channel?: never;
    }>;
    midi_set_tempo(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_set_tempo>): Promise<{
        success: boolean;
        message: string;
        bpm: number;
        previousBPM: number;
        error?: never;
    } | {
        success: boolean;
        error: string;
        message?: never;
        bpm?: never;
        previousBPM?: never;
    }>;
    midi_transport_control(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_transport_control>): Promise<{
        success: boolean;
        message: string;
        action: "play" | "pause" | "stop" | "rewind";
        currentState: "playing" | "paused" | "stopped";
        currentTime: number;
        error?: never;
    } | {
        success: boolean;
        error: string;
        message?: never;
        action?: never;
        currentState?: never;
        currentTime?: never;
    }>;
    midi_panic(_params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_panic>): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
        actionsPerformed: string[];
        error?: never;
    } | {
        success: boolean;
        error: string;
        message?: never;
        timestamp?: never;
        actionsPerformed?: never;
    }>;
    midi_import_score(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_import_score>): Promise<{
        success: boolean;
        error: string;
        supportedFormats: string[];
        preview?: never;
        sequence?: never;
        totalDuration?: never;
        noteCount?: never;
        estimatedBars?: never;
        message?: never;
        imported?: never;
        source?: never;
        executionResult?: never;
    } | {
        success: boolean;
        error: string;
        supportedFormats?: never;
        preview?: never;
        sequence?: never;
        totalDuration?: never;
        noteCount?: never;
        estimatedBars?: never;
        message?: never;
        imported?: never;
        source?: never;
        executionResult?: never;
    } | {
        success: boolean;
        preview: boolean;
        sequence: {
            notes: string[];
            rhythms: string[];
        };
        totalDuration: string;
        noteCount: number;
        estimatedBars: number;
        message: string;
        error?: never;
        supportedFormats?: never;
        imported?: never;
        source?: never;
        executionResult?: never;
    } | {
        success: boolean;
        imported: boolean;
        source: "text_notation" | "guitar_tab";
        totalDuration: string;
        noteCount: number;
        executionResult: {
            success: boolean;
            message: string;
            noteCount: number;
            format: "hybrid" | "legacy";
            duration: number;
            bpm: number;
            channel: any;
            parsedNotes: {
                note: string;
                duration: number;
                velocity: number;
                articulation: number;
                timing: number;
            }[] | undefined;
            effects: {
                reverb: any;
                swing: any;
                transpose: any;
            };
            error?: never;
        } | {
            success: boolean;
            error: string;
            format: string;
            message?: never;
            noteCount?: never;
            duration?: never;
            bpm?: never;
            channel?: never;
            parsedNotes?: never;
            effects?: never;
        };
        message: string;
        error?: never;
        supportedFormats?: never;
        preview?: never;
        sequence?: never;
        estimatedBars?: never;
    } | {
        success: boolean;
        error: string;
        source: "text_notation" | "musicxml" | "guitar_tab";
        supportedFormats?: never;
        preview?: never;
        sequence?: never;
        totalDuration?: never;
        noteCount?: never;
        estimatedBars?: never;
        message?: never;
        imported?: never;
        executionResult?: never;
    }>;
    private parseTextNotation;
    private parseGuitarTab;
    private calculateTotalDuration;
}
//# sourceMappingURL=mcp-tools-impl.d.ts.map