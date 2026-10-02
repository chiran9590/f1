/**
 * Smoke-test client registration against Supabase.
 * Usage: node scripts/test-registration.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env');
    const raw = readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    }
  } catch {
    /* optional */
  }
}

loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, key);
const stamp = Date.now();
const testEmail = `test.client.${stamp}@healthmaps.test`;
const password = 'TestPass123';
const fullName = 'Test Client';
const phone = '+1-555-0100';
const golf_course = 'Pine Valley Test Course';

async function testClientSignup() {
  console.log('--- Client signup test ---');
  console.log('Email:', testEmail);

  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password,
    options: {
      data: { full_name: fullName, role: 'client', phone, golf_course },
    },
  });

  if (error) {
    console.error('signup error:', error.message);
    return false;
  }

  if (!data.user) {
    console.error('No user returned');
    return false;
  }

  console.log('Auth user created:', data.user.id);
  await new Promise((r) => setTimeout(r, 2500));

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, phone, golf_course, role, full_name')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    console.error('Profile fetch error:', profileError.message);
    return false;
  }

  console.log('Profile row:', profile);
  const ok =
    profile.email === testEmail &&
    profile.phone === phone &&
    profile.golf_course === golf_course &&
    profile.role === 'client';

  console.log(ok ? 'PASS: profile fields match' : 'FAIL: profile field mismatch');
  return ok;
}

async function probeProfilesTable() {
  console.log('--- Profiles table probe (anon) ---');
  const { error } = await supabase.from('profiles').select('id').limit(1);
  if (error) {
    console.error('Probe error:', error.message, error.code);
    return false;
  }
  console.log('Probe OK (RLS allows anon read or empty)');
  return true;
}

const probeOk = await probeProfilesTable();
const signupOk = await testClientSignup();
process.exit(probeOk && signupOk ? 0 : 1);
