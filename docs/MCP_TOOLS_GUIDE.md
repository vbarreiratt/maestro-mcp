/**
 * MCP MIDI Tools - Guia de Uso com Exemplos
 * Baseado em erros reais encontrados durante testes
 */

# 🎼 GUIA DEFINITIVO - MCP MAESTRO TOOLS

## ⚠️ ERROS COMUNS E CORREÇÕES

### 1. 🎵 midi_send_note

**❌ ERRO COMUM:**
```json
{"velocity": 127}  // Erro! Valor muito alto
```

**✅ CORRETO:**
```json
{"note": "C4", "velocity": 0.8, "duration": 1.0, "channel": 1}
{"note": 60, "velocity": 1.0, "duration": 2.0}  // Máximo volume
```

**REGRA:** velocity sempre 0.0-1.0, NÃO 0-127!

---

### 2. 🎼 midi_play_phrase  

**❌ ERRO COMUM:**
```json
{"notes": ["C4", "E4", "G4"]}  // Erro! Array não aceito
{"notes": "C4:0.5:0.9, E4:0.25:0.8"}  // Erro! Formato complexo
```

**✅ CORRETO:**
```json
{"notes": "C4 E4 G4 C5"}  // String simples com espaços
{"notes": "C4 C4 D4 C4 F4 E4", "gap": 200}  // Happy Birthday
```

**REGRA:** Apenas string com notas separadas por ESPAÇO!

---

### 3. 🎭 midi_sequence_commands

**❌ ERRO COMUM:**
```json
[
  {"type": "chord", "notes": [60, 64, 67]},  // Erro! 'chord' não existe
  {"type": "wait", "duration": 500}         // Erro! 'wait' não existe  
]
```

**✅ CORRETO:**
```json
[
  {"type": "note", "note": "C4", "duration": 1, "velocity": 0.8},
  {"type": "delay", "duration": 0.5},  
  {"type": "note", "note": "E4", "duration": 1, "velocity": 0.8},
  {"type": "cc", "controller": 7, "value": 100}
]
```

**REGRA:** Apenas 3 tipos: `note`, `cc`, `delay`

---

## 🎯 EXEMPLOS FUNCIONAIS TESTADOS

### Happy Birthday Completo:
```json
{
  "tool": "midi_play_phrase",
  "arguments": {
    "notes": "C4 C4 D4 C4 F4 E4 C4 C4 D4 C4 G4 F4",
    "tempo": 120,
    "gap": 200
  }
}
```

### Acorde em Sequência:
```json
{
  "tool": "midi_sequence_commands", 
  "arguments": {
    "commands": [
      {"type": "note", "note": 60, "duration": 0.5, "velocity": 0.8},
      {"type": "note", "note": 64, "duration": 0.5, "velocity": 0.8}, 
      {"type": "note", "note": 67, "duration": 1.0, "velocity": 1.0}
    ]
  }
}
```

### Controle de Volume:
```json
{
  "tool": "midi_send_cc",
  "arguments": {
    "controller": "volume",  // ou 7
    "value": 100,
    "channel": 1
  }
}
```

---

## 🔧 CONFIGURAÇÃO INICIAL

1. **Listar Portas:**
```json
{"tool": "midi_list_ports", "arguments": {}}
```

2. **Configurar Saída:**
```json  
{"tool": "configure_midi_output", "arguments": {"portName": "GarageBand Virtual In"}}
```

3. **Teste Básico:**
```json
{"tool": "midi_send_note", "arguments": {"note": "C4", "velocity": 0.8, "duration": 2}}
```

---

## 🚨 RESUMO DAS REGRAS CRÍTICAS

- ✅ **velocity**: sempre 0.0-1.0  
- ✅ **notes** (phrase): string com espaços "C4 E4 G4"
- ✅ **sequence types**: apenas "note", "cc", "delay"
- ✅ **duration**: sempre em segundos (float)
- ✅ **channel**: 1-16 (integer)

**Seguindo este guia, todas as ferramentas funcionarão na primeira tentativa!** 🎼
