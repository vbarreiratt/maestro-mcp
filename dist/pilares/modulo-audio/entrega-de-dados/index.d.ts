import type { MusicalAnalysisResult } from '../analise-musical/index.js';
export interface DataDeliveryConfig {
    midiIntegration: boolean;
    realtimeStreaming: boolean;
    cacheEnabled: boolean;
}
export interface MIDICommand {
    type: 'note' | 'chord' | 'control';
    channel: number;
    data: number[];
    timestamp: number;
}
export interface DataDelivery {
    initialize(config: DataDeliveryConfig): Promise<void>;
    processAnalysis(result: MusicalAnalysisResult): Promise<void>;
    getMIDICommands(): Promise<MIDICommand[]>;
    exportData(format: 'json' | 'midi' | 'xml'): Promise<string>;
}
export declare const createDataDelivery: () => DataDelivery;
//# sourceMappingURL=index.d.ts.map