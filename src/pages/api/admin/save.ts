import type { APIRoute } from 'astro';
import { isSignedIn } from '@/lib/auth';
import { cleanStore } from '@/lib/content';
import { writeStore } from '@/lib/store';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

/** Saves the whole editable document. Every field is validated in cleanStore. */
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!(await isSignedIn(cookies))) return json({ ok: false, error: 'Your session ran out. Sign in again.' }, 401);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'That save was not readable. Reload the page and try again.' }, 400);
  }
  try {
    await writeStore(cleanStore(body));
    return json({ ok: true, savedAt: new Date().toISOString() });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : 'Saving failed.' }, 500);
  }
};
