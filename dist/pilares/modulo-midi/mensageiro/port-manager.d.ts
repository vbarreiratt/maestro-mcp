/**
 * Port Manager - MIDI port discovery and connection management
 * Handles port enumeration, connection state, and port monitoring
 */
import type { MidiPort } from '../../../types/index.js';
export interface PortManagerStatus {
    totalPorts: number;
    outputPorts: number;
    inputPorts: number;
    connectedPort: string | null;
    lastRefresh: number | null;
}
/**
 * Information about detected DAWs
 */
export interface DAWInfo {
    name: string;
    recommendedPort: MidiPort | null;
    optimalSettings: {
        latency: 'low' | 'medium' | 'high';
        bufferSize: number;
        preferredChannel: number;
    };
    confidence: number;
}
export interface PortSuggestion {
    port: MidiPort | null;
    reason: string;
    confidence: number;
    dawInfo?: DAWInfo;
}
/**
 * Manages MIDI port discovery and connection state
 */
export declare class PortManager {
    private availablePorts;
    private connectedPortName;
    private lastRefreshTime;
    private refreshInterval;
    constructor();
    initialize(): Promise<void>;
    /**
     * Refresh the list of available MIDI ports
     */
    refreshPorts(): Promise<void>;
    /**
     * Check if the ports list has changed from the previous refresh
     */
    private hasPortsChanged;
    /**
     * Get list of all available MIDI ports
     */
    listPorts(): MidiPort[];
    /**
     * Get only output ports (for MIDI sending)
     */
    listOutputPorts(): MidiPort[];
    /**
     * Get only input ports (for MIDI receiving - future use)
     */
    listInputPorts(): MidiPort[];
    /**
     * Find a port by name (exact match)
     */
    findPortByName(portName: string): MidiPort | null;
    /**
     * Find a port by partial name match (case insensitive)
     */
    findPortByPartialName(partialName: string): MidiPort[];
    /**
     * Connect to a specific MIDI output port
     */
    connectToPort(portName: string): boolean;
    /**
     * Disconnect from current port
     */
    disconnectPort(): void;
    /**
     * Get currently connected port name
     */
    getConnectedPortName(): string | null;
    /**
     * Get currently connected port info
     */
    getConnectedPort(): MidiPort | null;
    /**
     * Check if connected to any port
     */
    isConnected(): boolean;
    /**
     * Get the best available output port (heuristic selection)
     */
    getBestOutputPort(): MidiPort | null;
    /**
     * Auto-connect to the best available port
     */
    autoConnect(): boolean;
    /**
     * Get port manager status for health checks
     */
    getStatus(): PortManagerStatus;
    /**
     * Check if ports need refreshing (older than 30 seconds)
     */
    needsRefresh(): boolean;
    /**
     * Force refresh if needed
     */
    refreshIfNeeded(): Promise<void>;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
    /**
     * NEW: Detect available DAWs based on MIDI port names
     */
    detectDAWs(): DAWInfo[];
    /**
     * NEW: Suggest the best port for a given target DAW or auto-detect
     */
    suggestBestPort(targetDAW?: string): PortSuggestion;
    /**
     * NEW: Auto-connect with DAW optimization
     */
    autoConnectOptimized(targetDAW?: string): {
        success: boolean;
        port?: string;
        reason: string;
        dawInfo?: DAWInfo;
    };
    /**
     * NEW: Get detailed information about current setup
     */
    getSetupInfo(): {
        connectedPort: string | null;
        detectedDAWs: DAWInfo[];
        recommendation: PortSuggestion;
        totalPorts: number;
    };
}
//# sourceMappingURL=port-manager.d.ts.map