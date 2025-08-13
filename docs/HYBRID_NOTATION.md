# Notação Musical Híbrida - Guia Completo

## 🎯 Visão Geral

A **Notação Musical Híbrida** do Maestro MCP é um sistema avançado que permite expressar música com máxima precisão e naturalidade, combinando notação tradicional com controle granular de parâmetros musicais.

## 📝 Sintaxe Básica

### Formato Completo
```
nota:duração@velocity.articulação
```

### Componentes Detalhados

#### **1. Notas**
```
C4, D#4, Bb3, F#5, Ab2
```
- **Formato**: `[A-G][b#]?[0-9]`  
- **Exemplos**: `C4` (Dó central), `F#3` (Fá sustenido oitava 3), `Bb5` (Si bemol oitava 5)
- **Oitavas**: 0-9 (C4 = Dó central = 60 MIDI)

#### **2. Durações**

| Código | Nome | Beats (4/4) | Duração (120 BPM) | Exemplo |
|--------|------|-------------|-------------------|---------|
| `w` | Whole (Semibreve) | 4.0 | 2.0s | `C4:w` |
| `h` | Half (Mínima) | 2.0 | 1.0s | `C4:h` |
| `q` | Quarter (Semínima) | 1.0 | 0.5s | `C4:q` |
| `e` | Eighth (Colcheia) | 0.5 | 0.25s | `C4:e` |
| `s` | Sixteenth (Semicolcheia) | 0.25 | 0.125s | `C4:s` |
| `t` | Thirty-second (Fusa) | 0.125 | 0.0625s | `C4:t` |

#### **3. Velocity (Opcional)**
```
@0.8    → Velocity específica (forte)
@0.3    → Velocity baixa (suave)  
@1.0    → Velocity máxima (fortíssimo)
```
- **Range**: 0.0-1.0
- **Se omitido**: Usa valor global `velocity`

#### **4. Articulação (Opcional)**

| Código | Nome | Efeito | Valor Articulação |
|--------|------|--------|-------------------|
| `.leg` | Legato | Notas conectadas | 1.0 |
| `.stac` | Staccato | Notas curtas e destacadas | 0.0 |
| `.ten` | Tenuto | Notas sustentadas | 0.9 |
| `.accent` | Accent | Nota enfatizada (+20% velocity) | 0.9 |
| `.ghost` | Ghost note | Nota sutil (-30% velocity) | 0.7 |

#### **5. Separadores**
- `|` - Separador de compasso
- ` ` (espaço) - Separador entre notas

## 🎵 Exemplos Práticos

### Exemplo 1: Pop/Rock - Dinâmico
```json
{
  "bpm": 120,
  "notes": "C4:q@0.9.accent E4:e@0.7 G4:e@0.8.leg | C5:h@0.6.ten",
  "reverb": 0.5,
  "timeSignature": "4/4"
}
```

### Exemplo 2: Jazz - Com Swing
```json
{
  "bpm": 140,
  "notes": "C4:e@0.8.accent D4:e@0.4.ghost E4:q@0.9 F4:q@0.7.leg",
  "swing": 0.67,
  "reverb": 0.7,
  "key": "Bb major"
}
```

### Exemplo 3: Clássico - Expressivo
```json
{
  "bpm": 80,
  "notes": "A4:q@0.3 B4:q@0.5 C5:q@0.7.leg D5:q@0.9.accent | C5:h@0.8.ten",
  "reverb": 0.8,
  "articulation": 0.9,
  "key": "A minor"
}
```

### Exemplo 4: Eletrônico - Preciso
```json
{
  "bpm": 128,
  "notes": "C4:s@1.0.stac E4:s@0.8.stac G4:s@0.6.stac C5:s@0.4.ghost",
  "reverb": 0.2,
  "swing": 0.0
}
```

## 🎼 Exemplos por Gênero Musical

### **Pop/Rock**
**Características**: Dinâmicas contrastantes, acentos fortes, articulações mistas

```json
{
  "bpm": 120,
  "notes": "E4:q@0.9.accent E4:e@0.5 E4:e@0.8.stac | G4:h@0.7.leg A4:q@0.9.accent",
  "reverb": 0.4,
  "timeSignature": "4/4"
}
```

### **Jazz**
**Características**: Swing, ghost notes, acentos sincopados

```json
{
  "bpm": 120,
  "notes": "C4:q@0.8.accent D4:e@0.3.ghost E4:e@0.9 F4:q@0.6.ghost | G4:h@0.8.leg",
  "swing": 0.67,
  "reverb": 0.6,
  "key": "F major"
}
```

### **Clássico**
**Características**: Dinâmicas graduais, fraseado legato, articulações precisas

```json
{
  "bpm": 72,
  "notes": "C4:q@0.3 D4:q@0.4 E4:q@0.6.leg F4:q@0.8.ten | G4:h@0.9.leg F4:h@0.7",
  "articulation": 0.9,
  "reverb": 0.8,
  "key": "C major"
}
```

### **Eletrônico/EDM**
**Características**: Timing preciso, staccato, efeitos de reverb controlados

```json
{
  "bpm": 128,
  "notes": "C4:s@1.0.stac C4:s@0.0 C4:s@1.0.stac C4:s@0.0 | E4:e@0.8.accent G4:e@0.6",
  "reverb": 0.3,
  "swing": 0.0
}
```

## 📊 Parâmetros Globais

### Estrutura Base Completa
```typescript
{
  // OBRIGATÓRIOS
  bpm: number,              // 60-200 BPM
  notes: string,            // Notação híbrida
  
  // OPCIONAIS - Estrutura Musical
  timeSignature?: string,   // "4/4", "3/4", "6/8" (padrão: "4/4")
  key?: string,             // "C major", "A minor"
  
  // OPCIONAIS - Padrões Globais
  velocity?: number,        // 0.0-1.0 (padrão: 0.8)
  articulation?: number,    // 0.0-1.0 (padrão: 0.8)  
  reverb?: number,          // 0.0-1.0 (padrão: 0.4)
  swing?: number,           // 0.0-1.0 (padrão: 0.0)
  
  // OPCIONAIS - Técnicos
  channel?: number,         // 1-16 (padrão: 1)
  transpose?: number        // -12 a +12 semitons (padrão: 0)
}
```

### Valores Recomendados por Gênero

| Parâmetro | Pop/Rock | Jazz | Clássico | Eletrônico |
|-----------|----------|------|----------|------------|
| `velocity` | 0.8 | 0.7 | 0.6 | 0.9 |
| `articulation` | 0.6 | 0.8 | 0.9 | 0.2 |
| `reverb` | 0.4 | 0.6 | 0.8 | 0.3 |
| `swing` | 0.0 | 0.67 | 0.0 | 0.0 |

## 🔄 Migração do Formato Legado

### Formato Legado (Ainda Suportado)
```json
{
  "notes": "C4 D4 E4 F4",
  "rhythm": ["quarter", "quarter", "quarter", "quarter"],
  "tempo": 120,
  "style": "legato"
}
```

### Equivalente em Notação Híbrida
```json
{
  "bpm": 120,
  "notes": "C4:q D4:q E4:q F4:q",
  "articulation": 1.0
}
```

### Guia de Conversão

| Legado | Híbrido | Descrição |
|--------|---------|-----------|
| `"quarter"` | `:q` | Semínima |
| `"half"` | `:h` | Mínima |
| `"eighth"` | `:e` | Colcheia |
| `"style": "legato"` | `.leg` ou `articulation: 1.0` | Articulação legato |
| `"style": "staccato"` | `.stac` ou `articulation: 0.0` | Articulação staccato |
| `"tempo": 120` | `"bpm": 120` | Andamento |

## 🛠️ Detecção Automática de Formato

O sistema detecta automaticamente o formato usado:

```typescript
// Híbrido (detectado por presença de ":")
{
  "bpm": 120,
  "notes": "C4:q D4:e"  // ← contém ":"
}

// Legado (detectado por array rhythm)
{
  "notes": "C4 D4",
  "rhythm": ["quarter", "eighth"]  // ← array rhythm
}

// Legado (detectado por campo tempo)
{
  "notes": "C4 D4",
  "tempo": 120  // ← usa "tempo" ao invés de "bpm"
}
```

## 📈 Casos de Uso Avançados

### 1. Arpejos com Dinâmica Crescente
```json
{
  "bpm": 100,
  "notes": "C4:e@0.3 E4:e@0.5 G4:e@0.7 C5:e@0.9.accent",
  "reverb": 0.7
}
```

### 2. Ritmo de Bateria Eletrônica
```json
{
  "bpm": 128,
  "notes": "C4:s@1.0.accent C4:s C4:s@0.7 C4:s | C4:s@1.0.accent C4:s@0.4.ghost C4:s@0.9 C4:s",
  "reverb": 0.2
}
```

### 3. Melodia de Jazz com Ornamentos
```json
{
  "bpm": 140,
  "notes": "F4:e@0.8 G4:s@0.4.ghost F4:e@0.7.leg | Eb4:q@0.9.accent D4:e@0.6 C4:q@0.8.ten",
  "swing": 0.67,
  "key": "Bb major"
}
```

## ⚡ Performance e Otimização

### Recomendações
- **Frases curtas**: < 20 notas para melhor responsividade
- **BPM moderado**: 60-200 para máxima precisão
- **Timing**: Sistema garante precisão de ±5ms

### Limitações
- **Notas simultâneas**: Use `midi_sequence_commands` para acordes
- **Compassos complexos**: Funciona melhor com compassos regulares (4/4, 3/4)
- **Efeitos**: Reverb e swing são simulados via timing e articulação

## 🔍 Troubleshooting

### Problemas Comuns

#### Nota não toca
```
❌ "C4:x"     → Duração inválida
✅ "C4:q"     → Duração válida

❌ "H4:q"     → Nome de nota inválido  
✅ "B4:q"     → Nome correto (Si)
```

#### Timing incorreto
```
❌ bpm: 500   → BPM muito alto
✅ bpm: 120   → BPM dentro do range

❌ "@1.5"    → Velocity > 1.0
✅ "@0.9"    → Velocity válida
```

#### Articulação não funciona  
```
❌ ".ligado"  → Código inválido
✅ ".leg"     → Código válido

❌ ".acc"     → Abreviação incorreta
✅ ".accent"  → Código completo
```

### Mensagens de Erro Comuns

| Erro | Solução |
|------|---------|
| `"Invalid note name: H4"` | Use `B4` (Si) ao invés de `H4` |
| `"Invalid duration code"` | Use `w, h, q, e, s, t` |
| `"Invalid velocity value"` | Range 0.0-1.0, use ponto decimal |
| `"Unknown articulation code"` | Use códigos válidos: `leg, stac, ten, accent, ghost` |

---

## 🚀 Exemplos de Integração

### Cliente MCP
```json
{
  "method": "tools/call",
  "params": {
    "name": "maestro:midi_play_phrase",
    "arguments": {
      "bpm": 120,
      "notes": "C4:q@0.8.leg E4:e G4:e.stac | C5:h@0.9",
      "reverb": 0.6
    }
  }
}
```

### Resposta
```json
{
  "success": true,
  "message": "Playing phrase with hybrid notation",
  "noteCount": 4,
  "format": "hybrid",
  "duration": 2.0,
  "bpm": 120,
  "effects": {
    "reverb": 0.6,
    "swing": 0.0,
    "transpose": 0
  }
}
```

A **Notação Musical Híbrida** transforma a experiência de composição em código, oferecendo controle profissional com sintaxe intuitiva e mantendo total compatibilidade com sistemas legados.
