// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.bansfieldbenefice.org.uk',
  // Keep every URL from the old site: /services/ stays a folder, /benefice/contact.html stays a file.
  build: { format: 'preserve' },
  trailingSlash: 'ignore',
  integrations: [sitemap()],
});
