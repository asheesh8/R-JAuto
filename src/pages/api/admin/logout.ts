import type { APIRoute } from 'astro';
import { logOut } from '@/lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect }) => {
  logOut(cookies);
  return redirect('/admin/', 303);
};
