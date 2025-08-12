/**
 * Port Manager - MIDI port discovery and connection management
 * Handles port enumeration, connection state, and port monitoring
 */
import JZZ from 'jzz';
import { MidiError } from '../../../types/index.js';
import { ErrorCodes } from '../../../schemas/common-schemas.js';
import { logger } from '../../../utils/logger.js';
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
            // Check if ports changed before logging
            const portsChanged = this.hasPortsChanged(newPorts);
            const isFirstRefresh = this.lastRefreshTime === null;
            // Update internal state
            this.availablePorts = newPorts;
            this.lastRefreshTime = Date.now();
            // Only log if ports changed or this is the first time
            if (portsChanged || isFirstRefresh) {
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
        }
        catch (error) {
            logger.error('[PortManager] Port refresh failed:', { error });
            throw new MidiError(`Failed to refresh MIDI ports: ${error}`, ErrorCodes.MIDI_PORT_NOT_FOUND);
        }
    }
    /**
     * Check if the ports list has changed from the previous refresh
     */
    hasPortsChanged(newPorts) {
        if (this.availablePorts.length !== newPorts.length) {
            return true;
        }
        // Compare port names and connection states
        for (const newPort of newPorts) {
            const existingPort = this.availablePorts.find(p => p.id === newPort.id && p.name === newPort.name);
            if (!existingPort || existingPort.connected !== newPort.connected) {
                return true;
            }
        }
        return false;
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
    // ========================
    // NEW: DAW DETECTION AND OPTIMIZATION
    // ========================
    /**
     * NEW: Detect available DAWs based on MIDI port names
     */
    detectDAWs() {
        const outputPorts = this.listOutputPorts();
        const daws = [];
        logger.debug('[PortManager] Detecting DAWs from available ports', {
            portCount: outputPorts.length,
            portNames: outputPorts.map(p => p.name)
        });
        // GarageBand Detection
        const garageBandPorts = outputPorts.filter(p => p.name.toLowerCase().includes('garageband') ||
            p.name.toLowerCase().includes('garage band'));
        if (garageBandPorts.length > 0) {
            // Prefer "Virtual In" ports for GarageBand
            const virtualInPort = garageBandPorts.find(p => p.name.toLowerCase().includes('virtual in')) || garageBandPorts[0];
            daws.push({
                name: 'GarageBand',
                recommendedPort: virtualInPort || null,
                optimalSettings: {
                    latency: 'low',
                    bufferSize: 256,
                    preferredChannel: 1
                },
                confidence: 0.95
            });
        }
        // Logic Pro Detection
        const logicPorts = outputPorts.filter(p => p.name.toLowerCase().includes('logic') ||
            p.name.toLowerCase().includes('mainstage'));
        if (logicPorts.length > 0) {
            daws.push({
                name: 'Logic Pro',
                recommendedPort: logicPorts[0] || null,
                optimalSettings: {
                    latency: 'low',
                    bufferSize: 128,
                    preferredChannel: 1
                },
                confidence: 0.9
            });
        }
        // Ableton Live Detection
        const abletonPorts = outputPorts.filter(p => p.name.toLowerCase().includes('ableton') ||
            p.name.toLowerCase().includes('live'));
        if (abletonPorts.length > 0) {
            daws.push({
                name: 'Ableton Live',
                recommendedPort: abletonPorts[0] || null,
                optimalSettings: {
                    latency: 'medium',
                    bufferSize: 256,
                    preferredChannel: 1
                },
                confidence: 0.9
            });
        }
        // Pro Tools Detection
        const proToolsPorts = outputPorts.filter(p => p.name.toLowerCase().includes('pro tools') ||
            p.name.toLowerCase().includes('protools'));
        if (proToolsPorts.length > 0) {
            daws.push({
                name: 'Pro Tools',
                recommendedPort: proToolsPorts[0] || null,
                optimalSettings: {
                    latency: 'high',
                    bufferSize: 512,
                    preferredChannel: 1
                },
                confidence: 0.85
            });
        }
        // FL Studio Detection
        const flStudioPorts = outputPorts.filter(p => p.name.toLowerCase().includes('fl studio') ||
            p.name.toLowerCase().includes('fruity'));
        if (flStudioPorts.length > 0) {
            daws.push({
                name: 'FL Studio',
                recommendedPort: flStudioPorts[0] || null,
                optimalSettings: {
                    latency: 'medium',
                    bufferSize: 256,
                    preferredChannel: 1
                },
                confidence: 0.8
            });
        }
        // Cubase/Nuendo Detection
        const cubasePorts = outputPorts.filter(p => p.name.toLowerCase().includes('cubase') ||
            p.name.toLowerCase().includes('nuendo'));
        if (cubasePorts.length > 0) {
            daws.push({
                name: 'Cubase/Nuendo',
                recommendedPort: cubasePorts[0] || null,
                optimalSettings: {
                    latency: 'medium',
                    bufferSize: 256,
                    preferredChannel: 1
                },
                confidence: 0.8
            });
        }
        // Generic DAW detection (any port with "virtual" or software-like names)
        const virtualPorts = outputPorts.filter(p => (p.name.toLowerCase().includes('virtual') ||
            p.name.toLowerCase().includes('software') ||
            p.name.toLowerCase().includes('synth')) &&
            !daws.some(daw => daw.recommendedPort?.name === p.name));
        if (virtualPorts.length > 0) {
            daws.push({
                name: 'Unknown DAW/Software',
                recommendedPort: virtualPorts[0] || null,
                optimalSettings: {
                    latency: 'medium',
                    bufferSize: 256,
                    preferredChannel: 1
                },
                confidence: 0.5
            });
        }
        logger.info(`[PortManager] Detected ${daws.length} potential DAWs`, {
            daws: daws.map(d => ({ name: d.name, port: d.recommendedPort?.name, confidence: d.confidence }))
        });
        return daws;
    }
    /**
     * NEW: Suggest the best port for a given target DAW or auto-detect
     */
    suggestBestPort(targetDAW) {
        const outputPorts = this.listOutputPorts();
        if (outputPorts.length === 0) {
            return {
                port: null,
                reason: 'No MIDI output ports available',
                confidence: 0
            };
        }
        const detectedDAWs = this.detectDAWs();
        // If specific DAW requested, find it
        if (targetDAW && targetDAW.toLowerCase() !== 'auto') {
            const targetLower = targetDAW.toLowerCase();
            const matchingDAW = detectedDAWs.find(daw => daw.name.toLowerCase().includes(targetLower) ||
                targetLower.includes(daw.name.toLowerCase()));
            if (matchingDAW && matchingDAW.recommendedPort) {
                return {
                    port: matchingDAW.recommendedPort,
                    reason: `Optimized for ${matchingDAW.name}`,
                    confidence: matchingDAW.confidence,
                    dawInfo: matchingDAW
                };
            }
            else {
                // Try partial matching on port names
                const partialMatches = this.findPortByPartialName(targetDAW);
                if (partialMatches.length > 0) {
                    return {
                        port: partialMatches[0] || null,
                        reason: `Partial match for "${targetDAW}"`,
                        confidence: 0.6
                    };
                }
                else {
                    return {
                        port: null,
                        reason: `No ports found for DAW "${targetDAW}"`,
                        confidence: 0
                    };
                }
            }
        }
        // Auto-detect best option
        if (detectedDAWs.length > 0) {
            // Sort by confidence and prefer known DAWs
            const bestDAW = detectedDAWs
                .filter(daw => daw.recommendedPort)
                .sort((a, b) => b.confidence - a.confidence)[0];
            if (bestDAW) {
                return {
                    port: bestDAW.recommendedPort,
                    reason: `Auto-detected ${bestDAW.name}`,
                    confidence: bestDAW.confidence,
                    dawInfo: bestDAW
                };
            }
        }
        // Fallback to general best port logic
        const bestPort = this.getBestOutputPort();
        if (bestPort) {
            return {
                port: bestPort,
                reason: 'Best available output port (no DAW detected)',
                confidence: 0.7
            };
        }
        return {
            port: null,
            reason: 'No suitable ports found',
            confidence: 0
        };
    }
    /**
     * NEW: Auto-connect with DAW optimization
     */
    autoConnectOptimized(targetDAW) {
        try {
            const suggestion = this.suggestBestPort(targetDAW);
            if (!suggestion.port) {
                return {
                    success: false,
                    reason: suggestion.reason
                };
            }
            const connected = this.connectToPort(suggestion.port.name);
            if (connected) {
                logger.info(`[PortManager] Auto-connected with optimization`, {
                    port: suggestion.port.name,
                    reason: suggestion.reason,
                    confidence: suggestion.confidence,
                    daw: suggestion.dawInfo?.name
                });
                return {
                    success: true,
                    port: suggestion.port.name,
                    reason: suggestion.reason,
                    ...(suggestion.dawInfo && { dawInfo: suggestion.dawInfo })
                };
            }
            else {
                return {
                    success: false,
                    reason: `Failed to connect to suggested port: ${suggestion.port.name}`
                };
            }
        }
        catch (error) {
            logger.error('[PortManager] Auto-connect optimization failed', { error, targetDAW });
            return {
                success: false,
                reason: `Auto-connect failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    /**
     * NEW: Get detailed information about current setup
     */
    getSetupInfo() {
        const detectedDAWs = this.detectDAWs();
        const recommendation = this.suggestBestPort();
        return {
            connectedPort: this.connectedPortName,
            detectedDAWs,
            recommendation,
            totalPorts: this.listOutputPorts().length
        };
    }
}
//# sourceMappingURL=port-manager.js.map