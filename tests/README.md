# Tests Directory Structure

Esta pasta contém todos os testes e scripts de verificação do projeto Maestro MCP, organizados por categoria.

## 📁 Estrutura Organizada

### `/unit/` - Testes Unitários
Testes unitários dos componentes individuais:
- `mensageiro.test.ts` - Testes do Pilar 3 (MIDI Interface)

### `/integration/` - Testes de Integração  
Testes que verificam a integração entre componentes:
- `mensageiro-real.test.ts` - Testes reais com hardware MIDI
- `final-integration-test.js` - Teste final de integração completa

### `/performance/` - Testes de Performance
Scripts focados em medição de performance e timing:
- `surgical-performance-test.js` - Teste cirúrgico de performance crítica
- `quick-timing-test.js` - Teste rápido de timing  
- `test-native-timing.js` - Teste de timing nativo
- `test-timing.js` - Teste geral de timing

### `/scripts/` - Scripts de Teste Utilitários
Scripts diversos para testes específicos:
- `quick-mcp-test.js` - Teste rápido de comunicação MCP
- `test-direct-tool.js` - Teste direto de ferramentas
- `test-mcp-tools.js` - Teste das ferramentas MCP  
- `test-tone-simple.js` - Teste simples do Tone.js
- `test-tool-specific.js` - Teste específico de ferramentas

### `/investigation/` - Scripts de Investigação
Scripts criados para investigar bugs e problemas específicos:
- `investigate-minor-001.js` - Investigação do bug MINOR-001
- `quick-status-test.js` - Teste rápido de status para debug
- `test-minor-001-fix.test.ts` - Verificação da correção do MINOR-001

### `/musical/` - Testes Musicais
Pasta reservada para testes de funcionalidades musicais específicas.

## 🚀 Execução de Testes

### Testes Oficiais (Vitest)
```bash
npm test                    # Todos os testes
npm run test:unit          # Apenas unitários  
npm run test:integration   # Apenas integração
npm run test:musical       # Testes musicais
```

### Scripts de Investigação
```bash
# Executar scripts individuais
node tests/investigation/quick-status-test.js
node tests/performance/surgical-performance-test.js
node tests/scripts/test-tone-simple.js
```

## ⚠️ Cuidados com Scripts

Alguns scripts podem entrar em loops ou gerar output excessivo:
- **Performance tests**: Podem demorar devido a medições precisas
- **Investigation scripts**: Criados para debug específico, podem ser instáveis
- **Direct tool tests**: Podem travar aguardando resposta de servidor MCP

**Recomendação**: Use timeouts quando executar scripts de investigação.

---
**Organizado pelo ORGANIZADOR em 2025-08-12**  
**Estrutura limpa e profissional para desenvolvimento contínuo**
