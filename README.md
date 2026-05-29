# 🗂️ IAChatExporter

**Exporta tus conversaciones de IA a Markdown con un solo clic**

---

## 📌 Descripción

`IAChatExporter` es una extensión ligera para Chrome y Firefox que permite guardar las conversaciones de los principales modelos de IA (Gemini, Claude.ai y ChatGPT) directamente en archivos Markdown, **sin consumir tokens adicionales** ni compartir el contexto entre chats.

---

## ✨ Características

- 🎯 **Soporte** para Gemini, Claude.ai y ChatGPT (fase MVP: Gemini).
- 📄 Generación de archivos **Markdown con front‑matter YAML** listo para usar en herramientas de notas o generación de docs.
- 🛡️ **Sin dependencias externas**: código vanilla JavaScript/HTML/CSS.
- 🖥️ **UI premium**: modo oscuro, micro‑animaciones y diseño responsivo.
- 📦 **Instalación simple**: carga descomprimida o desde la Chrome Web Store.

---

## 📦 Instalación

1. **Descarga** el código zip o clona el repositorio:
   ```bash
   git clone https://github.com/drincast/iachatexporter-extension.git
   ```
2. Abre `chrome://extensions/` (o `about:addons` en Firefox).
3. Habilita **Modo desarrollador** y pulsa **Cargar sin empaquetar**.
4. Selecciona la carpeta `iachatexporter-extension`.
5. ¡Listo! Verás el ícono de la extensión en la barra de herramientas.

---

## 🚀 Uso rápido

1. Abre una conversación en **Gemini**, **Claude.ai** o **ChatGPT**.
2. Haz clic en el ícono de la extensión.
3. Selecciona la plataforma detectada y (opcional) escribe etiquetas.
4. Pulsa **Exportar a Markdown** y elige la ubicación del archivo.

El archivo generado incluye:
- Título sugerido (primer mensaje).
- Fecha de la conversación.
- Fuente del modelo.
- Front‑matter YAML con etiquetas.
- Mensajes del usuario y del asistente formateados.

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Sigue estos pasos:
1. Crea una rama `feature/descripcion`.
2. Haz tus cambios siguiendo las **convenciones de código** del proyecto (camelCase, comentarios en español, etc.).
3. Envía un **pull request** describiendo la mejora.

---

## 📄 Licencia

Este proyecto está licenciado bajo la **Apache License 2.0**. Consulta el archivo `LICENSE` para más detalles.

---

## 🙏 Agradecimientos

Gracias a la comunidad de desarrollo de extensiones y a los usuarios que prueban la herramienta. ¡Esperamos que te sea útil!
