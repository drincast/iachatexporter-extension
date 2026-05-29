# DEVLOG - ChatIASave

Registro diario de desarrollo, decisiones tomadas y progreso.

---

## [2026-05-28] Sesión 1: Estructura Inicial y Configuración Base

### Tareas Realizadas
- Creación de la documentación de gestión del proyecto:
  - `AGENTS.md`: Directrices, arquitectura, stack tecnológico y convenciones de código.
  - `ROADMAP.md`: Planificación del desarrollo por fases en formato checklist.
- Creación del archivo `manifest.json` inicial según las especificaciones de Manifest V3.
- Creación de la estructura de carpetas y archivos vacíos con sus comentarios de cabecera correspondientes:
  - Raíz: `background.js`
  - `/popup`: `popup.html`, `popup.js`, `popup.css`
  - `/content`: `content.js`, `parser.js`, `exporter.js`
  - `/parsers`: `gemini.js`, `claude.js`, `chatgpt.js`

### Decisiones de Arquitectura y Diseño
- Se adoptó Manifest V3 con permisos mínimos iniciales: `activeTab` para interactuar con la pestaña activa y acceso a los hosts necesarios para los LLMs (inicialmente Gemini en `https://gemini.google.com/*`, y placeholders para Claude y ChatGPT).
- Se establecieron comentarios en español en todos los archivos base, enfocados en explicar el "por qué" de las futuras implementaciones, siguiendo las convenciones de código.

### Siguientes Pasos
- Realizar pruebas manuales de exportación en Gemini.
- Analizar compatibilidad con Firefox (Fase 3).

---

## [2026-05-28] Sesión 2: Implementación Core de Gemini, Exporter y Descargas (Fase 1 y 2)

### Tareas Realizadas
- **Inicialización de Git**: Configuración de identidad local del autor (`Ruben`) e inicialización del repositorio Git local, realizando el primer commit con todos los archivos base y de control.
- **Service Worker (`background.js`)**: Implementación del listener de descarga utilizando `chrome.downloads` para evadir las directivas CSP de los LLMs.
- **Interfaz del Popup (`popup/`)**:
  - Implementación de `popup.html` con estructura moderna tipo tarjeta y campo opcional para etiquetas.
  - Implementación de `popup.css` con estilos neón premium, efectos hover, transiciones y un dot animado de estado.
  - Implementación de `popup.js` con detección de plataforma activa y paso de mensaje al script de contenido.
- **Parser de Gemini (`parsers/gemini.js`)**: Desarrollo de la extracción del título de la conversación del DOM o Sidebar, y mapeo ordenado de elementos `<user-query>` y `<model-response>`.
- **Convertidor HTML-a-Markdown (`content/exporter.js`)**: Desarrollo de un motor recursivo de conversión de HTML a sintaxis Markdown en Vanilla JS sin dependencias externas, con soporte avanzado para párrafos, negritas, listas ordenadas y tablas.
- **Orquestador Principal (`content/content.js`)**: Implementación de la captura del mensaje de exportación, invocación de parsers, normalización y codificación en Base64 para enviar el flujo al Service Worker de descargas.

### Decisiones de Arquitectura y Diseño
- Se implementaron stubs de error controlado para Claude y ChatGPT en sus respectivos archivos de parser para prevenir que la extensión falle de forma no controlada si se ejecuta en dichos sitios antes de sus respectivas fases de implementación (Fases 4 y 5).
- Se implementó la codificación a Base64 (`btoa(unescape(encodeURIComponent(markdownContent)))`) para transferir los datos del Markdown al Service Worker, asegurando que los emojis y acentos en español no se corrompan durante la descarga.

### Siguientes Pasos
- Cargar la extensión desempaquetada y validar manualmente la exportación en Google Gemini.
- Iniciar la Fase 3: Compatibilidad y empaquetado para Firefox.
