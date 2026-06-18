const Stripe = require('stripe');
const env = require('./env');

/**
 * Stripe-Client. Im MOCK-Modus (kein STRIPE_SECRET_KEY) wird `null`
 * zurückgegeben; escrowService nutzt dann eine simulierte Implementierung,
 * damit der komplette Treuhand-Flow ohne echte Keys demonstrierbar bleibt.
 */
let stripe = null;

if (!env.useMockStripe) {
  stripe = new Stripe(env.stripe.secretKey, { apiVersion: '2024-06-20' });
  // eslint-disable-next-line no-console
  console.log('[stripe] Live-Client initialisiert');
} else {
  // eslint-disable-next-line no-console
  console.log('[stripe] MOCK-Modus aktiv (kein STRIPE_SECRET_KEY gesetzt)');
}

module.exports = stripe;
