# 💻 Tradelater.ch lokal auf deinem Laptop einrichten

Schritt-für-Schritt, um das Projekt auf deinem eigenen Rechner zu klonen und zu starten.

## 1. Voraussetzungen (einmalig installieren)

| Tool | Wozu | Download |
|------|------|----------|
| **Node.js** (LTS, v18+) | Backend & Frontend | https://nodejs.org |
| **Git** | Repo klonen | https://git-scm.com |
| **VS Code** | Code ansehen/bearbeiten | https://code.visualstudio.com |
| *(optional)* **Expo Go** App | App auf dem Handy testen | App Store / Play Store |

Prüfen im Terminal:
```bash
node -v    # sollte v18 oder höher zeigen
git --version
```

## 2. Repository klonen

```bash
git clone https://github.com/WebWealthyAI/Test.git tradelater
cd tradelater
git checkout claude/tradelater-marketplace-build-clok0x
code .        # öffnet VS Code
```

## 3. Automatisches Setup

**macOS / Linux:**
```bash
bash setup.sh
```

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1
```

*(Oder manuell, plattformunabhängig:)*
```bash
npm run setup       # installiert backend + frontend
```

## 4. Starten (zwei Terminals)

**Terminal 1 – Backend** (läuft ohne Keys im Mock-Modus, mit Demo-Daten):
```bash
npm run backend
# -> Tradelater API läuft auf http://localhost:4000
```

**Terminal 2 – Frontend** (Expo):
```bash
npm run frontend
```
Dann im Expo-Menü:
- **`w`** drücken → öffnet die App im **Browser** (am schnellsten zum Anschauen)
- oder **QR-Code** mit der **Expo Go**-App auf dem Handy scannen
- oder **`a`** / **`i`** für Android-/iOS-Simulator

> 💡 Testest du auf dem **Handy**, ersetze in `frontend/.env` `localhost` durch die
> lokale IP deines Laptops (z. B. `http://192.168.1.50:4000/api`), damit das Handy
> das Backend erreicht.

## 5. Einloggen

Auf dem Login-Screen gibt es **Demo-Buttons**. Oder manuell:

| Rolle      | E-Mail                     | Passwort   |
|------------|----------------------------|------------|
| Käufer     | kaeufer@tradelater.ch      | buyer123   |
| Verkäufer  | verkaeufer@tradelater.ch   | seller123  |
| Admin      | admin@tradelater.ch        | admin123   |

## 6. Echte Dienste aktivieren (optional, später)

Im Mock-Modus brauchst du nichts. Für echte Daten/Zahlungen die Keys in
`backend/.env` eintragen:
- **Supabase:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Schema: `backend/src/db/schema.sql`)
- **Stripe Connect:** `STRIPE_SECRET_KEY`

Sobald gesetzt, schaltet das Backend automatisch vom Mock- in den Live-Modus.

## Problembehebung

- **`npm run frontend` schlägt fehl:** `cd frontend && npx expo install --fix` ausführen.
- **Port 4000 belegt:** in `backend/.env` `PORT=4001` setzen und in `frontend/.env` die `EXPO_PUBLIC_API_URL` anpassen.
- **Handy erreicht Backend nicht:** Laptop-IP statt `localhost` verwenden (siehe Schritt 4).
