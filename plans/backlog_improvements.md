# Backlog de Mejoras Post-Objetivo

Registro de mejoras identificadas durante el desarrollo que **no bloquean la funcionalidad principal** y se implementarán una vez completadas las 6 fases del ROADMAP.

Estas mejoras buscan elevar la calidad del código, la robustez y la experiencia del usuario sin desviar el foco del objetivo actual.

---

## Mejoras Identificadas

### 1. Manifest: separar `service_worker` y `scripts` en el background
- **Archivo:** `manifest.json`
- **Descripción:** El campo `background` declara simultáneamente `service_worker` (Chrome) y `scripts` (Firefox). Aunque funciona porque cada navegador ignora el campo del otro, Chrome no carga el polyfill en el Service Worker y las stores podrían rechazar campos no reconocidos.
- **Solución propuesta:** Usar `importScripts()` dentro de `background.js` para cargar el polyfill en Chrome, o generar manifests separados por navegador al empaquetar.
- **Prioridad:** Media

### 2. Exportador: soporte para listas anidadas
- **Archivo:** `content/exporter.js` (líneas 138-153)
- **Descripción:** Las listas `<ul>` y `<ol>` no manejan anidamiento. Un `<li>` con una sublista se renderiza sin indentación, perdiendo la jerarquía visual en el Markdown generado.
- **Solución propuesta:** Pasar un parámetro de profundidad (`depth`) a `convertNodeToMarkdown` para indentar sublistas.
- **Prioridad:** Media

### 3. Exportador: soporte para imágenes
- **Archivo:** `content/exporter.js`
- **Descripción:** `convertNodeToMarkdown` no maneja `<img>`. Si el LLM incluye imágenes en su respuesta, se pierden silenciosamente en la exportación.
- **Solución propuesta:** Agregar un caso para `<img>` que genere `![alt](src)` en Markdown.
- **Prioridad:** Baja

### 4. Exportador: espacio extra en código inline
- **Archivo:** `content/exporter.js` (línea 102)
- **Descripción:** El tag `<code>` inline retorna `` `texto` `` con espacios antes y después del backtick, produciendo espacios visibles innecesarios en el Markdown.
- **Solución propuesta:** Eliminar los espacios en el template literal del retorno.
- **Prioridad:** Baja (cosmético)

### 5. Popup: fuente Google Fonts cargada externamente
- **Archivo:** `popup/popup.html` (líneas 14-16)
- **Descripción:** Se carga la fuente "Outfit" desde Google Fonts, lo que requiere conexión a internet y genera una petición externa. Esto contradice el mensaje "Exportado local y privado" del footer.
- **Solución propuesta:** Incluir la fuente como archivo local dentro de la extensión o usar una fuente del sistema.
- **Prioridad:** Baja

### 6. Polyfill: diferencias entre callbacks (Chrome) y Promises (Firefox)
- **Archivo:** `compat/browser-polyfill.js`
- **Descripción:** El polyfill actual (`globalThis.browser = chrome`) funciona porque todo el código usa callbacks. Si en el futuro se migra a `.then()` o `async/await`, las APIs de Chrome no devolverán Promises y fallarán silenciosamente.
- **Solución propuesta:** Documentar la limitación o evaluar el uso de `webextension-polyfill` de Mozilla cuando se necesite soporte de Promises.
- **Prioridad:** Baja (no afecta mientras se usen callbacks)
