# actualizar.ps1
# Genera mi_guia.xml y lo sube a GitHub. Pensado para el Programador de tareas de Windows.

Set-Location 'C:\Users\808andrex\Dev\TV-KEVIN'
Start-Transcript -Path "$env:TEMP\epg-tvkevin.log" -Append | Out-Null

Write-Host "=== $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ==="

# Trae lo último del repo por si cambiaste algo desde otro lado
git pull --rebase --autostash

# Genera la guía
node index.js
if ($LASTEXITCODE -ne 0) {
    Write-Host 'node index.js falló, no se sube nada.'
    Stop-Transcript | Out-Null
    exit 1
}

# Sube solo mi_guia.xml y solo si cambió
git add mi_guia.xml
git diff --staged --quiet -- mi_guia.xml
if ($LASTEXITCODE -ne 0) {
    git commit mi_guia.xml -m "Actualización automática del EPG"
    git push
} else {
    Write-Host 'Sin cambios en mi_guia.xml.'
}

Stop-Transcript | Out-Null
