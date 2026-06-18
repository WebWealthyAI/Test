const express = require('express');
const offerService = require('../services/offerService');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const { ROLES } = require('../models');

const router = express.Router();

// Käufer macht Preisvorschlag.
router.post('/', authenticate, requireRole(ROLES.BUYER), asyncHandler(async (req, res) => {
  const result = await offerService.create(req.user.id, req.body);
  if (result.error) return res.status(400).json(result);
  res.status(201).json({ offer: result.offer });
}));

// Eigene Offerten (Käufer oder Verkäufer).
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const offers = await offerService.listForUser(req.user.id, req.user.role);
  res.json({ offers });
}));

// Gegenvorschlag.
router.post('/:id/counter', authenticate, asyncHandler(async (req, res) => {
  const role = req.user.role === ROLES.SELLER ? 'seller' : 'buyer';
  const result = await offerService.counter(req.params.id, req.user.id, role, req.body);
  if (result.error) return res.status(result.error === 'forbidden' ? 403 : 404).json(result);
  res.json({ offer: result.offer });
}));

router.post('/:id/accept', authenticate, asyncHandler(async (req, res) => {
  const result = await offerService.accept(req.params.id, req.user.id);
  if (result.error) return res.status(result.error === 'forbidden' ? 403 : 404).json(result);
  res.json({ offer: result.offer });
}));

router.post('/:id/reject', authenticate, asyncHandler(async (req, res) => {
  const result = await offerService.reject(req.params.id, req.user.id);
  if (result.error) return res.status(result.error === 'forbidden' ? 403 : 404).json(result);
  res.json({ offer: result.offer });
}));

module.exports = router;
