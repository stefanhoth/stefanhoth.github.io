import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import { unified } from "@astrojs/markdown-remark";
import tailwindcss from "@tailwindcss/vite";
import wikiLink from "remark-wiki-link";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx()],
  output: "static",
  site: "https://stefanhoth.com",
  base: "/",

  markdown: {
    processor: unified({
      remarkPlugins: [
        [
          wikiLink,
          {
            aliasDivider: "|",
            pathFormat: "obsidian-short",
            hrefTemplate: (permalink) => `/${permalink}`,
          },
        ],
      ],
    }),
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Never inline scripts into the HTML — the Worker's CSP has no
      // 'unsafe-inline' in script-src, so all scripts must be external files.
      assetsInlineLimit: 0,
    },
  },
});
