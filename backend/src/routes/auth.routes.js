const express = require('express');
const userService = require('../services/userService');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', asyncHandler(async (req, res) => {
  const user = await userService.register(req.body);
  res.status(201).json({ user });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const user = await userService.login(req.body);
  res.json({ user });
}));

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  res.json({ user: req.user });
}));

module.exports = router;
