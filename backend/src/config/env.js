require('dotenv').config();

const env = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',

  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    platformFeePercent: Number(process.env.PLATFORM_FEE_PERCENT || 7),
  },

  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
};

// MOCK-Modus: aktiv, sobald die externen Dienste nicht konfiguriert sind.
env.useMockStore = !env.supabase.url || !env.supabase.serviceRoleKey;
env.useMockStripe = !env.stripe.secretKey;

module.exports = env;
