# Plan de Implementación — Fase 5: Soporte ChatGPT

## Descripción

El objetivo de esta fase es habilitar el soporte funcional completo para **ChatGPT** (`chatgpt.com` y `chat.openai.com`). Tras la Fase 4, la extensión ya soporta Gemini y Claude.ai, y mantiene un stub (placeholder que lanza un error controlado) para ChatGPT.

En esta fase desarrollamos el parser específico `parsers/chatgpt.js`. La infraestructura de orquestación ya está preparada de fases anteriores: `content/content.js` detecta los hostnames de ChatGPT y `manifest.json` ya inyecta `parsers/chatgpt.js` en los `content_scripts` correspondientes. Por tanto, **solo se modifica el parser**.

---

## Decisiones de diseño

- **Selectores de mensajes en ChatGPT**:
  - Se usa el atributo `[data-message-author-role]` como selector principal por ser el más estable frente a los frecuentes cambios de clases CSS dinámicas de OpenAI.
    - **Usuario**: `data-message-author-role="user"`.
    - **Asistente**: `data-message-author-role="assistant"`.
  - Nodo de contenido interno: `.markdown`/`.prose` (asistente) o `.whitespace-pre-wrap` (usuario), con fallback al propio elemento. Esto excluye la botonera de copiar/feedback/regenerar que rodea cada turno.
- **Extracción de título**:
  - Se intenta obtener el nombre del chat desde el item activo del sidebar (`nav a[aria-current="page"]` y fallbacks de estado activo).
  - Si no está disponible, se limpia el título de la pestaña del navegador (`document.title` removiendo `ChatGPT`).
  - Fallback por defecto: `Conversación de ChatGPT`.
- **Mapeo al modelo común**:
  - Mensajes del usuario → `{ author: 'user', element: msgElement }`
  - Mensajes del asistente → `{ author: 'ai', element: msgElement }`

---

## Archivos involucrados

### [MODIFY] `parsers/chatgpt.js`

Reemplazar el stub actual por la implementación funcional del parser, registrado en `window.IAChatExporterChatGPTParser.parseChat()`, devolviendo `{ title, messages }` según el contrato común que consume `content/parser.js` y `content/exporter.js`.

No se modifican `content/content.js`, `manifest.json` ni el exportador: ya estaban preparados desde fases previas.

---

## Plan de verificación

### Pruebas Manuales
1. Recargar la extensión desempaquetada y acceder a [ChatGPT](https://chatgpt.com/).
2. Abrir un chat existente.
3. El popup debe detectar la plataforma y habilitar el botón de exportación.
4. Exportar el chat con etiquetas (ej. `test, chatgpt`).
5. Verificar el Markdown generado:
   - Que contenga frontmatter YAML con `source: ChatGPT`.
   - Que asigne correctamente los emojis: `🧑 Tú` y `🤖 Asistente`.
   - Que exporte en orden cronológico correcto y conserve formatos (código, listas, tablas).
   - Que no incluya texto de botones (copiar, regenerar, feedback).

### Riesgos conocidos
- El selector del **título del sidebar** es el más frágil: OpenAI cambia con frecuencia las clases/atributos de navegación. Si falla, recae en `document.title`.
- Los selectores no pudieron validarse contra el DOM real durante el desarrollo; la verificación manual es obligatoria antes de cerrar la fase.
