import type { AstroCookies } from 'astro';
import { getSecret } from './store';

const COOKIE = 'rj_admin';
const SESSION_HOURS = 12;
const encoder = new TextEncoder();

async function sign(payload: string): Promise<string | null> {
  // A dedicated session secret is preferred; falling back to the password means
  // a working install needs only one secret, and changing it signs everyone out.
  const secret = getSecret('ADMIN_SESSION_SECRET') ?? getSecret('ADMIN_PASSWORD');
  if (!secret) return null;
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Compares two strings without leaking how many characters matched. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function logIn(password: string, cookies: AstroCookies): Promise<boolean> {
  const expected = getSecret('ADMIN_PASSWORD');
  if (!expected || !timingSafeEqual(password, expected)) {
    // Takes the edge off automated guessing without a rate-limit store.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return false;
  }
  const expires = String(Date.now() + SESSION_HOURS * 3600_000);
  const signature = await sign(expires);
  if (!signature) return false;
  cookies.set(COOKIE, `${expires}.${signature}`, {
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
  const expected = await sign(expires);
  return Boolean(expected) && timingSafeEqual(signature, expected!);
}
