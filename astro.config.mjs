import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx()],
  output: 'static',
  site: 'https://stefanhoth.com',
  base: '/',

  vite: {
    plugins: [tailwindcss()],
  },
});