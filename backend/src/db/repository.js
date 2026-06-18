/**
 * Schlanke Repository-Abstraktion.
 *
 * Im MOCK-Modus arbeitet sie auf dem In-Memory-Store; sobald Supabase
 * konfiguriert ist, werden dieselben Aufrufe gegen die Postgres-Tabellen
 * ausgeführt. Die Service-Schicht bleibt dadurch unverändert.
 */
const env = require('./../config/env');
const supabase = require('./../config/supabase');
const store = require('./store');

function createRepository(table) {
  if (env.useMockStore) {
    const collection = () => store[table];
    return {
      async all(filter = {}) {
        return collection().filter((row) =>
          Object.entries(filter).every(([k, v]) => row[k] === v),
        );
      },
      async find(id) {
        return collection().find((row) => row.id === id) || null;
      },
      async findBy(filter = {}) {
        return (
          collection().find((row) =>
            Object.entries(filter).every(([k, v]) => row[k] === v),
          ) || null
        );
      },
      async insert(row) {
        collection().push(row);
        return row;
      },
      async update(id, patch) {
        const row = collection().find((r) => r.id === id);
        if (!row) return null;
        Object.assign(row, patch, { updated_at: new Date().toISOString() });
        return row;
      },
      async remove(id) {
        const idx = collection().findIndex((r) => r.id === id);
        if (idx === -1) return false;
        collection().splice(idx, 1);
        return true;
      },
    };
  }

  // Supabase-Pfad
  return {
    async all(filter = {}) {
      let q = supabase.from(table).select('*');
      Object.entries(filter).forEach(([k, v]) => {
        q = q.eq(k, v);
      });
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    async find(id) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    async findBy(filter = {}) {
      let q = supabase.from(table).select('*');
      Object.entries(filter).forEach(([k, v]) => {
        q = q.eq(k, v);
      });
      const { data, error } = await q.limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
    async insert(row) {
      const { data, error } = await supabase
        .from(table)
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async update(id, patch) {
      const { data, error } = await supabase
        .from(table)
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async remove(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return true;
    },
  };
}

module.exports = { createRepository };
