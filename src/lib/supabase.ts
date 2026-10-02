import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
}

// Browser client: anon key only. The service-role key must NEVER be in frontend code;
// admin-only operations run in Supabase Edge Functions (see supabase/functions).
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Calls an Edge Function with the signed-in user's session and returns a readable error. */
export async function callFunction<T = any>(name: string, body: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body: body as any });
  if (error) {
    let message = error.message;
    try {
      const ctx = (error as any).context;
      if (ctx && typeof ctx.json === 'function') {
        const j = await ctx.json();
        if (j?.error) message = j.error;
      }
    } catch { /* keep default message */ }
    throw new Error(message);
  }
  if (data && (data as any).error) throw new Error((data as any).error);
  return data as T;
}
