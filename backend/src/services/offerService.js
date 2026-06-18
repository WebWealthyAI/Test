const { createRepository } = require('../db/repository');
const { Offer, OFFER_STATUS, now } = require('../models');

const offerRepo = createRepository('offers');
const productRepo = createRepository('products');

/** Käufer macht einen Preisvorschlag. */
async function create(buyerId, { product_id, amount, message }) {
  const product = await productRepo.find(product_id);
  if (!product) return { error: 'product_not_found' };
  if (!product.allow_offers) return { error: 'offers_disabled' };

  const offer = Offer({
    product_id,
    buyer_id: buyerId,
    seller_id: product.seller_id,
    amount,
    message,
    history: [{ by: 'buyer', amount: Number(amount), at: now(), message }],
  });
  await offerRepo.insert(offer);
  return { offer };
}

/** Verkäufer (oder Käufer) macht einen Gegenvorschlag. */
async function counter(offerId, actorId, role, { amount, message }) {
  const offer = await offerRepo.find(offerId);
  if (!offer) return { error: 'not_found' };
  const isParty = offer.buyer_id === actorId || offer.seller_id === actorId;
  if (!isParty) return { error: 'forbidden' };

  const history = [...offer.history, { by: role, amount: Number(amount), at: now(), message }];
  const updated = await offerRepo.update(offerId, {
    amount: Number(amount),
    message: message || offer.message,
    status: OFFER_STATUS.COUNTERED,
    history,
  });
  return { offer: updated };
}

/** Offerte annehmen -> bereit zur Bestellung zum vereinbarten Preis. */
async function accept(offerId, actorId) {
  const offer = await offerRepo.find(offerId);
  if (!offer) return { error: 'not_found' };
  if (offer.buyer_id !== actorId && offer.seller_id !== actorId) return { error: 'forbidden' };
  const updated = await offerRepo.update(offerId, { status: OFFER_STATUS.ACCEPTED });
  return { offer: updated };
}

async function reject(offerId, actorId) {
  const offer = await offerRepo.find(offerId);
  if (!offer) return { error: 'not_found' };
  if (offer.buyer_id !== actorId && offer.seller_id !== actorId) return { error: 'forbidden' };
  const updated = await offerRepo.update(offerId, { status: OFFER_STATUS.REJECTED });
  return { offer: updated };
}

async function listForUser(userId, role) {
  const key = role === 'seller' ? { seller_id: userId } : { buyer_id: userId };
  return offerRepo.all(key);
}

/** Admin: Offerten-Überwachung / Log für Streitschlichtung. */
async function listAll() {
  return offerRepo.all();
}

module.exports = { create, counter, accept, reject, listForUser, listAll };
