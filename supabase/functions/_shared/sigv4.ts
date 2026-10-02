// Minimal AWS Signature V4 query-string presigner (works for Cloudflare R2 / any S3-compatible store).
// Uses only Web Crypto, so it runs in Deno (Supabase Edge Functions) and Node 20+.

const enc = new TextEncoder();

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(data: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", enc.encode(data)));
}

async function hmac(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", k, enc.encode(data));
}

// RFC 3986 encoding (what SigV4 requires)
function rfc3986(s: string): string {
  return encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

export interface PresignOptions {
  method: "GET" | "PUT";
  host: string;          // e.g. <account>.r2.cloudflarestorage.com
  path: string;          // e.g. /bucket/club/tiles/file.png  (unencoded)
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;       // "auto" for R2
  service?: string;      // "s3"
  expiresIn?: number;    // seconds
  now?: Date;
}

export async function presignUrl(o: PresignOptions): Promise<string> {
  const region = o.region ?? "auto";
  const service = o.service ?? "s3";
  const now = o.now ?? new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ""); // 20130524T000000Z
  const dateStamp = amzDate.slice(0, 8);
  const scope = `${dateStamp}/${region}/${service}/aws4_request`;

  const canonicalUri = o.path.split("/").map(rfc3986).join("/");

  const query: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${o.accessKeyId}/${scope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(o.expiresIn ?? 900),
    "X-Amz-SignedHeaders": "host",
  };
  const canonicalQuery = Object.keys(query).sort()
    .map((k) => `${rfc3986(k)}=${rfc3986(query[k])}`).join("&");

  const canonicalRequest = [
    o.method, canonicalUri, canonicalQuery,
    `host:${o.host}\n`, "host", "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, await sha256Hex(canonicalRequest)].join("\n");

  const kDate = await hmac(enc.encode("AWS4" + o.secretAccessKey), dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  const kSigning = await hmac(kService, "aws4_request");
  const signature = toHex(await hmac(kSigning, stringToSign));

  return `https://${o.host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}
