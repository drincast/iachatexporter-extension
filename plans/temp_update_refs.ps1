# temp_update_refs.ps1
# -------------------------------------------------
# Busca en todo el proyecto los archivos con extensiones
# .md, .json, .js, .html y .css y reemplaza
# todas las ocurrencias del nombre antiguo del proyecto
# 'ChatIASave' por el nuevo 'IAChatExporter'.
# -------------------------------------------------

Get-ChildItem -Recurse -Include *.md,*.json,*.js,*.html,*.css |
    ForEach-Object {
        # Leer los bytes del archivo tal cual están codificados
        $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
        # Intentar detectar la codificación original (fallback a UTF8 sin BOM)
        $encoding = [System.Text.Encoding]::UTF8
        try {
            $encoding = [System.Text.Encoding]::GetEncoding([System.Text.Encoding]::Default.CodePage)
        } catch {}
        # Convertir a texto usando esa codificación
        $content = $encoding.GetString($bytes)
        # Reemplazar todas las coincidencias
        $updated = $content -replace 'ChatIASave', 'IAChatExporter'
        # Obtener los bytes con la misma codificación y sobrescribir
        $newBytes = $encoding.GetBytes($updated)
        [System.IO.File]::WriteAllBytes($_.FullName, $newBytes)
    }
