import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://cardea.tekhos.com',
  integrations: [sitemap()],
  output: 'static',
});
