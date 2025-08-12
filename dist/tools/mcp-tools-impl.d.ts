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
        error?: never;
    } | {
        success: boolean;
        error: string;
        message?: never;
        midiNote?: never;
        velocity?: never;
        duration?: never;
        channel?: never;
    }>;
    midi_play_phrase(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_play_phrase>): Promise<{
        success: boolean;
        message: string;
        noteCount: number;
        tempo: number;
        style: "legato" | "staccato" | "tenuto" | "marcato";
        playbackId: string;
        duration: number;
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
    }>;
    midi_sequence_commands(params: z.infer<typeof MCP_TOOL_SCHEMAS.midi_sequence_commands>): Promise<{
        success: boolean;
        message: string;
        results: ({
            success: boolean;
            type: string;
            midiNote: number;
            velocity: number | undefined;
            controller?: never;
            value?: never;
            duration?: never;
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
            error?: never;
            command?: never;
        } | {
            success: boolean;
            type: string;
            duration: number | undefined;
            midiNote?: never;
            velocity?: never;
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
            controller?: never;
            value?: never;
            duration?: never;
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
}
//# sourceMappingURL=mcp-tools-impl.d.ts.map