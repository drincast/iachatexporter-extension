/**
 * @file claude.js
 * 
 * Implementa los selectores DOM específicos y la lógica de extracción para la interfaz de Claude.ai.
 * Mantener esta lógica en un archivo dedicado aísla las actualizaciones de interfaz que Claude pueda sufrir
 * del resto de los componentes y adaptadores de la extensión.
 */

// Stub inicial registrado en window para evitar excepciones de carga.
// El soporte funcional completo se desarrollará en la Fase 4 del ROADMAP.
window.IAChatExporterClaudeParser = {
  
  /**
   * Extrae la conversación y el título directamente del DOM de Claude.ai.
   * Se requiere manejar selectores dinámicos del DOM del cliente y capturar errores por cambios de UI.
   * 
   * @returns {object} Objeto con el título y la lista de mensajes extraídos.
   */
  parseChat() {
    try {
      // 1. Extracción del título de la conversación.
      let title = '';
      
      // Se intenta obtener el título del elemento activo del sidebar.
      // Claude suele tener enlaces en el sidebar para chats recientes.
      const activeSidebarItem = document.querySelector('a[href^="/chat/"].bg-accent, a[href^="/chat/"].bg-bg-200, [class*="active"] a[href^="/chat/"]');
      if (activeSidebarItem) {
        title = activeSidebarItem.textContent.trim();
      }

      // Si no está disponible el sidebar, se busca en la barra superior o en el document.title.
      if (!title && document.title) {
        title = document.title
          .replace(' - Claude', '')
          .replace('Claude - ', '')
          .replace('Claude', '')
          .trim();
      }

      // 2. Extracción secuencial de mensajes.
      // Claude renderiza los mensajes en orden. Usamos selectores CSS genéricos y fallbacks conocidos
      // para minimizar la fragilidad ante cambios de clases dinámicas por parte de Anthropic.
      const selector = '.font-user-message, .font-claude-message, .font-claude-response, [data-testid="user-message"], .human-message, .assistant-message';
      const messageElements = document.querySelectorAll(selector);
      const messages = [];

      messageElements.forEach((element) => {
        let author = '';
        const classes = element.classList;

        // Determinamos el autor comparando las clases CSS del contenedor o el test ID.
        if (classes.contains('font-user-message') || 
            classes.contains('human-message') || 
            element.getAttribute('data-testid') === 'user-message') {
          author = 'user';
        } else if (classes.contains('font-claude-message') || 
                   classes.contains('font-claude-response') || 
                   classes.contains('assistant-message')) {
          author = 'ai';
        }

        if (author) {
          // Buscamos el contenedor interno con el texto/formato enriquecido si existe,
          // para evitar meter metadatos, botones de copiar o feedback que estén en el contenedor padre.
          const contentNode = element.querySelector('.grid') || element;
          messages.push({
            author: author,
            element: contentNode
          });
        }
      });

      return {
        title: title || 'Conversación de Claude',
        messages: messages
      };
    } catch (error) {
      // Se utiliza try-catch para capturar fallos inesperados y evitar que rompan el flujo de ejecución global.
      console.error('Error al extraer el DOM de Claude.ai:', error);
      throw new Error('No se pudo leer la estructura del chat de Claude.ai. La interfaz de Anthropic puede haber cambiado.');
    }
  }
};
