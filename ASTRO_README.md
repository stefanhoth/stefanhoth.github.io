# Astro Website

Diese Website wurde von Jekyll zu Astro migriert.

## Entwicklung

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Build für Production
npm run build

# Preview des Builds
npm run preview
```

## Projektstruktur

- `src/pages/index.astro` - Hauptseite
- `src/components/` - Astro Komponenten
- `src/layouts/` - Layout Templates
- `public/` - Statische Assets (img/, _redirects)

## Deployment

Die Website wird als statische Site gebaut. Der Output ist im `dist/` Ordner.

Für Netlify:
- Build Command: `npm run build`
- Publish Directory: `dist`

Für GitHub Pages:
- Der `dist/` Ordner kann direkt deployed werden

## Technologie

- Astro 4.x
- React (optional, für zukünftige Erweiterungen)
- MDX (optional, für Blog-Posts)

