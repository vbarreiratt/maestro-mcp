# OBJETIVO: Implementar sistema de replay universal no servidor MCP Maestro

## CONTEXTO
Servidor MCP Python para controle MIDI que atualmente requer reenvio completo de parâmetros para repetições com pequenas modificações. Sistema deve funcionar UNIVERSALMENTE com TODAS as ferramentas MIDI (midi_play_phrase, midi_send_note, midi_sequence_commands, midi_send_cc, etc.).

## PASSO 0: SETUP GIT (EXECUTAR PRIMEIRO)
```bash
# Criar nova branch para esta feature
git checkout -b feat/maestro-replay-last

# Verificar que está na branch correta
git branch
```

## IMPLEMENTAÇÃO REQUERIDA

### 1. Cache Universal da Última Operação
- Adicionar `self.last_operation = None` na classe principal
- Capturar automaticamente TODA operação MIDI executada
- Armazenar: função_chamada, parâmetros_completos, timestamp
```python
self.last_operation = {
    "function": "midi_play_phrase",
    "params": {"voices": [...], "bpm": 166, "reverb": 0.4},
    "timestamp": time.time()
}
```

### 2. Novo Método Universal `maestro_replay_last`
```python
def maestro_replay_last(self, modifications=None):
    # Se não há operação anterior, retornar erro
    # Se sem modificações, re-executar função original com parâmetros idênticos
    # Se com modificações, aplicar changes nos parâmetros e executar função original
    # Funciona com qualquer função MIDI: midi_play_phrase, midi_send_note, midi_sequence_commands, etc.
```

### 3. Sistema de Modificações Universal (Diff System)
O diff system aplica mudanças pontuais em QUALQUER parâmetro de QUALQUER função:

```python
# Exemplos de modificações para diferentes funções:

# Para midi_play_phrase:
modifications = {
    "bpm": 140,
    "reverb": 0.8,
    "voices[0].channel": 4,           # Muda canal da voz 0
    "voices[1].velocity": 0.9,        # Muda velocity da voz 1
    "key": "C major"                  # Muda tonalidade
}

# Para midi_send_note:
modifications = {
    "note": "C5",                     # Muda nota
    "channel": 3,                     # Muda canal
    "velocity": 0.9,                  # Muda velocity
    "duration": 2.0                   # Muda duração
}

# Para midi_sequence_commands:
modifications = {
    "commands[0].note": "D4",         # Muda primeira nota da sequência
    "commands[2].channel": 5          # Muda canal do terceiro comando
}

# Para midi_send_cc:
modifications = {
    "controller": "volume",           # Muda controlador
    "value": 100,                     # Muda valor
    "channel": 2                      # Muda canal
}
```

### 4. Sistema de Path Navigation
Implementar navegação por path para modificações aninhadas:
```python
def apply_path_modification(data, path, value):
    # "voices[0].channel" → data["voices"][0]["channel"] = value
    # "commands[2].note" → data["commands"][2]["note"] = value
    # "bpm" → data["bpm"] = value
```

### 5. Auto-captura em TODAS as Funções MIDI
Modificar TODAS as funções MIDI existentes para capturar operação:
- `midi_play_phrase`
- `midi_send_note`
- `midi_sequence_commands`
- `midi_send_cc`
- `midi_set_tempo`
- `midi_transport_control`
- Etc.

### 6. Schema JSON para o MCP
Adicionar nova função universal no schema:
```json
{
  "name": "maestro:maestro_replay_last",
  "description": "🔄 Repete a última operação MIDI com modificações opcionais",
  "parameters": {
    "modifications": {
      "description": "Modificações a aplicar usando notação de path (ex: 'voices[0].channel': 4)",
      "type": "object"
    },
    "verbose": {
      "default": false,
      "description": "Mostrar resposta completa",
      "type": "boolean"
    }
  }
}
```

## ARQUIVOS A MODIFICAR
- Classe principal do servidor MCP (TODAS as funções MIDI)
- Schema de funções MCP
- Sistema de aplicação de modificações por path

## CRITÉRIOS DE SUCESSO
- Funciona: `maestro_replay_last()` repete QUALQUER operação anterior
- Funciona: `maestro_replay_last({"voices[0].channel": 4})` para midi_play_phrase
- Funciona: `maestro_replay_last({"note": "C5"})` para midi_send_note
- Funciona: `maestro_replay_last({"value": 127})` para midi_send_cc
- Funciona: `maestro_replay_last({"commands[0].note": "D4"})` para midi_sequence_commands
- Retrocompatível: métodos existentes continuam funcionando
- Universal: funciona com 100% das funções MIDI

## IMPLEMENTAÇÃO TÉCNICA
```python
class UniversalReplay:
    def __init__(self):
        self.last_operation = None
    
    def capture_operation(self, function_name, params):
        self.last_operation = {
            "function": function_name,
            "params": copy.deepcopy(params),
            "timestamp": time.time()
        }
    
    def apply_modifications(self, base_params, modifications):
        result = copy.deepcopy(base_params)
        for path, value in modifications.items():
            self.set_nested_value(result, path, value)
        return result
    
    def set_nested_value(self, data, path, value):
        # Implementar navegação por path: "voices[0].channel" etc.
        pass
```

## RESTRIÇÕES
- Manter compatibilidade total com código existente
- Máxima simplicidade de implementação
- Zero verbosidade desnecessária
- Código production-ready
- DEVE funcionar com 100% das funções MIDI existentes

## FINALIZAÇÃO GIT (EXECUTAR AO FINAL)
```bash
# Adicionar todos os arquivos modificados
git add .

# Commit com mensagem descritiva
git commit -m "feat: implement universal replay system with path-based modifications

- Add maestro_replay_last() function for all MIDI operations
- Implement auto-capture system for last operation
- Add path-based modification system (voices[0].channel, etc.)
- Maintain full backward compatibility
- Support all existing MIDI functions"

# Push da nova branch
git push -u origin feat/maestro-replay-last
```

IMPLEMENTE AGORA. Apenas código, zero explicações exceto comentários essenciais no código.