import { DATA_KEY, type Driver, type StoreData } from './types';

/**
 * Development only. Keeps the document under `.data/` so the admin panel works
 * locally without a Blob token. Never selected in production; see pickDriver.
 */
export function createLocalDiskDriver(root: string): Driver {
  const path = async () => (await import('node:path')).join(root, DATA_KEY);

  return {
    name: 'local-disk',

    async read() {
      const { readFile } = await import('node:fs/promises');
      try {
        return JSON.parse(await readFile(await path(), 'utf8')) as StoreData;
      } catch {
        return null;
      }
    },

    async write(data) {
      const { mkdir, writeFile } = await import('node:fs/promises');
      const { dirname } = await import('node:path');
      const file = await path();
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, JSON.stringify(data, null, 2), 'utf8');
    },
  };
}
