const express = require('express');
const escrowService = require('../services/escrowService');
const userService = require('../services/userService');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const { ROLES } = require('../models');
const env = require('../config/env');

const router = express.Router();

// Verkäufer-Onboarding für Stripe Connect (Treuhand-Auszahlungskonto).
router.post('/connect/onboard', authenticate, requireRole(ROLES.SELLER), asyncHandler(async (req, res) => {
  const account = await userService.ensureSellerAccount(req.user.id);
  res.json({ account });
}));

// Info über das Treuhand-Modell (für UI-Anzeige).
router.get('/escrow/info', asyncHandler(async (req, res) => {
  res.json({
    model: 'stripe_connect_manual_capture',
    platformFeePercent: escrowService.platformFeePercent,
    mock: env.useMockStripe,
    steps: [
      'Käufer zahlt – Geld wird autorisiert/blockiert (requires_capture).',
      'Verkäufer versendet die Ware.',
      'Käufer bestätigt Erhalt – Capture + Transfer an Verkäufer (abzüglich Gebühr).',
      'Streitfall – Admin kann stornieren/refunden.',
    ],
  });
}));

// Stripe Webhook (Capture/Transfer/Refund Events). Raw body wird in index.js gesetzt.
router.post('/webhook', asyncHandler(async (req, res) => {
  // In Produktion: stripe.webhooks.constructEvent(req.body, sig, secret)
  // Im Prototyp bestätigen wir den Empfang.
  res.json({ received: true, mock: env.useMockStripe });
}));

module.exports = router;
