import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://faastpt.com',
  output: 'static',
  integrations: [sitemap()],
});
