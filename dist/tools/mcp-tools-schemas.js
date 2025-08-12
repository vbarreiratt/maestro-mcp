/**
 * MCP Tools Schema Definitions
 * Complete schemas for all 8 mandatory MIDI tools
 */
import { z } from 'zod';
// ========================
// 1. SYSTEM MANAGEMENT
// ========================
export const MidiListPortsSchema = z.object({
    refresh: z.boolean().optional().describe("Force refresh of port list")
}).describe("🎹 Lista todas as portas MIDI disponíveis (entrada e saída) no sistema");
export const ConfigureMidiOutputSchema = z.object({
    portName: z.string().min(1).describe("Nome da porta MIDI de saída OU 'auto' para detecção automática"),
    targetDAW: z.string().optional().describe("🆕 DAW alvo para otimização: 'GarageBand', 'Logic', 'Ableton', etc. (usado com portName='auto')")
}).describe("🔧 Configura a porta MIDI de saída. SUPORTA: Nome específico OU 'auto' + targetDAW");
// ========================
// 2. BASIC MUSICAL CONTROL
// ========================
export const MidiSendNoteSchema = z.object({
    note: z.union([
        z.string().describe("🆕 SUPORTE EXPANDIDO: Formato simples 'C4' OU notação musical 'C4:q' (nota:duração). Códigos: w=whole, h=half, q=quarter, e=eighth, s=sixteenth"),
        z.number().int().min(0).max(127)
    ]).describe("Nota MIDI com notação musical: 'C4' (simples), 'C4:q' (musical), ou número 0-127"),
    velocity: z.number().min(0).max(1).default(0.8).describe("⚠️ IMPORTANTE: Intensidade 0.0-1.0 (NÃO 0-127!) - Ex: 0.8 = forte, 0.3 = suave"),
    duration: z.number().positive().default(1.0).describe("Duração em segundos (padrão: 1.0s) - IGNORADA se usar notação musical 'C4:q'"),
    channel: z.number().int().min(1).max(16).default(1).describe("Canal MIDI 1-16 (padrão: 1)"),
    outputPort: z.string().optional().describe("Override da porta padrão")
}).describe("🎵 Envia nota MIDI individual. SUPORTA: 'C4' (simples) E 'C4:q' (musical). Velocity: 0.0-1.0");
export const MidiPlayPhraseSchema = z.object({
    notes: z.string().min(1).describe("⚠️ FORMATO: String com notas - Simples: 'C4 E4 G4' OU Musical: 'C4:q E4:e G4:h' (nota:duração)"),
    rhythm: z.union([
        z.string().describe("Padrão rítmico: 'quarter quarter half' ou valor único"),
        z.literal("whole"),
        z.literal("half"),
        z.literal("quarter"),
        z.literal("eighth"),
        z.literal("sixteenth")
    ]).optional().describe("Ritmo das notas (opcional se usar notação musical C4:q)"),
    tempo: z.number().int().min(60).max(200).default(120).describe("BPM (padrão: 120)"),
    style: z.enum(["legato", "staccato", "tenuto", "marcato"]).default("legato").describe("Articulação (padrão: legato)"),
    channel: z.number().int().min(1).max(16).default(1).describe("Canal MIDI 1-16 (padrão: 1)"),
    gap: z.number().min(0).default(100).describe("Pausa entre notas em ms (padrão: 100ms)"),
    outputPort: z.string().optional().describe("Override da porta padrão"),
    // NEW: Enhanced timing options
    notation: z.enum(["auto", "simple", "musical"]).default("auto").describe("🆕 Formato: 'auto' detecta automaticamente, 'simple' = 'C4 E4', 'musical' = 'C4:q E4:e'"),
    quantize: z.boolean().default(false).describe("🆕 Correção automática de timing para grade musical"),
    timeSignature: z.tuple([z.number().int().min(1).max(16), z.number().int().min(1).max(16)]).default([4, 4]).describe("🆕 Compasso [numerador, denominador] - Ex: [4,4], [3,4], [6,8]")
}).describe("🎼 Toca frase musical. SUPORTA: Formato simples 'C4 E4 G4' E notação musical 'C4:q E4:e G4:h'");
// ========================
// 3. ADVANCED CONTROL
// ========================
export const MidiSequenceCommandSchema = z.object({
    type: z.enum(["note", "cc", "delay"]).describe("⚠️ APENAS 3 TIPOS: 'note' (tocar nota), 'cc' (control change), 'delay' (pausa). NÃO use 'chord' ou 'wait'!"),
    time: z.number().min(0).optional().describe("Offset em segundos (opcional)"),
    // Note parameters (use com type: 'note')
    note: z.union([
        z.string().describe("🆕 SUPORTE EXPANDIDO: Formato simples 'C4' OU notação musical 'C4:q' (nota:duração)"),
        z.number().int().min(0).max(127)
    ]).optional().describe("Para type='note': suporta 'C4' (simples), 'C4:q' (musical), ou número MIDI 0-127"),
    duration: z.number().positive().optional().describe("Duração em segundos (para 'note' ou 'delay') - IGNORADA se nota usar formato 'C4:q'"),
    velocity: z.number().min(0).max(1).optional().describe("Para type='note': intensidade 0.0-1.0"),
    // CC parameters (use com type: 'cc')
    controller: z.number().int().min(0).max(127).optional().describe("Para type='cc': número do controlador"),
    value: z.number().int().min(0).max(127).optional().describe("Para type='cc': valor 0-127"),
    // Common parameters
    channel: z.number().int().min(1).max(16).optional().describe("Canal MIDI (opcional)")
});
export const MidiSequenceCommandsSchema = z.object({
    commands: z.array(MidiSequenceCommandSchema).min(1).describe("⚠️ EXEMPLOS: [{'type':'note','note':'C4','duration':1,'velocity':0.8}, {'type':'note','note':'D4:h'}, {'type':'delay','duration':0.5}]"),
    outputPort: z.string().optional().describe("Override da porta padrão")
}).describe("🎭 Sequência MIDI com notação musical. SUPORTE: 'C4' E 'C4:q'. TIPOS: 'note', 'cc', 'delay'");
export const MidiSendCCSchema = z.object({
    controller: z.union([
        z.number().int().min(0).max(127),
        z.enum(["volume", "pan", "expression", "reverb", "chorus", "modwheel", "sustain"])
    ]).describe("Número do controlador 0-127 ou nome conhecido"),
    value: z.number().int().min(0).max(127).describe("Valor do controlador 0-127"),
    channel: z.number().int().min(1).max(16).default(1).describe("Canal MIDI 1-16 (padrão: 1)"),
    outputPort: z.string().optional().describe("Override da porta padrão")
}).describe("🎛️ Envia mensagem MIDI Control Change para modificar parâmetros do instrumento");
// ========================
// 4. TIME & STATE MANAGEMENT
// ========================
export const MidiSetTempoSchema = z.object({
    bpm: z.number().int().min(60).max(200).describe("BPM (Beats Per Minute) entre 60-200")
}).describe("⏱️ Define o BPM (Beats Per Minute) global para todas as operações musicais");
export const MidiTransportControlSchema = z.object({
    action: z.enum(["play", "pause", "stop", "rewind"]).describe("Ação de controle de transport")
}).describe("▶️ Controla o transport musical (play, pause, stop) do sistema");
export const MidiPanicSchema = z.object({}).describe("🚨 Para imediatamente toda a reprodução MIDI (All Notes Off + Reset Controllers)");
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
    outputPort: z.string().optional().describe("Override da porta padrão")
}).describe("🎼 Importa e executa partituras/tablaturas. FORMATOS: notação musical, MusicXML, tablatura de guitarra");
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
    midi_import_score: MidiImportScoreSchema
};
//# sourceMappingURL=mcp-tools-schemas.js.map