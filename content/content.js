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
 * @file content.js
 * 
 * Actúa como el orquestador principal inyectado en la página de chat del LLM. Es necesario
 * para detectar dinámicamente en qué plataforma nos encontramos, recibir las solicitudes de
 * exportación enviadas desde el popup, invocar al parser correspondiente e iniciar el flujo
 * de exportación de los datos resultantes.
 */

// Listener para recibir los mensajes del popup de la extensión.
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'exportChat') {
    try {
      const hostname = window.location.hostname;
      let platform = '';
      let parser = null;

      // 1. Detección de la plataforma y asignación de su parser correspondiente.
      if (hostname.includes('gemini.google.com')) {
        platform = 'Gemini';
        parser = window.IAChatExporterGeminiParser;
      } else if (hostname.includes('claude.ai')) {
        platform = 'Claude';
        parser = window.IAChatExporterClaudeParser;
      } else if (hostname.includes('chatgpt.com') || hostname.includes('chat.openai.com')) {
        platform = 'ChatGPT';
        parser = window.IAChatExporterChatGPTParser;
      }

      // Si no hay parser inyectado o soportado para esta pestaña, respondemos con error.
      if (!parser) {
        sendResponse({ success: false, error: 'Plataforma no soportada o parser no cargado.' });
        return;
      }

      // 2. Extracción de los datos del chat en caliente desde el DOM.
      const rawChatData = parser.parseChat();
      if (!rawChatData || !rawChatData.messages || rawChatData.messages.length === 0) {
        sendResponse({ success: false, error: 'No se encontraron mensajes en esta conversación.' });
        return;
      }

      // 3. Normalización al modelo de datos común del plugin.
      const normalizedChat = window.IAChatExporterParser.normalizeChat(
        rawChatData.title,
        platform,
        rawChatData.messages
      );

      // 4. Conversión a texto Markdown con Frontmatter YAML.
      const markdownContent = window.IAChatExporterExporter.exportToMarkdown(
        normalizedChat,
        request.tags || []
      );

      // 5. Creación del nombre del archivo descargado.
      // Se genera un nombre en kebab-case limpio para mantener el orden local.
      const todayStr = normalizedChat.date;
      const fileSlug = slugify(normalizedChat.title);
      const filename = `IAChatExporter-${platform.toLowerCase()}-${fileSlug}-${todayStr}.md`;

      // 6. Generación del stream de datos de descarga (Data URL).
      // Se codifica en base64 para evitar problemas de codificación de caracteres especiales (tildes, emojis) en la descarga.
      const base64Content = btoa(unescape(encodeURIComponent(markdownContent)));
      const dataUrl = `data:text/markdown;charset=utf-8;base64,${base64Content}`;

      // 7. Envío al Service Worker (background.js) para ejecutar la descarga física.
      browser.runtime.sendMessage({
        action: 'downloadFile',
        url: dataUrl,
        filename: filename
      }, (downloadResponse) => {
        if (browser.runtime.lastError) {
          console.error('Error de mensajería en la descarga:', browser.runtime.lastError);
          sendResponse({ success: false, error: browser.runtime.lastError.message });
        } else if (downloadResponse && downloadResponse.success) {
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: downloadResponse ? downloadResponse.error : 'Error desconocido al descargar.' });
        }
      });

    } catch (error) {
      // Capturamos cualquier error en tiempo de ejecución para dar feedback preciso en el popup.
      console.error('Fallo en el script de contenido al exportar:', error);
      sendResponse({ success: false, error: error.message });
    }

    return true; // Mantiene el canal abierto para responder asíncronamente tras la descarga.
  }
});

/**
 * Convierte un texto a formato amigable de nombres de archivos (kebab-case).
 * 
 * @param {string} text - Texto a transformar.
 * @returns {string} Texto formateado en minúsculas con guiones.
 */
function slugify(text) {
  try {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD') // Separa los diacríticos (acentos) de las letras base
      .replace(/[\u0300-\u036f]/g, '') // Elimina los diacríticos (acentos)
      .replace(/[^a-z0-9\s-]/g, '') // Elimina caracteres especiales
      .trim()
      .replace(/\s+/g, '-') // Cambia espacios por guiones
      .replace(/-+/g, '-') // Evita guiones consecutivos
      .substring(0, 50); // Acota el tamaño máximo del nombre del archivo
  } catch (e) {
    return 'conversacion';
  }
}
