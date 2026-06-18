const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { seedIfEmpty } = require('./db/seed');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// Stripe-Webhook benötigt den Raw-Body -> vor dem JSON-Parser registrieren.
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '5mb' }));

// Healthcheck / Modus-Anzeige.
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'tradelater-backend',
    mockStore: env.useMockStore,
    mockStripe: env.useMockStripe,
    time: new Date().toISOString(),
  });
});

// Routen
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/offers', require('./routes/offers.routes'));
app.use('/api/orders', require('./routes/orders.routes'));
app.use('/api/payments', require('./routes/payments.routes'));
app.use('/api/ads', require('./routes/ads.routes'));
app.use('/api/logistics', require('./routes/logistics.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

app.use(notFound);
app.use(errorHandler);

// Mock-Daten laden, damit die App sofort befüllt ist.
if (env.useMockStore) {
  seedIfEmpty();
}

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`\n  Tradelater API läuft auf http://localhost:${env.port}`);
  console.log(`  Health: http://localhost:${env.port}/api/health`);
  console.log(`  Modus:  Store=${env.useMockStore ? 'MOCK' : 'Supabase'} | Stripe=${env.useMockStripe ? 'MOCK' : 'Live'}\n`);
});

module.exports = app;
