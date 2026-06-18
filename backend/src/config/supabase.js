const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

/**
 * Supabase-Client (Service-Role) für serverseitige Operationen.
 * Im MOCK-Modus (keine Keys) wird `null` zurückgegeben und die Services
 * fallen automatisch auf den In-Memory-Store zurück.
 */
let supabase = null;

if (!env.useMockStore) {
  supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  // eslint-disable-next-line no-console
  console.log('[supabase] verbunden mit', env.supabase.url);
} else {
  // eslint-disable-next-line no-console
  console.log('[supabase] MOCK-Modus aktiv (kein SUPABASE_URL / SERVICE_ROLE_KEY gesetzt)');
}

module.exports = supabase;
