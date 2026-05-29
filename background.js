/**
 * @file background.js
 * 
 * Se utiliza un Service Worker de fondo en Manifest V3 para centralizar la gestión de eventos
 * globales de la extensión. Su existencia es necesaria porque las páginas de contenido (content scripts)
 * tienen un ciclo de vida limitado al de la pestaña y no pueden acceder directamente a ciertas API
 * privileges de Chrome/Firefox, como la gestión avanzada de descargas o la mensajería persistente.
 */

// Escucha mensajes enviados desde el content script o el popup para realizar tareas en segundo plano.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Se procesa la solicitud de descarga de archivo Markdown.
  // Se requiere que la descarga se realice aquí en el background service worker porque las
  // páginas de contenido de los LLMs tienen políticas de seguridad CSP estrictas que bloquean
  // la creación de URLs temporales (Blob URLs) o la simulación de clics de descarga.
  if (request.action === 'downloadFile') {
    try {
      chrome.downloads.download({
        url: request.url,
        filename: request.filename,
        saveAs: true // Permitimos al usuario elegir la ubicación y nombre final para mayor control.
      }, (downloadId) => {
        // Se manejan los posibles errores al intentar invocar la API de descargas de Chrome.
        if (chrome.runtime.lastError) {
          sendResponse({
            success: false,
            error: chrome.runtime.lastError.message
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
