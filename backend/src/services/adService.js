const { createRepository } = require('../db/repository');
const { Ad } = require('../models');

const repo = createRepository('ads');

/** Verkäufer/Advertiser bucht einen Werbeplatz. */
async function book(advertiserId, { product_id, slot, budget, starts_at, ends_at }) {
  const ad = Ad({ advertiser_id: advertiserId, product_id, slot, budget, starts_at, ends_at });
  await repo.insert(ad);
  return ad;
}

/** Admin: Buchung freigeben oder ablehnen. */
async function setStatus(id, status) {
  return repo.update(id, { status });
}

async function list(filter = {}) {
  return repo.all(filter);
}

/** Aktive Werbung für einen Slot (Auslieferung in der App). */
async function activeForSlot(slot) {
  const ads = await repo.all({ slot, status: 'active' });
  const ts = Date.now();
  return ads.filter((a) => !a.ends_at || new Date(a.ends_at).getTime() > ts);
}

module.exports = { book, setStatus, list, activeForSlot };
