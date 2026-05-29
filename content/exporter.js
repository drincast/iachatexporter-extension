/**
 * @file exporter.js
 * 
 * Contiene la lógica responsable de transformar la conversación (ya unificada y estructurada)
 * al formato final de Markdown con frontmatter YAML. Se separa del parser para mantener una única
 * responsabilidad: la serialización y preparación del flujo de datos para su almacenamiento local.
 */

// Se expone en el contexto global window para que content.js pueda invocarlo
// tras recolectar los datos del chat en la pestaña activa.
window.ChatIASaveExporter = {
  
  /**
   * Transforma el objeto unificado de chat a un archivo de texto Markdown estructurado.
   * Se requiere generar el frontmatter YAML y dar formato a los mensajes del usuario y asistente.
   * 
   * @param {object} chatData - Datos normalizados del chat.
   * @param {Array<string>} tags - Etiquetas personalizadas provistas por el usuario.
   * @returns {string} Contenido completo formateado en Markdown.
   */
  exportToMarkdown(chatData, tags = []) {
    try {
      // 1. Generación del bloque Frontmatter YAML.
      // Se requiere el formato específico con comillas escapadas para evitar que títulos con caracteres especiales corrompan el YAML.
      let markdown = '---\n';
      markdown += `title: "${chatData.title.replace(/"/g, '\\"')}"\n`;
      markdown += `date: ${chatData.date}\n`;
      markdown += `source: ${chatData.source}\n`;
      markdown += `tags: [${tags.map(t => `"${t.replace(/"/g, '\\"')}"`).join(', ')}]\n`;
      markdown += '---\n\n';

      // 2. Cabecera principal del documento.
      markdown += `# ${chatData.title}\n\n`;

      // 3. Conversión de mensajes a Markdown.
      chatData.messages.forEach(msg => {
        const messageMarkdown = convertNodeToMarkdown(msg.element).trim();
        
        if (msg.author === 'user') {
          markdown += `### 🧑 Tú\n${messageMarkdown}\n\n---\n\n`;
        } else {
          markdown += `### 🤖 Asistente\n${messageMarkdown}\n\n---\n\n`;
        }
      });

      // 4. Pie de firma con fecha y hora actual de la descarga.
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const formattedTime = `${chatData.date} ${hours}:${minutes}`;
      
      markdown += `*Exportado con ChatIASave · ${formattedTime}*\n`;

      // Se realiza una limpieza de saltos de línea sobrantes acumulados en el procesamiento recursivo.
      return markdown.replace(/\n{3,}/g, '\n\n');

    } catch (error) {
      console.error('Error al formatear conversación a Markdown:', error);
      throw error;
    }
  }
};

/**
 * Convierte de manera recursiva un nodo HTML a formato Markdown plano.
 * Se requiere este formateador ad-hoc para cumplir con la restricción del stack técnico
 * de no usar librerías externas como Turndown.js.
 * 
 * @param {Node} node - Nodo del DOM actual.
 * @returns {string} Texto plano con sintaxis Markdown.
 */
function convertNodeToMarkdown(node) {
  // Caso base: Nodo de texto plano.
  if (node.nodeType === Node.TEXT_NODE) {
    return node.nodeValue;
  }
  
  // Ignorar nodos que no sean elementos (como comentarios).
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const tagName = node.tagName.toLowerCase();
  
  // Manejo de bloques de código preformateados.
  if (tagName === 'pre') {
    const codeElement = node.querySelector('code') || node;
    let language = '';
    
    // Intentamos deducir el lenguaje del bloque a partir de la clase CSS típica.
    const classes = Array.from(codeElement.classList || []);
    const langClass = classes.find(c => c.startsWith('language-') || c.startsWith('lang-'));
    if (langClass) {
      language = langClass.replace('language-', '').replace('lang-', '');
    }
    
    return `\n\`\`\`${language}\n${codeElement.textContent.trim()}\n\`\`\`\n\n`;
  }
  
  // Código en línea.
  if (tagName === 'code') {
    return ` \`${node.textContent}\` `;
  }

  // Procesamiento estructurado de tablas HTML a Markdown.
  if (tagName === 'table') {
    return parseHtmlTableToMarkdown(node);
  }

  // Llamada recursiva para recorrer los hijos del nodo actual.
  let childrenMarkdown = '';
  node.childNodes.forEach(child => {
    childrenMarkdown += convertNodeToMarkdown(child);
  });

  // Mapeo sintáctico de etiquetas HTML comunes a Markdown.
  switch (tagName) {
    case 'p':
      return `\n\n${childrenMarkdown.trim()}\n\n`;
    case 'strong':
    case 'b':
      return `**${childrenMarkdown}**`;
    case 'em':
    case 'i':
      return `*${childrenMarkdown}*`;
    case 'br':
      return '\n';
    case 'h1': return `\n\n# ${childrenMarkdown.trim()}\n\n`;
    case 'h2': return `\n\n## ${childrenMarkdown.trim()}\n\n`;
    case 'h3': return `\n\n### ${childrenMarkdown.trim()}\n\n`;
    case 'h4': return `\n\n#### ${childrenMarkdown.trim()}\n\n`;
    case 'h5': return `\n\n##### ${childrenMarkdown.trim()}\n\n`;
    case 'h6': return `\n\n###### ${childrenMarkdown.trim()}\n\n`;
    case 'a':
      const href = node.getAttribute('href') || '';
      return `[${childrenMarkdown}](${href})`;
    case 'ul':
      return `\n${childrenMarkdown}\n`;
    case 'ol':
      // Re-numeramos los items de la lista ordenada secuencialmente.
      let listIndex = 1;
      let olMarkdown = '\n';
      node.childNodes.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE && child.tagName.toLowerCase() === 'li') {
          let liText = '';
          child.childNodes.forEach(c => { liText += convertNodeToMarkdown(c); });
          olMarkdown += `${listIndex}. ${liText.trim()}\n`;
          listIndex++;
        }
      });
      return olMarkdown + '\n';
    case 'li':
      return `- ${childrenMarkdown.trim()}\n`;
    case 'blockquote':
      return `\n> ${childrenMarkdown.trim().replace(/\n/g, '\n> ')}\n\n`;
    default:
      // Etiquetas de contenedor neutras (div, span, section) solo propagan sus textos.
      return childrenMarkdown;
  }
}

/**
 * Convierte un elemento <table> del DOM en una tabla con formato Markdown válido.
 * 
 * @param {HTMLElement} tableNode - Elemento tabla del DOM.
 * @returns {string} Tabla estructurada en texto Markdown.
 */
function parseHtmlTableToMarkdown(tableNode) {
  try {
    const rows = Array.from(tableNode.querySelectorAll('tr'));
    if (rows.length === 0) return '';

    let markdownTable = '\n\n';
    let columnCount = 0;

    // Procesamos la fila de cabecera de la tabla.
    const firstRow = rows[0];
    const headerCells = Array.from(firstRow.querySelectorAll('th, td'));
    columnCount = headerCells.length;
    
    const headers = headerCells.map(cell => cell.textContent.trim().replace(/\|/g, '\\|'));
    markdownTable += `| ${headers.join(' | ')} |\n`;
    
    // Creamos la línea divisoria del encabezado Markdown.
    const separators = Array(columnCount).fill('---');
    markdownTable += `| ${separators.join(' | ')} |\n`;

    // Procesamos las filas restantes de datos.
    for (let i = 1; i < rows.length; i++) {
      const cells = Array.from(rows[i].querySelectorAll('td'));
      const rowData = cells.map(cell => cell.textContent.trim().replace(/\|/g, '\\|'));
      
      // Rellenamos con celdas vacías si la fila tiene menos celdas que la cabecera.
      while (rowData.length < columnCount) {
        rowData.push('');
      }
      markdownTable += `| ${rowData.join(' | ')} |\n`;
    }

    return markdownTable + '\n';
  } catch (error) {
    // Si la tabla no se puede formatear de forma segura, hacemos fallback al texto plano.
    console.error('Error al formatear tabla HTML:', error);
    return tableNode.innerText;
  }
}
