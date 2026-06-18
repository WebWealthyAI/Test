const env = require('../config/env');
const supabase = require('../config/supabase');
const store = require('../db/store');

/** Globale SEO-Einstellungen (Admin). */
async function getGlobal() {
  if (env.useMockStore) return store.seoSettings;
  const { data, error } = await supabase
    .from('seo_settings')
    .select('*')
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data || store.seoSettings;
}

async function updateGlobal(patch) {
  if (env.useMockStore) {
    store.seoSettings = { ...store.seoSettings, ...patch };
    return store.seoSettings;
  }
  const { data, error } = await supabase
    .from('seo_settings')
    .upsert({ id: 1, ...patch })
    .select()
    .single();
  if (error) throw error;
  return data;
}

module.exports = { getGlobal, updateGlobal };
