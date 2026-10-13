// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.bansfieldbenefice.org.uk',
  // Keep every URL from the old site: /services/ stays a folder, /benefice/contact.html stays a file.
  build: { format: 'preserve' },
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      // Leave out the 404 page and /notices/, which only redirects to the privacy policy.
      filter: (page) => !/\/(404(\.html)?|notices\/)$/.test(page),
    }),
  ],
});
