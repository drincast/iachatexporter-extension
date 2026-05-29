# ROADMAP - ChatIASave

Plan general de desarrollo y progreso del proyecto.

## Checklist de Fases

- [ ] **Fase 1 — Estructura base + git ini + parser Gemini (~3 sesiones)**
  - [x] Crear la estructura de carpetas y archivos base
  - [x] Crear documentación inicial (`AGENTS.md`, `ROADMAP.md`, `DEVLOG.md`)
  - [x] Configurar `manifest.json` inicial
  - [ ] Inicialización del repositorio Git
  - [ ] Investigación y desarrollo de selectores para el parser de Gemini (`parsers/gemini.js`)
  - [ ] Integración del parser de Gemini en el script de contenido (`content/content.js`)
- [ ] **Fase 2 — Exportador y descarga (~2 sesiones)**
  - [ ] Desarrollo de la lógica genérica de parseo (`content/parser.js`)
  - [ ] Desarrollo del exportador a Markdown (`content/exporter.js`)
  - [ ] Implementación de la descarga local del archivo `.md`
  - [ ] Creación de interfaz básica en el popup (`popup/popup.html`, `popup/popup.js`, `popup/popup.css`)
- [ ] **Fase 3 — Compatibilidad Firefox (~1 sesión)**
  - [ ] Revisión de compatibilidad de API de Chrome/Firefox (`browser` vs `chrome`)
  - [ ] Pruebas y ajustes del manifest para Firefox
- [ ] **Fase 4 — Soporte Claude.ai (~2 sesiones)**
  - [ ] Investigación de selectores de DOM para Claude.ai
  - [ ] Desarrollo del parser específico para Claude.ai (`parsers/claude.js`)
- [ ] **Fase 5 — Soporte ChatGPT (~2 sesiones)**
  - [ ] Investigación de selectores de DOM para ChatGPT
  - [ ] Desarrollo del parser específico para ChatGPT (`parsers/chatgpt.js`)
- [ ] **Fase 6 — Pulido final (~1 sesión)**
  - [ ] Optimización de selectores y control de errores
  - [ ] Diseño final de iconos y UI del popup
  - [ ] Pruebas de extremo a extremo y preparación para publicación
