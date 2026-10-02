import type { AstroCookies } from 'astro';
import { ADMIN_PASSWORD_HASH, env, getSecret } from './store';

const COOKIE = 'rj_admin';
const SESSION_HOURS = 12;
const encoder = new TextEncoder();

const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
const fromBase64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

// Last resort when no secret is configured anywhere: sessions then last only as
// long as this server instance does, which is fine for local development.
let instanceKey: string | undefined;

/**
 * The cookie signing key has to be secret, so it never comes from the
 * repository. A dedicated secret is preferred; otherwise the Vercel Blob token,
 * which every live install has and which is never shown to visitors.
 */
function sessionKey(): string {
  return getSecret('ADMIN_SESSION_SECRET')
    ?? getSecret('ADMIN_PASSWORD')
    ?? env('BLOB_READ_WRITE_TOKEN')
    ?? (instanceKey ??= toHex(crypto.getRandomValues(new Uint8Array(32)).buffer));
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(sessionKey()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
}

/** Compares two strings without leaking how many characters matched. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Checks a password against `pbkdf2-sha256$<iterations>$<salt>$<hash>`. */
async function matchesHash(password: string, stored: string): Promise<boolean> {
  const [scheme, iterations, salt, hash] = stored.split('$');
  if (scheme !== 'pbkdf2-sha256' || !iterations || !salt || !hash) return false;
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromBase64(salt), iterations: Number(iterations) },
    key,
    256,
  );
  return timingSafeEqual(toHex(bits), toHex(fromBase64(hash).buffer));
}

async function passwordMatches(password: string): Promise<boolean> {
  const configured = getSecret('ADMIN_PASSWORD');
  if (configured) return timingSafeEqual(password, configured);
  return matchesHash(password, ADMIN_PASSWORD_HASH);
}

export async function logIn(password: string, cookies: AstroCookies): Promise<boolean> {
  if (!(await passwordMatches(password))) {
    // Takes the edge off automated guessing without a rate-limit store.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return false;
  }
  const expires = String(Date.now() + SESSION_HOURS * 3600_000);
  cookies.set(COOKIE, `${expires}.${await sign(expires)}`, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_HOURS * 3600,
  });
  return true;
}

export function logOut(cookies: AstroCookies) {
  cookies.delete(COOKIE, { path: '/' });
}

export async function isSignedIn(cookies: AstroCookies): Promise<boolean> {
  const raw = cookies.get(COOKIE)?.value;
  if (!raw) return false;
  const [expires, signature] = raw.split('.');
  if (!expires || !signature || !(Number(expires) > Date.now())) return false;
  return timingSafeEqual(signature, await sign(expires));
}
