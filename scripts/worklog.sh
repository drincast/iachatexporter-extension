#!/usr/bin/env bash
# Registro de sesiones de trabajo para proyectos colaborativos humano-agente.
# Requiere: bash 4+ y Python 3 (para cierre de sesión con cálculo de duración).
# Uso:
#   bash scripts/worklog.sh init [nombre-proyecto]
#   bash scripts/worklog.sh start "Claude Code" "claude-sonnet-4-6"
#   bash scripts/worklog.sh end "Fix descarga Firefox"

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$(realpath "$SCRIPT_DIR/../WORKLOG.md")"

COMMAND="${1:-}"
ARG1="${2:-}"
ARG2="${3:-}"

get_tz() {
    python3 -c "
import datetime
now = datetime.datetime.now().astimezone()
offset = now.utcoffset()
total = int(offset.total_seconds())
sign = '+' if total >= 0 else '-'
total = abs(total)
h, m = divmod(total // 60, 60)
print(f'{sign}{h:02d}:{m:02d}')
"
}

do_init() {
    local project="${1:-}"
    if [ -f "$LOG_FILE" ]; then
        echo "WORKLOG.md ya existe en: $LOG_FILE"
        return 0
    fi
    [ -z "$project" ] && project="$(basename "$(pwd)")"
    cat > "$LOG_FILE" << EOF
# Work Log — $project

> **Total:** 0 sessions · 0 min · 0h 00min · Last: —

---
EOF
    echo "Inicializado: $LOG_FILE (proyecto: $project)"
}

case "$COMMAND" in
    init)
        do_init "$ARG1"
        ;;

    start)
        [ -f "$LOG_FILE" ] || do_init ""
        agent="${ARG1:-Unknown Agent}"
        model="${ARG2:+ ($ARG2)}"
        now=$(date "+%Y-%m-%d %H:%M")
        sid=$(date "+%Y-%m-%dT%H:%M")
        tz=$(get_tz)

        # Bloque de nueva sesión (insertar después del primer ---)
        block="\n## Session ${sid} | drincast x ${agent}\n- **Agent:** ${agent}${model}\n- **Start:** ${now} ${tz}\n- **End:** —\n- **Duration:** —\n- **Summary:** —"

        if grep -q "^---$" "$LOG_FILE"; then
            awk -v b="$block" '
                /^---$/ && !done { print; printf "%s\n", b; done=1; next }
                { print }
            ' "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
        else
            printf "\n%s\n" "$block" >> "$LOG_FILE"
        fi

        echo "Sesion iniciada: ${sid} | drincast x ${agent}"
        ;;

    end)
        [ -f "$LOG_FILE" ] || { echo "Error: WORKLOG.md no encontrado."; exit 1; }
        summary="${ARG1:-—}"

        python3 - "$LOG_FILE" "$summary" << 'PYEOF'
import sys, re
from datetime import datetime
from pathlib import Path

log_path = Path(sys.argv[1])
summary  = sys.argv[2]
lines    = log_path.read_text(encoding="utf-8").splitlines()

now     = datetime.now().astimezone()
now_str = now.strftime("%Y-%m-%d %H:%M")
raw_tz  = now.strftime("%z")
tz_fmt  = f"{raw_tz[:3]}:{raw_tz[3:]}"

header_idx = -1; start_time = None
end_idx = dur_idx = sum_idx = -1

i = 0
while i < len(lines):
    if re.match(r"^## Session .+ \| drincast", lines[i]):
        l_start = None; l_end = l_dur = l_sum = -1; found = False
        for j in range(i + 1, min(i + 10, len(lines))):
            # Detener el escaneo al llegar al siguiente bloque de sesion para no leer su Start.
            if re.match(r"^## Session .+ \| drincast", lines[j]):
                break
            m = re.match(r"^- \*\*Start:\*\* (\d{4}-\d{2}-\d{2} \d{2}:\d{2})", lines[j])
            if m:
                l_start = datetime.strptime(m.group(1), "%Y-%m-%d %H:%M")
            if re.match(r"^- \*\*End:\*\* —", lines[j]):
                l_end = j; found = True
            if re.match(r"^- \*\*Duration:\*\* —", lines[j]):
                l_dur = j
            if re.match(r"^- \*\*Summary:\*\* —", lines[j]):
                l_sum = j
        if found:
            header_idx = i; start_time = l_start
            end_idx = l_end; dur_idx = l_dur; sum_idx = l_sum
            break
    i += 1

if header_idx == -1:
    print("No hay sesion abierta.")
    sys.exit(1)

dur_min = 0
if start_time:
    dur_min = max(0, int((now.replace(tzinfo=None) - start_time).total_seconds() / 60))
h, m = divmod(dur_min, 60)
dur_str = f"{h}h {m:02d}min"

if end_idx >= 0: lines[end_idx] = f"- **End:** {now_str} {tz_fmt}"
if dur_idx >= 0: lines[dur_idx] = f"- **Duration:** {dur_min} min ({dur_str})"
if sum_idx >= 0: lines[sum_idx] = f"- **Summary:** {summary}"

for i, line in enumerate(lines):
    mt = re.match(r"^> \*\*Total:\*\* (\d+) sessions · (\d+) min", line)
    if mt:
        s      = int(mt.group(1)) + 1
        total  = int(mt.group(2)) + dur_min
        th, tm = divmod(total, 60)
        today  = now.strftime("%Y-%m-%d")
        lines[i] = f"> **Total:** {s} sessions · {total} min · {th}h {tm:02d}min · Last: {today}"
        break

log_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"Sesion cerrada. Duracion: {dur_min} min ({dur_str})")
PYEOF
        ;;

    *)
        echo "Uso: bash scripts/worklog.sh <comando> [args]"
        echo ""
        echo "Comandos:"
        echo "  init [nombre-proyecto]         Crea WORKLOG.md"
        echo "  start [agente] [modelo]        Abre una nueva sesion"
        echo "  end   [resumen]                Cierra la sesion abierta"
        echo ""
        echo "Ejemplos:"
        echo "  bash scripts/worklog.sh init"
        echo "  bash scripts/worklog.sh start \"Claude Code\" \"claude-sonnet-4-6\""
        echo "  bash scripts/worklog.sh end \"Fix parser Gemini\""
        ;;
esac
