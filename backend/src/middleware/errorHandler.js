// Zentrale Fehlerbehandlung.
function notFound(req, res) {
  res.status(404).json({ error: 'not_found', path: req.originalUrl });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
  }
  res.status(status).json({
    error: err.code || 'server_error',
    message: err.message || 'Unerwarteter Fehler',
  });
}

// Wrapper, damit async-Route-Handler Fehler an den errorHandler durchreichen.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { notFound, errorHandler, asyncHandler };
