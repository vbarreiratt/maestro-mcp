/**
 * Pilar 1: O Tradutor - Musical Intelligence and Validation
 *
 * Core orchestrator for musical intelligence, validation, interpretation and expansion.
 * Transforms abstract musical plans into executable MIDI scores with precise timing.
 */
import { PlanoMusical, PartituraExecutavel } from '../../schemas/music-schemas.js';
export declare class Tradutor {
    private defaultKey;
    private defaultTimeSignature;
    /**
     * Main transformation method: PlanoMusical → PartituraExecutável
     */
    translateMusicalPlan(plano: PlanoMusical): Promise<PartituraExecutavel>;
    /**
     * Process individual note events
     */
    private processNoteEvent;
    /**
     * Process chord events by expanding to individual notes
     */
    private processChordEvent;
    /**
     * Process control change events
     */
    private processCCEvent;
    /**
     * Process sequence events (multiple notes/chords with timing)
     */
    private processSequenceEvent;
    /**
     * Convert seconds back to musical time notation
     */
    private secondsToMusicalTime;
}
export declare const tradutor: Tradutor;
export declare function translateMusicalPlan(plano: PlanoMusical): Promise<PartituraExecutavel>;
//# sourceMappingURL=index.d.ts.map