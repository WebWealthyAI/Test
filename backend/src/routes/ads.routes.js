const express = require('express');
const adService = require('../services/adService');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const { ROLES } = require('../models');

const router = express.Router();

// Verkäufer/Advertiser bucht einen Werbeplatz (Werbe-Engine).
router.post('/', authenticate, requireRole(ROLES.SELLER, ROLES.ADMIN), asyncHandler(async (req, res) => {
  const ad = await adService.book(req.user.id, req.body);
  res.status(201).json({ ad });
}));

// Eigene Buchungen.
router.get('/mine', authenticate, asyncHandler(async (req, res) => {
  res.json({ ads: await adService.list({ advertiser_id: req.user.id }) });
}));

// Aktive Werbung für einen Slot (für die App-Auslieferung).
router.get('/slot/:slot', asyncHandler(async (req, res) => {
  res.json({ ads: await adService.activeForSlot(req.params.slot) });
}));

module.exports = router;
