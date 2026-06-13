/**
 * @file chatgpt.js
 *
 * Implementa los selectores DOM específicos y la lógica de extracción para la interfaz de ChatGPT.
 * Se requiere un aislamiento completo de los selectores de ChatGPT para facilitar su mantenimiento preventivo
 * e iterar rápidamente cuando OpenAI actualice la estructura de clases y nodos de su aplicación.
 */

// Se registra en el objeto global window para que content.js pueda invocarlo de forma dinámica.
window.IAChatExporterChatGPTParser = {

  /**
   * Extrae la conversación y el título directamente del DOM de ChatGPT.
   * Se requiere manejar selectores dinámicos del DOM del cliente y capturar errores por cambios de UI.
   *
   * @returns {object} Objeto con el título y la lista de mensajes extraídos.
   */
  parseChat() {
    try {
      // 1. Extracción del título de la conversación.
      // Se intenta leer desde el item activo del sidebar (la conversación en curso queda marcada).
      let title = '';
      const sidebarActiveItem = document.querySelector('nav a[aria-current="page"], nav li[class*="active"] a, nav a[data-active]');
      if (sidebarActiveItem) {
        title = sidebarActiveItem.textContent.trim();
      }

      // Si no está disponible el sidebar, se limpia el título de la página del navegador.
      if (!title && document.title) {
        title = document.title
          .replace('ChatGPT - ', '')
          .replace(' - ChatGPT', '')
          .replace('ChatGPT', '')
          .trim();
      }

      // 2. Extracción secuencial de mensajes.
      // ChatGPT marca cada turno con el atributo data-message-author-role, que es el selector
      // mas estable de OpenAI frente a sus frecuentes cambios de clases CSS dinamicas.
      const messageElements = document.querySelectorAll('[data-message-author-role]');
      const messages = [];

      messageElements.forEach((element) => {
        const role = element.getAttribute('data-message-author-role');
        let author = '';

        if (role === 'user') {
          author = 'user';
        } else if (role === 'assistant') {
          author = 'ai';
        }

        if (author) {
          // Buscamos el contenedor interno con el texto/formato enriquecido si existe,
          // para excluir botones de copiar, feedback o regenerar que rodean al mensaje.
          // En el asistente el contenido vive en .markdown.prose; el usuario usa .whitespace-pre-wrap.
          const contentNode = element.querySelector('.markdown, .prose, .whitespace-pre-wrap') || element;
          messages.push({
            author: author,
            element: contentNode
          });
        }
      });

      return {
        title: title || 'Conversación de ChatGPT',
        messages: messages
      };
    } catch (error) {
      // Se utiliza try-catch para evitar que un cambio en la interfaz de ChatGPT
      // rompa la extensión por completo, permitiendo capturar el error detallado.
      console.error('Error al extraer el DOM de ChatGPT:', error);
      throw new Error('No se pudo leer la estructura del chat de ChatGPT. La interfaz de OpenAI puede haber cambiado.');
    }
  }
};
