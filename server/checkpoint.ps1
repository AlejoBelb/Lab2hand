$fecha = Get-Date -Format "yyyy-MM-dd HH:mm"
$texto = "`n---`n🕒 **Última sincronización con GitHub:** $fecha — 100 % sincronizado.`n"
Add-Content -Path "README.md" -Value $texto
git add README.md
git commit -m "Checkpoint automático de sincronización ($fecha)"
git push origin main
