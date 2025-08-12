export interface AudioCaptureConfig {
    sampleRate: number;
    bufferSize: number;
    channels: number;
    deviceId?: string;
}
export interface AudioCapture {
    initialize(config: AudioCaptureConfig): Promise<void>;
    startCapture(): Promise<void>;
    stopCapture(): Promise<void>;
    getAudioData(): Promise<Float32Array>;
}
export declare const createAudioCapture: () => AudioCapture;
//# sourceMappingURL=index.d.ts.map