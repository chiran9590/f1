// Supabase Edge Function: authenticated read-only proxy to a club's files in Cloudflare R2.
// Used by the client map (Mapbox) to load tiles and GeoJSON layers without making the bucket public.
//
//   GET /functions/v1/club-files/tiles/{z}/{x}/{y}.png            -> {club}/tiles/{z}/{x}/{y}.png
//   GET /functions/v1/club-files/metadata/{file name}             -> {club}/metadata/{file name}
//
// Clients can only read their own club. Admins pass ?club=<club-slug>.
import { getCaller, slugify } from "../_shared/common.ts";
import { presignUrl } from "../_shared/sigv4.ts";

const ACCOUNT = Deno.env.get("R2_ACCOUNT_ID")!;
const KEY_ID = Deno.env.get("R2_ACCESS_KEY_ID")!;
const SECRET = Deno.env.get("R2_SECRET_ACCESS_KEY")!;
const BUCKET = Deno.env.get("R2_BUCKET") ?? "maptiles";
const HOST = `${ACCOUNT}.r2.cloudflarestorage.com`;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const TYPES: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
  geojson: "application/geo+json", json: "application/json",
};

const fail = (status: number, msg: string) =>
  new Response(JSON.stringify({ error: msg }), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "GET") return fail(405, "Method not allowed");

  try {
    const caller = await getCaller(req);
    if (caller instanceof Response) return caller;

    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
    const at = parts.indexOf("club-files");
    const [kind, ...rest] = parts.slice(at + 1);
    if (!["tiles", "metadata"].includes(kind) || rest.length === 0) return fail(400, "Bad path");
    if (rest.some((p) => p === ".." || p === "." || p === "" || /[\x00-\x1f\\]/.test(p))) return fail(400, "Bad path");

    // Which club's folder may this caller read?
    let slug: string;
    if (caller.role === "admin") {
      slug = url.searchParams.get("club") ?? "";
      if (!/^[a-z0-9-]+$/.test(slug)) return fail(400, "club parameter required");
    } else {
      if (!caller.clubId) return fail(403, "No club assigned");
      const { data: club } = await caller.admin.from("clubs").select("club_name").eq("id", caller.clubId).maybeSingle();
      if (!club) return fail(403, "No club assigned");
      slug = slugify(club.club_name);
    }

    const key = `${slug}/${kind}/${rest.join("/")}`;
    const signed = await presignUrl({
      method: "GET", host: HOST, path: `/${BUCKET}/${key}`,
      accessKeyId: KEY_ID, secretAccessKey: SECRET, expiresIn: 60,
    });
    const r = await fetch(signed);
    if (!r.ok) return new Response(null, { status: 404, headers: cors });

    const ext = key.split(".").pop()?.toLowerCase() ?? "";
    return new Response(r.body, {
      status: 200,
      headers: {
        ...cors,
        "Content-Type": TYPES[ext] ?? r.headers.get("content-type") ?? "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (e) {
    console.error(e);
    return fail(500, "Internal error");
  }
});
