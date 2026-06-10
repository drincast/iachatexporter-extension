/**
 * Copyright 2026 Rubén Dario Orozco Zapata (drincast)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @file compat/browser-polyfill.js
 *
 * Polyfill de compatibilidad entre Chrome y Firefox para las APIs de extensiones.
 * Es necesario porque Chrome expone sus APIs bajo el objeto global `chrome`, mientras
 * que Firefox las expone bajo `browser`. Al ejecutar este script primero, garantizamos
 * que el resto del código del proyecto siempre use `browser.*` de forma segura en ambos
 * navegadores sin necesidad de condiciones ni detecciones adicionales.
 */

// Si `browser` no está definido, estamos en Chrome (o un entorno basado en Chromium).
// En ese caso, creamos un alias global apuntando al objeto `chrome` ya existente.
if (typeof browser === 'undefined') {
  // eslint-disable-next-line no-undef
  globalThis.browser = chrome;
}
