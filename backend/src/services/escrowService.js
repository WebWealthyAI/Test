/**
 * Treuhand- / Escrow-Service auf Basis von Stripe Connect.
 *
 * Ablauf:
 *   1. authorizePayment()  -> PaymentIntent mit capture_method:'manual'
 *                             (Käufer-Geld wird BLOCKIERT / autorisiert)
 *   2. releaseToSeller()   -> capture + Transfer an Connect-Konto des Verkäufers
 *                             abzüglich Plattform-Gebühr (FREIGABE)
 *   3. refundBuyer()       -> Stornierung / Rückerstattung im Streitfall
 *
 * Im MOCK-Modus (kein STRIPE_SECRET_KEY) werden die Stripe-Aufrufe durch
 * deterministische Fake-IDs ersetzt, damit der gesamte Flow ohne Keys läuft.
 */
const { v4: uuid } = require('uuid');
const stripe = require('../config/stripe');
const env = require('../config/env');

const PLATFORM_FEE = env.stripe.platformFeePercent;

function toCents(amount) {
  return Math.round(Number(amount) * 100);
}

function platformFeeCents(amount) {
  return Math.round(toCents(amount) * (PLATFORM_FEE / 100));
}

/**
 * Erstellt ein Connect-Konto (Express) für einen Verkäufer.
 * Liefert account_id + Onboarding-Link.
 */
async function createSellerAccount(seller) {
  if (env.useMockStripe) {
    return {
      accountId: `acct_mock_${seller.id.slice(0, 8)}`,
      onboardingUrl: `https://connect.stripe.com/mock/onboarding/${seller.id}`,
      mock: true,
    };
  }

  const account = await stripe.accounts.create({
    type: 'express',
    email: seller.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
    metadata: { tradelater_user_id: seller.id },
  });

  const link = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'https://tradelater.ch/connect/refresh',
    return_url: 'https://tradelater.ch/connect/return',
    type: 'account_onboarding',
  });

  return { accountId: account.id, onboardingUrl: link.url, mock: false };
}

/**
 * Schritt 1: Zahlung autorisieren -> Geld blockiert (noch nicht eingezogen).
 * destinationAccountId = Stripe-Connect-Konto des Verkäufers.
 */
async function authorizePayment({ amount, currency = 'chf', buyer, order, destinationAccountId }) {
  const fee = platformFeeCents(amount);

  if (env.useMockStripe || !destinationAccountId) {
    return {
      paymentIntentId: `pi_mock_${uuid().slice(0, 12)}`,
      clientSecret: `pi_mock_secret_${uuid().slice(0, 12)}`,
      status: 'requires_capture', // = Geld blockiert
      platformFee: fee / 100,
      mock: true,
    };
  }

  const intent = await stripe.paymentIntents.create({
    amount: toCents(amount),
    currency,
    capture_method: 'manual', // <- Kernstück des Treuhand-Modells
    customer: buyer.stripe_customer_id || undefined,
    application_fee_amount: fee,
    transfer_data: { destination: destinationAccountId },
    metadata: { order_id: order.id, buyer_id: buyer.id },
  });

  return {
    paymentIntentId: intent.id,
    clientSecret: intent.client_secret,
    status: intent.status,
    platformFee: fee / 100,
    mock: false,
  };
}

/**
 * Schritt 2: Freigabe an Verkäufer.
 * Bestätigt der Käufer den Erhalt, wird das blockierte Geld eingezogen
 * (capture) und – via transfer_data der Autorisierung – an den Verkäufer
 * weitergeleitet, abzüglich Plattform-Gebühr.
 */
async function releaseToSeller({ paymentIntentId }) {
  if (env.useMockStripe || String(paymentIntentId).startsWith('pi_mock_')) {
    return {
      paymentIntentId,
      transferId: `tr_mock_${uuid().slice(0, 12)}`,
      status: 'released',
      mock: true,
    };
  }

  const captured = await stripe.paymentIntents.capture(paymentIntentId);
  return {
    paymentIntentId: captured.id,
    transferId: captured.latest_charge,
    status: 'released',
    mock: false,
  };
}

/**
 * Streitfall / Stornierung: blockiertes oder eingezogenes Geld zurück an Käufer.
 */
async function refundBuyer({ paymentIntentId }) {
  if (env.useMockStripe || String(paymentIntentId).startsWith('pi_mock_')) {
    return {
      paymentIntentId,
      refundId: `re_mock_${uuid().slice(0, 12)}`,
      status: 'refunded',
      mock: true,
    };
  }

  // Bei noch nicht eingezogenem Intent reicht cancel, sonst refund.
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (intent.status === 'requires_capture') {
    const cancelled = await stripe.paymentIntents.cancel(paymentIntentId);
    return { paymentIntentId: cancelled.id, status: 'refunded', mock: false };
  }
  const refund = await stripe.refunds.create({ payment_intent: paymentIntentId });
  return { paymentIntentId, refundId: refund.id, status: 'refunded', mock: false };
}

module.exports = {
  createSellerAccount,
  authorizePayment,
  releaseToSeller,
  refundBuyer,
  platformFeePercent: PLATFORM_FEE,
};
