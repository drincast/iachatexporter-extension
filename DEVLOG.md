# DEVLOG - IAChatExporter

Registro diario de desarrollo, decisiones tomadas y progreso.
Archivo muestra lo mas actual al inicio 

---

## [2026-06-13] Sesión 5 — Soporte ChatGPT (Fase 5)

### Tareas Realizadas
- **Desarrollo del Parser de ChatGPT**: Implementación de `parsers/chatgpt.js` reemplazando el stub. Extrae mensajes vía el atributo `[data-message-author-role]` (selector estable de OpenAI), mapeando `user` → `'user'` y `assistant` → `'ai'`. El nodo de contenido apunta a `.markdown`/`.prose` (asistente) o `.whitespace-pre-wrap` (usuario) para excluir la botonera de copiar/feedback/regenerar.
- **Extracción de título**: item activo del sidebar (`nav a[aria-current="page"]` y fallbacks) con fallback a `document.title` limpiando `ChatGPT`. Default `Conversación de ChatGPT`.
- **Plan de fase**: creación de `plans/implementation_plan_fase5_chatgpt.md` con la misma estructura que el plan de la Fase 4.
- **Sin cambios en infraestructura**: `content/content.js` ya detectaba los hostnames de ChatGPT y `manifest.json` ya inyectaba el parser, por lo que solo se modificó `parsers/chatgpt.js`.

### Decisiones de Arquitectura y Diseño
- Se priorizó `data-message-author-role` sobre las clases CSS dinámicas por ser más resistente a los cambios frecuentes de UI de OpenAI.

### Verificación Realizada
- Prueba manual exitosa en un navegador **Chromium**, sobre un chat de **solo texto**. Exportación correcta.

### Pendiente de Validación
- Pruebas en **Firefox**.
- Chats con contenido enriquecido: bloques de código, listas, tablas.
- Manejo de imágenes y adjuntos (relacionado con la Fase 6).

### Corrección de Bug en Scripts WORKLOG
- **Bug detectado**: el comando `end` de `scripts/worklog.ps1` y `scripts/worklog.sh` calculaba mal la duración. Al buscar la sesión abierta, el escaneo interno usaba una ventana fija de 10 líneas que se desbordaba al siguiente bloque `## Session` y sobrescribía el `Start` con el de la sesión anterior (más antigua). Síntoma: una sesión de ~23 min registró 796 min (13h 16min) tomando el `Start` del día previo.
- **Solución aplicada**: añadir un `break` al detectar otro encabezado `## Session`, confinando el escaneo al bloque actual. Cambio de una línea en cada script.
- **Validación**: probado con un `WORKLOG.md` temporal (escenario sesión abierta + sesión antigua); la duración se calculó correctamente desde el `Start` de la sesión abierta.
- **Plan**: `plans/fix_worklog_duration_scan.md`.
- **Datos corregidos**: se recalcularon manualmente la duración de la sesión de hoy y la línea `Total` de `WORKLOG.md`; el contador de sesiones también estaba inflado (decía 6 con solo 3 bloques reales) por corridas previas con el bug.

### Siguientes Pasos
- Completar las pruebas de validación más completas de la Fase 5.
- Abordar la Fase 6 (inconsistencias de copia e imágenes en los chats).

---

## [2026-06-12] Sesión 4 — Soporte Claude.ai y Optimización de Codificación/DOM (Fase 4)

### Tareas Realizadas
- **Desarrollo del Parser de Claude**: Implementación de `parsers/claude.js` con selectores para extraer secuencialmente mensajes y el título de las conversaciones de `claude.ai`.
- **Corrección de Mojibake (Caracteres Chinos) en Windows**: Añadido el marcador BOM UTF-8 (`\uFEFF`) al inicio del Markdown generado en `content/exporter.js`. Esto obliga a los editores de Windows (como el Bloc de Notas) a interpretar el archivo correctamente como UTF-8 en lugar de fallar y decodificar los bytes UTF-8 de los emojis/acentos como caracteres en GBK/ANSI.
- **Evitado de Textos Duplicados**: Optimizado `convertNodeToMarkdown` en `content/exporter.js` para ignorar nodos del DOM ocultos (`display: none`, `hidden`, `aria-hidden="true"`, `.sr-only`). Esto evita duplicar textos diseñados exclusivamente para lectores de pantalla o interfaces de herramientas (como "Web buscada, visualizó un archivo").

### Inconsistencias Detectadas
- **Imágenes no indicadas**: El exportador no incluye ninguna indicación o placeholder cuando hay imágenes adjuntas en los mensajes.
- **Mensajes/Contenido incompleto**: Se detectaron secciones de la conversación que no se copian correctamente al archivo Markdown final.

### Siguientes Pasos
- Iniciar la Fase 5: Soporte para ChatGPT.
- Desarrollar la nueva Fase 6 para solucionar las inconsistencias de copia e imágenes en los chats.

---

## [2026-06-12] Sesión 3.2 — Sistema de Registro de Sesiones Colaborativas (COWORK + WORKLOG)

### Tareas Realizadas
- **`COWORK.md` creado**: Archivo de instrucciones para cualquier agente de IA (Claude Code, GitHub Copilot, Cursor, etc.) con guía de inicio de sesión, cierre y setup en proyectos nuevos. El sistema es agnóstico al agente: cualquier herramienta que lo lea puede ejecutar el registro sin contexto previo del proyecto.
- **`WORKLOG.md` creado**: Registro de sesiones en orden descendente (más reciente primero) con total acumulado de sesiones y minutos invertidos en el proyecto. Línea de totales localizable por regex para actualizaciones de bajo costo.
- **`scripts/worklog.ps1`**: Script PowerShell cross-platform (Windows 5.1+, Linux y macOS con pwsh) con comandos `init`, `start` y `end`. Gestiona inserción en orden descendente, cálculo automático de duración y actualización del acumulado.
- **`scripts/worklog.sh`**: Script Bash con Python 3 como motor para el cierre de sesión, orientado a entornos Linux/macOS sin pwsh instalado. Misma interfaz que el script PowerShell.
- **`AGENTS.md` actualizado**: Agregada sección `## Registro de sesiones de trabajo` que documenta el sistema y referencia sus archivos.

### Decisiones de Arquitectura y Diseño
- Los scripts evitan caracteres unicode literales en el código fuente; PowerShell 5.1 no lee UTF-8 sin BOM, por lo que se definen `$DASH = [char]0x2014` y `$DOT = [char]0x00B7` en lugar de los literales `—` y `·`.
- El sistema es **replicable en cualquier proyecto**: `COWORK.md` incluye una sección de setup que permite al agente inicializarlo copiando tres archivos (`COWORK.md`, `scripts/worklog.ps1`, `scripts/worklog.sh`) y ejecutando `init`.
- Se eligió script sobre lectura/escritura directa por el agente para mantener el costo de tokens constante independientemente del tamaño del historial de sesiones.

### Siguientes Pasos
- **Ejecutar Fase 4**: Iniciar la integración para los otros CHATs

---

## [2026-06-09] Sesión 3.1 — Solución del error de descarga en Firefox (Blob URLs y Toggle Base64)

### Tareas Realizadas
- **Corrección de descargas en Firefox**: Implementación de descargas a través de **Blob URLs** locales creados y revocados en `background.js` (los cuales son compatibles con la seguridad estricta de Firefox).
- **Opción de codificación avanzada**: Añadido toggle "Forzar codificación Base64" en `popup/popup.html` y estilizado de forma premium en `popup/popup.css`.
- **Detección inteligente de Firefox**: Implementada lógica en `popup/popup.js` que detecta Firefox vía `navigator.userAgent`, deshabilitando el toggle de Base64 e informando al usuario sobre la limitación de forma clara.
- **Flujo condicional de descargas y Fallback Chromium**: Modificados `content/content.js` y `background.js` para bifurcar y transferir datos. En navegadores Chromium (donde `URL.createObjectURL` no existe por ejecutarse en un Service Worker), se aplica un fallback automático en segundo plano para realizar siempre la descarga en Base64 (`data:` URL), asegurando la compatibilidad universal sin que el usuario deba intervenir.

### Siguientes Pasos
- **Pruebas manuales**: Verificar en Chrome (Blob y Base64) y en Firefox (solo Blob, validar deshabilitación de Base64).
- Realizar PR a la rama `main` tras la verificación y cerrar Fase 3.

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


