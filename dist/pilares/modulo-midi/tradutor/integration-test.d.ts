/**
 * Integration Test: Pilar 1 (Tradutor) + Pilar 3 (Mensageiro)
 *
 * End-to-end validation of musical intelligence and MIDI communication
 */
export interface TestResult {
    name: string;
    passed: boolean;
    duration: number;
    error?: string;
    details?: Record<string, any>;
}
export declare class IntegrationTester {
    private tradutor;
    constructor();
    /**
     * Run all integration tests
     */
    runAllTests(): Promise<TestResult[]>;
    /**
     * Test 1: Basic note translation
     */
    private testBasicNoteTranslation;
    /**
     * Test 2: Chord expansion with real Tonal.js
     */
    private testChordExpansion;
    /**
     * Test 3: Musical validation
     */
    private testMusicalValidation;
    /**
     * Test 4: End-to-end MIDI playback (requires Mensageiro initialization)
     */
    private testEndToEndMidiPlayback;
    /**
     * Test 5: Complex progression with multiple chord types
     */
    private testComplexProgression;
}
export declare function runIntegrationTests(): Promise<TestResult[]>;
//# sourceMappingURL=integration-test.d.ts.map