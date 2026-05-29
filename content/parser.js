/**
 * @file parser.js
 * 
 * Define la estructura de datos común y la lógica abstracta o genérica para el procesamiento de mensajes.
 * Su propósito es unificar la salida de los diferentes parsers específicos (Gemini, Claude, ChatGPT)
 * en un formato estándar y limpio, evitando la duplicación de código en la preparación de los datos.
 */

// Se expone en el contexto global window para que el orquestador principal (content.js)
// pueda unificar el formato de los chats sin importar el LLM de origen.
window.IAChatExporterParser = {
  
  /**
   * Normaliza los datos crudos extraídos de la interfaz del DOM en una estructura estándar.
   * Se requiere este paso intermedio para que el exportador (exporter.js) solo maneje un formato
   * único de datos, desacoplando la estructura visual del DOM del resultado final en Markdown.
   * 
   * @param {string} title - Título de la conversación.
   * @param {string} source - Origen del chat ('Gemini', 'Claude' o 'ChatGPT').
   * @param {Array<{author: string, element: HTMLElement}>} rawMessages - Lista de mensajes crudos con su autor y elemento HTML.
   * @returns {object} Objeto de conversación normalizado.
   */
  normalizeChat(title, source, rawMessages) {
    try {
      // Se obtiene la fecha actual en formato local YYYY-MM-DD para el Frontmatter YAML.
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      return {
        title: title ? title.trim() : 'Conversación de ChatIA',
        date: formattedDate,
        source: source,
        messages: rawMessages.map(msg => {
          // Validamos que el autor sea uno de los admitidos para evitar errores de renderizado.
          const author = (msg.author === 'user') ? 'user' : 'ai';
          return {
            author: author,
            element: msg.element // Se conserva el nodo HTML para que el exportador traduzca su contenido a Markdown.
          };
        })
      };
    } catch (error) {
      // Manejo de errores para diagnosticar fallas de parseo en caso de elementos nulos del DOM.
      console.error('Error al normalizar la conversación:', error);
      throw error;
    }
  }
};
