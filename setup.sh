#!/usr/bin/env bash
# Tradelater.ch – lokales Setup für macOS / Linux
# Aufruf:  bash setup.sh
set -e

echo "🌍 Tradelater.ch – lokales Setup"
echo

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js fehlt. Bitte installieren: https://nodejs.org (LTS, v18+)"
  exit 1
fi
echo "✓ Node $(node -v)"

echo
echo "📦 Backend-Abhängigkeiten installieren..."
npm --prefix backend install

echo
echo "📦 Frontend-Abhängigkeiten installieren..."
npm --prefix frontend install

# .env-Dateien anlegen, falls nicht vorhanden
[ -f backend/.env ]  || cp backend/.env.example  backend/.env  && echo "✓ backend/.env angelegt"
[ -f frontend/.env ] || cp frontend/.env.example frontend/.env && echo "✓ frontend/.env angelegt"

echo
echo "✅ Fertig! So startest du:"
echo "   Terminal 1:  npm run backend     (API auf http://localhost:4000, Mock-Modus)"
echo "   Terminal 2:  npm run frontend    (Expo – dann 'w' für Browser / QR für Handy)"
echo
echo "Demo-Logins: kaeufer@ / verkaeufer@ / admin@tradelater.ch (PW: buyer123 / seller123 / admin123)"
