/**
 * Apply fix-profiles-columns.sql to Supabase.
 *
 * Requires one of:
 *   SUPABASE_DB_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
 *   or DATABASE_URL (same format)
 *
 * Get the connection string from: Supabase Dashboard → Project Settings → Database → Connection string (URI)
 *
 * Usage: node scripts/apply-profiles-fix.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, '..', 'fix-profiles-columns.sql');
const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('Missing SUPABASE_DB_URL or DATABASE_URL.');
  console.error('Add your Supabase Postgres connection string to .env and re-run:');
  console.error('  SUPABASE_DB_URL=postgresql://postgres.[ref]:[password]@... node scripts/apply-profiles-fix.mjs');
  process.exit(1);
}

const sql = readFileSync(sqlPath, 'utf8');

async function main() {
  let pg;
  try {
    pg = await import('pg');
  } catch {
    console.error('Install pg first: npm install pg');
    process.exit(1);
  }

  const client = new pg.default.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected. Running fix-profiles-columns.sql...');
  await client.query(sql);
  console.log('Done. Profiles schema + RLS + trigger updated.');

  const { rows } = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles'
    ORDER BY ordinal_position
  `);
  console.log('\nprofiles columns:', rows.map((r) => `${r.column_name} (${r.data_type})`).join(', '));
  await client.end();
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
