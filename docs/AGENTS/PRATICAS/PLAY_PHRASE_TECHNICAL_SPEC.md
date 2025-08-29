# Ficha Técnica: Uso do Comando `midi_play_phrase` para Agentes

## 1. Objetivo

Este documento serve como uma ficha técnica detalhada para agentes que interagem com o servidor Maestro MCP, especificando a forma correta de construir e enviar comandos para a ferramenta `midi_play_phrase`. O objetivo é garantir a consistência, precisão e conformidade com o esquema de validação do servidor.

## 2. Visão Geral da Ferramenta `midi_play_phrase`

A ferramenta `midi_play_phrase` é utilizada para tocar frases musicais complexas, suportando tanto notação híbrida para voz única quanto polifonia multi-voz. Ela permite controle detalhado sobre BPM, articulação, velocidade, transposição e outros parâmetros musicais.

**Nome da Ferramenta:** `midi_play_phrase`

## 3. Fórmula de Notação Híbrida

A notação híbrida é a base para especificar as notas e suas propriedades. Ela combina nome da nota, duração, velocidade e articulação em uma única string.

**Formato Geral da Nota:** `[NomeDaNota/Acorde]:[Duração]@[Velocidade].[Articulação]`

*   **`NomeDaNota/Acorde`**:
    *   **Notas Simples:** Ex: `C4`, `F#3`, `Bb5`.
    *   **Acordes Nomeados:** Ex: `[C]`, `[Am]`, `[G7]`, `[Cmaj7]`. Suporta inversões como `[G/B]`.
    *   **Acordes Explícitos:** Ex: `[C3 E3 G3]` (notas separadas por espaço dentro dos colchetes).
*   **`Duração`**: (Obrigatório se `Velocidade` ou `Articulação` forem especificados)
    *   `w` (whole - semibreve)
    *   `h` (half - mínima)
    *   `q` (quarter - semínima)
    *   `e` (eighth - colcheia)
    *   `s` (sixteenth - semicolcheia)
    *   `t` (thirty-second - fusa)
    *   **Exemplo:** `C4:q` (C4 semínima)
*   **`Velocidade`**: (Opcional, precedido por `@`)
    *   Valor decimal entre `0.0` (silêncio) e `1.0` (máximo).
    *   **Exemplo:** `C4:q@0.8` (C4 semínima com 80% de velocidade)
*   **`Articulação`**: (Opcional, precedido por `.`)
    *   `leg` (legato - 1.0)
    *   `stac` (staccato - 0.0)
    *   `ten` (tenuto - 0.9)
    *   `accent` (acento - modifica velocidade, articulação padrão)
    *   `ghost` (ghost note - modifica velocidade, articulação padrão)
    *   **Exemplo:** `C4:q@0.8.leg` (C4 semínima, 80% velocidade, legato)

**Exemplos de Strings de Notação Híbrida:**

*   `C4:q.stac D4:e.leg E4:e.ten F4:q.accent G4:h.ghost`
*   `[C]:q.stac [Dm]:e.leg [G7]:e.ten [Cmaj7]:q.accent [F]:h.ghost`

## 4. Estrutura JSON para `tools.call`

Os comandos devem ser enviados como um objeto JSON para a função `tools.call`.

**Estrutura Geral:**

```javascript
tools.call("midi_play_phrase", {
  "bpm": <number>, // BPM (Beats Per Minute)
  // Escolha UMA das opções abaixo: 'notes' OU 'voices'
  "notes": "<string_notacao_hibrida_voz_unica>", // Para voz única
  "voices": [ // Para multi-voz
    {
      "channel": <number>, // Canal MIDI para esta voz (1-16)
      "notes": "<string_notacao_hibrida_para_esta_voz>",
      "velocity": <number_opcional>, // Override de velocidade para esta voz
      "articulation": <number_opcional>, // Override de articulação para esta voz
      "transpose": <number_opcional> // Override de transposição para esta voz
    }
    // ... mais objetos de voz
  ],
  "timeSignature": "<string_opcional>", // Ex: "4/4", "3/4"
  "key": "<string_opcional>", // Ex: "C major", "A minor"
  "velocity": <number_opcional>, // Velocidade global padrão (0.0-1.0)
  "articulation": <number_opcional>, // Articulação global padrão (0.0-1.0)
  "reverb": <number_opcional>, // Quantidade de reverb (0.0-1.0)
  "swing": <number_opcional>, // Quantidade de swing (0.0-1.0)
  "channel": <number_opcional>, // Canal MIDI global padrão (1-16)
  "transpose": <number_opcional>, // Transposição global em semitons
  "outputPort": "<string_opcional>", // Override da porta MIDI de saída
  "verbose": <boolean_opcional> // Mostrar resposta completa (true/false)
})
```

### 4.1. Parâmetros Essenciais

*   **`bpm`**: `number` (inteiro, min: 60, max: 200) - Batidas por minuto. **Obrigatório.**

### 4.2. Notação de Voz (Escolha um: `notes` OU `voices`)

*   **`notes`**: `string` (min: 1 caractere) - Para frases de **voz única**. Utilize a "Fórmula de Notação Híbrida" acima.
    *   **Exemplo:** `"C4:q.stac D4:q.stac"`
*   **`voices`**: `array` de objetos `VoiceSchema` (min: 1, max: 16 elementos) - Para frases **multi-voz**. Cada objeto `VoiceSchema` deve conter:
    *   `channel`: `number` (inteiro, min: 1, max: 16) - Canal MIDI para esta voz. **Obrigatório.**
    *   `notes`: `string` (min: 1 caractere) - Notação híbrida para as notas desta voz. **Obrigatório.**
    *   `velocity`, `articulation`, `transpose`: `number` (opcionais) - Overrides específicos para esta voz.
    *   **Exemplo:**
        ```json
        "voices": [
          {
            "channel": 1,
            "notes": "C4:q.stac E4:q.stac"
          },
          {
            "channel": 2,
            "notes": "G3:h.leg"
          }
        ]
        ```

### 4.3. Parâmetros de Estrutura Musical (Opcionais)

*   **`timeSignature`**: `string` (padrão: `"4/4"`) - Fórmula de compasso. Ex: `"4/4"`, `"3/4"`, `"6/8"`.
*   **`key`**: `string` - Tonalidade musical. Ex: `"C major"`, `"A minor"`.

### 4.4. Parâmetros de Padrões Globais (Opcionais)

Estes valores são usados se não forem especificados inline na notação híbrida ou em uma voz específica.

*   **`velocity`**: `number` (min: 0.0, max: 1.0, padrão: `0.8`) - Velocidade global.
*   **`articulation`**: `number` (min: 0.0, max: 1.0, padrão: `0.8`) - Articulação global (0.0=staccato, 1.0=legato).
*   **`reverb`**: `number` (min: 0.0, max: 1.0, padrão: `0.4`) - Quantidade de reverb.
*   **`swing`**: `number` (min: 0.0, max: 1.0, padrão: `0.0`) - Quantidade de swing.

### 4.5. Parâmetros Técnicos (Opcionais)

*   **`channel`**: `number` (inteiro, min: 1, max: 16, padrão: `1`) - Canal MIDI global. Usado para voz única.
*   **`transpose`**: `number` (inteiro, min: -12, max: 12, padrão: `0`) - Transposição em semitons.
*   **`outputPort`**: `string` - Nome da porta MIDI de saída para override da porta padrão.
*   **`verbose`**: `boolean` (padrão: `false`) - Se `true`, a resposta incluirá detalhes completos para depuração.

## 5. Considerações Importantes para Agentes

*   **Validação de Esquema (Zod):** Todos os parâmetros são rigorosamente validados pelo esquema Zod no servidor. Certifique-se de que os tipos e intervalos de valores estejam corretos para evitar erros.
*   **Exclusividade `notes` vs `voices`:** O esquema permite `notes` OU `voices`, mas não ambos. Se `voices` for fornecido, ele será priorizado.
*   **`voices` Array Vazio:** Se você fornecer o parâmetro `voices`, ele DEVE conter pelo menos um objeto de voz. Um array vazio (`[]`) resultará em um erro de validação.
*   **Comportamento do Inspector (Observação):** Atualmente, ao usar a interface do Inspector, foi observado que a ferramenta `midi_play_phrase` pode exigir que o campo `notes` de nível superior E o campo `notes` dentro do objeto de voz no array `voices` sejam preenchidos com a mesma string para que o comando seja executado com sucesso. Esta é uma peculiaridade da UI do Inspector e não um requisito do esquema do servidor. Agentes programáticos não devem replicar este comportamento.
*   **`bpm` Mínimo:** O `bpm` deve ser no mínimo 60.

## 6. Exemplos Completos para Teste

### Exemplo 1: Voz Única (Staccato)

```javascript
tools.call("midi_play_phrase", {
  "bpm": 120,
  "notes": "C4:q.stac D4:q.stac E4:q.stac F4:q.stac",
  "timeSignature": "4/4",
  "velocity": 0.8,
  "articulation": 0.0 // Explicitamente staccato
})
```

### Exemplo 2: Multi-Voz (Misto)

```javascript
tools.call("midi_play_phrase", {
  "bpm": 100,
  "voices": [
    {
      "channel": 1,
      "notes": "[C]:q.stac [Dm]:e.leg",
      "velocity": 0.9
    },
    {
      "channel": 2,
      "notes": "G3:h.ten A3:q.accent",
      "transpose": -12
    }
  ],
  "timeSignature": "4/4",
  "reverb": 0.6,
  "verbose": true
})
```

---

**Documento gerado por Gemini CLI Agent**
**Data:** 27 de Agosto de 2025
