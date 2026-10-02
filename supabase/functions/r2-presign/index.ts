// Supabase Edge Function: hands out short-lived Cloudflare R2 URLs.
// The R2 secret key lives ONLY here (as a function secret), never in the browser.
//
// POST body:
//   { action: "upload",   clubId, kind: "tiles" | "metadata", fileName, contentType? }   (admin only)
//   { action: "download", keys: string[] }                                                 (admin, or client for own club)
import { corsHeaders, getCaller, json, slugify } from "../_shared/common.ts";
import { presignUrl } from "../_shared/sigv4.ts";

const ACCOUNT = Deno.env.get("R2_ACCOUNT_ID")!;
const KEY_ID = Deno.env.get("R2_ACCESS_KEY_ID")!;
const SECRET = Deno.env.get("R2_SECRET_ACCESS_KEY")!;
const BUCKET = Deno.env.get("R2_BUCKET") ?? "maptiles";
const HOST = `${ACCOUNT}.r2.cloudflarestorage.com`;

const safeName = (n: string) => n.replace(/[^\w.\-]+/g, "_").slice(-150);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    if (!ACCOUNT || !KEY_ID || !SECRET) return json({ error: "R2 secrets are not configured on the server" }, 500);

    const caller = await getCaller(req);
    if (caller instanceof Response) return caller;

    const body = await req.json();

    // ---------- upload (admin) ----------
    if (body.action === "upload") {
      if (caller.role !== "admin") return json({ error: "Admin role required" }, 403);
      const { clubId, kind, fileName, contentType } = body;
      if (!clubId || !["tiles", "metadata"].includes(kind) || !fileName) {
        return json({ error: "clubId, kind and fileName are required" }, 400);
      }
      const { data: club } = await caller.admin.from("clubs").select("club_name").eq("id", clubId).maybeSingle();
      if (!club) return json({ error: "Club not found" }, 404);

      const key = `${slugify(club.club_name)}/${kind}/${Date.now()}-${safeName(fileName)}`;
      const uploadUrl = await presignUrl({
        method: "PUT", host: HOST, path: `/${BUCKET}/${key}`,
        accessKeyId: KEY_ID, secretAccessKey: SECRET, expiresIn: 3600,
      });
      return json({ uploadUrl, key, contentType: contentType ?? "application/octet-stream" });
    }

    // ---------- download (admin or the club's own client) ----------
    if (body.action === "download") {
      const keys: string[] = Array.isArray(body.keys) ? body.keys.slice(0, 500) : [];
      if (keys.length === 0) return json({ urls: {} });

      if (caller.role !== "admin") {
        if (!caller.clubId) return json({ error: "No club assigned" }, 403);
        const { data: club } = await caller.admin.from("clubs").select("club_name").eq("id", caller.clubId).maybeSingle();
        const prefix = `${slugify(club?.club_name ?? "")}/`;
        if (!club || keys.some((k) => !k.startsWith(prefix) || k.includes(".."))) {
          return json({ error: "Not allowed to read those files" }, 403);
        }
      }
      const urls: Record<string, string> = {};
      for (const k of keys) {
        urls[k] = await presignUrl({
          method: "GET", host: HOST, path: `/${BUCKET}/${k}`,
          accessKeyId: KEY_ID, secretAccessKey: SECRET, expiresIn: 3600,
        });
      }
      return json({ urls });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: "Internal error" }, 500);
  }
});
