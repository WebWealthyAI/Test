# Tradelater.ch

Lokaler B2C- & B2B-Marktplatz mit sicherem Treuhand-Zahlungssystem (Escrow via Stripe Connect)
und integrierter Verhandlungsfunktion.

> **Status:** Funktionsfähiger Prototyp / Scaffold. Backend läuft mit In-Memory-Mock-Daten,
> sodass die End-to-End-Flows ohne externe Keys demonstrierbar sind. Supabase und Stripe sind
> über Konfiguration aktivierbar.

## Architektur

```
Test/
├── backend/        Node.js / Express API (Supabase + Stripe Connect Escrow)
└── frontend/       React Native (Expo) App mit NativeWind/TailwindCSS
```

| Schicht   | Technologie                                            |
|-----------|--------------------------------------------------------|
| App       | React Native (Expo), React Navigation, NativeWind      |
| Backend   | Node.js, Express                                       |
| Datenbank | Supabase (PostgreSQL, Auth, Realtime)                  |
| Payments  | Stripe Connect (Treuhand / Escrow)                     |

## Kern-Workflows

**Inserat-Flow:** Foto-Upload → Beschreibung → Preis → Online

**Kauf-Flow:** Entdecken → Offerte/Direktkauf → Zahlung (Geld blockiert) →
Logistik → Käufer bestätigt Erhalt → Geld an Verkäufer freigegeben

## Rollen

- **Admin** – SEO, Monitoring, Escrow-Überwachung, User-Management, Logistik, Ads, Offerten-Logs
- **Verkäufer (Supplier)** – Produkt-Upload, SEO-Tags, Inventar, Orders, Marketing ("Push to Top")
- **Käufer (Demander)** – Discover, Offerten/Verhandlung, Stripe Checkout, "Erhalt bestätigen"

## Schnellstart

### Backend
```bash
cd backend
cp .env.example .env       # optional: Supabase/Stripe Keys eintragen
npm install
npm run dev                # http://localhost:4000  (läuft im MOCK-Modus ohne Keys)
```

### Frontend
```bash
cd frontend
cp .env.example .env       # EXPO_PUBLIC_API_URL setzen
npm install
npm start                  # Expo Dev Server
```

## Treuhand / Escrow (Stripe Connect)

1. Käufer zahlt → `PaymentIntent` mit `capture_method: manual` + `transfer_data` (Geld **blockiert/authorisiert**).
2. Ware unterwegs → Status `shipped` / `delivered`.
3. Käufer drückt **"Artikel erhalten & geprüft"** → Capture + Transfer an Verkäufer-Konto (**Freigabe**).
4. Streitfall → Admin kann via Dispute-Route stornieren/refunden.

Siehe `backend/src/services/escrowService.js` und `backend/src/routes/payments.routes.js`.
