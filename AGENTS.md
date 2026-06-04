# IAChatExporter - Identidad y Directrices del Proyecto

## Identidad del proyecto
Eres el agente de desarrollo del proyecto **IAChatExporter**.
No tomes decisiones de arquitectura por cuenta propia.
Si algo no está definido aquí, pregunta antes de asumir.

## Qué es el proyecto
Plugin para Chrome y Firefox que permite exportar conversaciones de LLMs (Gemini, Claude.ai, ChatGPT) a archivos Markdown locales. Sin consumir tokens adicionales. Sin compartir contexto entre chats.

## El problema que resuelve
Los chats de IA no tienen exportación nativa. Las soluciones existentes (Proyectos, Cuadernos) comparten contexto entre chats y aumentan el consumo de tokens. Este plugin simplemente copia la conversación visible en pantalla y la guarda como .md en local.

## Stack técnico
- Manifest V3 (compatible Chrome y Firefox)
- Vanilla JavaScript, sin frameworks ni librerías externas
- Formato de salida: Markdown con frontmatter YAML
- MVP: soporte inicial solo para Gemini
- Expansión posterior: Claude.ai → ChatGPT

## Convenciones de código
- Nombres de funciones: camelCase (ej: parseMessages, exportToMarkdown)
- Nombres de archivos: kebab-case (ej: content-script.js, gemini-parser.js)
- Nombres de variables: camelCase
- Constantes globales: UPPER_SNAKE_CASE (ej: SUPPORTED_PLATFORMS)
- Comentarios: siempre en español, explicando el "por qué" no el "qué"
- Una función = una responsabilidad (funciones cortas y específicas)
- Siempre manejar errores con try/catch en funciones que tocan el DOM

## Reglas a seguir
- Siempre traba en la rama dev u otra rama, nunca en la principal 'main'.


## Arquitectura de carpetas
IAChatExporter-extension/
├── manifest.json
├── background.js
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── content/
│   ├── content.js       ← detecta plataforma y orquesta
│   ├── parser.js        ← lógica genérica de parseo
│   └── exporter.js      ← convierte datos → Markdown
├── parsers/
│   ├── gemini.js        ← selectores específicos de Gemini
│   ├── claude.js        ← selectores específicos de Claude.ai
│   └── chatgpt.js       ← selectores específicos de ChatGPT
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png

## Formato del archivo Markdown generado
```markdown
---
title: "[título sugerido desde primer mensaje]"
date: YYYY-MM-DD
source: [Gemini | Claude | ChatGPT]
tags: []
---

# [título]

### 🧑 Tú
[mensaje del usuario]

---

### 🤖 Asistente
[respuesta del asistente]

---
*Exportado con IAChatExporter · YYYY-MM-DD HH:MM*
```

## Fases del proyecto
- Fase 1 — Estructura base + git ini + parser Gemini    (~3 sesiones)
- Fase 2 — Exportador y descarga              (~2 sesiones)
- Fase 3 — Compatibilidad Firefox             (~1 sesión)
- Fase 4 — Soporte Claude.ai                  (~2 sesiones)
- Fase 5 — Soporte ChatGPT                    (~2 sesiones)
- Fase 6 — Pulido final                       (~1 sesión)
