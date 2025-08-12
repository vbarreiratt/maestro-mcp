# 🎵 Exemplos de Notação Musical Unificada

## ✨ Novo Suporte à Notação Musical

As ferramentas `midi_send_note` e `midi_sequence_commands` agora suportam **notação musical unificada** além dos formatos anteriores.

### 📝 Formatos Suportados

#### 1. **Formato Simples** (compatibilidade backwards)
```json
{
  "note": "C4",
  "duration": 1.0
}
```

#### 2. **Formato Musical Unificado** ⭐ NOVO
```json
{
  "note": "C4:q"  // Nota C4 com duração de quarter note
}
```

### 🎼 Códigos de Duração

| Código | Duração | Exemplo |
|--------|---------|---------|
| `w`    | Whole note (4 batidas) | `C4:w` |
| `h`    | Half note (2 batidas) | `C4:h` |
| `q`    | Quarter note (1 batida) | `C4:q` |
| `e`    | Eighth note (0.5 batidas) | `C4:e` |
| `s`    | Sixteenth note (0.25 batidas) | `C4:s` |
| `t`    | Thirty-second note | `C4:t` |

### 🎯 Notas com Ponto
```json
{
  "note": "C4:q."  // Quarter note pontuada (1.5 batidas)
}
```

## 🛠️ Exemplos Práticos

### midi_send_note
```json
// Formato simples (anterior)
{
  "tool": "midi_send_note",
  "arguments": {
    "note": "C4",
    "velocity": 0.8,
    "duration": 2.0
  }
}

// Formato musical (novo)
{
  "tool": "midi_send_note", 
  "arguments": {
    "note": "C4:h",  // Half note = 2 segundos @ 120 BPM
    "velocity": 0.8
    // duration é ignorada quando usar notação musical
  }
}
```

### midi_sequence_commands
```json
{
  "tool": "midi_sequence_commands",
  "arguments": {
    "commands": [
      {
        "type": "note",
        "note": "C4:q",      // Quarter note
        "velocity": 0.8
      },
      {
        "type": "note", 
        "note": "E4:e",      // Eighth note
        "velocity": 0.7
      },
      {
        "type": "note",
        "note": "G4:h",      // Half note
        "velocity": 0.9
      }
    ]
  }
}
```

## ⚡ Vantagens

1. **Compatibilidade Total**: Formatos antigos continuam funcionando
2. **Precisão Musical**: Durações baseadas no BPM global atual
3. **Expressividade**: Notação musical padrão (w, h, q, e, s)
4. **Flexibilidade**: Suporte a notas pontuadas
5. **Consistência**: Mesmo parser usado em `midi_play_phrase`

## 🎵 Timing Automático

- Durações calculadas automaticamente baseadas no **BPM global** atual
- Se BPM = 120: `q` = 0.5s, `h` = 1.0s, `w` = 2.0s
- Se BPM = 90: `q` = 0.67s, `h` = 1.33s, `w` = 2.67s

## 🔄 Compatibilidade Backwards

✅ **100% Compatível**: Todos os códigos existentes continuam funcionando  
✅ **Sem Breaking Changes**: Parâmetros `duration` respeitados quando não usar notação musical  
✅ **Comportamento Consistente**: Lógica anterior preservada completamente  