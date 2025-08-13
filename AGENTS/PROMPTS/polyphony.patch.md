# FOLLOW-UP: Expandir implementação atual de acordes no MCP MIDI

## STATUS ATUAL ✅

**FUNCIONANDO BEM:**
- ✅ Acordes explícitos: `[C3 E3 G3]:q@0.8`
- ✅ Acordes básicos nomeados: `[Am]`, `[Dm]` 
- ✅ Melodia + acordes simultâneos sem picotamento
- ✅ Timing preciso e legato fluido
- ✅ Dinâmica independente por elemento

## LIMITAÇÕES IDENTIFICADAS ❌

### 1. **ACORDES NOMEADOS INCOMPLETOS**
```
❌ [Bb] → "Unknown chord: Bb"
❌ Provavelmente faltam: [F], [G], [C], [G7], [Cmaj7], [Em7], etc.
```

### 2. **SEM POLIFONIA REAL MULTI-VOZ**
```
❌ Ainda não temos: {"voices": [...]}
❌ Bach precisa de 3-4 vozes INDEPENDENTES
❌ Cada voz deveria ter canal/articulação próprios
```

### 3. **SINTAXE HARMÔNICA LIMITADA**
```
❌ Inversões: [C/E], [F/A], [G/B]
❌ Extensões: [G7], [Cmaj7], [Am7b5], [Dsus4]
❌ Alterações: [C#dim], [Bb7], [F#m]
```

## IMPLEMENTAÇÃO NECESSÁRIA

### 1. **ACORDES NOMEADOS COMPLETOS**
```javascript
const chordDatabase = {
  // Tríades maiores
  "C": ["C", "E", "G"], "D": ["D", "F#", "A"], "E": ["E", "G#", "B"],
  "F": ["F", "A", "C"], "G": ["G", "B", "D"], "A": ["A", "C#", "E"], 
  "B": ["B", "D#", "F#"], "Bb": ["Bb", "D", "F"],
  
  // Tríades menores  
  "Cm": ["C", "Eb", "G"], "Dm": ["D", "F", "A"], "Em": ["E", "G", "B"],
  "Fm": ["F", "Ab", "C"], "Gm": ["G", "Bb", "D"], "Am": ["A", "C", "E"],
  
  // Sétimas
  "C7": ["C", "E", "G", "Bb"], "Cmaj7": ["C", "E", "G", "B"],
  "G7": ["G", "B", "D", "F"], "Am7": ["A", "C", "E", "G"],
  
  // Inversões
  "C/E": ["E", "G", "C"], "F/A": ["A", "C", "F"], "G/B": ["B", "D", "G"]
}
```

### 2. **MÚLTIPLAS VOZES INDEPENDENTES**
```json
// SINTAXE DESEJADA:
{
  "voices": [
    {"channel": 1, "notes": "D4:q@0.7.leg A3:q@0.6 F4:q@0.8 E4:q@0.7"},
    {"channel": 2, "notes": "[Dm]:h@0.5 [Bb]:h@0.4"}, 
    {"channel": 3, "notes": "D2:w@0.6"}
  ],
  "bpm": 72,
  "key": "d minor"
}
```

### 3. **IMPLEMENTAÇÃO TÉCNICA**

**ARQUIVOS ALVO:**
- Parser de notação híbrida (expandir acordes nomeados)
- `midi_play_phrase` (adicionar suporte a `voices` array)
- Sistema de canais MIDI (distribuição automática)

**REQUISITOS:**
- **Backwards compatibility**: Manter sintaxe atual funcionando
- **Detecção automática**: Single voice vs multi-voice
- **Canal assignment**: Distribuição inteligente por voz
- **Timing perfeito**: Sincronização entre todas as vozes

### 4. **TESTE DE VALIDAÇÃO**
```javascript
// DEVE FUNCIONAR:
"[Bb]:q@0.6 [F/A]:q@0.7 [Gm]:h@0.5 [C7]:q@0.8"

// E TAMBÉM:
{
  "voices": [
    {"channel": 1, "notes": "D4:q G4:q F4:q E4:q"},
    {"channel": 2, "notes": "[Dm]:q [Bb]:q [F]:q [C]:q"},
    {"channel": 3, "notes": "D2:w"},
    {"channel": 4, "notes": "A2:h F2:h"}
  ]
}
```

## RESULTADO ESPERADO

**Bach com 4 vozes independentes** tocando simultaneamente, cada uma com:
- ✅ Canal MIDI próprio
- ✅ Articulação independente  
- ✅ Timing sincronizado
- ✅ Acordes nomeados completos
- ✅ Sem limitações harmônicas

**FOCO**: Transformar o MCP MIDI em um **sequenciador completo** capaz de reproduzir qualquer música barroca/clássica com fidelidade total.