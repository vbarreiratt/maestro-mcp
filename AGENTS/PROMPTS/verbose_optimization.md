# Sistema de Verbose Otimizado para MCP MIDI

## Objetivo
Implementar sistema de resposta condensada para ferramentas MCP MIDI, reduzindo verbose desnecessário e melhorando UX.

## Implementação Requerida

### 1. Configuração Padrão (verbose=false)
```json
{
  "success": true,
  "summary": "▶️ midi_play_phrase: 4 vozes, 110 BPM, 15.2s",
  "details": "[oculto]"
}
```

### 2. Resposta Verbose Completa (verbose=true)
```json
{
  "success": true,
  "summary": "▶️ midi_play_phrase: 4 vozes, 110 BPM, 15.2s",
  "message": "Playing multi-voice notation with 4 voice(s)",
  "format": "multi-voice",
  "voiceCount": 4,
  "totalNotes": 63,
  "channels": [1, 2, 3, 4],
  "duration": 15.2,
  "bpm": 110,
  "voices": [...],
  "effects": {...}
}
```

## Modificações Necessárias

### A. Parâmetros de Função
Adicionar a TODAS as funções MIDI:
```python
verbose: bool = False  # Padrão condensado
```

### B. Lógica de Resposta
```python
def format_response(success, data, verbose=False):
    base_response = {
        "success": success,
        "summary": generate_summary(data)
    }
    
    if verbose:
        base_response.update(data)
    else:
        base_response["details"] = "[oculto]"
    
    return base_response
```

### C. Função de Debug
Nova ferramenta para debug da última operação:
```python
@tool
def maestro_debug_last():
    """🔍 Mostra detalhes completos da última operação MIDI"""
    return last_operation_details
```

## Schema de Parâmetros Atualizado

### Exemplo: midi_play_phrase
```json
{
  "bpm": {"type": "integer", "description": "BPM"},
  "voices": {"type": "array", "description": "Vozes musicais"},
  "verbose": {
    "type": "boolean", 
    "default": false,
    "description": "Mostrar resposta completa (padrão: condensada)"
  }
}
```

## Benefícios Esperados

### ✅ UX Melhorada
- Conversas 90% mais limpas
- Foco no resultado musical
- Menos distração técnica

### ✅ Performance
- Redução de ~80% no consumo de tokens
- Respostas mais rápidas
- Cache mais eficiente

### ✅ Flexibilidade
- Debug opcional quando necessário
- Backward compatibility
- Configuração por comando

## Casos de Uso

### 1. Uso Normal (Padrão)
```
User: "Toque uma melodia em Dó Maior"
Claude: executa midi_play_phrase()
Response: ✅ ▶️ midi_play_phrase: 1 voz, 120 BPM, 8.5s
```

### 2. Debug Necessário
```
User: "Por que a última música não tocou direito?"
Claude: executa maestro_debug_last()
Response: [detalhes técnicos completos da última operação]
```

### 3. Verbose Específico
```
Claude: executa midi_play_phrase(verbose=true)
Response: [resposta completa com todos os detalhes]
```

## Implementação Priorizada

### Fase 1: Core
1. Adicionar parâmetro `verbose` a todas as funções
2. Implementar lógica de resposta condensada
3. Criar função `maestro_debug_last`

### Fase 2: Refinamento
1. Otimizar mensagens de summary
2. Adicionar emojis e formatação
3. Configuração global de verbose

### Fase 3: Avançado
1. Níveis de verbose (0=mínimo, 1=normal, 2=completo)
2. Filtros de informação específicos
3. Histórico de operações para debug

## Resultado Final
Transformar isto:
```
🔴 ANTES: 2000+ caracteres de resposta técnica desnecessária
```

Nisto:
```
🟢 DEPOIS: ✅ ▶️ Melodia tocada: 4 vozes, 110 BPM, 15s
```

**Ganho:** ~95% redução de ruído, UX limpa, debug opcional quando necessário.