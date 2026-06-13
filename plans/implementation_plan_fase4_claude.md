# Plan de Implementación — Fase 4: Soporte Claude.ai

## Descripción

El objetivo de esta fase es habilitar el soporte funcional completo para **Claude.ai**. Actualmente, la extensión cuenta con un parser base para Gemini y stubs (placeholders que lanzan un error controlado) para Claude.ai y ChatGPT.

En esta fase desarrollaremos el parser específico `parsers/claude.js` y configuraremos el orquestador para permitir la exportación de conversaciones desde `claude.ai`.

---

## Decisiones de diseño

- **Selectores de mensajes en Claude.ai**:
  - Buscaremos elementos en el DOM secuencialmente con selectores robustos que cubran las clases principales usadas por Anthropic y sus fallbacks históricos:
    - **Usuario**: `.font-user-message`, `[data-testid="user-message"]`, `.human-message`.
    - **Asistente (Claude)**: `.font-claude-message`, `.font-claude-response`, `.assistant-message`.
- **Extracción de título**:
  - Intentaremos obtener el nombre del chat desde el elemento seleccionado en el sidebar (enlaces `/chat/` activos).
  - Si no está disponible, limpiaremos el título de la pestaña del navegador (`document.title` removiendo el sufijo ` - Claude`).
  - Fallback por defecto: `Conversación de Claude`.
- **Mapeo al modelo común**:
  - Mensajes del usuario → `{ author: 'user', element: msgElement }`
  - Mensajes del asistente → `{ author: 'ai', element: msgElement }`

---

## Archivos involucrados

### [MODIFY] `parsers/claude.js`

Reemplazar el stub actual por la implementación funcional del parser:

```javascript
window.IAChatExporterClaudeParser = {
  parseChat() {
    try {
      // 1. Extracción del título de la conversación.
      let title = '';
      
      // Intentamos buscar enlaces de chats en el sidebar que tengan estado activo/seleccionado.
      const activeSidebarItem = document.querySelector('a[href^="/chat/"].bg-accent, a[href^="/chat/"].bg-bg-200, [class*="active"] a[href^="/chat/"]');
      if (activeSidebarItem) {
        title = activeSidebarItem.textContent.trim();
      }

      // Si no está en el sidebar, limpiamos el título de la página del navegador.
      if (!title && document.title) {
        title = document.title
          .replace(' - Claude', '')
          .replace('Claude - ', '')
          .replace('Claude', '')
          .trim();
      }

      // 2. Extracción secuencial de mensajes.
      const selector = '.font-user-message, .font-claude-message, .font-claude-response, [data-testid="user-message"], .human-message, .assistant-message';
      const messageElements = document.querySelectorAll(selector);
      const messages = [];

      messageElements.forEach((element) => {
        let author = '';
        const classes = element.classList;

        if (classes.contains('font-user-message') || 
            classes.contains('human-message') || 
            element.getAttribute('data-testid') === 'user-message') {
          author = 'user';
        } else if (classes.contains('font-claude-message') || 
                   classes.contains('font-claude-response') || 
                   classes.contains('assistant-message')) {
          author = 'ai';
        }

        if (author) {
          // Buscamos el contenedor interno con el texto/formato enriquecido si existe,
          // para evitar meter metadatos, botones de copiar, etc.
          const contentNode = element.querySelector('.grid') || element;
          messages.push({
            author: author,
            element: contentNode
          });
        }
      });

      return {
        title: title || 'Conversación de Claude',
        messages: messages
      };
    } catch (error) {
      console.error('Error al extraer el DOM de Claude.ai:', error);
      throw new Error('No se pudo leer la estructura del chat de Claude.ai. La interfaz de Anthropic puede haber cambiado.');
    }
  }
};
```

---

## Plan de verificación

### Pruebas Manuales
1. Abrir la extensión y acceder a [Claude.ai](https://claude.ai/).
2. Iniciar un chat o abrir uno existente.
3. El popup debe mostrar: **`Claude.ai Detectado`** en verde y habilitar el botón de exportación.
4. Exportar el chat con etiquetas (ej. `test, claude`).
5. Verificar el Markdown generado:
   - Que contenga frontmatter YAML con `source: Claude`.
   - Que asigne correctamente los emojis: `🧑 Tú` y `🤖 Asistente`.
   - Que exporte en orden cronológico correcto y conserve formatos (código, listas, etc.).
