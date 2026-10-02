import { DATA_KEY, type Driver, type StoreData } from './types';

/**
 * Vercel Blob. The document is overwritten in place at a stable pathname
 * (`addRandomSuffix: false`), so its public URL never changes. Reads go
 * straight to that URL with a cache-busting query rather than through `head()`,
 * which keeps every page view to one plain fetch instead of an API operation.
 */
function storeUrl(token: string): string | null {
  // Tokens look like vercel_blob_rw_<storeId>_<secret>.
  const storeId = token.split('_')[3];
  return storeId ? `https://${storeId.toLowerCase()}.public.blob.vercel-storage.com/${DATA_KEY}` : null;
}

export function createVercelBlobDriver(token: string): Driver {
  return {
    name: 'vercel-blob',

    async read() {
      try {
        let url = storeUrl(token);
        if (!url) {
          const { head } = await import('@vercel/blob');
          url = (await head(DATA_KEY, { token })).url;
        }
        const response = await fetch(`${url}?t=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) return null;
        return (await response.json()) as StoreData;
      } catch {
        // Nothing saved yet, or the store is unreachable: fall back to defaults.
        return null;
      }
    },

    async write(data) {
      const { put } = await import('@vercel/blob');
      await put(DATA_KEY, JSON.stringify(data, null, 2), {
        token,
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 60,
      });
    },
  };
}
