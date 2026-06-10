# Plan de Implementación — Fix Firefox + Toggle Base64 (Actualizado)

## Descripción

Firefox bloquea las `data:` URLs en `browser.downloads.download()` por razones de seguridad, requiriendo **Blob URLs**.
Por otro lado, Chrome ejecuta su background script como un **Service Worker**, donde no existe el objeto `window` ni el método `URL.createObjectURL()`, lo que provoca el error `URL.createObjectURL is not a function` si intentamos usar Blobs allí.

La solución unificada es **bifurcar la creación del stream de descarga en `background.js`**:
1. Si el entorno soporta `URL.createObjectURL` (como Firefox o entornos con DOM completo), se crea y descarga el **Blob URL**.
2. Si el entorno no lo soporta (como el Service Worker de Chrome), se realiza un fallback transparente convirtiendo el texto plano a **Base64 (data: URL)** en el propio Service Worker y procediendo a la descarga.

---

## Contexto del fallo en Chrome

En Chrome MV3, `background.js` corre en un Service Worker. Al invocar `URL.createObjectURL` bajo el toggle en OFF:
```
Error al exportar: URL.createObjectURL is not a function
```
Esto ocurre porque la API de URLs de objetos (Blob) está ligada al ciclo de vida del DOM/Window para evitar memory leaks, y no está disponible en Workers.

---

## Decisiones de diseño

- **Compatibilidad cruzada sin configuración manual**:
  - En **Firefox**: Se enviará texto plano y se generará una **Blob URL** en el background. El toggle de Base64 permanece desactivado en la UI de Firefox.
  - En **Chrome**: Si el toggle está en OFF, se envía texto plano al background y este cae en el fallback de **Base64** internamente. Si está en ON, se envía pre-codificado en Base64 desde el content script. Ambas opciones funcionan perfectamente en Chrome.
- **Detección de soporte de API**:
  - En `background.js` comprobamos si `typeof URL.createObjectURL === 'function'` para decidir dinámicamente el método.

---

## Archivos involucrados

### [MODIFY] `background.js`

Modificar la lógica de generación de la URL de descarga para incluir el fallback de Base64 en Service Workers:

```javascript
      // Se usa un Blob local si no viene una URL preparada (Base64).
      if (!downloadUrl && request.content) {
        if (typeof URL.createObjectURL === 'function') {
          // Firefox u otros entornos con soporte DOM (Event Page).
          // Esto es obligatorio para Firefox, que rechaza descargas desde data: URLs.
          const blob = new Blob([request.content], { type: 'text/markdown;charset=utf-8' });
          downloadUrl = URL.createObjectURL(blob);
          isBlob = true;
        } else {
          // Chrome Service Worker: Fallback a Base64 local ya que URL.createObjectURL no existe en Workers.
          const base64Content = btoa(unescape(encodeURIComponent(request.content)));
          downloadUrl = `data:text/markdown;charset=utf-8;base64,${base64Content}`;
        }
      }
```

---

## Plan de verificación

### Chrome
1. Toggle **OFF** (defecto): abrir Gemini, exportar → se genera la descarga (debe usar el fallback Base64 interno en background y descargar con éxito) ✅
2. Toggle **ON**: abrir Gemini, exportar → se genera la descarga (usa Base64 desde el content script con éxito) ✅

### Firefox
1. Toggle **OFF** (defecto): abrir Gemini, exportar → se genera la descarga (debe usar Blob URL en background con éxito) ✅
2. El toggle debe aparecer deshabilitado con la nota descriptiva.
