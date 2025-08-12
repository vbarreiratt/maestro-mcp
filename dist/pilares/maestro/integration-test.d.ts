/**
 * Integration test for Pilar 2 - Maestro
 * Tests the complete pipeline: PartituraExecutável -> Scheduled MIDI Events
 */
declare class MockMIDIOutput {
    private sentEvents;
    sendNoteOn(note: number, velocity: number, channel: number): void;
    sendNoteOff(note: number, channel: number): void;
    sendCC(controller: number, value: number, channel: number): void;
    sendProgramChange(program: number, channel: number): void;
    getEvents(): Array<{
        type: string;
        data: any;
        timestamp: number;
    }>;
    clear(): void;
}
/**
 * Test the complete Maestro integration
 */
export declare function testMaestroIntegration(): Promise<void>;
/**
 * Test real integration with Mensageiro (if available)
 */
export declare function testMaestroWithMensageiro(): Promise<void>;
export { MockMIDIOutput };
//# sourceMappingURL=integration-test.d.ts.map