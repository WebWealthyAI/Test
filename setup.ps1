# Tradelater.ch - lokales Setup fuer Windows (PowerShell)
# Aufruf:  powershell -ExecutionPolicy Bypass -File setup.ps1

Write-Host "Tradelater.ch - lokales Setup" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js fehlt. Bitte installieren: https://nodejs.org (LTS, v18+)" -ForegroundColor Red
  exit 1
}
Write-Host ("OK Node " + (node -v))

Write-Host ""
Write-Host "Backend-Abhaengigkeiten installieren..."
npm --prefix backend install

Write-Host ""
Write-Host "Frontend-Abhaengigkeiten installieren..."
npm --prefix frontend install

if (-not (Test-Path backend\.env))  { Copy-Item backend\.env.example  backend\.env;  Write-Host "OK backend/.env angelegt" }
if (-not (Test-Path frontend\.env)) { Copy-Item frontend\.env.example frontend\.env; Write-Host "OK frontend/.env angelegt" }

Write-Host ""
Write-Host "Fertig! So startest du:" -ForegroundColor Green
Write-Host "   Terminal 1:  npm run backend     (API auf http://localhost:4000, Mock-Modus)"
Write-Host "   Terminal 2:  npm run frontend    (Expo - dann 'w' fuer Browser / QR fuer Handy)"
Write-Host ""
Write-Host "Demo-Logins: kaeufer@ / verkaeufer@ / admin@tradelater.ch (PW: buyer123 / seller123 / admin123)"
