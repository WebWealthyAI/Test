const express = require('express');
const orderService = require('../services/orderService');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const { ROLES } = require('../models');

const router = express.Router();

// Kauf-Flow: Checkout -> Geld wird im Treuhand blockiert.
router.post('/checkout', authenticate, requireRole(ROLES.BUYER), asyncHandler(async (req, res) => {
  const result = await orderService.checkout(req.user.id, req.body);
  if (result.error) return res.status(400).json(result);
  res.status(201).json(result);
}));

// Käufer-Bestellungen (Following / Tracking).
router.get('/mine', authenticate, requireRole(ROLES.BUYER), asyncHandler(async (req, res) => {
  res.json({ orders: await orderService.listForBuyer(req.user.id) });
}));

// Verkäufer-Bestellungen (Order Management).
router.get('/selling', authenticate, requireRole(ROLES.SELLER), asyncHandler(async (req, res) => {
  res.json({ orders: await orderService.listForSeller(req.user.id) });
}));

router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const order = await orderService.get(req.params.id);
  if (!order) return res.status(404).json({ error: 'not_found' });
  res.json({ order });
}));

// Verkäufer: als versandt markieren (erzeugt Shipment + Tracking).
router.post('/:id/ship', authenticate, requireRole(ROLES.SELLER), asyncHandler(async (req, res) => {
  const result = await orderService.markShipped(req.params.id, req.user.id, req.body);
  if (result.error) return res.status(result.error === 'forbidden' ? 403 : 404).json(result);
  res.json(result);
}));

// Käufer: "Artikel erhalten & geprüft" -> Treuhand-Freigabe an Verkäufer.
router.post('/:id/confirm', authenticate, requireRole(ROLES.BUYER), asyncHandler(async (req, res) => {
  const result = await orderService.confirmReceipt(req.params.id, req.user.id);
  if (result.error) return res.status(result.error === 'forbidden' ? 403 : 400).json(result);
  res.json(result);
}));

// Streitfall eröffnen (Käufer/Verkäufer).
router.post('/:id/dispute', authenticate, asyncHandler(async (req, res) => {
  const result = await orderService.dispute(req.params.id, { reason: req.body.reason });
  if (result.error) return res.status(404).json(result);
  res.json(result);
}));

module.exports = router;
