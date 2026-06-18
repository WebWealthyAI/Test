const { createRepository } = require('../db/repository');
const { Product, now } = require('../models');

const repo = createRepository('products');

async function create(sellerId, data) {
  const product = Product({ ...data, seller_id: sellerId });
  await repo.insert(product);
  return product;
}

async function update(id, sellerId, patch) {
  const product = await repo.find(id);
  if (!product) return { error: 'not_found' };
  if (product.seller_id !== sellerId) return { error: 'forbidden' };
  const allowed = [
    'title', 'description', 'price', 'category', 'images', 'stock',
    'status', 'allow_offers', 'delivery_options', 'location', 'seo',
  ];
  const clean = Object.fromEntries(
    Object.entries(patch).filter(([k]) => allowed.includes(k)),
  );
  const updated = await repo.update(id, clean);
  return { product: updated };
}

async function get(id) {
  return repo.find(id);
}

/**
 * Öffentliche Auflistung mit einfacher Suche, Kategorie-Filter und
 * Sortierung (geboostete Inserate zuerst -> "Push to Top").
 */
async function discover({ q, category, sellerId, includeAll } = {}) {
  let items = await repo.all(sellerId ? { seller_id: sellerId } : {});
  if (!includeAll) items = items.filter((p) => p.status === 'online');
  if (category) items = items.filter((p) => p.category === category);
  if (q) {
    const needle = q.toLowerCase();
    items = items.filter(
      (p) =>
        p.title.toLowerCase().includes(needle) ||
        p.description.toLowerCase().includes(needle) ||
        (p.seo?.keywords || []).some((k) => k.toLowerCase().includes(needle)),
    );
  }
  const nowTs = Date.now();
  return items.sort((a, b) => {
    const aBoost = a.boosted_until && new Date(a.boosted_until).getTime() > nowTs ? 1 : 0;
    const bBoost = b.boosted_until && new Date(b.boosted_until).getTime() > nowTs ? 1 : 0;
    if (aBoost !== bBoost) return bBoost - aBoost;
    return new Date(b.created_at) - new Date(a.created_at);
  });
}

async function adjustStock(id, sellerId, delta) {
  const product = await repo.find(id);
  if (!product || product.seller_id !== sellerId) return null;
  const stock = Math.max(0, product.stock + delta);
  return repo.update(id, { stock, status: stock === 0 ? 'sold' : product.status });
}

async function setStatus(id, sellerId, status) {
  const product = await repo.find(id);
  if (!product || product.seller_id !== sellerId) return null;
  return repo.update(id, { status });
}

/** Marketing: "Push to Top" – hebt Produkt für N Stunden hervor. */
async function boost(id, sellerId, hours = 24) {
  const product = await repo.find(id);
  if (!product || product.seller_id !== sellerId) return null;
  const until = new Date(Date.now() + hours * 3600 * 1000).toISOString();
  return repo.update(id, { boosted_until: until });
}

module.exports = {
  create,
  update,
  get,
  discover,
  adjustStock,
  setStatus,
  boost,
};
