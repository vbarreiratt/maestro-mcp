/**
 * Core type definitions for Maestro MCP Musical Server
 * Defines interfaces for the 3-pillar architecture
 */
// Error Types
export class MidiError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'MidiError';
    }
}
export class MusicTheoryError extends Error {
    invalidValue;
    constructor(message, invalidValue) {
        super(message);
        this.invalidValue = invalidValue;
        this.name = 'MusicTheoryError';
    }
}
export class TimingError extends Error {
    actualLatency;
    constructor(message, actualLatency) {
        super(message);
        this.actualLatency = actualLatency;
        this.name = 'TimingError';
    }
}
//# sourceMappingURL=index.js.map