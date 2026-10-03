// Supabase Edge Function: admin deletes a user account.
// POST body: { userId }
import { corsHeaders, getCaller, json } from "../_shared/common.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const caller = await getCaller(req);
    if (caller instanceof Response) return caller;
    if (caller.role !== "admin") return json({ error: "Admin role required" }, 403);

    const { userId } = await req.json();
    if (!userId) return json({ error: "userId is required" }, 400);
    if (userId === caller.userId) return json({ error: "You cannot delete your own account" }, 400);

    const { error } = await caller.admin.auth.admin.deleteUser(userId);
    if (error) return json({ error: `Failed to delete user: ${error.message}` }, 500);

    return json({ success: true });
  } catch (e) {
    console.error(e);
    return json({ error: "Internal error" }, 500);
  }
});
