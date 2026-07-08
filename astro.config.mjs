import { readdirSync } from "node:fs";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import { unified } from "@astrojs/markdown-remark";
import tailwindcss from "@tailwindcss/vite";
import wikiLink from "remark-wiki-link";
import { defineConfig } from "astro/config";

// Vault filenames are the source of truth for slugs (kebab-case, flat
// directory) — used both to resolve [[Wikilink]] targets to those slugs
// and to mark links to non-existent pages as "new".
const vaultPermalinks = readdirSync(new URL("./vault", import.meta.url))
  .filter((name) => name.endsWith(".md"))
  .map((name) => name.replace(/\.md$/, ""));

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
            permalinks: vaultPermalinks,
            pageResolver: (name) => [name.trim().toLowerCase().replace(/\s+/g, "-")],
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
