import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export interface Caller {
  userId: string;
  role: string | null;
  clubId: string | null;
  admin: SupabaseClient; // service-role client (server side only)
}

/** Verifies the JWT sent by the browser and loads the caller's role/club from `profiles`. */
export async function getCaller(req: Request): Promise<Caller | Response> {
  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "Not signed in" }, 401);

  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const token = auth.replace(/^Bearer\s+/i, "");
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return json({ error: "Invalid session" }, 401);

  const { data: profile } = await admin
    .from("profiles").select("role, club_id").eq("id", user.id).maybeSingle();

  return { userId: user.id, role: profile?.role ?? null, clubId: profile?.club_id ?? null, admin };
}

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "club";
