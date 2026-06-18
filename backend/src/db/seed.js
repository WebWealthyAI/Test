/**
 * Seed-Daten für den MOCK-Modus: ein Admin, ein Verkäufer, ein Käufer und
 * ein paar Produkte – damit die App ohne weitere Schritte demonstrierbar ist.
 */
const store = require('./store');
const { User, Product, ROLES } = require('../models');

function seedIfEmpty() {
  if (store.users.length > 0) return;

  const admin = User({ email: 'admin@tradelater.ch', full_name: 'Admin', role: ROLES.ADMIN, password_hash: 'hashed:admin123' });
  const seller = User({
    email: 'verkaeufer@tradelater.ch',
    full_name: 'Verkäufer Vreni',
    role: ROLES.SELLER,
    password_hash: 'hashed:seller123',
    stripe_account_id: 'acct_mock_seed0001',
  });
  const buyer = User({ email: 'kaeufer@tradelater.ch', full_name: 'Käufer Kurt', role: ROLES.BUYER, password_hash: 'hashed:buyer123' });

  store.users.push(admin, seller, buyer);

  store.products.push(
    Product({
      seller_id: seller.id,
      title: 'Vintage Rennrad – Cilo',
      description: 'Schweizer Rennrad, top gewartet, Rahmengrösse 56.',
      price: 450,
      category: 'velo',
      images: ['https://picsum.photos/seed/velo/600/400'],
      stock: 1,
      location: 'Zürich',
      seo: { keywords: ['rennrad', 'cilo', 'vintage', 'velo zürich'], meta_title: 'Vintage Cilo Rennrad', meta_description: 'Gepflegtes Schweizer Rennrad in Zürich.' },
    }),
    Product({
      seller_id: seller.id,
      title: 'MacBook Air M1',
      description: '256 GB, kaum gebraucht, mit Originalverpackung.',
      price: 720,
      category: 'elektronik',
      images: ['https://picsum.photos/seed/macbook/600/400'],
      stock: 2,
      location: 'Bern',
      seo: { keywords: ['macbook', 'm1', 'laptop'], meta_title: 'MacBook Air M1', meta_description: 'MacBook Air M1 günstig kaufen.' },
    }),
    Product({
      seller_id: seller.id,
      title: 'Designer Sofa – 3-Sitzer',
      description: 'Graues Stoffsofa, nur Abholung in Luzern.',
      price: 300,
      category: 'moebel',
      images: ['https://picsum.photos/seed/sofa/600/400'],
      stock: 1,
      delivery_options: ['pickup'],
      location: 'Luzern',
    }),
  );

  // eslint-disable-next-line no-console
  console.log('[seed] Mock-Daten geladen: admin@/verkaeufer@/kaeufer@tradelater.ch (PW: admin123/seller123/buyer123)');
}

module.exports = { seedIfEmpty };

// Direkt ausführbar: `npm run seed`
if (require.main === module) {
  seedIfEmpty();
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ users: store.users.length, products: store.products.length }, null, 2));
}
