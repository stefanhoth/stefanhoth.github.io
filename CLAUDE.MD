# Stefan Hoth Personal Website

## Project Overview

This is Stefan Hoth's personal website built with Astro, showcasing professional profile, experience, and contact information. The site is built as static assets and served by a Cloudflare Worker.

## Tech Stack

- **Framework**: Astro 5.16.6
- **Styling**: Tailwind CSS 4.1.18
- **UI Components**: Radix UI + shadcn/ui pattern
- **Languages**: TypeScript, Astro components
- **Linting/Formatting**: Biome 2.3.10
- **Deployment**: Cloudflare Workers (wrangler)

## Project Structure

```
/
├── public/              # Static assets (incl. _headers for Cloudflare)
├── worker/
│   └── index.js         # Cloudflare Worker entry (serves assets, routes /contact)
├── functions/
│   ├── contact.js       # Contact form handler (Turnstile + SMTP)
│   └── smtp.js          # Minimal SMTP client
├── src/
│   ├── components/      # Astro components
│   │   ├── About.astro
│   │   ├── ContactForm.astro
│   │   ├── JobHunt.astro
│   │   ├── Links.astro
│   │   ├── Profile.astro
│   │   ├── Quote.astro
│   │   └── ui/          # React UI components (shadcn/ui)
│   ├── layouts/
│   │   └── Layout.astro # Base layout
│   ├── pages/
│   │   └── index.astro  # Main page
│   ├── styles/
│   │   └── global.css   # Global styles
│   └── lib/
│       └── utils.ts     # Utility functions
├── astro.config.mjs     # Astro configuration
├── wrangler.jsonc       # Cloudflare Workers configuration
├── biome.json          # Biome linter/formatter config
├── components.json     # shadcn/ui components config
└── tsconfig.json       # TypeScript configuration
```

## Development Commands

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run Biome linter
npm run format     # Format code with Biome
npm run lint:fix   # Auto-fix linting issues
npm run test       # Run Vitest (unit + jsdom) tests
npm run test:watch # Run Vitest in watch mode
npm run test:e2e   # Run Playwright end-to-end tests (real browser)
npm run worker:dev    # Build, then run the Worker locally with wrangler dev
npm run worker:deploy # Build, then deploy the Worker to Cloudflare
```

## Key Features

1. **Profile Section**: Professional introduction and photo
2. **Job Hunt Status**: Current job search status
3. **About Section**: Detailed background and expertise
4. **Quote Section**: Featured quote or motto
5. **Links Section**: Social media and professional links
6. **Contact Form**: POSTs to `/contact`, handled by the Cloudflare Worker (Turnstile bot check + email via SMTP)

## Design Patterns

- Component-based architecture with Astro
- Utility-first styling with Tailwind CSS
- Type-safe development with TypeScript
- Modern React components for interactive UI elements
- Responsive design

## Configuration Notes

- Node version managed via `.nvmrc` (currently v24)
- Renovate bot enabled for dependency updates
- Worker secrets (`TURNSTILE_SECRET_KEY`, `MAILSENDER_SMTP_USER`, `MAILSENDER_SMTP_PASS`) are set via `wrangler secret`; local values go in `.dev.vars` (see `.dev.vars.example`)
- `PUBLIC_TURNSTILE_SITE_KEY` is a build-time env var for the frontend Turnstile widget (see `.env.example`)

## Deployment

The site runs on Cloudflare Workers. A single Worker (`worker/index.js`, configured via `wrangler.jsonc`) serves the static Astro build from `dist/` through the `ASSETS` binding, handles `POST /contact`, and stamps security headers on every asset response. It is bound to the custom domain `stefanhoth.com`.

**Configuration** (`wrangler.jsonc`):
- Worker name: `stefanhoth-com`, entry point `worker/index.js`
- Static assets served from `dist/` (Astro build output)
- Route: `stefanhoth.com` as a custom domain
- Observability logs enabled

**Headers**:
- Security headers (X-Frame-Options, X-Content-Type-Options, HSTS, CSP, Referrer-Policy, Permissions-Policy) are defined in two places that must be kept in sync: `public/_headers` (applied by the assets platform) and the `SECURITY_HEADERS` object in `worker/index.js`
- The CSP allows `https://challenges.cloudflare.com` (script + frame) for the Turnstile widget
- `public/_headers` caches `/_astro/*` for 1 year with the immutable directive

**Deploys**:
- Production: `npm run worker:deploy` (builds, then `wrangler deploy`)
- PR previews: `.github/workflows/preview-deploy.yml` builds the site and uploads a preview version via `cloudflare/wrangler-action` with a `pr-<number>` alias, then registers a GitHub deployment and comments the preview URL (`https://pr-<number>-stefanhoth-com.stefanhoth-de.workers.dev`) on the PR
- CI (`.github/workflows/ci.yml`) runs lint, build, unit tests, and Playwright e2e on every PR and push to main
- Local Worker testing: `npm run worker:dev` (secrets from `.dev.vars`)

## Working with This Codebase

### Adding New Components

1. Create `.astro` files in `src/components/` for static content
2. Use React/TypeScript in `src/components/ui/` for interactive components
3. Import and use in `src/pages/index.astro`

### Styling

- Use Tailwind utility classes directly in components
- Global styles in `src/styles/global.css`
- Custom utilities via Tailwind configuration

### Contact Form

The contact form POSTs to `/contact`, which the Worker routes to `onRequestPost` in `functions/contact.js`. The handler:
1. Verifies the Cloudflare Turnstile token (`cf-turnstile-response`) against the siteverify API using `TURNSTILE_SECRET_KEY`
2. Validates required fields (name, email, message) and rejects CR/LF in name/email to prevent SMTP header injection
3. Sends the email via SMTP through mailbox.org (`smtp.mailbox.org:465`, credentials in `MAILSENDER_SMTP_USER`/`MAILSENDER_SMTP_PASS`) using the minimal client in `functions/smtp.js`
4. Redirects back to `/?sent=true` on success or `/?error=true` on failure

The frontend widget needs `PUBLIC_TURNSTILE_SITE_KEY` at build time.

## Recent Changes

- Migrated hosting from Netlify to Cloudflare Workers (PR #44)
- Contact form now handled by the Worker: Turnstile verification + email via mailbox.org SMTP
- Updated to Node.js v24
- Activated Renovate bot for automated dependency updates
