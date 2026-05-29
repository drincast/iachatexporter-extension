/**
 * @file gemini.js
 * 
 * Implementa los selectores DOM específicos y la lógica de extracción para la interfaz de Gemini.
 * Se separa en un módulo independiente para que los cambios frecuentes en el diseño del sitio de Gemini
 * no afecten la lógica de control principal ni a los parsers de otras plataformas de IA.
 */

// Se registra en el objeto global window para que content.js pueda invocarlo de forma dinámica.
window.ChatIASaveGeminiParser = {
  
  /**
   * Extrae la conversación y el título directamente del DOM de Gemini.
   * Se requiere manejar selectores dinámicos del DOM del cliente y capturar errores por cambios de UI.
   * 
   * @returns {object} Objeto con el título y la lista de mensajes extraídos.
   */
  parseChat() {
    try {
      // 1. Extracción del título de la conversación.
      // Se intenta leer desde la conversación seleccionada en el sidebar.
      let title = '';
      const sidebarActiveTitle = document.querySelector('a[data-test-id="conversation"].selected .conversation-title');
      if (sidebarActiveTitle) {
        title = sidebarActiveTitle.textContent.trim();
      }

      // Si no está disponible el sidebar, se busca en la barra superior.
      if (!title) {
        const topbarTitle = document.querySelector('conversation-actions .conversation-title');
        if (topbarTitle) {
          title = topbarTitle.textContent.trim();
        }
      }

      // Como último recurso, se limpia el título de la página del navegador.
      if (!title) {
        title = document.title
          .replace('Gemini - ', '')
          .replace(' - Gemini', '')
          .trim();
      }

      // 2. Extracción de mensajes en orden secuencial del chat.
      // Gemini utiliza etiquetas personalizadas <user-query> y <model-response> en el DOM.
      const messageElements = document.querySelectorAll('user-query, model-response');
      const messages = [];

      messageElements.forEach((element) => {
        const tagName = element.tagName.toLowerCase();
        
        if (tagName === 'user-query') {
          // Intentamos obtener el nodo que contiene el texto de la consulta,
          // evitando capturar botones de edición de la interfaz de usuario.
          const queryTextNode = element.querySelector('.query-text') || element;
          messages.push({
            author: 'user',
            element: queryTextNode
          });
        } else if (tagName === 'model-response') {
          // Buscamos el contenedor interno del texto de respuesta del modelo,
          // de esta manera excluimos la botonera de feedback, compartir y fuentes externas.
          const responseTextNode = element.querySelector('.message-content') || element;
          messages.push({
            author: 'ai',
            element: responseTextNode
          });
        }
      });

      return {
        title: title || 'Conversación de Gemini',
        messages: messages
      };
    } catch (error) {
      // Se utiliza try-catch para evitar que un cambio en la interfaz de Gemini
      // rompa la extensión por completo, permitiendo capturar el error detallado.
      console.error('Error al extraer el DOM de Gemini:', error);
      throw new Error('No se pudo leer la estructura del chat de Gemini. La interfaz de Google puede haber cambiado.');
    }
  }
};
