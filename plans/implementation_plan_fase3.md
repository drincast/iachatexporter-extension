# Plan de Implementación — Fase 3: Compatibilidad Firefox

## Descripción

Chrome y Firefox comparten la especificación Manifest V3, pero difieren en sus APIs de extensiones:
- Chrome usa el objeto global `chrome`
- Firefox usa el objeto global `browser` (basado en Promesas)

El objetivo de esta fase es hacer que la extensión funcione correctamente en Firefox **sin romper la compatibilidad con Chrome**, usando un polyfill mínimo que unifica ambas APIs.

---

## Decisiones de diseño

- Se crea un polyfill en `compat/browser-polyfill.js` que asigna `browser = chrome` cuando estamos en Chrome, y deja intacto `browser` en Firefox.
- Todo el código del proyecto usa `browser.*` a partir de esta fase.
- Se usa `gecko_id: "iachatexporter@drincast"` como identificador temporal para Firefox.
- Firefox MV3 soporta `service_worker` desde Firefox 109, pero para mayor compatibilidad se declaran también `scripts` en el `background`.

---

## Archivos involucrados

### [NEW] `compat/browser-polyfill.js`

Polyfill mínimo sin dependencias que unifica las APIs de Chrome y Firefox:

```js
if (typeof browser === 'undefined') {
  globalThis.browser = chrome;
}
```

Se inyecta **primero** en todos los bloques `content_scripts` del `manifest.json` y se referencia en el `popup.html`.

---

### [MODIFY] `manifest.json`

1. Agregar `browser_specific_settings` con el `gecko_id` para Firefox.
2. Agregar `scripts` en el bloque `background` para Firefox (Chrome usa `service_worker`).
3. Inyectar `compat/browser-polyfill.js` como primer script en cada bloque `content_scripts`.

```json
"browser_specific_settings": {
  "gecko": {
    "id": "iachatexporter@drincast",
    "strict_min_version": "109.0"
  }
},
"background": {
  "service_worker": "background.js",
  "scripts": ["compat/browser-polyfill.js", "background.js"]
},
"content_scripts": [
  {
    "matches": ["https://gemini.google.com/*"],
    "js": [
      "compat/browser-polyfill.js",
      "parsers/gemini.js",
      "content/parser.js",
      "content/exporter.js",
      "content/content.js"
    ]
  },
  ...
]
```

---

### [MODIFY] `background.js`

Reemplazar todas las referencias `chrome.*` por `browser.*`:

| Antes | Después |
|---|---|
| `chrome.runtime.onMessage` | `browser.runtime.onMessage` |
| `chrome.downloads.download(...)` | `browser.downloads.download(...)` |
| `chrome.runtime.lastError` | `browser.runtime.lastError` |

---

### [MODIFY] `content/content.js`

Reemplazar todas las referencias `chrome.*` por `browser.*`:

| Antes | Después |
|---|---|
| `chrome.runtime.onMessage` | `browser.runtime.onMessage` |
| `chrome.runtime.sendMessage` | `browser.runtime.sendMessage` |
| `chrome.runtime.lastError` | `browser.runtime.lastError` |

---

### [MODIFY] `popup/popup.js`

Reemplazar todas las referencias `chrome.*` por `browser.*`:

| Antes | Después |
|---|---|
| `chrome.tabs.query` | `browser.tabs.query` |
| `chrome.tabs.sendMessage` | `browser.tabs.sendMessage` |
| `chrome.runtime.lastError` | `browser.runtime.lastError` |

---

### [MODIFY] `popup/popup.html`

Agregar el polyfill antes del tag `<script src="popup.js">`:

```html
<script src="../compat/browser-polyfill.js"></script>
<script src="popup.js"></script>
```

---

## Archivos NO modificados en esta fase

- `parsers/gemini.js` — no usa APIs de extensión
- `parsers/claude.js` — no usa APIs de extensión
- `parsers/chatgpt.js` — no usa APIs de extensión
- `content/parser.js` — no usa APIs de extensión
- `content/exporter.js` — no usa APIs de extensión
- `popup/popup.css` — sin cambios

---

## Checklist de implementación

- [x] Crear carpeta `compat/` y archivo `browser-polyfill.js`
- [x] Actualizar `manifest.json` (gecko_id, scripts background, polyfill en content_scripts)
- [x] Actualizar `background.js` (chrome → browser)
- [x] Actualizar `content/content.js` (chrome → browser)
- [x] Actualizar `popup/popup.js` (chrome → browser)
- [x] Actualizar `popup/popup.html` (agregar polyfill)
- [ ] Verificar en Chrome: cargar extensión y exportar en Gemini
- [ ] Verificar en Firefox: cargar complemento temporal y exportar en Gemini
- [ ] Commit y push a rama `dev`

---

## Plan de verificación

### Chrome
1. Ir a `chrome://extensions/` → Cargar sin empaquetar.
2. Abrir Gemini → exportar conversación.
3. Verificar que el archivo `.md` se descarga correctamente.

### Firefox
1. Ir a `about:debugging#/runtime/this-firefox` → Cargar complemento temporal → `manifest.json`.
2. Abrir Gemini en Firefox → exportar conversación.
3. Verificar que el archivo `.md` se descarga correctamente.

### Consola DevTools
- Sin errores `ReferenceError: chrome is not defined`
- Sin errores `ReferenceError: browser is not defined`

### Notas técnicas
- Firefox MV3 ya soporta chrome.* como alias de browser.* desde la versión 109, pero el comportamiento no es idéntico en todas las APIs (p. ej. chrome.downloads puede fallar en Firefox). El polyfill refuerza esto explícitamente.
- No se requieren cambios en parsers/, content/parser.js ni content/exporter.js porque no usan APIs de extensión.
- Esta fase no toca la lógica de parseo de Gemini ni el formato del Markdown generado.

---

*Plan creado para la Fase 3 · 2026-06-04*
