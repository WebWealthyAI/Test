/**
 * Erzeugt eine visuelle Vorschau (PNG) der wichtigsten Tradelater-Screens.
 * Reines SVG -> PNG via @resvg/resvg-js, ohne Browser.
 *
 *   node preview/generate-preview.js
 */
const fs = require('fs');
const path = require('path');

const BRAND = '#0F766E';
const BRAND_DARK = '#115E59';
const ACCENT = '#F59E0B';
const BG = '#F3F4F6';
const INK = '#111827';
const MUTED = '#6B7280';
const GREEN = '#10B981';

const FONT = 'Liberation Sans, Arial, sans-serif';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function t(x, y, str, { size = 14, fill = INK, weight = 'normal', anchor = 'start' } = {}) {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}">${esc(str)}</text>`;
}
function rect(x, y, w, h, { fill = '#fff', rx = 0, stroke, sw = 1 } = {}) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}/>`;
}
function badge(x, y, label, color) {
  const w = 16 + label.length * 6.2;
  return `${rect(x, y, w, 20, { fill: `${color}22`, rx: 10 })}${t(x + w / 2, y + 14, label, { size: 10, fill: color, weight: 'bold', anchor: 'middle' })}`;
}
function pill(x, y, w, h, label, { fill = BRAND, fg = '#fff', size = 13 } = {}) {
  return `${rect(x, y, w, h, { fill, rx: h / 2 })}${t(x + w / 2, y + h / 2 + size / 3, label, { size, fill: fg, weight: 'bold', anchor: 'middle' })}`;
}

const PW = 300; const PH = 600; // phone content size

// Telefon-Rahmen + Inhalt
function phone(x, y, title, headerColor, bodyFn) {
  const inner = bodyFn(x + 12, y + 64); // body start below status+header
  return `
  <g>
    ${rect(x - 6, y - 6, PW + 12, PH + 12, { fill: '#1F2937', rx: 34 })}
    ${rect(x, y, PW, PH, { fill: BG, rx: 28 })}
    <clipPath id="clip_${x}_${y}"><rect x="${x}" y="${y}" width="${PW}" height="${PH}" rx="28"/></clipPath>
    <g clip-path="url(#clip_${x}_${y})">
      ${rect(x, y, PW, 56, { fill: headerColor })}
      ${rect(x + PW / 2 - 35, y + 8, 70, 5, { fill: '#00000033', rx: 3 })}
      ${t(x + 16, y + 44, title, { size: 17, fill: '#fff', weight: 'bold' })}
      ${inner}
    </g>
  </g>`;
}

function card(x, y, w, h, inner) {
  return `${rect(x, y, w, h, { fill: '#fff', rx: 14, stroke: '#E5E7EB' })}${inner}`;
}

// ---- Screen 1: Discover (Käufer) ----
function discover(x, y) {
  const cw = PW - 24;
  const prod = (py, name, sub, price, tag, tagColor) =>
    card(x, py, cw, 92,
      rect(x + 10, py + 12, 68, 68, { fill: '#CBD5E1', rx: 10 }) +
      t(x + 90, py + 30, name, { size: 14, weight: 'bold' }) +
      t(x + 90, py + 48, sub, { size: 11, fill: MUTED }) +
      t(x + 90, py + 72, price, { size: 16, fill: BRAND, weight: 'bold' }) +
      (tag ? badge(x + cw - 96, py + 62, tag, tagColor) : ''));
  return [
    rect(x, y, cw, 38, { fill: '#fff', rx: 10, stroke: '#E5E7EB' }),
    t(x + 14, y + 24, '🔍  Suche nach Produkten…', { size: 12, fill: MUTED }),
    prod(y + 50, 'Vintage Rennrad – Cilo', 'Zürich · velo', 'CHF 450.00', 'Offerte', BRAND),
    prod(y + 152, 'MacBook Air M1', 'Bern · elektronik', 'CHF 720.00', '⭐ Top', ACCENT),
    prod(y + 254, 'Designer Sofa 3-Sitzer', 'Luzern · moebel', 'CHF 300.00', 'Abholung', '#6366F1'),
    prod(y + 356, 'iPhone 13 128GB', 'Genf · elektronik', 'CHF 480.00', 'Offerte', BRAND),
    // bottom tab bar
    rect(x - 12, y + PH - 116, PW, 56, { fill: '#fff', stroke: '#E5E7EB' }),
    t(x + 22, y + PH - 80, '🔍', { size: 18 }), t(x + 18, y + PH - 64, 'Entdecken', { size: 9, fill: BRAND }),
    t(x + 110, y + PH - 80, '🤝', { size: 18 }), t(x + 104, y + PH - 64, 'Offerten', { size: 9, fill: MUTED }),
    t(x + 190, y + PH - 80, '📦', { size: 18 }), t(x + 176, y + PH - 64, 'Bestellungen', { size: 9, fill: MUTED }),
  ].join('');
}

// ---- Screen 2: Produktdetail + Offerte ----
function productDetail(x, y) {
  const cw = PW - 24;
  return [
    rect(x, y, cw, 130, { fill: '#CBD5E1', rx: 14 }),
    t(x, y + 158, 'Vintage Rennrad – Cilo', { size: 18, weight: 'bold' }),
    t(x, y + 184, 'CHF 450.00', { size: 22, fill: BRAND, weight: 'bold' }),
    badge(x + 150, y + 170, 'Lager: 1', GREEN),
    t(x, y + 208, 'Zürich · velo · Versand, Abholung', { size: 11, fill: MUTED }),
    card(x, y + 222, cw, 56, t(x + 12, y + 244, 'Schweizer Rennrad, top gewartet,', { size: 12, fill: '#374151' }) + t(x + 12, y + 262, 'Rahmengrösse 56.', { size: 12, fill: '#374151' })),
    pill(x, y + 290, cw, 44, 'Direkt kaufen (Treuhand)'),
    // Offer card
    card(x, y + 346, cw, 188,
      t(x + 12, y + 372, 'Preis vorschlagen', { size: 15, weight: 'bold' }) +
      t(x + 12, y + 392, 'Verhandle einen fairen Preis.', { size: 11, fill: MUTED }) +
      t(x + 12, y + 414, 'Dein Angebot (CHF)', { size: 11, fill: '#374151' }) +
      rect(x + 12, y + 422, cw - 24, 36, { fill: '#fff', rx: 8, stroke: '#D1D5DB' }) +
      t(x + 22, y + 445, '405', { size: 14 }) +
      pill(x + 12, y + 478, cw - 24, 42, 'Offerte senden', { fill: ACCENT })),
  ].join('');
}

// ---- Screen 3: Checkout / Treuhand ----
function checkout(x, y) {
  const cw = PW - 24;
  return [
    card(x, y, cw, 70,
      t(x + 12, y + 28, 'Vintage Rennrad – Cilo', { size: 14, weight: 'bold' }) +
      t(x + 12, y + 52, 'Betrag', { size: 12, fill: MUTED }) +
      t(x + cw - 12, y + 52, 'CHF 450.00', { size: 16, fill: BRAND, weight: 'bold', anchor: 'end' })),
    card(x, y + 84, cw, 110,
      t(x + 12, y + 110, 'Lieferung', { size: 14, weight: 'bold' }) +
      pill(x + 12, y + 124, (cw - 32) / 2, 38, 'Versand') +
      rect(x + 24 + (cw - 32) / 2, y + 124, (cw - 32) / 2, 38, { fill: '#fff', rx: 19, stroke: '#D1D5DB' }) +
      t(x + 24 + (cw - 32) / 2 + (cw - 32) / 4, y + 148, 'Abholung', { size: 13, fill: MUTED, anchor: 'middle' }) +
      t(x + 12, y + 184, 'Lieferadresse: Bahnhofstr. 1, 8001 ZH', { size: 11, fill: '#374151' })),
    // escrow notice
    rect(x, y + 206, cw, 92, { fill: '#CCFBF1', rx: 14, stroke: '#99F6E4' }),
    t(x + 16, y + 234, '🔒', { size: 20 }),
    t(x + 44, y + 232, 'Treuhand-Schutz', { size: 13, fill: BRAND_DARK, weight: 'bold' }),
    t(x + 44, y + 252, 'Dein Geld wird sicher blockiert und', { size: 11, fill: BRAND_DARK }),
    t(x + 44, y + 268, 'erst freigegeben, wenn du den Erhalt', { size: 11, fill: BRAND_DARK }),
    t(x + 44, y + 284, 'bestätigst.', { size: 11, fill: BRAND_DARK }),
    pill(x, y + 318, cw, 48, 'Jetzt bezahlen · CHF 450.00'),
    t(x + cw / 2, y + 400, 'Stripe Connect · manual capture', { size: 10, fill: MUTED, anchor: 'middle' }),
  ].join('');
}

// ---- Screen 4: Order Tracking ----
function tracking(x, y) {
  const cw = PW - 24;
  const ev = (py, label, time) =>
    `<circle cx="${x + 18}" cy="${py - 4}" r="5" fill="${BRAND}"/>` +
    t(x + 34, py, label, { size: 12, fill: '#374151' }) +
    t(x + cw - 4, py, time, { size: 9, fill: MUTED, anchor: 'end' });
  return [
    card(x, y, cw, 62,
      t(x + 12, y + 28, 'Vintage Rennrad – Cilo', { size: 14, weight: 'bold' }) +
      badge(x + 12, y + 38, 'Versendet', '#6366F1') +
      t(x + cw - 12, y + 44, 'CHF 450.00', { size: 15, fill: BRAND, weight: 'bold', anchor: 'end' })),
    card(x, y + 76, cw, 150,
      t(x + 12, y + 102, 'Lieferung', { size: 14, weight: 'bold' }) +
      t(x + 12, y + 122, 'Swiss Post · TL839201744', { size: 11, fill: MUTED }) +
      ev(y + 150, 'Versandlabel erstellt', '14:02') +
      ev(y + 176, 'Abgeholt vom Verkäufer', '16:30') +
      ev(y + 202, 'In Zustellung', 'heute')),
    rect(x, y + 238, cw, 50, { fill: '#CCFBF1', rx: 14, stroke: '#99F6E4' }),
    t(x + 14, y + 268, '🔒 Geld sicher blockiert bis Bestätigung', { size: 11, fill: BRAND_DARK }),
    pill(x, y + 304, cw, 48, '✓ Artikel erhalten & geprüft', { fill: GREEN }),
    rect(x, y + 364, cw, 42, { fill: '#fff', rx: 12, stroke: '#E5E7EB' }),
    t(x + cw / 2, y + 390, 'Problem melden (Streitfall)', { size: 12, fill: MUTED, anchor: 'middle' }),
  ].join('');
}

// ---- Screen 5: Seller Dashboard ----
function sellerDash(x, y) {
  const cw = PW - 24;
  const stat = (sx, w, value, label, color) =>
    card(sx, y, w, 76, t(sx + 12, y + 38, value, { size: 20, fill: color, weight: 'bold' }) + t(sx + 12, y + 60, label, { size: 10, fill: MUTED }));
  return [
    t(x, y - 24, 'Hallo, Verkäufer Vreni', { size: 17, weight: 'bold' }),
    stat(x, (cw - 10) / 2, '2', 'Offene Aufträge', ACCENT),
    stat(x + (cw - 10) / 2 + 10, (cw - 10) / 2, '1', 'Versendet', '#6366F1'),
    card(x, y + 90, cw, 70, t(x + 12, y + 130, 'CHF 1’170.00', { size: 20, fill: GREEN, weight: 'bold' }) + t(x + 12, y + 150, 'Umsatz (freigegeben)', { size: 10, fill: MUTED })),
    card(x, y + 174, cw, 84,
      t(x + 12, y + 200, 'Treuhand-Auszahlung', { size: 14, weight: 'bold' }) +
      t(x + 12, y + 222, 'Stripe-Connect: acct_…seed0001', { size: 11, fill: MUTED }) +
      t(x + 12, y + 242, 'Auszahlung nach Käufer-Bestätigung', { size: 11, fill: MUTED })),
    card(x, y + 272, cw, 130,
      t(x + 12, y + 298, 'Letzte Bestellungen', { size: 14, weight: 'bold' }) +
      t(x + 12, y + 324, '#b15fef53', { size: 11, fill: '#374151' }) + t(x + 110, y + 324, 'completed', { size: 11, fill: GREEN }) + t(x + cw - 12, y + 324, 'CHF 450', { size: 11, weight: 'bold', anchor: 'end' }) +
      t(x + 12, y + 348, '#7a91c0d2', { size: 11, fill: '#374151' }) + t(x + 110, y + 348, 'funds_held', { size: 11, fill: ACCENT }) + t(x + cw - 12, y + 348, 'CHF 680', { size: 11, weight: 'bold', anchor: 'end' }) +
      t(x + 12, y + 372, '#c2e0aa10', { size: 11, fill: '#374151' }) + t(x + 110, y + 372, 'shipped', { size: 11, fill: '#6366F1' }) + t(x + cw - 12, y + 372, 'CHF 300', { size: 11, weight: 'bold', anchor: 'end' })),
  ].join('');
}

// ---- Screen 6: Admin Escrow Monitor ----
function adminEscrow(x, y) {
  const cw = PW - 24;
  const txRow = (py, amount, status, color) =>
    card(x, py, cw, 60,
      t(x + 12, py + 28, amount, { size: 15, weight: 'bold' }) +
      badge(x + cw - 96, py + 14, status, color) +
      t(x + 12, py + 48, 'Order #b15fef53 · Gebühr CHF 31.50', { size: 10, fill: MUTED }));
  return [
    t(x, y - 24, 'Treuhand-Monitor', { size: 17, weight: 'bold' }),
    rect(x, y, cw, 96, { fill: '#CCFBF1', rx: 14, stroke: '#99F6E4' }),
    t(x + 14, y + 28, 'Blockiert', { size: 12, fill: BRAND_DARK }) + t(x + cw - 14, y + 28, 'CHF 980.00', { size: 13, fill: BRAND_DARK, weight: 'bold', anchor: 'end' }),
    t(x + 14, y + 54, 'Freigegeben', { size: 12, fill: BRAND_DARK }) + t(x + cw - 14, y + 54, 'CHF 1’170.00', { size: 13, fill: BRAND_DARK, weight: 'bold', anchor: 'end' }),
    t(x + 14, y + 80, 'Gebühren', { size: 12, fill: BRAND_DARK }) + t(x + cw - 14, y + 80, 'CHF 150.50', { size: 13, fill: BRAND_DARK, weight: 'bold', anchor: 'end' }),
    txRow(y + 110, 'CHF 450.00', 'Freigegeben', GREEN),
    txRow(y + 180, 'CHF 680.00', 'Blockiert', ACCENT),
    txRow(y + 250, 'CHF 300.00', 'Eingezogen', '#3B82F6'),
    pill(x, y + 318, cw, 42, 'An Käufer erstatten (Streitfall)', { fill: '#EF4444' }),
  ].join('');
}

// ---- Compose poster ----
const COL = PW + 60;
const ROW = PH + 120;
const cols = 3;
const W = COL * cols + 40;
const H = ROW * 2 + 120;

const screens = [
  ['Käufer · Entdecken', BRAND, discover],
  ['Käufer · Produkt & Offerte', BRAND, productDetail],
  ['Käufer · Kasse (Treuhand)', BRAND, checkout],
  ['Käufer · Tracking & Freigabe', BRAND, tracking],
  ['Verkäufer · Dashboard', BRAND_DARK, sellerDash],
  ['Admin · Treuhand-Monitor', BRAND_DARK, adminEscrow],
];

let body = '';
screens.forEach((s, i) => {
  const col = i % cols;
  const row = Math.floor(i / cols);
  const x = 40 + col * COL;
  const y = 150 + row * ROW;
  body += t(x + PW / 2, y - 18, s[0], { size: 16, fill: '#E5E7EB', weight: 'bold', anchor: 'middle' });
  body += phone(x, y, s[0].split('·')[1].trim(), s[1], s[2]);
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0B3D3A"/><stop offset="1" stop-color="#062826"/>
  </linearGradient></defs>
  ${rect(0, 0, W, H, { fill: 'url(#bg)' })}
  ${t(40, 70, 'Tradelater.ch', { size: 44, fill: '#fff', weight: 'bold' })}
  ${t(40, 104, 'Lokaler Marktplatz · Treuhand-Schutz (Escrow) · Verhandlung — Prototyp UI-Vorschau', { size: 18, fill: '#5EEAD4' })}
  ${body}
</svg>`;

const outDir = path.join(__dirname);
fs.writeFileSync(path.join(outDir, 'tradelater-preview.svg'), svg);

try {
  const { Resvg } = require('@resvg/resvg-js');
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: W } });
  fs.writeFileSync(path.join(outDir, 'tradelater-preview.png'), resvg.render().asPng());
  console.log('PNG + SVG erzeugt in', outDir);
} catch (e) {
  console.log('SVG erzeugt (PNG übersprungen:', e.message, ')');
}
