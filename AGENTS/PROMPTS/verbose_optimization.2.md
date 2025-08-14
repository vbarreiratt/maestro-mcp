# Correção: Verbose por Categoria de Função

## Problema Detectado
A otimização de verbose foi aplicada globalmente, mas algumas funções **PRECISAM** mostrar detalhes por padrão.

## Correção Necessária

### Funções INFORMATIVAS (verbose=true por padrão):
```python
# Estas devem mostrar detalhes completos sempre:
- midi_list_ports()          # Lista de portas é o resultado principal
- configure_midi_output()    # Confirmação de configuração é essencial
- get_file_info()           # Informações do arquivo são o objetivo
- maestro_debug_last()      # Debug sempre verbose (já implementado)
```

### Funções de EXECUÇÃO (verbose=false por padrão):
```python
# Estas podem ter resumo condensado:
- midi_play_phrase()
- midi_send_note()
- midi_sequence_commands()
- midi_send_cc()
- etc.
```

## Implementação Sugerida

### Opção A: Default por Função
```python
@tool
def midi_list_ports(verbose: bool = True):  # True para informativas
    
@tool  
def midi_play_phrase(verbose: bool = False):  # False para execução
```

### Opção B: Categorização Automática
```python
INFORMATIVE_FUNCTIONS = ['midi_list_ports', 'configure_midi_output', 'get_file_info']

def get_default_verbose(function_name):
    return function_name in INFORMATIVE_FUNCTIONS
```

## Resultado Esperado
- ✅ `midi_list_ports()` → Mostra portas completas
- ✅ `midi_play_phrase()` → Resumo condensado  
- ✅ Debug opcional funciona para ambos

**Prioridade:** Alta - função informativa sem informação não faz sentido.