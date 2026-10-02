import { createLocalDiskDriver } from './local-disk';
import { createVercelBlobDriver } from './vercel-blob';
import type { Driver, StoreData } from './types';

export type { StoreData } from './types';

/**
 * Used only while no ADMIN_PASSWORD is configured, so the panel works the
 * moment the site deploys. It is in the repository and therefore public
 * knowledge: set ADMIN_PASSWORD on the Vercel project before launch. Doing so
 * also re-keys the session cookie, since ADMIN_SESSION_SECRET falls back to it.
 */
export const DEMO_ADMIN_PASSWORD = 'NORTHMAIN460';

export function env(name: string): string | undefined {
  return process.env[name] ?? (import.meta.env as Record<string, string | undefined>)[name] ?? undefined;
}

export function getSecret(name: 'ADMIN_PASSWORD' | 'ADMIN_SESSION_SECRET'): string | null {
  const configured = env(name);
  if (configured) return configured;
  return name === 'ADMIN_PASSWORD' ? DEMO_ADMIN_PASSWORD : null;
}

/** True while the panel is still protected by the public demo password. */
export function usingDemoPassword(): boolean {
  return !env('ADMIN_PASSWORD');
}

let driver: Driver | null | undefined;

/**
 * Vercel Blob when its token is present. The disk driver is a development
 * convenience and never chosen in production, so a misconfigured deploy shows
 * the built-in defaults instead of writing to a container that disappears.
 */
async function pickDriver(): Promise<Driver | null> {
  if (driver !== undefined) return driver;

  const token = env('BLOB_READ_WRITE_TOKEN');
  if (token) {
    driver = createVercelBlobDriver(token);
  } else if (import.meta.env.DEV) {
    const { join } = await import('node:path');
    driver = createLocalDiskDriver(join(process.cwd(), '.data'));
  } else {
    driver = null;
  }
  return driver;
}

export async function storeStatus(): Promise<{ driver: Driver['name'] | null; writable: boolean }> {
  const d = await pickDriver();
  return { driver: d?.name ?? null, writable: Boolean(d) };
}

export async function readStore(): Promise<StoreData> {
  const d = await pickDriver();
  return (await d?.read()) ?? {};
}

export async function writeStore(data: StoreData): Promise<void> {
  const d = await pickDriver();
  if (!d) throw new Error('No storage is configured. Add a Vercel Blob store to the project.');
  await d.write({ ...data, updatedAt: new Date().toISOString() });
}
