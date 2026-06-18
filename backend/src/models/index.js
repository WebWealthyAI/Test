/**
 * Datenmodelle (Factory-Funktionen).
 *
 * Diese definieren die kanonische Form jeder Entität. Sie werden sowohl vom
 * Mock-Store als auch — über die identische Spaltenstruktur — von den
 * Supabase-Tabellen (siehe src/db/schema.sql) verwendet.
 */
const { v4: uuid } = require('uuid');

const ROLES = Object.freeze({
  ADMIN: 'admin',
  SELLER: 'seller', // Account Inhaber / Supplier
  BUYER: 'buyer', // Demander
});

const ORDER_STATUS = Object.freeze({
  PENDING_PAYMENT: 'pending_payment',
  FUNDS_HELD: 'funds_held', // Geld blockiert im Treuhand
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  COMPLETED: 'completed', // Käufer bestätigt -> Geld freigegeben
  DISPUTED: 'disputed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
});

const OFFER_STATUS = Object.freeze({
  PENDING: 'pending',
  COUNTERED: 'countered',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
});

const TX_STATUS = Object.freeze({
  AUTHORIZED: 'authorized', // PaymentIntent erstellt, Geld blockiert
  CAPTURED: 'captured', // eingezogen
  RELEASED: 'released', // an Verkäufer transferiert
  REFUNDED: 'refunded',
  FAILED: 'failed',
});

function now() {
  return new Date().toISOString();
}

const User = (data = {}) => ({
  id: data.id || uuid(),
  email: data.email,
  password_hash: data.password_hash || null,
  full_name: data.full_name || '',
  role: data.role || ROLES.BUYER,
  phone: data.phone || '',
  avatar_url: data.avatar_url || '',
  // Stripe Connect Account des Verkäufers (für Treuhand-Auszahlung)
  stripe_account_id: data.stripe_account_id || null,
  stripe_customer_id: data.stripe_customer_id || null,
  is_active: data.is_active !== undefined ? data.is_active : true,
  created_at: data.created_at || now(),
});

const Product = (data = {}) => ({
  id: data.id || uuid(),
  seller_id: data.seller_id,
  title: data.title || '',
  description: data.description || '',
  price: Number(data.price || 0), // in CHF
  currency: data.currency || 'CHF',
  category: data.category || 'general',
  images: data.images || [], // URLs
  stock: data.stock !== undefined ? Number(data.stock) : 1,
  status: data.status || 'online', // online | paused | sold | draft
  allow_offers: data.allow_offers !== undefined ? data.allow_offers : true,
  delivery_options: data.delivery_options || ['pickup', 'shipping'],
  location: data.location || '',
  // SEO-Kontrolle pro Produkt
  seo: data.seo || { keywords: [], meta_title: '', meta_description: '' },
  // Marketing: "Push to Top"
  boosted_until: data.boosted_until || null,
  created_at: data.created_at || now(),
  updated_at: data.updated_at || now(),
});

const Order = (data = {}) => ({
  id: data.id || uuid(),
  product_id: data.product_id,
  buyer_id: data.buyer_id,
  seller_id: data.seller_id,
  offer_id: data.offer_id || null, // wenn aus angenommener Offerte entstanden
  amount: Number(data.amount || 0),
  currency: data.currency || 'CHF',
  status: data.status || ORDER_STATUS.PENDING_PAYMENT,
  delivery_method: data.delivery_method || 'shipping',
  shipping_address: data.shipping_address || null,
  transaction_id: data.transaction_id || null,
  shipment_id: data.shipment_id || null,
  buyer_confirmed_at: data.buyer_confirmed_at || null,
  created_at: data.created_at || now(),
  updated_at: data.updated_at || now(),
});

const Offer = (data = {}) => ({
  id: data.id || uuid(),
  product_id: data.product_id,
  buyer_id: data.buyer_id,
  seller_id: data.seller_id,
  amount: Number(data.amount || 0), // aktueller Vorschlag
  currency: data.currency || 'CHF',
  status: data.status || OFFER_STATUS.PENDING,
  message: data.message || '',
  // Verhandlungs-Historie (Vorschlag / Gegenvorschlag)
  history: data.history || [],
  created_at: data.created_at || now(),
  updated_at: data.updated_at || now(),
});

const Transaction = (data = {}) => ({
  id: data.id || uuid(),
  order_id: data.order_id,
  buyer_id: data.buyer_id,
  seller_id: data.seller_id,
  amount: Number(data.amount || 0),
  platform_fee: Number(data.platform_fee || 0),
  currency: data.currency || 'CHF',
  status: data.status || TX_STATUS.AUTHORIZED,
  // Stripe-Referenzen
  payment_intent_id: data.payment_intent_id || null,
  transfer_id: data.transfer_id || null,
  refund_id: data.refund_id || null,
  created_at: data.created_at || now(),
  updated_at: data.updated_at || now(),
});

const Shipment = (data = {}) => ({
  id: data.id || uuid(),
  order_id: data.order_id,
  carrier: data.carrier || '',
  tracking_number: data.tracking_number || '',
  status: data.status || 'label_created', // label_created | in_transit | delivered
  events: data.events || [],
  created_at: data.created_at || now(),
  updated_at: data.updated_at || now(),
});

const Ad = (data = {}) => ({
  id: data.id || uuid(),
  advertiser_id: data.advertiser_id,
  product_id: data.product_id || null,
  slot: data.slot || 'home_banner', // home_banner | category_top | search_promoted
  budget: Number(data.budget || 0),
  starts_at: data.starts_at || now(),
  ends_at: data.ends_at || null,
  status: data.status || 'pending', // pending | active | finished | rejected
  created_at: data.created_at || now(),
});

const Report = (data = {}) => ({
  id: data.id || uuid(),
  type: data.type || 'technical', // technical | delivery_delay | order_problem | dispute
  severity: data.severity || 'info', // info | warning | critical
  ref_id: data.ref_id || null, // order_id / product_id etc.
  message: data.message || '',
  resolved: data.resolved || false,
  created_at: data.created_at || now(),
});

module.exports = {
  ROLES,
  ORDER_STATUS,
  OFFER_STATUS,
  TX_STATUS,
  User,
  Product,
  Order,
  Offer,
  Transaction,
  Shipment,
  Ad,
  Report,
  now,
};
