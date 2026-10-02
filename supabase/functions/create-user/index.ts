// Supabase Edge Function: admin creates a user account and (optionally) assigns a club.
// POST body: { email, password, name, role?: "client" | "admin", clubId?: string | null }
import { corsHeaders, getCaller, json } from "../_shared/common.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const caller = await getCaller(req);
    if (caller instanceof Response) return caller;
    if (caller.role !== "admin") return json({ error: "Admin role required" }, 403);

    const { email, password, name, role = "client", clubId = null } = await req.json();
    if (!email || !password || !name) return json({ error: "name, email and password are required" }, 400);
    if (String(password).length < 8) return json({ error: "Password must be at least 8 characters" }, 400);
    if (!["client", "admin"].includes(role)) return json({ error: "Invalid role" }, 400);

    const { data, error } = await caller.admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,                    // admin-created users can log in right away
      user_metadata: { full_name: name },
    });
    if (error || !data.user) return json({ error: error?.message ?? "Could not create user" }, 400);

    // The signup trigger creates the profile as 'client'; set the real values here.
    const { error: pErr } = await caller.admin.from("profiles").upsert({
      id: data.user.id, name, email, role, club_id: clubId || null,
    });
    if (pErr) return json({ error: `User created but profile failed: ${pErr.message}`, userId: data.user.id }, 500);

    return json({ success: true, userId: data.user.id });
  } catch (e) {
    console.error(e);
    return json({ error: "Internal error" }, 500);
  }
});
