// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// TODO(rj): confirm the production domain before launch. It is baked into
// canonicals, Open Graph URLs and the sitemap.
export default defineConfig({
  site: 'https://www.rjautoservicevt.com',
  trailingSlash: 'ignore',
  adapter: vercel(),
  devToolbar: { enabled: false },
  integrations: [sitemap({ filter: (page) => !page.includes('/admin') })],
  build: { inlineStylesheets: 'auto', format: 'directory' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  compressHTML: true,
});
