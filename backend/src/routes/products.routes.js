const express = require('express');
const productService = require('../services/productService');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const { ROLES } = require('../models');

const router = express.Router();

// Öffentliche Entdeckung (Discover / Suche).
router.get('/', asyncHandler(async (req, res) => {
  const { q, category } = req.query;
  const items = await productService.discover({ q, category });
  res.json({ products: items });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const product = await productService.get(req.params.id);
  if (!product) return res.status(404).json({ error: 'not_found' });
  res.json({ product });
}));

// --- Verkäufer-Bereich ---
router.post('/', authenticate, requireRole(ROLES.SELLER, ROLES.ADMIN), asyncHandler(async (req, res) => {
  const product = await productService.create(req.user.id, req.body);
  res.status(201).json({ product });
}));

router.patch('/:id', authenticate, requireRole(ROLES.SELLER, ROLES.ADMIN), asyncHandler(async (req, res) => {
  const result = await productService.update(req.params.id, req.user.id, req.body);
  if (result.error === 'not_found') return res.status(404).json(result);
  if (result.error === 'forbidden') return res.status(403).json(result);
  res.json({ product: result.product });
}));

router.post('/:id/stock', authenticate, requireRole(ROLES.SELLER), asyncHandler(async (req, res) => {
  const product = await productService.adjustStock(req.params.id, req.user.id, Number(req.body.delta || 0));
  if (!product) return res.status(404).json({ error: 'not_found' });
  res.json({ product });
}));

router.post('/:id/status', authenticate, requireRole(ROLES.SELLER), asyncHandler(async (req, res) => {
  const product = await productService.setStatus(req.params.id, req.user.id, req.body.status);
  if (!product) return res.status(404).json({ error: 'not_found' });
  res.json({ product });
}));

// Marketing: Push to Top
router.post('/:id/boost', authenticate, requireRole(ROLES.SELLER), asyncHandler(async (req, res) => {
  const product = await productService.boost(req.params.id, req.user.id, Number(req.body.hours || 24));
  if (!product) return res.status(404).json({ error: 'not_found' });
  res.json({ product });
}));

module.exports = router;
