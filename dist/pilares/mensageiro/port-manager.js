/**
 * Port Manager - MIDI port discovery and connection management
 * Handles port enumeration, connection state, and port monitoring
 */
import JZZ from 'jzz';
import { MidiError } from '../../types/index.js';
import { ErrorCodes } from '../../schemas/common-schemas.js';
import { logger } from '../../utils/logger.js';
/**
 * Manages MIDI port discovery and connection state
 */
export class PortManager {
    availablePorts = [];
    connectedPortName = null;
    lastRefreshTime = null;
    refreshInterval = null;
    constructor() {
        logger.info('[PortManager] Created');
    }
    async initialize() {
        try {
            logger.info('[PortManager] Initializing...');
            // Initial port discovery
            await this.refreshPorts();
            // Set up auto-refresh every 5 seconds to detect new devices
            this.refreshInterval = setInterval(() => {
                this.refreshPorts().catch(error => {
                    logger.error('[PortManager] Auto-refresh failed:', error);
                });
            }, 5000);
            logger.info('[PortManager] Initialized successfully');
        }
        catch (error) {
            throw new MidiError(`Failed to initialize PortManager: ${error}`, ErrorCodes.SYSTEM_INITIALIZATION_FAILED);
        }
    }
    /**
     * Refresh the list of available MIDI ports
     */
    async refreshPorts() {
        try {
            logger.info('[PortManager] Refreshing MIDI ports...');
            const newPorts = [];
            // Get JZZ info about available ports
            const info = JZZ.info();
            // Process output ports
            if (info.outputs) {
                info.outputs.forEach((portInfo, index) => {
                    newPorts.push({
                        id: `out_${index}`,
                        name: portInfo.name || `Output Port ${index}`,
                        type: 'output',
                        connected: this.connectedPortName === portInfo.name,
                        manufacturer: portInfo.manufacturer ? portInfo.manufacturer : undefined
                    });
                });
            }
            // Process input ports  
            if (info.inputs) {
                info.inputs.forEach((portInfo, index) => {
                    newPorts.push({
                        id: `in_${index}`,
                        name: portInfo.name || `Input Port ${index}`,
                        type: 'input',
                        connected: false, // We don't connect to input ports for output operations
                        manufacturer: portInfo.manufacturer ? portInfo.manufacturer : undefined
                    });
                });
            }
            // Update internal state
            this.availablePorts = newPorts;
            this.lastRefreshTime = Date.now();
            const outputCount = newPorts.filter(p => p.type === 'output').length;
            const inputCount = newPorts.filter(p => p.type === 'input').length;
            logger.info(`[PortManager] Found ${newPorts.length} ports: ${outputCount} output, ${inputCount} input`);
            // Log available output ports (most relevant for our use case)
            const outputPorts = newPorts.filter(p => p.type === 'output');
            if (outputPorts.length > 0) {
                logger.info('[PortManager] Available output ports:');
                newPorts.filter(p => p.type === 'output').forEach(port => {
                    logger.info(`  - ${port.name} (${port.id})${port.connected ? ' [CONNECTED]' : ''}`);
                });
            }
            else {
                logger.warn('[PortManager] No MIDI output ports found. Check your MIDI setup.');
            }
        }
        catch (error) {
            logger.error('[PortManager] Port refresh failed:', { error });
            throw new MidiError(`Failed to refresh MIDI ports: ${error}`, ErrorCodes.MIDI_PORT_NOT_FOUND);
        }
    }
    /**
     * Get list of all available MIDI ports
     */
    listPorts() {
        return [...this.availablePorts];
    }
    /**
     * Get only output ports (for MIDI sending)
     */
    listOutputPorts() {
        return this.availablePorts.filter(port => port.type === 'output');
    }
    /**
     * Get only input ports (for MIDI receiving - future use)
     */
    listInputPorts() {
        return this.availablePorts.filter(port => port.type === 'input');
    }
    /**
     * Find a port by name (exact match)
     */
    findPortByName(portName) {
        return this.availablePorts.find(port => port.name === portName) || null;
    }
    /**
     * Find a port by partial name match (case insensitive)
     */
    findPortByPartialName(partialName) {
        const searchTerm = partialName.toLowerCase();
        return this.availablePorts.filter(port => port.name.toLowerCase().includes(searchTerm));
    }
    /**
     * Connect to a specific MIDI output port
     */
    connectToPort(portName) {
        try {
            logger.info(`[PortManager] Attempting to connect to: ${portName}`);
            // First, ensure we have fresh port information
            // Note: We don't await here to avoid blocking, but we should have recent data
            // Find the port
            const port = this.findPortByName(portName);
            if (!port) {
                // Try partial match as fallback
                const partialMatches = this.findPortByPartialName(portName);
                if (partialMatches.length === 1) {
                    logger.info(`[PortManager] Exact match not found, using partial match: ${partialMatches[0].name}`);
                    return this.connectToPort(partialMatches[0].name);
                }
                else if (partialMatches.length > 1) {
                    logger.warn(`[PortManager] Multiple partial matches for '${portName}':`, { matches: partialMatches.map(p => p.name) });
                    return false;
                }
                else {
                    logger.error(`[PortManager] Port '${portName}' not found`);
                    return false;
                }
            }
            // Check if it's an output port
            if (port.type !== 'output') {
                logger.error(`[PortManager] Port '${portName}' is not an output port (type: ${port.type})`);
                return false;
            }
            // Disconnect from current port if any
            if (this.connectedPortName) {
                this.disconnectPort();
            }
            // Set new connection
            this.connectedPortName = portName;
            // Update port connection status
            this.availablePorts = this.availablePorts.map(p => ({
                ...p,
                connected: p.name === portName && p.type === 'output'
            }));
            logger.info(`[PortManager] Successfully connected to: ${portName}`);
            return true;
        }
        catch (error) {
            logger.error(`[PortManager] Failed to connect to port '${portName}':`, { error });
            return false;
        }
    }
    /**
     * Disconnect from current port
     */
    disconnectPort() {
        if (this.connectedPortName) {
            logger.info(`[PortManager] Disconnecting from: ${this.connectedPortName}`);
            // Update port connection status
            this.availablePorts = this.availablePorts.map(p => ({
                ...p,
                connected: false
            }));
            this.connectedPortName = null;
            logger.info('[PortManager] Disconnected from MIDI port');
        }
    }
    /**
     * Get currently connected port name
     */
    getConnectedPortName() {
        return this.connectedPortName;
    }
    /**
     * Get currently connected port info
     */
    getConnectedPort() {
        if (!this.connectedPortName) {
            return null;
        }
        return this.findPortByName(this.connectedPortName);
    }
    /**
     * Check if connected to any port
     */
    isConnected() {
        return this.connectedPortName !== null;
    }
    /**
     * Get the best available output port (heuristic selection)
     */
    getBestOutputPort() {
        const outputPorts = this.listOutputPorts();
        if (outputPorts.length === 0) {
            return null;
        }
        // Preference order:
        // 1. Already connected port
        const connected = outputPorts.find(p => p.connected);
        if (connected)
            return connected;
        // 2. Known good software synthesizers
        const softSynths = ['IAC Driver', 'Microsoft GS Wavetable Synth', 'FluidSynth'];
        for (const synthName of softSynths) {
            const synth = outputPorts.find(p => p.name.includes(synthName));
            if (synth)
                return synth;
        }
        // 3. Any hardware port (usually more reliable than system default)
        const hardware = outputPorts.find(p => p.manufacturer &&
            !p.name.toLowerCase().includes('software') &&
            !p.name.toLowerCase().includes('driver'));
        if (hardware)
            return hardware;
        // 4. First available port
        return outputPorts[0] || null;
    }
    /**
     * Auto-connect to the best available port
     */
    autoConnect() {
        const bestPort = this.getBestOutputPort();
        if (bestPort) {
            return this.connectToPort(bestPort.name);
        }
        return false;
    }
    /**
     * Get port manager status for health checks
     */
    getStatus() {
        const outputPorts = this.availablePorts.filter(p => p.type === 'output').length;
        const inputPorts = this.availablePorts.filter(p => p.type === 'input').length;
        return {
            totalPorts: this.availablePorts.length,
            outputPorts,
            inputPorts,
            connectedPort: this.connectedPortName,
            lastRefresh: this.lastRefreshTime
        };
    }
    /**
     * Check if ports need refreshing (older than 30 seconds)
     */
    needsRefresh() {
        if (!this.lastRefreshTime)
            return true;
        return Date.now() - this.lastRefreshTime > 30000;
    }
    /**
     * Force refresh if needed
     */
    async refreshIfNeeded() {
        if (this.needsRefresh()) {
            await this.refreshPorts();
        }
    }
    /**
     * Cleanup resources
     */
    async cleanup() {
        logger.info('[PortManager] Starting cleanup...');
        // Clear auto-refresh interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
        // Disconnect from current port
        this.disconnectPort();
        // Clear port list
        this.availablePorts = [];
        logger.info('[PortManager] Cleanup complete');
    }
}
//# sourceMappingURL=port-manager.js.map