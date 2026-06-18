const express = require('express');
const userService = require('../services/userService');
const orderService = require('../services/orderService');
const offerService = require('../services/offerService');
const logisticsService = require('../services/logisticsService');
const adService = require('../services/adService');
const reportService = require('../services/reportService');
const seoService = require('../services/seoService');
const { createRepository } = require('../db/repository');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const { ROLES, TX_STATUS } = require('../models');

const router = express.Router();
const txRepo = createRepository('transactions');

// Alle Admin-Routen erfordern Admin-Rolle.
router.use(authenticate, requireRole(ROLES.ADMIN));

// User-Management
router.get('/users', asyncHandler(async (req, res) => {
  res.json({ users: await userService.list() });
}));
router.post('/users/:id/active', asyncHandler(async (req, res) => {
  const user = await userService.setActive(req.params.id, Boolean(req.body.is_active));
  res.json({ user });
}));

// Payment & Treuhand-Überwachung
router.get('/escrow', asyncHandler(async (req, res) => {
  const transactions = await txRepo.all();
  const summary = transactions.reduce(
    (acc, t) => {
      if (t.status === TX_STATUS.AUTHORIZED) acc.held += t.amount;
      if (t.status === TX_STATUS.RELEASED) acc.released += t.amount;
      if (t.status === TX_STATUS.REFUNDED) acc.refunded += t.amount;
      acc.platformFees += t.platform_fee || 0;
      return acc;
    },
    { held: 0, released: 0, refunded: 0, platformFees: 0 },
  );
  res.json({ transactions, summary });
}));

// Admin kann Streitfall final auflösen (Refund an Käufer).
router.post('/orders/:id/refund', asyncHandler(async (req, res) => {
  const result = await orderService.dispute(req.params.id, { byAdmin: true, reason: req.body.reason });
  res.json(result);
}));

// System-Monitoring / Meldungen
router.get('/reports', asyncHandler(async (req, res) => {
  res.json({ reports: await reportService.list() });
}));
router.post('/reports/:id/resolve', asyncHandler(async (req, res) => {
  res.json({ report: await reportService.resolve(req.params.id) });
}));

// Logistik-Übersicht
router.get('/shipments', asyncHandler(async (req, res) => {
  res.json({ shipments: await logisticsService.listAll() });
}));

// Offerten-Überwachung (Streitschlichtung)
router.get('/offers', asyncHandler(async (req, res) => {
  res.json({ offers: await offerService.listAll() });
}));

// Werbe-Engine
router.get('/ads', asyncHandler(async (req, res) => {
  res.json({ ads: await adService.list() });
}));
router.post('/ads/:id/status', asyncHandler(async (req, res) => {
  res.json({ ad: await adService.setStatus(req.params.id, req.body.status) });
}));

// Globale SEO-Verwaltung
router.get('/seo', asyncHandler(async (req, res) => {
  res.json({ seo: await seoService.getGlobal() });
}));
router.put('/seo', asyncHandler(async (req, res) => {
  res.json({ seo: await seoService.updateGlobal(req.body) });
}));

// Alle Bestellungen (Monitoring)
router.get('/orders', asyncHandler(async (req, res) => {
  res.json({ orders: await orderService.listAll() });
}));

module.exports = router;
