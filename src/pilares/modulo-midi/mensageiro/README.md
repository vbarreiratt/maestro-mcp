# 📡 Mensageiro - Interface MIDI

## Visão Geral

O **Mensageiro** é o pilar responsável pela comunicação direta com dispositivos MIDI, DAWs e hardware musical. Ele atua como ponte física entre o sistema e o mundo real da produção musical.

## Responsabilidades Principais

### 🔌 Gerenciamento de Portas
- Detecção automática de dispositivos MIDI
- Configuração dinâmica de portas de entrada/saída
- Monitoramento de conexões
- Fallback para portas virtuais

### 📤 Comunicação MIDI
- Envio preciso de mensagens MIDI
- Recepção de dados MIDI externos
- Protocolo MIDI completo (notes, CC, sysex)
- Controle de velocidade e timing

### 🎚️ Interface com DAWs
- Integração com Logic Pro, GarageBand, Ableton
- Suporte a dispositivos virtuais
- Sincronização com software musical
- Controle remoto de parâmetros

### 🖥️ Gerenciamento de Hardware
- Comunicação com teclados MIDI
- Controle de interfaces de áudio
- Suporte a controladores MIDI
- Monitoramento de dispositivos

## Arquivos Principais

- `index.ts` - Interface principal do Mensageiro
- `midi-interface.ts` - Protocolo MIDI core
- `port-manager.ts` - Gerenciamento de portas
- `protocol.ts` - Implementação do protocolo MIDI

## Fluxo de Operação

1. **Detecta** dispositivos MIDI disponíveis
2. **Configura** portas de comunicação
3. **Recebe** comandos do Maestro
4. **Traduz** para mensagens MIDI
5. **Envia** dados para dispositivos físicos
6. **Monitora** resposta e status

## Tecnologias Utilizadas

- **JZZ**: Biblioteca MIDI JavaScript multiplataforma
- **Node.js MIDI**: Interface nativa com sistema
- **Web MIDI API**: Suporte a navegadores modernos

## Integração

O Mensageiro executa fisicamente as intenções musicais coordenadas pelo Maestro e interpretadas pelo Tradutor, garantindo comunicação confiável com o ecossistema MIDI.
