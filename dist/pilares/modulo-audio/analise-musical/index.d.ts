export interface MusicalAnalysisResult {
    timestamp: number;
    pitch?: number;
    chord?: string;
    rhythm?: {
        bpm: number;
        timeSignature: string;
        pattern: number[];
    };
    dynamics: number;
    instruments: string[];
}
export interface MusicalAnalyzer {
    initialize(): Promise<void>;
    analyze(audioData: Float32Array): Promise<MusicalAnalysisResult>;
    setAnalysisMode(mode: 'realtime' | 'batch'): void;
}
export declare const createMusicalAnalyzer: () => MusicalAnalyzer;
//# sourceMappingURL=index.d.ts.map