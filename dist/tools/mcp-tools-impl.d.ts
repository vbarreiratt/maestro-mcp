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
    private lastOperationDetails;
    private lastOperation;
    constructor();
    /**
     * Capture operation for replay system
     */
    private captureOperation;
    /**
     * Format response based on verbose flag
     * Condensed by default, detailed when requested
     */
    private formatResponse;
    /**
     * Generate concise summary for operations
     */
    private generateSummary;
    /**
     * Get appropriate transport icon
     */
    private getTransportIcon;
    /**
     * Play a chord or single note with proper timing
     * Handles both chord and single note from ParsedNote
     * Applies articulation to modify actual MIDI note duration
     */
    private playParsedNote;
    /**
     * Calculate the actual MIDI note duration based on articulation value
     * @param baseDurationMs - The base note duration in milliseconds
     * @param articulation - Articulation value (0.0 = staccato, 1.0 = legato)
     * @returns Adjusted duration in milliseconds
     */
    private calculateArticulatedDuration;
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
    /**
     * Execute MIDI from parsed notes with timing precision
     */
    private executeMIDI;
    /**
     * Debug function to show details of the last MIDI operation
     */
    /**
     * Universal replay system - replays last operation with optional modifications
     */
    maestro_replay_last(modifications?: any): Promise<any>;
    /**
     * Apply path-based modifications to parameters
     */
    private applyModifications;
    /**
     * Set nested value using path notation (e.g., "voices[0].channel")
     */
    private setNestedValue;
    maestro_debug_last(): Promise<any>;
    midi_list_ports(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_list_ports>): Promise<any>;
    configure_midi_output(params: z.infer<typeof MCP_TOOL_SCHEMAS.configure_midi_output>): Promise<any>;
    midi_send_note(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_send_note>): Promise<any>;
    midi_play_phrase(params: any): Promise<any>;
    midi_sequence_commands(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_sequence_commands>): Promise<any>;
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
        executionResult: any;
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