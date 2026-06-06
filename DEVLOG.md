# DEVLOG - IAChatExporter

Registro diario de desarrollo, decisiones tomadas y progreso.
Archivo muestra lo mas actual al inicio 

---

## [2026-06-04] Sesión 3 — Compatibilidad Firefox (Fase 3)

### Tareas Realizadas
- **Polyfill de compatibilidad**: Creación de `compat/browser-polyfill.js` que asigna `browser = chrome` en Chrome y lo deja intacto en Firefox.
- **Actualización del manifest.json**: Se agregó `browser_specific_settings.gecko` con el id `iachatexporter@drincast` para pruebas de desarrollo y `strict_min_version: "109.0"`. Se configuró `scripts` en el background para Firefox.
- **Migración de APIs**: Se reemplazaron todas las referencias `chrome.*` por `browser.*` en `background.js`, `content/content.js` y `popup/popup.js`.
- **Inyección del polyfill**: Se agregó el polyfill como primer script en todos los `content_scripts` del manifest.

### Problema Detectado
Al probar la exportación en Firefox, se obtuvo el error:
```
Access denied for URL data:text/markdown;charset=utf-8;base64,...
```
Firefox bloquea las `data:` URLs en `browser.downloads.download()` por razones de seguridad. Chrome las acepta sin problema.

### Decisión de Arquitectura
- **Solución adoptada**: Migrar a **Blob URLs** (compatibles con Chrome y Firefox).
- **Compatibilidad hacia atrás**: Mantener la codificación Base64 como opción avanzada, deshabilitada automáticamente en Firefox mediante `navigator.userAgent.includes('Firefox/')`.
- Se creó el plan `plans/implementation_plan_fix_firefox_base64.md` documentando la solución.

### Siguientes Pasos
- **Pendiente**: Implementar el fix de Blob URLs según el plan creado.
- Verificar la exportación en Chrome (Base64 y Blob URL).
- Verificar la exportación en Firefox (Blob URL).
- Commit y push de los cambios de la Fase 3.

---

## [2026-05-29] Sesión 2.1 — Refactoring de Identidad y Documentación

### Tareas Realizadas
- **Rename del proyecto**: Cambio de nombre de `ChatIASave` a `IAChatExporter` en todos los archivos y configuración del proyecto.
- **README.md creado**: Documentación pública del proyecto con descripción, características, guía de instalación y uso rápido.
- **LICENSE agregada**: Archivo `LICENSE` con licencia Apache 2.0, incluyendo el header de licencia en todos los archivos fuente del proyecto.
- **.gitignore configurados**: Archivos de ignore para el proyecto, evitando que archivos temporales y de sistema se incluyan en el repositorio.
- **Iconos placeholders**: Iconos de tamaño 16x16, 48x48 y 128x128 en formato PNG para la extensión.

### Decisiones de Arquitectura y Diseño
- Se utilizó `IAChatExporter` como nombre final del proyecto, reflejando mejor el propósito de la extensión (exportar a múltiples LLMs, no solo Chat).
- La licencia Apache 2.0 se eligió para permitir uso comercial y modificación libre del código.
- Los `.gitignore` incluyen patrones para sistemas operativos comunes (Windows, macOS) y editores (VS Code).

### Siguientes Pasos
- Continuar con pruebas manuales de exportación en Gemini.
- Implementar Fase 3: Compatibilidad Firefox.

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


