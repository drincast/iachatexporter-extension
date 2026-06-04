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
 * @file background.js
 * 
 * Se utiliza un Service Worker de fondo en Manifest V3 para centralizar la gestión de eventos
 * globales de la extensión. Su existencia es necesaria porque las páginas de contenido (content scripts)
 * tienen un ciclo de vida limitado al de la pestaña y no pueden acceder directamente a ciertas API
 * privileges de Chrome/Firefox, como la gestión avanzada de descargas o la mensajería persistente.
 */

// Escucha mensajes enviados desde el content script o el popup para realizar tareas en segundo plano.
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Se procesa la solicitud de descarga de archivo Markdown.
  // Se requiere que la descarga se realice aquí en el background service worker porque las
  // páginas de contenido de los LLMs tienen políticas de seguridad CSP estrictas que bloquean
  // la creación de URLs temporales (Blob URLs) o la simulación de clics de descarga.
  if (request.action === 'downloadFile') {
    try {
      browser.downloads.download({
        url: request.url,
        filename: request.filename,
        saveAs: true // Permitimos al usuario elegir la ubicación y nombre final para mayor control.
      }, (downloadId) => {
        // Se manejan los posibles errores al intentar invocar la API de descargas de Chrome.
        if (browser.runtime.lastError) {
          sendResponse({
            success: false,
            error: browser.runtime.lastError.message
          });
        } else {
          sendResponse({
            success: true,
            downloadId: downloadId
          });
        }
      });
    } catch (error) {
      // Control de excepciones generales para prevenir caídas silenciosas en el service worker.
      sendResponse({
        success: false,
        error: error.message
      });
    }
    return true; // Se retorna true para indicarle a Chrome que la respuesta será asíncrona.
  }
});
