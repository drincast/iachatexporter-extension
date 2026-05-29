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
- Inicializar el repositorio Git local (`git init`).
- Desarrollar la lógica del parser para Gemini (`parsers/gemini.js`) y su integración en `content/content.js`.
