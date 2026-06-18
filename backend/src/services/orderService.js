const { createRepository } = require('../db/repository');
const {
  Order, Transaction, ORDER_STATUS, TX_STATUS, now,
} = require('../models');
const escrowService = require('./escrowService');
const logisticsService = require('./logisticsService');
const reportService = require('./reportService');

const orderRepo = createRepository('orders');
const txRepo = createRepository('transactions');
const productRepo = createRepository('products');
const userRepo = createRepository('users');
const offerRepo = createRepository('offers');

/**
 * Kauf-Flow Schritt 1+2: Bestellung anlegen und Zahlung autorisieren.
 * Das Geld wird im Treuhand BLOCKIERT (status: funds_held).
 */
async function checkout(buyerId, { product_id, offer_id, delivery_method, shipping_address }) {
  const product = await productRepo.find(product_id);
  if (!product) return { error: 'product_not_found' };
  if (product.stock <= 0) return { error: 'out_of_stock' };

  // Preis: aus angenommener Offerte oder Listenpreis.
  let amount = product.price;
  if (offer_id) {
    const offer = await offerRepo.find(offer_id);
    if (!offer || offer.status !== 'accepted') return { error: 'offer_not_accepted' };
    amount = offer.amount;
  }

  const seller = await userRepo.find(product.seller_id);
  const buyer = await userRepo.find(buyerId);

  const order = Order({
    product_id,
    buyer_id: buyerId,
    seller_id: product.seller_id,
    offer_id: offer_id || null,
    amount,
    delivery_method: delivery_method || 'shipping',
    shipping_address: shipping_address || null,
    status: ORDER_STATUS.PENDING_PAYMENT,
  });
  await orderRepo.insert(order);

  // Stripe Connect: PaymentIntent mit manual capture -> Geld blockiert.
  const auth = await escrowService.authorizePayment({
    amount,
    currency: (product.currency || 'CHF').toLowerCase(),
    buyer,
    order,
    destinationAccountId: seller?.stripe_account_id,
  });

  const tx = Transaction({
    order_id: order.id,
    buyer_id: buyerId,
    seller_id: product.seller_id,
    amount,
    platform_fee: auth.platformFee,
    status: TX_STATUS.AUTHORIZED,
    payment_intent_id: auth.paymentIntentId,
  });
  await txRepo.insert(tx);

  await orderRepo.update(order.id, {
    status: ORDER_STATUS.FUNDS_HELD,
    transaction_id: tx.id,
  });

  // Lagerbestand reservieren.
  await productRepo.update(product_id, { stock: Math.max(0, product.stock - 1) });

  return {
    order: await orderRepo.find(order.id),
    transaction: tx,
    payment: { clientSecret: auth.clientSecret, status: auth.status, mock: auth.mock },
  };
}

/** Verkäufer markiert die Bestellung als versandt und erzeugt ein Shipment. */
async function markShipped(orderId, sellerId, { carrier, tracking_number }) {
  const order = await orderRepo.find(orderId);
  if (!order) return { error: 'not_found' };
  if (order.seller_id !== sellerId) return { error: 'forbidden' };

  const shipment = await logisticsService.createShipment(orderId, { carrier, tracking_number });
  const updated = await orderRepo.update(orderId, {
    status: ORDER_STATUS.SHIPPED,
    shipment_id: shipment.id,
  });
  return { order: updated, shipment };
}

/**
 * Kauf-Flow Schritt 3: Käufer bestätigt Erhalt ("Artikel erhalten & geprüft").
 * -> Treuhand-Freigabe: Geld wird an den Verkäufer transferiert.
 */
async function confirmReceipt(orderId, buyerId) {
  const order = await orderRepo.find(orderId);
  if (!order) return { error: 'not_found' };
  if (order.buyer_id !== buyerId) return { error: 'forbidden' };
  if (![ORDER_STATUS.FUNDS_HELD, ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED].includes(order.status)) {
    return { error: 'invalid_status' };
  }

  const tx = await txRepo.find(order.transaction_id);
  const release = await escrowService.releaseToSeller({ paymentIntentId: tx.payment_intent_id });

  await txRepo.update(tx.id, {
    status: TX_STATUS.RELEASED,
    transfer_id: release.transferId || null,
  });
  const updated = await orderRepo.update(orderId, {
    status: ORDER_STATUS.COMPLETED,
    buyer_confirmed_at: now(),
  });
  return { order: updated, release };
}

/** Streitfall / Admin: Geld an Käufer zurück. */
async function dispute(orderId, { reason, byAdmin } = {}) {
  const order = await orderRepo.find(orderId);
  if (!order) return { error: 'not_found' };

  await reportService.create({
    type: 'dispute',
    severity: 'critical',
    ref_id: orderId,
    message: reason || 'Streitfall eröffnet',
  });

  if (byAdmin) {
    const tx = await txRepo.find(order.transaction_id);
    const refund = await escrowService.refundBuyer({ paymentIntentId: tx.payment_intent_id });
    await txRepo.update(tx.id, { status: TX_STATUS.REFUNDED, refund_id: refund.refundId || null });
    const updated = await orderRepo.update(orderId, { status: ORDER_STATUS.REFUNDED });
    return { order: updated, refund };
  }
  const updated = await orderRepo.update(orderId, { status: ORDER_STATUS.DISPUTED });
  return { order: updated };
}

async function get(orderId) {
  const order = await orderRepo.find(orderId);
  if (!order) return null;
  const [product, transaction, shipment] = await Promise.all([
    productRepo.find(order.product_id),
    order.transaction_id ? txRepo.find(order.transaction_id) : null,
    order.shipment_id ? logisticsService.getShipment(order.shipment_id) : null,
  ]);
  return { ...order, product, transaction, shipment };
}

async function listForBuyer(buyerId) {
  return orderRepo.all({ buyer_id: buyerId });
}

async function listForSeller(sellerId) {
  return orderRepo.all({ seller_id: sellerId });
}

async function listAll() {
  return orderRepo.all();
}

module.exports = {
  checkout,
  markShipped,
  confirmReceipt,
  dispute,
  get,
  listForBuyer,
  listForSeller,
  listAll,
};
