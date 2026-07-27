import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://faastpt.example',
  output: 'static',
  integrations: [sitemap()],
});
