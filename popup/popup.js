/**
 * @file popup.js
 * 
 * Este script controla la lógica interactiva del popup de la extensión. Se requiere para
 * capturar las acciones del usuario en la interfaz (como clics en botones de exportación),
 * comunicarse con la pestaña activa para solicitar la extracción de datos y actualizar el
 * estado visual del proceso en tiempo real.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicializamos los elementos de la interfaz del DOM para poder manipularlos.
  const statusBox = document.getElementById('statusBox');
  const statusDot = document.getElementById('statusDot') || statusBox.querySelector('.status-dot');
  const statusText = document.getElementById('statusText');
  const tagsInput = document.getElementById('tagsInput');
  const btnExport = document.getElementById('btnExport');

  // Nombres amigables para los LLM soportados.
  const PLATFORMS = {
    gemini: 'Gemini',
    claude: 'Claude.ai',
    chatgpt: 'ChatGPT'
  };

  /**
   * Identifica la plataforma de IA activa según el host de la pestaña.
   * Se requiere una detección exacta de la URL para habilitar selectores del dominio específico.
   * 
   * @param {string} url - URL completa de la pestaña activa.
   * @returns {string|null} Clave de la plataforma detectada o null si no es compatible.
   */
  function detectPlatform(url) {
    try {
      const hostname = new URL(url).hostname;
      if (hostname.includes('gemini.google.com')) return 'gemini';
      if (hostname.includes('claude.ai')) return 'claude';
      if (hostname.includes('chatgpt.com') || hostname.includes('chat.openai.com')) return 'chatgpt';
    } catch (e) {
      // Retornar null si la URL no es válida (por ejemplo, pestañas del sistema chrome://)
      return null;
    }
    return null;
  }

  /**
   * Verifica el estado de la pestaña activa y actualiza la interfaz del popup.
   * Este método maneja errores en caso de que las API de pestañas no estén listas.
   */
  function checkCurrentTab() {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) return;
        
        const activeTab = tabs[0];
        const platform = detectPlatform(activeTab.url);

        if (platform) {
          // Si la pestaña actual aloja un LLM compatible, activamos la interfaz.
          statusBox.classList.add('detected');
          statusDot.className = 'status-dot active';
          statusText.textContent = `${PLATFORMS[platform]} Detectado`;
          btnExport.removeAttribute('disabled');
        } else {
          // En páginas no soportadas se bloquea la acción para evitar errores de inyección.
          statusBox.classList.remove('detected');
          statusDot.className = 'status-dot';
          statusText.textContent = 'Abre Gemini, Claude o ChatGPT';
          btnExport.setAttribute('disabled', 'true');
        }
      });
    } catch (error) {
      // Se captura cualquier error de API de extensiones para evitar fallas silenciosas en la consola.
      console.error('Error al consultar la pestaña activa:', error);
      statusText.textContent = 'Error al detectar pestaña';
      statusDot.className = 'status-dot error';
    }
  }

  // Se inicia la validación de la pestaña activa al abrir el popup.
  checkCurrentTab();

  // Escucha el evento de clic en el botón de exportación para orquestar la extracción.
  btnExport.addEventListener('click', () => {
    try {
      // Cambiamos el estado visual del botón para retroalimentar al usuario de que la acción está en proceso.
      btnExport.setAttribute('disabled', 'true');
      const originalText = btnExport.querySelector('.btn-text').textContent;
      btnExport.querySelector('.btn-text').textContent = 'Exportando...';

      // Parseamos las etiquetas ingresadas por el usuario, eliminando espacios vacíos.
      const tagsRaw = tagsInput.value || '';
      const tagsArray = tagsRaw.split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      // Enviamos el mensaje a la pestaña activa para iniciar el parseo en la página web.
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) {
          resetButton();
          return;
        }

        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: 'exportChat', tags: tagsArray },
          (response) => {
            // Manejamos la respuesta de la inyección de script de contenido.
            if (chrome.runtime.lastError) {
              console.error('Error al comunicarse con el script de contenido:', chrome.runtime.lastError);
              alert('Error: Asegúrate de estar en una conversación activa y recargar la página del chat si acabas de instalar la extensión.');
              resetButton();
              return;
            }

            if (response && response.success) {
              btnExport.querySelector('.btn-text').textContent = '¡Listo!';
              setTimeout(() => {
                resetButton();
              }, 1500);
            } else {
              alert('Error al exportar: ' + (response ? response.error : 'Respuesta vacía'));
              resetButton();
            }
          }
        );
      });

      function resetButton() {
        btnExport.removeAttribute('disabled');
        btnExport.querySelector('.btn-text').textContent = originalText;
      }

    } catch (error) {
      console.error('Error en el proceso de exportación del popup:', error);
      alert('Ocurrió un error inesperado al intentar exportar.');
      btnExport.removeAttribute('disabled');
      btnExport.querySelector('.btn-text').textContent = 'Exportar a Markdown';
    }
  });
});
