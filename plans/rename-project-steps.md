# Steps to rename the project and root folder to **IAChatExporter**

## Overview
This document outlines the exact commands and actions needed to rename the repository folder, update internal references, and commit the changes. Follow the steps sequentially; you can close your editor after creating this file and resume later.

---

## 1️⃣ Prepare the environment
```powershell
# Navigate to the parent directory that contains the project folder
cd D:\Desarrollo\RepoGit\github
```
- Ensure no editor or terminal is locking the folder.
- Make sure Git is configured (user.name, user.email).

## 2️⃣ Rename the root folder
```powershell
Rename-Item -Path .\chatiasave-extension -NewName iachatexporter-extension
```
> This moves the whole project, including the hidden `.git` directory, to `iachatexporter-extension`.

## 3️⃣ Change to the new folder
```powershell
cd iachatexporter-extension
```

## 4️⃣ Update internal references
Run a search‑and‑replace on all relevant source files (markdown, JSON, JS, HTML, CSS) to replace the old project name.
```powershell
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
```
- Verify the changes manually if you prefer.

## 5️⃣ Verify Git status
```powershell
git status
```
You should see a list of modified files.

## 6️⃣ Commit the rename
```powershell
git add -A
git commit -m "Rename project: chatiasave‑extension → IAChatExporter (folder & internal references)"
```

## 7️⃣ (Optional) Update remote URL after creating the GitHub repo
```powershell
git remote set-url origin https://github.com/drincast/iachatexporter-extension.git
```
Replace `<YOUR_USERNAME>` with your GitHub handle.

## 8️⃣ Verify everything works
- Load the unpacked extension from the new folder in Chrome/Firefox.
- Run `git log` to confirm the commit is recorded.

---

# ✅ Checklist
- [x] Navigate to parent directory
- [x] Rename folder to `IAChatExporter`
- [x] `cd` into the new folder
- [x] Replace all occurrences of `ChatIASave` with `IAChatExporter`
- [x] Run `git status` and confirm modifications
- [x] Commit the changes
- [x] (Optional) Update remote URL on GitHub
- [x] Test the extension locally
- [x] Close editor and resume later

*File created in `plans/rename-project-steps.md`*
