# Plan de Implementación — Fix Firefox + Toggle Base64

## Descripción

Firefox bloquea las `data:` URLs en `browser.downloads.download()` por razones de
seguridad. La solución principal es migrar a **Blob URLs** (compatibles con Chrome y
Firefox). Adicionalmente, se conserva la codificación Base64 como opción avanzada en
la UI, restringida a Chrome.

---

## Contexto del fallo

```
Access denied for URL data:text/markdown;charset=utf-8;base64,...
```

Firefox no permite pasar una `data:` URL al método `downloads.download()`.
Chrome sí lo acepta. El polyfill `browser.*` funciona correctamente, el problema
es el **formato de la URL de descarga**, no la API en sí.

---

## Decisiones de diseño

- **Comportamiento por defecto**: Blob URL → funciona en Chrome y Firefox.
- **Opción avanzada**: toggle "Forzar codificación Base64" en el popup.
  - Deshabilitado y con nota explicativa si el navegador es Firefox.
  - Habilitado en Chrome/Chromium.
- La detección del navegador se hace mediante `navigator.userAgent`
  (buscar `Firefox/` en el user agent string).
- El valor del toggle se lee en `popup.js` y se pasa como parámetro
  `useBase64: true/false` en el mensaje al content script.
- `content.js` decide qué método de codificación aplicar según ese parámetro.

---

## Archivos involucrados

### [MODIFY] `popup/popup.html`

Agregar el toggle de Base64 al formulario, antes del botón de exportar:

```html
<!-- Toggle de codificación avanzada -->
<div class="form-group toggle-group" id="base64Group">
  <label class="toggle-label" for="base64Toggle">
    <input type="checkbox" id="base64Toggle">
    <span class="toggle-text">Forzar codificación Base64</span>
  </label>
  <span class="toggle-note" id="base64Note"></span>
</div>
```

---

### [MODIFY] `popup/popup.css`

Estilos para el nuevo toggle:

```css
.toggle-group { ... }
.toggle-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.toggle-note  { font-size: 11px; color: var(--text-muted); }
input[type="checkbox"]:disabled + .toggle-text { opacity: 0.4; }
```

---

### [MODIFY] `popup/popup.js`

1. Detectar si el navegador es Firefox al cargar el popup:

```js
const isFirefox = navigator.userAgent.includes('Firefox/');
const base64Toggle = document.getElementById('base64Toggle');
const base64Note   = document.getElementById('base64Note');

if (isFirefox) {
  base64Toggle.disabled = true;
  base64Note.textContent = 'No disponible en Firefox';
} else {
  base64Note.textContent = 'Solo compatible con Chrome/Chromium';
}
```

2. Al enviar el mensaje al content script, incluir el parámetro:

```js
{ action: 'exportChat', tags: tagsArray, useBase64: base64Toggle.checked }
```

---

### [MODIFY] `content/content.js`

Leer el parámetro `request.useBase64` y aplicar el método de codificación
correspondiente antes de enviar el mensaje al Service Worker:

```js
let downloadPayload;

if (request.useBase64) {
  // Método legado: base64 data URL (solo Chrome)
  const base64Content = btoa(unescape(encodeURIComponent(markdownContent)));
  downloadPayload = {
    action: 'downloadFile',
    url: `data:text/markdown;charset=utf-8;base64,${base64Content}`,
    filename: filename
  };
} else {
  // Método por defecto: texto plano → el background crea el Blob URL
  downloadPayload = {
    action: 'downloadFile',
    content: markdownContent,
    filename: filename
  };
}

browser.runtime.sendMessage(downloadPayload, ...);
```

---

### [MODIFY] `background.js`

Detectar si llega `request.url` (Base64/data URL) o `request.content` (texto plano)
y actuar en consecuencia:

```js
let downloadUrl;

if (request.url) {
  // Modo Base64 legado: la URL ya viene lista desde el content script
  downloadUrl = request.url;
} else {
  // Modo Blob: crear el Blob en el Service Worker (contexto con permisos)
  const blob = new Blob([request.content], { type: 'text/markdown;charset=utf-8' });
  downloadUrl = URL.createObjectURL(blob);
}

browser.downloads.download({
  url: downloadUrl,
  filename: request.filename,
  saveAs: true
}, (downloadId) => {
  // Liberar la Blob URL de memoria si fue creada en este contexto
  if (request.content) {
    URL.revokeObjectURL(downloadUrl);
  }
  ...
});
```

---

## Checklist de implementación

- [ ] Actualizar `background.js`: soportar tanto `request.url` (Base64) como `request.content` (Blob)
- [ ] Actualizar `content/content.js`: bifurcar según `request.useBase64`
- [ ] Actualizar `popup/popup.html`: agregar toggle de Base64
- [ ] Actualizar `popup/popup.css`: estilos del toggle
- [ ] Actualizar `popup/popup.js`: detectar Firefox, deshabilitar toggle, pasar parámetro `useBase64`
- [ ] Verificar en Chrome con Base64 OFF (Blob URL): descarga correcta
- [ ] Verificar en Chrome con Base64 ON: descarga correcta
- [ ] Verificar en Firefox con Base64 OFF (Blob URL): descarga correcta
- [ ] Verificar en Firefox con Base64 ON: toggle deshabilitado, no permite intentarlo
- [ ] Commit y push a rama `dev`

---

## Plan de verificación

### Chrome
1. Toggle **OFF** (defecto): abrir Gemini, exportar → archivo `.md` descargado ✅
2. Toggle **ON** (Base64): abrir Gemini, exportar → archivo `.md` descargado ✅
3. Toggle debe estar habilitado en Chrome.

### Firefox
1. Toggle **OFF** (defecto): abrir Gemini, exportar → archivo `.md` descargado ✅
2. Toggle debe aparecer **deshabilitado** con nota "No disponible en Firefox".

---

*Plan creado · 2026-06-04*
