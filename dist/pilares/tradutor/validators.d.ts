/**
 * Advanced Musical Validation
 *
 * Comprehensive validation for musical theory, timing consistency,
 * MIDI ranges, and harmonic relationships using real music theory.
 */
import { PlanoMusical, PartituraExecutavel } from '../../schemas/music-schemas.js';
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    details?: Record<string, any>;
}
/**
 * Comprehensive music theory validation for PlanoMusical
 */
export declare function validateMusicTheory(plano: PlanoMusical): Promise<ValidationResult>;
/**
 * Validate final executable score consistency
 */
export declare function validateMusicalConsistency(score: PartituraExecutavel): Promise<ValidationResult>;
//# sourceMappingURL=validators.d.ts.map