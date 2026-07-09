# Plan: Obsidian-Vault-Struktur & Build-Time-Ingestion (Astro Content Layer)

**Datum:** 2026-07-05
**Status:** Umgesetzt (PR #67, erweitert in PR #74/#76)
**Aktualisiert:** 2026-07-09 — Netlify-Referenzen entfernt: Das Repo läuft seit PR #44 auf Cloudflare Workers (Deploy automatisch bei Push auf `main` via Cloudflare-GitHub-App), und das Kontaktformular wird vom Worker selbst verarbeitet (Turnstile + SMTP), nicht mehr von Netlify Forms. Die Mechanik dieses Plans ist davon unberührt.
**Ergänzt:** [PR #33 — Obsidian Sync Headless Pipeline](https://github.com/stefanhoth/stefanhoth.github.io/pull/33) (Sync-Hälfte). Dieses Dokument beschreibt die Ingestion-Hälfte.

---

## Ziel

Das Markdown aus `vault/` wird **zur Build-Zeit** in die Astro-Layouts eingebettet — statischer HTML-Output, kein Client-Side-Markdown-Rendering. Der Vault kommt mit **so wenig Dateien wie möglich** aus (1 Seite = 1 Markdown-Datei), aber mit genug Kontrakt (Frontmatter-Schema, Ordner-Regeln), um den Build verlässlich zu machen — auch wenn der Sync aus PR #33 später alle 30 Minuten ungeprüft auf `main` pusht.

## Flow

```
vault/*.md  (flach, 1 Seite = 1 Datei)
     ↓  glob()-Loader (Astro Content Layer)
Zod-Schema-Validierung  ← kaputte Frontmatter = Build-Abbruch
     ↓  render() zur Build-Zeit
statisches HTML in Layout.astro (kein Client-JS)
     ↓  Cloudflare-Workers-Build (bei Push auf main)
stefanhoth.com
```

---

## Reihenfolge der drei Umbauten

1. **Brand Refresh 2026** („Quiet Authority", eigener Plan im Obsidian-Vault) — Texte werden zuerst hartcodiert aktualisiert, eigener PR. Danach existiert `Quote.astro` nicht mehr, `LatestPost.astro` und der GitHub-Link sind neu.
2. **Dieser Plan** — Vault-Verzeichnis + Content-Layer-Ingestion. Der Vault wird initial **von Hand** mit den neuen Quiet-Authority-Texten befüllt und committet; funktioniert komplett ohne den Sync.
3. **PR #33** — der Headless-Sync ersetzt dann nur noch das manuelle Committen.

---

## Was in den Vault gehört — und was nicht

| Aus dem Vault (autorierter Text)        | Bleibt Astro-Komponente (Struktur/Dynamik)      |
| --------------------------------------- | ------------------------------------------------ |
| Tagline, JobHunt-Text, About-Body        | `LatestPost` (dynamischer RSS-Fetch, Build-Time) |
| Title/Description (SEO) pro Seite        | `Links` (SVG-Icons, Photography-TODO)            |
| Ganze Seiten: Projekte, READMEs          | `ContactForm` (Worker: Turnstile + SMTP)         |
|                                          | `Profile`-Gerüst (Name, Bild, Standort)          |

Bewusster Trade-off: Die Links-Liste bleibt in `Links.astro`, obwohl sie Text enthält. Verschachteltes YAML (Liste von Objekten mit Label/URL/Icon) lässt sich in Obsidians Properties-UI nicht sauber editieren und wäre fehleranfällig. Einfache Skalar-Felder dagegen schon — deshalb liegt alles, was aus dem Vault kommt, entweder im Markdown-Body oder in flachen Frontmatter-Feldern.

---

## Vault-Struktur (minimal, flach)

```
vault/
├── .obsidian/           # Obsidian-Konfig (gesynct, größtenteils gitignored per PR #33)
├── attachments/         # Bilder/Anhänge (Obsidian-Einstellung: Attachment-Ordner)
├── home.md              # Homepage → /
├── projects.md          # Projektliste → /projects
├── manager-readme.md    # → /manager-readme
└── employee-readme.md   # → /employee-readme
```

**Die eine Regel:** Nur `*.md` **direkt im Vault-Root** wird zur Seite. Der Dateiname ist der URL-Slug. Alles andere — Unterordner, `.obsidian/`, `attachments/`, private Notizen — wird per Konstruktion ignoriert, weil das glob-Pattern nicht rekursiv matcht. Eine Streu-Notiz in einem Unterordner kann den Build also nie beeinflussen.

## Frontmatter-Kontrakt

### Normale Seiten (`projects.md`, `manager-readme.md`, …)

```yaml
---
title: Manager README        # Pflicht, sobald publish: true
description: Wie ich führe…  # optional, für <meta name="description">
publish: true                # default false → Seite wird NICHT gebaut
---
```

`publish: false` als Default ist der zentrale Schutz: Eine neue, halbfertige Note im Vault-Root geht nie versehentlich live — wichtig, sobald der 30-Minuten-Sync aus PR #33 direkt auf `main` pusht.

### `home.md` (Sonderfall)

Die Homepage besteht aus Sektionen, daher liegen die Sektions-Texte als **einfache Skalar-Felder** im Frontmatter, der Body ist der About-Text. Initialer Inhalt = die neuen Quiet-Authority-Texte:

```yaml
---
title: Stefan Hoth | Engineering Leader
description: Engineering Leader building high-trust engineering organizations. Currently open to Director or Head of Engineering roles, remote-first.
tagline: Engineering Leader · Building high-trust engineering organizations
jobhunt: "**Open to new roles:** Director or Head of Engineering, remote-first. Ideally with a founder or CTO building out their first engineering leadership layer, or a scale-up that needs structure brought into an established team."
---
I build engineering organizations where teams ship sustainably and stakeholders
trust the process. […]

On the side I'm building [crusty-proxy](https://github.com/stefanhoth/crusty-proxy), […]
```

- `jobhunt` weggelassen oder leer → Banner wird ausgeblendet (Job-Suche beenden = ein Feld in Obsidian löschen)
- Kein `publish`-Feld — die Homepage wird immer gebaut; fehlt `home.md`, bricht der Build (gewollt)
- Keine Quote-Felder — `Quote.astro` wird im Brand Refresh gelöscht

---

## Geplante Änderungen am Repository

### 1. `src/content.config.ts` (neu)

Zwei Collections über den `glob()`-Loader. `base` darf außerhalb von `src/` liegen; `pattern` akzeptiert Arrays mit `!`-Negation (micromatch).

```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const home = defineCollection({
  loader: glob({ pattern: "home.md", base: "./vault" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tagline: z.string(),
    jobhunt: z.string().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: ["*.md", "!home.md"], base: "./vault" }),
  schema: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      publish: z.boolean().default(false),
    })
    .superRefine((data, ctx) => {
      if (data.publish && !data.title) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "title ist Pflicht, wenn publish: true",
        });
      }
    }),
});

export const collections = { home, pages };
```

### 2. `src/pages/[slug].astro` (neu)

Eine dynamische Route rendert alle publizierten Vault-Seiten — neue Seite anlegen heißt: neue `.md` im Vault-Root + `publish: true`, kein Astro-Code nötig.

```astro
---
import { getCollection, render } from "astro:content";
import Layout from "@/layouts/Layout.astro";

export async function getStaticPaths() {
  const pages = await getCollection("pages", ({ data }) => data.publish);
  return pages.map((page) => ({ params: { slug: page.id }, props: { page } }));
}

const { page } = Astro.props;
const { Content } = await render(page);
---

<Layout title={page.data.title} description={page.data.description}>
  <article class="prose">
    <h1>{page.data.title}</h1>
    <Content />
  </article>
</Layout>
```

### 3. `src/pages/index.astro` (Umbau, nach dem Brand Refresh)

```astro
---
import { getEntry, render } from "astro:content";
// … bestehende Komponenten-Imports …

const home = await getEntry("home", "home");
const { Content: AboutContent } = await render(home);
---

<Layout title={home.data.title} description={home.data.description}>
  <Profile tagline={home.data.tagline} />
  {home.data.jobhunt && <JobHunt text={home.data.jobhunt} />}
  <About><AboutContent /></About>
  <LatestPost />
  <Links />
  <ContactForm />
</Layout>
```

`Profile.astro`, `JobHunt.astro` und `About.astro` werden von hartcodiertem Text auf Props/Slot umgestellt; Markup und Styles bleiben unverändert.

### 4. Wikilinks: `@portaljs/remark-wiki-link`

- Als devDependency, registriert in `astro.config.mjs` unter `markdown.remarkPlugins` — wirkt damit auf alle Collection-Einträge
- Flacher Vault → triviale Auflösung: `[[manager-readme]]` → `/manager-readme`, Aliase wie `[[manager-readme|Wie ich führe]]` funktionieren

```js
// astro.config.mjs
import wikiLink from "@portaljs/remark-wiki-link";

export default defineConfig({
  markdown: {
    remarkPlugins: [
      [wikiLink, { pathFormat: "obsidian-short", hrefTemplate: (p) => `/${p}` }],
    ],
  },
  // …
});
```

**Obsidian-Konvention:** Einstellung „Use [[Wikilinks]]" **aus**. Dann erzeugt Obsidian beim Einfügen von Bildern Standard-Syntax (`![](attachments/x.png)`) statt `![[…]]`-Embeds, die das Plugin nicht zuverlässig abdeckt. Manuell getippte `[[…]]`-Links funktionieren trotzdem.

### 5. Typografie

`@tailwindcss/typography` als Dependency, in `src/styles/global.css` aktiviert (Tailwind-4-Syntax):

```css
@plugin "@tailwindcss/typography";
```

Die gerenderten Markdown-Seiten bekommen damit über `class="prose"` konsistente Typografie, ohne dass jede HTML-Struktur einzeln gestylt werden muss.

### 6. Attachments/Bilder

- Obsidian-Einstellung: Attachment-Ordner = `attachments/`
- Primärweg: relative Pfade `![](attachments/foo.png)` — Astro soll sie beim Build auflösen und optimieren. **Verifikationspunkt:** Die Astro-Doku ist für Content außerhalb von `src/` hier nicht eindeutig; bei der Implementierung mit einem Testbild prüfen.
- Fallback, falls die Optimierung außerhalb `src/` nicht greift: Prebuild-Copy im `build`-Script — `cp -r vault/attachments public/attachments`
- Phase 1 (READMEs + Projektliste) ist reiner Text; Bilder blockieren nichts

---

## Verlässlichkeits-Mechanismen im Überblick

1. **Nur Root-`*.md` wird ingested** → keine Streu-Notiz, kein Unterordner, keine Obsidian-Konfig kann den Build beeinflussen
2. **`publish: false` als Default** → halbfertige Notes gehen nie live, Veröffentlichen ist eine bewusste Entscheidung in Obsidian
3. **Zod-Validierung** → kaputte Frontmatter einer publizierten Seite lässt den Cloudflare-Build **laut** fehlschlagen; die letzte gute Version bleibt online
4. **`home.md` ist Pflicht** → fehlt sie, bricht der Build sofort, statt eine leere Homepage zu deployen

## Offene Punkte

- **Navigation:** Wie erreichen Besucher die neuen Seiten? Vorschlag: Links im About-Text per Wikilink; alternativ später eine kleine Nav-Komponente
- **Bild-Optimierung** außerhalb `src/` verifizieren (siehe Punkt 6)
- **Photography-Link** (aus dem Brand Refresh): unabhängig von diesem Plan, bleibt TODO in `Links.astro`

## Bestehende Infrastruktur bleibt unverändert

- Astro 5 + Tailwind 4 + Cloudflare Workers (Deployment)
- `@astrojs/mdx` ist bereits installiert; für den Vault reicht plain Markdown
- Der Sync-Workflow aus PR #33 baut später unverändert auf dieser Struktur auf
