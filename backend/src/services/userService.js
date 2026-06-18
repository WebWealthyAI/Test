const { createRepository } = require('../db/repository');
const { User, ROLES } = require('../models');
const escrowService = require('./escrowService');

const repo = createRepository('users');

async function register({ email, full_name, role, phone, password }) {
  const existing = await repo.findBy({ email });
  if (existing) {
    const err = new Error('E-Mail bereits registriert');
    err.status = 409;
    throw err;
  }
  // Hinweis: In Produktion übernimmt Supabase Auth das Passwort-Hashing.
  const user = User({ email, full_name, role, phone, password_hash: password ? `hashed:${password}` : null });

  // Verkäufer erhalten direkt ein Stripe-Connect-Konto (Treuhand-Auszahlung).
  if (user.role === ROLES.SELLER) {
    const account = await escrowService.createSellerAccount(user);
    user.stripe_account_id = account.accountId;
  }

  await repo.insert(user);
  return sanitize(user);
}

async function login({ email, password }) {
  const user = await repo.findBy({ email });
  if (!user) {
    const err = new Error('Ungültige Anmeldedaten');
    err.status = 401;
    throw err;
  }
  // Prototyp-Validierung; in Produktion via Supabase Auth.
  if (user.password_hash && user.password_hash !== `hashed:${password}`) {
    const err = new Error('Ungültige Anmeldedaten');
    err.status = 401;
    throw err;
  }
  return sanitize(user);
}

async function getById(id) {
  const user = await repo.find(id);
  return user ? sanitize(user) : null;
}

async function list(filter = {}) {
  const users = await repo.all(filter);
  return users.map(sanitize);
}

async function setActive(id, isActive) {
  const updated = await repo.update(id, { is_active: isActive });
  return updated ? sanitize(updated) : null;
}

async function ensureSellerAccount(id) {
  const user = await repo.find(id);
  if (!user) return null;
  if (!user.stripe_account_id) {
    const account = await escrowService.createSellerAccount(user);
    await repo.update(id, { stripe_account_id: account.accountId });
    return account;
  }
  return { accountId: user.stripe_account_id, alreadyExists: true };
}

function sanitize(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

module.exports = {
  register,
  login,
  getById,
  list,
  setActive,
  ensureSellerAccount,
};
