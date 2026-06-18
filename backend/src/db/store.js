/**
 * In-Memory Mock-Store für den Prototyp.
 * Spiegelt die Supabase-Tabellen wider, sodass Services unabhängig von der
 * tatsächlichen Datenbank entwickelt und demonstriert werden können.
 */
const store = {
  users: [],
  products: [],
  orders: [],
  offers: [],
  transactions: [],
  shipments: [],
  ads: [],
  reports: [],
  seoSettings: {
    siteTitle: 'Tradelater.ch – Lokaler Marktplatz',
    metaDescription: 'Kaufe und verkaufe lokal mit sicherem Treuhand-Schutz.',
    defaultKeywords: ['marktplatz', 'schweiz', 'treuhand', 'escrow', 'lokal'],
    robots: 'index, follow',
  },
};

module.exports = store;
