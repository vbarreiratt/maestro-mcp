### Estrutura Atual

```bash
maestro-mcp/
├── src/
│   ├── pilares/
│   │   ├── tradutor/
│   │   │   ├── index.ts
│   │   │   ├── music-theory.ts
│   │   │   ├── validators.ts
│   │   │   └── transformers.ts
│   │   ├── maestro/
│   │   │   ├── index.ts
│   │   │   ├── scheduler.ts
│   │   │   ├── transport.ts
│   │   │   └── event-manager.ts
│   │   └── mensageiro/
│   │       ├── index.ts
│   │       ├── midi-interface.ts
│   │       ├── port-manager.ts
│   │       └── protocol.ts
│   ├── schemas/
│   │   ├── midi-schemas.ts
│   │   ├── music-schemas.ts
│   │   └── common-schemas.ts
│   ├── tools/
│   │   ├── midi-tools.ts
│   │   ├── system-tools.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── music-theory.ts
│   │   ├── timing.ts
│   │   └── logger.ts
│   ├── types/
│   │   └── index.ts
│   └── server.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── musical/
├── docs/
│   ├── API.md
│   ├── SETUP.md
│   └── MUSICAL_EXAMPLES.md
├── mcp-inspector/
│   └── config.json
└── examples/
    ├── basic-usage.js
    ├── complex-sequences.js
    └── daw-integration.js
```

### Nova Atual

```bash
maestro-mcp/
├── src/
│   ├── pilares/
│   │   ├── modulo midi/
│   │   │   ├── tradutor/
│   │   │   │  ├── readme.md
│   │   │   │  ├── index.ts
│   │   │   │  ├── music-theory.ts
│   │   │   │  ├── validators.ts
│   │   │   │  └── transformers.ts
│   │   │   ├──maestro/
│   │   │   │  ├── readme.md
│   │   │   │  ├── index.ts
│   │   │   │  ├── scheduler.ts
│   │   │   │  ├── transport.ts
│   │   │   │  └── event-manager.ts
│   │   │   └──mensageiro/
│   │   │       ├── readme.md
│   │   │       ├── index.ts
│   │   │       ├── midi-interface.ts
│   │   │       ├── port-manager.ts
│   │   │       └── protocol.ts
│   │   └── modulo audio/
│   │       ├── Captura de Áudio/
│   │       │  ├── readme.md
│   │       │  └── index.ts (placeholder)
│   │       ├── Análise Musical/
│   │       │   ├── readme.md
│   │       │   └── index.ts (placeholder)
│   │       └── Entrega de Dados/
│   │           ├── readme.md
│   │           └── index.ts (placeholder)
│   ├── schemas/
│   │   ├── midi-schemas.ts
│   │   ├── music-schemas.ts
│   │   └── common-schemas.ts
│   ├── tools/
│   │   ├── midi-tools.ts
│   │   ├── system-tools.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── music-theory.ts
│   │   ├── timing.ts
│   │   └── logger.ts
│   ├── types/
│   │   └── index.ts
│   └── server.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── musical/
├── docs/
│   ├── API.md
│   ├── SETUP.md
│   └── MUSICAL_EXAMPLES.md
├── mcp-inspector/
│   └── config.json
└── examples/
    ├── basic-usage.js
    ├── complex-sequences.js
    └── daw-integration.js
```
