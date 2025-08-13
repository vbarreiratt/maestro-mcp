/**
 * MCP Tools Schema Definitions
 * Complete schemas for all 8 mandatory MIDI tools
 */
import { z } from 'zod';
// ========================
// 1. SYSTEM MANAGEMENT
// ========================
export const MidiListPortsSchema = z.object({
    refresh: z.boolean().optional().describe("Force refresh of port list"),
    verbose: z.boolean().default(false).describe("Mostrar resposta completa (padrão: condensada)")
}).describe("🎹 Lista todas as portas MIDI disponíveis (entrada e saída) no sistema");
export const ConfigureMidiOutputSchema = z.object({
    portName: z.string().min(1).describe("Nome da porta MIDI de saída OU 'auto' para detecção automática"),
    targetDAW: z.string().optional().describe("🆕 DAW alvo para otimização: 'GarageBand', 'Logic', 'Ableton', etc. (usado com portName='auto')"),
    verbose: z.boolean().default(false).describe("Mostrar resposta completa (padrão: condensada)")
}).describe("🔧 Configura a porta MIDI de saída. SUPORTA: Nome específico OU 'auto' + targetDAW");
// ========================
// 2. BASIC MUSICAL CONTROL
// ========================
// Voice schema for multi-voice support
const VoiceSchema = z.object({
    channel: z.number().int().min(1).max(16).describe("MIDI channel for this voice"),
    notes: z.string().min(1).describe("Hybrid notation for this voice: 'C4:q@0.8.leg D4:e E4:e.stac'"),
    velocity: z.number().min(0).max(1).optional().describe("Voice-specific velocity override"),
    articulation: z.number().min(0).max(1).optional().describe("Voice-specific articulation override"),
    transpose: z.number().int().min(-12).max(12).optional().describe("Voice-specific transpose override")
});
// Simplified schema avoiding union types that break MCP JSON Schema conversion
export const MidiPlayPhraseSchema = z.object({
    // Core parameters
    bpm: z.number().int().min(60).max(200).describe("BPM (Beats Per Minute)"),
    // Single-voice format (backward compatible)
    notes: z.string().min(1).optional().describe("🎵 SINGLE-VOICE: Musical notation 'C4:q@0.8.leg D4:e E4:e.stac' OR chord notation '[Bb]:q@0.6 [F/A]:q@0.7'"),
    // Multi-voice format (NEW)
    voices: z.array(VoiceSchema).min(1).max(16).optional().describe("🎼 MULTI-VOICE: Array de vozes independentes com canais próprios [{channel: 1, notes: 'D4:q'}, {channel: 2, notes: '[Dm]:h'}]"),
    // Musical Structure  
    timeSignature: z.string().regex(/^\d+\/\d+$/).default("4/4").describe("Time signature like '4/4', '3/4', '6/8'"),
    key: z.string().optional().describe("Musical key like 'C major', 'A minor'"),
    // Global Defaults
    velocity: z.number().min(0).max(1).default(0.8).describe("Global velocity 0.0-1.0"),
    articulation: z.number().min(0).max(1).default(0.8).describe("Global articulation 0.0-1.0"),
    reverb: z.number().min(0).max(1).default(0.4).describe("Reverb amount 0.0-1.0"),
    swing: z.number().min(0).max(1).default(0.0).describe("Swing amount 0.0-1.0"),
    // Technical
    channel: z.number().int().min(1).max(16).default(1).describe("MIDI channel 1-16 (usado para single-voice)"),
    transpose: z.number().int().min(-12).max(12).default(0).describe("Transpose in semitones"),
    outputPort: z.string().optional().describe("Override porta padrão"),
    verbose: z.boolean().default(false).describe("Mostrar resposta completa (padrão: condensada)")
}).describe("🎼 POLIFONIA COMPLETA: Use 'notes' para single-voice OU 'voices' para multi-voice. EXEMPLOS: Single: {notes: '[Bb]:q [F/A]:q'} | Multi: {voices: [{channel: 1, notes: 'D4:q'}]}");
// Temporarily simplified schema to resolve MCP connection issues
export const MidiSendNoteSchema = z.object({
    note: z.union([
        z.string().describe("Nota musical 'C4' ou híbrido 'C4:q@0.8.leg'"),
        z.number().int().min(0).max(127).describe("Número MIDI 0-127")
    ]).describe("Nota MIDI"),
    velocity: z.number().min(0).max(1).default(0.8).describe("Intensidade 0.0-1.0"),
    duration: z.number().positive().default(1.0).describe("Duração em segundos"),
    bpm: z.number().int().min(60).max(200).default(120).describe("BPM para notação híbrida"),
    channel: z.number().int().min(1).max(16).default(1).describe("Canal MIDI 1-16"),
    outputPort: z.string().optional().describe("Override porta padrão"),
    verbose: z.boolean().default(false).describe("Mostrar resposta completa (padrão: condensada)")
}).describe("🎵 Envia uma nota MIDI individual com controle completo de parâmetros");
// ========================
// 3. ADVANCED CONTROL
// ========================
export const MidiSequenceCommandSchema = z.object({
    type: z.enum(["note", "cc", "delay"]).describe("⚠️ APENAS 3 TIPOS: 'note' (tocar nota), 'cc' (control change), 'delay' (pausa). NÃO use 'chord' ou 'wait'!"),
    time: z.number().min(0).optional().describe("Offset em segundos (opcional)"),
    // Note parameters (use com type: 'note')
    note: z.union([
        z.string().describe("🆕 SUPORTE HÍBRIDO: Formato simples 'C4' OU notação híbrida 'C4:q@0.8.leg'"),
        z.number().int().min(0).max(127)
    ]).optional().describe("Para type='note': suporta formato híbrido ou número MIDI 0-127"),
    duration: z.number().positive().optional().describe("Duração em segundos (para 'note' ou 'delay') - IGNORADA se nota usar formato híbrido"),
    velocity: z.number().min(0).max(1).optional().describe("Para type='note': intensidade 0.0-1.0"),
    // CC parameters (use com type: 'cc')
    controller: z.number().int().min(0).max(127).optional().describe("Para type='cc': número do controlador"),
    value: z.number().int().min(0).max(127).optional().describe("Para type='cc': valor 0-127"),
    // Common parameters
    channel: z.number().int().min(1).max(16).optional().describe("Canal MIDI (opcional)")
});
export const MidiSequenceCommandsSchema = z.object({
    commands: z.array(MidiSequenceCommandSchema).min(1).describe("⚠️ EXEMPLOS: [{'type':'note','note':'C4:q@0.8.leg'}, {'type':'delay','duration':0.5}]"),
    outputPort: z.string().optional().describe("Override da porta padrão"),
    verbose: z.boolean().default(false).describe("Mostrar resposta completa (padrão: condensada)")
}).describe("🎭 Sequência MIDI com notação híbrida. SUPORTE: 'C4:q@0.8.leg'. TIPOS: 'note', 'cc', 'delay'");
export const MidiSendCCSchema = z.object({
    controller: z.union([
        z.number().int().min(0).max(127),
        z.enum(["volume", "pan", "expression", "reverb", "chorus", "modwheel", "sustain"])
    ]).describe("Número do controlador 0-127 ou nome conhecido"),
    value: z.number().int().min(0).max(127).describe("Valor do controlador 0-127"),
    channel: z.number().int().min(1).max(16).default(1).describe("Canal MIDI 1-16 (padrão: 1)"),
    outputPort: z.string().optional().describe("Override da porta padrão"),
    verbose: z.boolean().default(false).describe("Mostrar resposta completa (padrão: condensada)")
}).describe("🎛️ Envia mensagem MIDI Control Change para modificar parâmetros do instrumento");
// ========================
// 4. TIME & STATE MANAGEMENT
// ========================
export const MidiSetTempoSchema = z.object({
    bpm: z.number().int().min(60).max(200).describe("BPM (Beats Per Minute) entre 60-200"),
    verbose: z.boolean().default(false).describe("Mostrar resposta completa (padrão: condensada)")
}).describe("⏱️ Define o BPM (Beats Per Minute) global para todas as operações musicais");
export const MidiTransportControlSchema = z.object({
    action: z.enum(["play", "pause", "stop", "rewind"]).describe("Ação de controle de transport"),
    verbose: z.boolean().default(false).describe("Mostrar resposta completa (padrão: condensada)")
}).describe("▶️ Controla o transport musical (play, pause, stop) do sistema");
export const MidiPanicSchema = z.object({
    verbose: z.boolean().default(false).describe("Mostrar resposta completa (padrão: condensada)")
}).describe("🚨 Para imediatamente toda a reprodução MIDI (All Notes Off + Reset Controllers)");
// ========================
// 5. NEW: SCORE IMPORT
// ========================
export const MidiImportScoreSchema = z.object({
    source: z.enum(["text_notation", "musicxml", "guitar_tab"]).describe("Tipo de partitura: notação textual, MusicXML ou tablatura"),
    data: z.string().min(1).describe("Dados da partitura - Ex: 'A4:q B4:e A4:e | F4:h G4:q' ou tablatura de guitarra"),
    tempo: z.number().int().min(60).max(200).default(120).describe("BPM (padrão: 120)"),
    channel: z.number().int().min(1).max(16).default(1).describe("Canal MIDI 1-16 (padrão: 1)"),
    preview: z.boolean().default(false).describe("Se true, apenas calcula duração sem tocar"),
    quantize: z.boolean().default(true).describe("Aplicar correção automática de timing"),
    outputPort: z.string().optional().describe("Override da porta padrão"),
    verbose: z.boolean().default(false).describe("Mostrar resposta completa (padrão: condensada)")
}).describe("🎼 Importa e executa partituras/tablaturas. FORMATOS: notação musical, MusicXML, tablatura de guitarra");
// ========================
// 6. DEBUG FUNCTION
// ========================
export const MaestroDebugLastSchema = z.object({}).describe("🔍 Mostra detalhes completos da última operação MIDI executada");
// ========================
// CONTROL CHANGE MAPPINGS
// ========================
export const CC_MAPPINGS = {
    volume: 7,
    pan: 10,
    expression: 11,
    reverb: 91,
    chorus: 93,
    modwheel: 1,
    sustain: 64
};
// ========================
// EXPORT ALL SCHEMAS
// ========================
export const MCP_TOOL_SCHEMAS = {
    midi_list_ports: MidiListPortsSchema,
    configure_midi_output: ConfigureMidiOutputSchema,
    midi_send_note: MidiSendNoteSchema,
    midi_play_phrase: MidiPlayPhraseSchema,
    midi_sequence_commands: MidiSequenceCommandsSchema,
    midi_send_cc: MidiSendCCSchema,
    midi_set_tempo: MidiSetTempoSchema,
    midi_transport_control: MidiTransportControlSchema,
    midi_panic: MidiPanicSchema,
    midi_import_score: MidiImportScoreSchema,
    maestro_debug_last: MaestroDebugLastSchema
};
//# sourceMappingURL=mcp-tools-schemas.js.map