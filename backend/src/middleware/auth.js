const userService = require('../services/userService');

/**
 * Prototyp-Authentifizierung.
 * Der Client sendet `x-user-id` (und optional `x-user-role`). In Produktion
 * wird dies durch ein Supabase-JWT (Authorization: Bearer ...) ersetzt, das
 * hier verifiziert würde.
 */
async function authenticate(req, res, next) {
  const userId = req.header('x-user-id');
  if (!userId) {
    return res.status(401).json({ error: 'unauthorized', message: 'x-user-id Header fehlt' });
  }
  const user = await userService.getById(userId);
  if (!user || !user.is_active) {
    return res.status(401).json({ error: 'unauthorized', message: 'Unbekannter oder inaktiver Nutzer' });
  }
  req.user = user;
  next();
}

/** Rollenbasierte Zugriffskontrolle. */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'forbidden', message: 'Unzureichende Berechtigung' });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
