// app/lib/session.server.ts
// Manajemen sesi berbasis HTTP Cookie aman untuk Cloudflare Workers

const SESSION_COOKIE_NAME = "__mtq_session";
const SESSION_SECRET = "mtq-tel-u-secret-session-key-2026-bph";

/**
 * Sign session payload dengan HMAC-SHA256 (Web Crypto API)
 */
async function signValue(value: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  const b64Sig = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${value}.${b64Sig}`;
}

/**
 * Verifikasi dan ekstrak payload sesi
 */
async function verifyValue(signedValue: string): Promise<string | null> {
  const lastDot = signedValue.lastIndexOf(".");
  if (lastDot === -1) return null;

  const value = signedValue.substring(0, lastDot);
  const sig = signedValue.substring(lastDot + 1);

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  try {
    const rawSig = Uint8Array.from(atob(sig), (c) => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify("HMAC", key, rawSig, enc.encode(value));
    return isValid ? value : null;
  } catch {
    return null;
  }
}

/**
 * Buat header Set-Cookie untuk sesi login
 */
export async function createSessionCookie(userId: string): Promise<string> {
  const signed = await signValue(userId);
  const maxAge = 60 * 60 * 24 * 7; // 7 hari
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(
    signed
  )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

/**
 * Baca userId dari Cookie request
 */
export async function getSessionUserId(request: Request): Promise<string | null> {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const target = cookies.find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!target) return null;

  const rawSigned = decodeURIComponent(target.substring(SESSION_COOKIE_NAME.length + 1));
  return verifyValue(rawSigned);
}

/**
 * Buat header Set-Cookie untuk logout (menghapus cookie)
 */
export function destroySessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
