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
    verbose: z.boolean().default(false).describe("Mostrar resposta completa (padrão: resumida)")
}).describe("🎹 Lista portas MIDI disponíveis. ✅ SEMPRE use PRIMEIRO para descobrir conexões. Retorna nomes exatos para configure_midi_output.");
export const ConfigureMidiOutputSchema = z.object({
    portName: z.string().min(1).describe("Nome da porta MIDI de saída OU 'auto' para detecção automática"),
    targetDAW: z.string().optional().describe("🆕 DAW alvo para otimização: 'GarageBand', 'Logic', 'Ableton', etc. (usado com portName='auto')"),
    verbose: z.boolean().default(false).describe("Mostrar resposta completa (padrão: resumida)")
}).describe("🔧 ESSENCIAL: Configure saída MIDI antes de tocar qualquer música. Use nome exato de midi_list_ports OU 'auto' + targetDAW (ex: 'GarageBand'). ⚠️ OBRIGATÓRIO para reprodução.");
// ========================
// 2. BASIC MUSICAL CONTROL
// ========================
// Voice schema for multi-voice support
const VoiceSchema = z.object({
    channel: z.number().int().min(1).max(16).describe("MIDI channel for this voice"),
    notes: z.string().min(1).describe("Notação desta voz: 'C4:q@0.7.leg D4:e@0.5'. Dinâmicas 0.3-1.0 para som natural."),
    velocity: z.number().min(0).max(1).optional().describe("Dinâmica desta voz (sobrescreve global). Use 0.3-1.0"),
    articulation: z.number().min(0).max(1).optional().describe("Articulação desta voz (sobrescreve global). 0.6-0.9 = natural"),
    transpose: z.number().int().min(-12).max(12).optional().describe("Voice-specific transpose override")
});
// Simplified schema avoiding union types that break MCP JSON Schema conversion
export const MidiPlayPhraseSchema = z.object({
    // Core parameters
    bpm: z.number().int().min(60).max(200).describe("BPM (Beats Per Minute)"),
    // Single-voice format (backward compatible)
    notes: z.string().min(1).optional().describe("🎵 NOTAÇÃO HÍBRIDA (VOZ ÚNICA): 'C4:q@0.7.leg D4:e' (nota:duração@dinâmica.articulação). ACORDES: '[Am]:h [F]:q'. Dinâmicas naturais: 0.3-1.0. | separa compassos."),
    // Multi-voice format (NEW)
    voices: z.array(VoiceSchema).min(1).max(16).optional().describe("🎼 POLIFONIA: Múltiplas vozes simultâneas. voices=[{channel:1, notes:'C4:q@0.7'}, {channel:2, notes:'E4:q@0.5'}]. Cada voz independente."),
    // Musical Structure  
    timeSignature: z.string().regex(/^\d+\/\d+$/).default("4/4").describe("Time signature like '4/4', '3/4', '6/8'"),
    key: z.string().optional().describe("Musical key like 'C major', 'A minor'"),
    // Global Defaults
    velocity: z.number().min(0).max(1).default(0.7).describe("Dinâmica global 0.3-1.0 (0.3=pp, 0.5=p, 0.7=mf, 0.9=f, 1.0=ff). Use 0.3-1.0 para som natural"),
    articulation: z.number().min(0).max(1).default(0.75).describe("Articulação global 0.2-1.0 (0.4=stac, 0.75=normal, 0.85=leg). Use 0.6-0.9 para naturalidade"),
    reverb: z.number().min(0).max(1).default(0.4).describe("Reverb amount 0.0-1.0"),
    swing: z.number().min(0).max(1).default(0.0).describe("Swing amount 0.0-1.0"),
    // Technical
    channel: z.number().int().min(1).max(16).default(1).describe("MIDI channel 1-16 (usado para single-voice)"),
    transpose: z.number().int().min(-12).max(12).default(0).describe("Transpose in semitones"),
    outputPort: z.string().optional().describe("Override porta padrão"),
    verbose: z.boolean().default(false).describe("Mostrar resposta completa (padrão: condensada)")
}).describe("🎼 PRINCIPAL para melodias/acordes/composições. NOTAÇÃO: 'C4:q@0.7.leg D4:e | F4:h' (nota:duração@dinâmica.articulação). ACORDES: '[Am]:h [F]:q'. MULTI-VOZ: voices=[{channel:1, notes:'...'}]. 🎵 DINÂMICAS NATURAIS: 0.3-1.0 (pp-ff). Evite extremos para fluidez.");
// Temporarily simplified schema to resolve MCP connection issues
export const MidiSendNoteSchema = z.object({
    note: z.union([
        z.string().describe("Nota musical 'C4' ou híbrido 'C4:q@0.8.leg'"),
        z.number().int().min(0).max(127).describe("Número MIDI 0-127")
    ]).describe("Nota MIDI"),
    velocity: z.number().min(0).max(1).default(0.7).describe("Dinâmica 0.3-1.0 (MUSICAL: 0.3=pp, 0.5=p, 0.7=mf, 0.9=f, 1.0=ff)"),
    duration: z.number().positive().default(1.0).describe("Duração em segundos"),
    bpm: z.number().int().min(60).max(200).default(120).describe("BPM para notação híbrida"),
    channel: z.number().int().min(1).max(16).default(1).describe("Canal MIDI 1-16"),
    outputPort: z.string().optional().describe("Override porta padrão"),
    verbose: z.boolean().default(false).describe("Mostrar resposta completa (padrão: condensada)")
}).describe("🎵 Toca UMA nota simples. Para MELODIAS use midi_play_phrase. HYBRID: 'C4:q@0.7.leg' (nota:duração@dinâmica.articulação). Dinâmicas 0.3-1.0 para som natural.");
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
    velocity: z.number().min(0).max(1).optional().describe("Dinâmica 0.3-1.0 (recomendado para naturalidade musical)"),
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
}).describe("🎭 AVANÇADO: Sequências complexas com timing preciso. TIPOS: 'note' (tocar), 'cc' (controle), 'delay' (pausa). HYBRID suportado: note:'C4:q@0.7.leg'. Para melodias simples, use midi_play_phrase.");
export const MidiSendCCSchema = z.object({
    controller: z.union([
        z.number().int().min(0).max(127),
        z.enum(["volume", "pan", "expression", "reverb", "chorus", "modwheel", "sustain"])
    ]).describe("Número do controlador 0-127 ou nome conhecido"),
    value: z.number().int().min(0).max(127).describe("Valor do controlador 0-127"),
    channel: z.number().int().min(1).max(16).default(1).describe("Canal MIDI 1-16 (padrão: 1)"),
    outputPort: z.string().optional().describe("Override da porta padrão"),
    verbose: z.boolean().default(false).describe("Mostrar resposta completa (padrão: condensada)")
}).describe("🎛️ Controla parâmetros do instrumento. COMUNS: 'volume'=7, 'pan'=10, 'reverb'=91. Use NOMES ('volume') ou números (7). Valores 0-127.");
// ========================
// 4. TIME & STATE MANAGEMENT
// ========================
export const MidiSetTempoSchema = z.object({
    bpm: z.number().int().min(60).max(200).describe("BPM (Beats Per Minute) entre 60-200"),
    verbose: z.boolean().default(false).describe("Mostrar resposta completa (padrão: condensada)")
}).describe("⏱️ Define tempo global (60-200 BPM). Afeta TODAS operações subsequentes. TÍPICOS: 120=moderado, 80=lento, 140=rápido.");
export const MidiTransportControlSchema = z.object({
    action: z.enum(["play", "pause", "stop", "rewind"]).describe("Ação de controle de transport"),
    verbose: z.boolean().default(false).describe("Mostrar resposta completa (padrão: condensada)")
}).describe("▶️ Controle de reprodução. 'play'=iniciar, 'stop'=parar, 'pause'=pausar, 'rewind'=voltar ao início. Para DAWs que suportam transport MIDI.");
export const MidiPanicSchema = z.object({
    verbose: z.boolean().default(false).describe("Mostrar resposta completa (padrão: condensada)")
}).describe("🚨 EMERGÊNCIA: Para TODA reprodução MIDI imediatamente. Use se notas ficarem 'presas' ou som não parar. Envia All Notes Off em todos canais.");
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
}).describe("🎼 IMPORTA partituras externas. FORMATOS: 'text_notation' (notação híbrida), 'musicxml' (MuseScore/Sibelius), 'guitar_tab' (tablatura). Para composição direta, use midi_play_phrase.");
// ========================
// 6. DEBUG FUNCTION
// ========================
export const MaestroDebugLastSchema = z.object({}).describe("🔍 DEBUG: Mostra detalhes da última operação. Use para troubleshooting quando comando não funciona como esperado.");
export const MaestroReplayLastSchema = z.object({
    modifications: z.record(z.any()).optional().describe("Modificações a aplicar usando notação de path (ex: 'voices[0].channel': 4)"),
    verbose: z.boolean().default(false).describe("Mostrar resposta completa (padrão: condensada)")
}).describe("🔄 REPLAY: Executa última operação novamente com modificações opcionais. Útil para ajustar velocidade/canal sem reescrever comando completo.");
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
    maestro_debug_last: MaestroDebugLastSchema,
    maestro_replay_last: MaestroReplayLastSchema
};
//# sourceMappingURL=mcp-tools-schemas.js.map