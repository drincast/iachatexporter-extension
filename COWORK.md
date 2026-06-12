# COWORK — Guía de sesiones de trabajo colaborativo

Instrucciones para registrar sesiones de trabajo entre el autor y un agente de IA.
**Lee este archivo y ejecuta las instrucciones correspondientes al iniciar o cerrar una sesión.**

---

## Setup — primer uso en un proyecto nuevo

Si `WORKLOG.md` **no existe** en la raíz del proyecto, inicializa el sistema antes de empezar:

```powershell
# Windows / pwsh
pwsh scripts/worklog.ps1 init "nombre-del-proyecto"

# Linux / macOS (sin pwsh instalado)
bash scripts/worklog.sh init "nombre-del-proyecto"
```

Si se omite el nombre, el script usa el nombre del directorio actual.

### Replicar este sistema en un proyecto nuevo

Copia estos tres archivos a la raíz del nuevo proyecto:

```
COWORK.md
scripts/worklog.ps1
scripts/worklog.sh
```

Luego ejecuta `init` en ese proyecto. El resto se genera automáticamente.

---

## Inicio de sesión

Al comenzar a trabajar, ejecuta:

```powershell
# Windows / pwsh — con agente y modelo
pwsh scripts/worklog.ps1 start "Claude Code" "claude-sonnet-4-6"

# Windows / pwsh — solo agente (si no conoces el modelo exacto)
pwsh scripts/worklog.ps1 start "Claude Code"

# Linux / macOS
bash scripts/worklog.sh start "Claude Code" "claude-sonnet-4-6"
```

Reemplaza `"Claude Code"` con el nombre de tu agente (GitHub Copilot, Cursor, Gemini Code, etc.)  
Reemplaza `"claude-sonnet-4-6"` con el ID del modelo si lo conoces.

---

## Cierre de sesión

Al terminar, ejecuta con un resumen breve de lo realizado:

```powershell
# Windows / pwsh
pwsh scripts/worklog.ps1 end "Descripción breve de lo realizado en esta sesión"

# Linux / macOS
bash scripts/worklog.sh end "Descripción breve de lo realizado en esta sesión"
```

El script automáticamente:
1. Registra la hora de cierre
2. Calcula los minutos invertidos en la sesión
3. Actualiza el total acumulado en `WORKLOG.md`

---

## Referencia rápida de comandos

| Comando | Acción |
|---|---|
| `worklog.ps1 init [proyecto]` | Inicializa `WORKLOG.md` |
| `worklog.ps1 start [agente] [modelo]` | Abre una nueva sesión |
| `worklog.ps1 end [resumen]` | Cierra la sesión abierta y actualiza totales |

---

## Notas

- El registro se guarda en `WORKLOG.md` en **orden descendente** (sesión más reciente primero).
- El autor registrado es siempre **drincast** (Rubén Orozco).
- Si una sesión quedó abierta de una sesión anterior, `end` la cerrará calculando el tiempo desde su inicio.
- **Compatibilidad:** Windows (PowerShell 5.1+), Linux y macOS (pwsh o bash + Python 3).
- `worklog.sh` requiere Python 3 para el cálculo de duración al cerrar sesión.
