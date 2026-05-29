# Plan de Implementación — IAChatExporter: Fases 1 & 2

Este plan cubre la inicialización de Git, el desarrollo del parser específico de Gemini, la lógica común de parseo, el convertidor a Markdown, la comunicación en la extensión y el flujo de descarga.

## User Review Required

> [!IMPORTANT]
> **Aislamiento y Privacidad**: Toda la extracción de datos y la conversión a Markdown se realiza localmente en el navegador del usuario. No se envía ningún dato a servidores externos.
> **Descargas en Manifest V3**: Utilizaremos el service worker (`background.js`) para manejar las descargas mediante la API `chrome.downloads.download`. Esto es más robusto frente a las políticas de seguridad (CSP) que los LLMs imponen en sus páginas de chat.

> [!WARNING]
> **Formateador HTML a Markdown**: Dado que el stack tecnológico prohíbe el uso de librerías externas (como `Turndown.js`), implementaremos un formateador personalizado muy ligero y específico en `exporter.js` para traducir los elementos HTML típicos (`p`, `strong`, `em`, `code`, `pre`, `ul`, `ol`, `li`, `a`) a sintaxis Markdown.

## Proposed Changes

### 1. Inicialización del Repositorio Git

#### [NEW] [.gitignore](file:///d:/Desarrollo/RepoGit/github/IAChatExporter-extension/.gitignore)
- Ignorar archivos del sistema (`.DS_Store`, `Thumbs.db`) y carpetas temporales.

---

### 2. Extensión y Comunicación (Service Worker y Popup)

#### [MODIFY] [manifest.json](file:///d:/Desarrollo/RepoGit/github/IAChatExporter-extension/manifest.json)
- Nos aseguraremos de que todos los permisos e inyecciones de scripts están correctos.

#### [MODIFY] [background.js](file:///d:/Desarrollo/RepoGit/github/IAChatExporter-extension/background.js)
- Escuchar solicitudes del script de contenido para descargar el archivo Markdown generado.
- Usar `chrome.downloads.download` para iniciar la descarga.

#### [MODIFY] [popup.html](file:///d:/Desarrollo/RepoGit/github/IAChatExporter-extension/popup/popup.html)
- Diseñar una interfaz mínima y moderna (acorde a las directrices visuales premium, usando variables CSS y un layout limpio) con un botón para iniciar la exportación.

#### [MODIFY] [popup.js](file:///d:/Desarrollo/RepoGit/github/IAChatExporter-extension/popup/popup.js)
- Enviar un mensaje (`chrome.tabs.sendMessage`) al script de contenido de la pestaña activa para solicitar la exportación.

#### [MODIFY] [popup.css](file:///d:/Desarrollo/RepoGit/github/IAChatExporter-extension/popup/popup.css)
- Estilos modernos, uso de variables de color (paleta violeta/azul agradable) y transiciones suaves para hover en los botones.

---

### 3. Scripts de Contenido y Lógica de Parseo

#### [MODIFY] [content.js](file:///d:/Desarrollo/RepoGit/github/IAChatExporter-extension/content/content.js)
- Escuchar el mensaje enviado por el popup.
- Identificar en qué plataforma estamos basándonos en la URL (`window.location.hostname`).
- Invocar el parser de la plataforma correspondiente (ej. `parseGeminiChat()`).
- Pasar el resultado por el formateador y enviar el string final Markdown al Service Worker para su descarga.

#### [MODIFY] [parser.js](file:///d:/Desarrollo/RepoGit/github/IAChatExporter-extension/content/parser.js)
- Definir una interfaz/estructura unificada del objeto de conversación para todos los LLMs.
- Estructura: `{ title: string, date: string, source: string, messages: Array<{ author: 'user'|'ai', text: string, html: HTMLElement }> }`

#### [MODIFY] [exporter.js](file:///d:/Desarrollo/RepoGit/github/IAChatExporter-extension/content/exporter.js)
- Implementar la función `exportToMarkdown(chatData)` que genera el frontmatter YAML y el cuerpo.
- Implementar una función `convertHtmlToMarkdown(htmlElement)` para procesar el DOM de los mensajes y generar un Markdown limpio (manejando listas, bloques de código, textos enriquecidos y saltos de línea).

#### [MODIFY] [gemini.js](file:///d:/Desarrollo/RepoGit/github/IAChatExporter-extension/parsers/gemini.js)
- Implementar `parseGeminiChat()` usando selectores DOM actuales:
  - Mensajes de usuario: se extraen del tag `<user-query>`.
  - Respuestas del asistente: se extraen del tag `<model-response>`.
  - Título del chat: extraído del selector del panel lateral `a[data-test-id="conversation"].selected .conversation-title` o del título de la ventana `document.title` depurado.

## Verification Plan

### Manual Verification
1. Cargar la extensión desempaquetada en Chrome (`chrome://extensions/`).
2. Abrir una pestaña de Gemini (`https://gemini.google.com/`) y mantener una conversación.
3. Hacer clic en el icono de la extensión y pulsar "Exportar".
4. Verificar que se descarga un archivo `.md` con el nombre correcto y que el contenido coincide exactamente con el formato Markdown especificado en las directrices (Frontmatter YAML, cabeceras del usuario y asistente).
