#Requires -Version 5.1
<#
.SYNOPSIS
    Registro de sesiones de trabajo para proyectos colaborativos humano-agente.
.EXAMPLE
    pwsh  scripts/worklog.ps1 init
    pwsh  scripts/worklog.ps1 start "Claude Code" "claude-sonnet-4-6"
    pwsh  scripts/worklog.ps1 end   "Fix descarga Firefox, fallback Base64"
#>
param(
    [Parameter(Position = 0)] [string]$Command = "",
    [Parameter(Position = 1)] [string]$Arg1    = "",
    [Parameter(Position = 2)] [string]$Arg2    = ""
)

$ErrorActionPreference = "Stop"
$UTF8   = [System.Text.UTF8Encoding]::new($false)
$DASH   = [char]0x2014   # em dash: -
$DOT    = [char]0x00B7   # middle dot: *
$LogFile = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\WORKLOG.md"))

function Format-Duration([int]$Min) {
    "$([Math]::Floor($Min/60))h $("{0:D2}" -f ($Min % 60))min"
}

function Get-TzString {
    $o    = [System.TimeZoneInfo]::Local.GetUtcOffset([DateTime]::Now)
    $sign = if ($o.TotalMinutes -ge 0) { "+" } else { "-" }
    "$sign$("{0:D2}" -f [Math]::Abs($o.Hours)):$("{0:D2}" -f [Math]::Abs($o.Minutes))"
}

function Read-Log  { [System.IO.File]::ReadAllLines($LogFile, $UTF8) }
function Write-Log([string[]]$Lines) { [System.IO.File]::WriteAllLines($LogFile, $Lines, $UTF8) }

function Invoke-Init([string]$ProjectName) {
    if (Test-Path $LogFile) { Write-Host "WORKLOG.md ya existe en: $LogFile"; return }
    $project = if ($ProjectName) { $ProjectName } else { Split-Path (Get-Location) -Leaf }
    Write-Log @(
        "# Work Log $DASH $project",
        "",
        "> **Total:** 0 sessions $DOT 0 min $DOT 0h 00min $DOT Last: $DASH",
        "",
        "---"
    )
    Write-Host "Inicializado: $LogFile (proyecto: $project)"
}

switch ($Command.ToLower()) {

    "init" {
        Invoke-Init $Arg1
    }

    "start" {
        if (-not (Test-Path $LogFile)) { Invoke-Init "" }

        $agent  = if ($Arg1) { $Arg1 } else { "Unknown Agent" }
        $model  = if ($Arg2) { " ($Arg2)" } else { "" }
        $now    = Get-Date
        $sid    = $now.ToString("yyyy-MM-ddTHH:mm")
        $start  = $now.ToString("yyyy-MM-dd HH:mm")
        $tz     = Get-TzString

        $block = @(
            "",
            "## Session $sid | drincast x $agent",
            "- **Agent:** $agent$model",
            "- **Start:** $start $tz",
            "- **End:** $DASH",
            "- **Duration:** $DASH",
            "- **Summary:** $DASH"
        )

        $lines = [System.Collections.Generic.List[string]]::new()
        $lines.AddRange([string[]](Read-Log))

        $sepIdx = -1
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i].Trim() -eq "---") { $sepIdx = $i; break }
        }

        $result = [System.Collections.Generic.List[string]]::new()
        if ($sepIdx -eq -1) {
            $result.AddRange([string[]]$lines.ToArray())
            $result.AddRange([string[]]$block)
        } else {
            $result.AddRange([string[]]$lines[0..$sepIdx])
            $result.AddRange([string[]]$block)
            if (($sepIdx + 1) -lt $lines.Count) {
                $result.AddRange([string[]]$lines[($sepIdx + 1)..($lines.Count - 1)])
            }
        }

        Write-Log $result.ToArray()
        Write-Host "Sesion iniciada: $sid | drincast x $agent"
    }

    "end" {
        if (-not (Test-Path $LogFile)) {
            Write-Host "Error: WORKLOG.md no encontrado. Ejecuta 'start' primero."
            exit 1
        }

        $summary   = if ($Arg1) { $Arg1 } else { "$DASH" }
        $lines     = [System.Collections.Generic.List[string]]::new()
        $lines.AddRange([string[]](Read-Log))

        $headerIdx = -1; $startTime = $null
        $endIdx    = -1; $durIdx    = -1; $sumIdx = -1

        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match '^## Session .+ \| drincast') {
                $lStart = $null; $lEnd = -1; $lDur = -1; $lSum = -1; $open = $false
                $limit  = [Math]::Min($i + 10, $lines.Count)
                for ($j = $i + 1; $j -lt $limit; $j++) {
                    # Detener el escaneo al llegar al siguiente bloque de sesion para no leer su Start.
                    if ($lines[$j] -match '^## Session .+ \| drincast') { break }
                    if ($lines[$j] -match '^- \*\*Start:\*\* (\d{4}-\d{2}-\d{2} \d{2}:\d{2})') {
                        $lStart = [DateTime]::ParseExact(
                            $Matches[1], "yyyy-MM-dd HH:mm",
                            [System.Globalization.CultureInfo]::InvariantCulture)
                    }
                    if ($lines[$j] -match "^- \*\*End:\*\* $DASH")      { $lEnd = $j; $open = $true }
                    if ($lines[$j] -match "^- \*\*Duration:\*\* $DASH") { $lDur = $j }
                    if ($lines[$j] -match "^- \*\*Summary:\*\* $DASH")  { $lSum = $j }
                }
                if ($open) {
                    $headerIdx = $i; $startTime = $lStart
                    $endIdx    = $lEnd; $durIdx = $lDur; $sumIdx = $lSum
                    break
                }
            }
        }

        if ($headerIdx -eq -1) { Write-Host "No hay sesion abierta."; exit 1 }

        $now    = Get-Date
        $tz     = Get-TzString
        $durMin = if ($startTime) { [int]($now - $startTime).TotalMinutes } else { 0 }
        $durStr = Format-Duration $durMin

        if ($endIdx -ge 0) { $lines[$endIdx] = "- **End:** $($now.ToString('yyyy-MM-dd HH:mm')) $tz" }
        if ($durIdx -ge 0) { $lines[$durIdx] = "- **Duration:** $durMin min ($durStr)" }
        if ($sumIdx -ge 0) { $lines[$sumIdx] = "- **Summary:** $summary" }

        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match "^\> \*\*Total:\*\* (\d+) sessions .+ (\d+) min") {
                $s  = [int]$Matches[1] + 1
                $m  = [int]$Matches[2] + $durMin
                $d  = Format-Duration $m
                $dt = $now.ToString("yyyy-MM-dd")
                $lines[$i] = "> **Total:** $s sessions $DOT $m min $DOT $d $DOT Last: $dt"
                break
            }
        }

        Write-Log $lines.ToArray()
        Write-Host "Sesion cerrada. Duracion: $durMin min ($durStr)"
    }

    default {
        Write-Host @"
Uso: pwsh scripts/worklog.ps1 <comando> [args]

Comandos:
  init  [nombre-proyecto]        Crea WORKLOG.md
  start [agente] [modelo]        Abre una nueva sesion
  end   [resumen]                Cierra la sesion abierta y actualiza totales

Ejemplos:
  pwsh scripts/worklog.ps1 init
  pwsh scripts/worklog.ps1 start "Claude Code" "claude-sonnet-4-6"
  pwsh scripts/worklog.ps1 end "Fix parser Gemini, mejora exportador"
"@
    }
}
