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
    private tradutor;
    private maestro;
    private defaultOutputPort;
    private globalBPM;
    constructor();
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
        midiNote: number;
        velocity: number;
        duration: number;
        channel: number;
        notationUsed: string;
        error?: never;
    } | {
        success: boolean;
        error: string;
        message?: never;
        midiNote?: never;
        velocity?: never;
        duration?: never;
        channel?: never;
        notationUsed?: never;
    }>;
    midi_play_phrase(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_play_phrase>): Promise<{
        success: boolean;
        message: string;
        noteCount: number;
        tempo: number;
        style: "legato" | "staccato" | "tenuto" | "marcato";
        playbackId: string;
        duration: string;
        notationUsed: "auto" | "simple" | "musical";
        quantized: boolean;
        timing: string;
        error?: never;
    } | {
        success: boolean;
        error: string;
        message?: never;
        noteCount?: never;
        tempo?: never;
        style?: never;
        playbackId?: never;
        duration?: never;
        notationUsed?: never;
        quantized?: never;
        timing?: never;
    }>;
    midi_sequence_commands(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_sequence_commands>): Promise<{
        success: boolean;
        message: string;
        results: ({
            success: boolean;
            type: string;
            midiNote: number;
            velocity: number | undefined;
            duration: number;
            notationUsed: string;
            controller?: never;
            value?: never;
            error?: never;
            command?: never;
        } | {
            success: boolean;
            type: string;
            controller: number;
            value: number;
            midiNote?: never;
            velocity?: never;
            duration?: never;
            notationUsed?: never;
            error?: never;
            command?: never;
        } | {
            success: boolean;
            type: string;
            duration: number | undefined;
            midiNote?: never;
            velocity?: never;
            notationUsed?: never;
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
                note?: string | number | undefined;
                velocity?: number | undefined;
                duration?: number | undefined;
                channel?: number | undefined;
                time?: number | undefined;
                controller?: number | undefined;
            };
            type?: never;
            midiNote?: never;
            velocity?: never;
            duration?: never;
            notationUsed?: never;
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
            tempo: number;
            style: "legato" | "staccato" | "tenuto" | "marcato";
            playbackId: string;
            duration: string;
            notationUsed: "auto" | "simple" | "musical";
            quantized: boolean;
            timing: string;
            error?: never;
        } | {
            success: boolean;
            error: string;
            message?: never;
            noteCount?: never;
            tempo?: never;
            style?: never;
            playbackId?: never;
            duration?: never;
            notationUsed?: never;
            quantized?: never;
            timing?: never;
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
    /**
     * Convert duration names to Tone.js format
     */
    private convertDurationToToneJS;
}
//# sourceMappingURL=mcp-tools-impl.d.ts.map