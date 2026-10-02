import type { APIRoute } from 'astro';
import { logIn } from '@/lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const ok = await logIn(String(form.get('password') ?? ''), cookies);
  return redirect(ok ? '/admin/' : '/admin/?error=1', 303);
};
