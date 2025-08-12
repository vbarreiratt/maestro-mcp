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
  portName: z.string().min(1).describe("Nome exato da porta MIDI de saída")
}).describe("🔧 Configura a porta MIDI de saída padrão para todas as operações");

// ========================
// 2. BASIC MUSICAL CONTROL
// ========================

export const MidiSendNoteSchema = z.object({
  note: z.union([
    z.string().regex(/^[A-G][#b]?[0-9]$/, "Formato: C4, F#3, Bb2"),
    z.number().int().min(0).max(127)
  ]).describe("Nota MIDI: 'C4' ou número 0-127"),
  velocity: z.number().min(0).max(1).default(0.8).describe("⚠️ IMPORTANTE: Intensidade 0.0-1.0 (NÃO 0-127!) - Ex: 0.8 = forte, 0.3 = suave"),
  duration: z.number().positive().default(1.0).describe("Duração em segundos (padrão: 1.0s)"),
  channel: z.number().int().min(1).max(16).default(1).describe("Canal MIDI 1-16 (padrão: 1)"),
  outputPort: z.string().optional().describe("Override da porta padrão")
}).describe("🎵 Envia uma nota MIDI individual. ATENÇÃO: velocity usa escala 0.0-1.0, não 0-127");

export const MidiPlayPhraseSchema = z.object({
  notes: z.string().min(1).describe("⚠️ FORMATO: String com notas separadas por ESPAÇO - Ex: 'C4 E4 G4 C5' ou 'C4 C4 D4 C4 F4 E4' (Happy Birthday)"),
  rhythm: z.union([
    z.string().describe("Padrão rítmico: 'quarter quarter half' ou valor único"),
    z.literal("whole"),
    z.literal("half"), 
    z.literal("quarter"),
    z.literal("eighth"),
    z.literal("sixteenth")
  ]).default("quarter").describe("Ritmo das notas (padrão: quarter)"),
  tempo: z.number().int().min(60).max(200).default(120).describe("BPM (padrão: 120)"),
  style: z.enum(["legato", "staccato", "tenuto", "marcato"]).default("legato").describe("Articulação (padrão: legato)"),
  channel: z.number().int().min(1).max(16).default(1).describe("Canal MIDI 1-16 (padrão: 1)"),
  gap: z.number().min(0).default(100).describe("Pausa entre notas em ms (padrão: 100ms)"),
  outputPort: z.string().optional().describe("Override da porta padrão")
}).describe("🎼 Toca frase musical. ENTRADA: String simples 'C4 E4 G4', NÃO array JSON!");

// ========================
// 3. ADVANCED CONTROL
// ========================

export const MidiSequenceCommandSchema = z.object({
  type: z.enum(["note", "cc", "delay"]).describe("⚠️ APENAS 3 TIPOS: 'note' (tocar nota), 'cc' (control change), 'delay' (pausa). NÃO use 'chord' ou 'wait'!"),
  time: z.number().min(0).optional().describe("Offset em segundos (opcional)"),
  // Note parameters (use com type: 'note')
  note: z.union([
    z.string().regex(/^[A-G][#b]?[0-9]$/),
    z.number().int().min(0).max(127)
  ]).optional().describe("Para type='note': nota MIDI ('C4' ou 60)"),
  duration: z.number().positive().optional().describe("Duração em segundos (para 'note' ou 'delay')"), 
  velocity: z.number().min(0).max(1).optional().describe("Para type='note': intensidade 0.0-1.0"),
  // CC parameters (use com type: 'cc')
  controller: z.number().int().min(0).max(127).optional().describe("Para type='cc': número do controlador"),
  value: z.number().int().min(0).max(127).optional().describe("Para type='cc': valor 0-127"),
  // Common parameters
  channel: z.number().int().min(1).max(16).optional().describe("Canal MIDI (opcional)")
});

export const MidiSequenceCommandsSchema = z.object({
  commands: z.array(MidiSequenceCommandSchema).min(1).describe("⚠️ EXEMPLOS VÁLIDOS: [{'type':'note','note':'C4','duration':1,'velocity':0.8}, {'type':'delay','duration':0.5}]"),
  outputPort: z.string().optional().describe("Override da porta padrão")
}).describe("🎭 Sequência MIDI. TIPOS: 'note'=nota, 'cc'=controlador, 'delay'=pausa. NÃO use 'chord'!");

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
} as const;

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
  midi_panic: MidiPanicSchema
} as const;

export type MCPToolSchemas = typeof MCP_TOOL_SCHEMAS;