const express = require('express');
const logisticsService = require('../services/logisticsService');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const { ROLES } = require('../models');

const router = express.Router();

// Tracking-Status eines Shipments abrufen (Käufer-Following).
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const shipment = await logisticsService.getShipment(req.params.id);
  if (!shipment) return res.status(404).json({ error: 'not_found' });
  res.json({ shipment });
}));

// Verkäufer/Carrier fügt ein Tracking-Event hinzu.
router.post('/:id/events', authenticate, requireRole(ROLES.SELLER, ROLES.ADMIN), asyncHandler(async (req, res) => {
  const shipment = await logisticsService.addTrackingEvent(req.params.id, req.body);
  if (!shipment) return res.status(404).json({ error: 'not_found' });
  res.json({ shipment });
}));

module.exports = router;
