# Stefan Hoth Personal Website

## Project Overview

This is Stefan Hoth's personal website built with Astro, showcasing professional profile, experience, and contact information. The site is deployed as a static GitHub Pages site.

## Tech Stack

- **Framework**: Astro 5.16.6
- **Styling**: Tailwind CSS 4.1.18
- **UI Components**: Radix UI + shadcn/ui pattern
- **Languages**: TypeScript, Astro components
- **Linting/Formatting**: Biome 2.3.10
- **Deployment**: Netlify

## Project Structure

```
/
├── public/              # Static assets
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
```

## Key Features

1. **Profile Section**: Professional introduction and photo
2. **Job Hunt Status**: Current job search status
3. **About Section**: Detailed background and expertise
4. **Quote Section**: Featured quote or motto
5. **Links Section**: Social media and professional links
6. **Contact Form**: Netlify Forms integration for contact

## Design Patterns

- Component-based architecture with Astro
- Utility-first styling with Tailwind CSS
- Type-safe development with TypeScript
- Modern React components for interactive UI elements
- Responsive design

## Configuration Notes

- Node version managed via `.nvmrc` (currently v24)
- Renovate bot enabled for dependency updates
- Contact form configured for Netlify Forms (name must match form ID)

## Deployment

The site is deployed via Netlify with automatic deployments triggered when changes are pushed to the main branch. The repository is hosted on GitHub at `stefanhoth.github.io`.

### Netlify Configuration

The site uses a `netlify.toml` file for comprehensive configuration:

**Build Settings**:
- Build command: `npm run build`
- Publish directory: `dist` (Astro output)
- Node.js version: 24

**Redirects**:
- All domain aliases (stefan-hoth.de, www.stefanhoth.com, etc.) redirect to the primary domain stefanhoth.com with 301 status
- Legacy Netlify subdomain redirects to primary domain

**Security Headers**:
- X-Frame-Options: Prevents clickjacking attacks
- X-Content-Type-Options: Prevents MIME type sniffing
- Strict-Transport-Security (HSTS): Enforces HTTPS for 1 year
- Content-Security-Policy: Restricts resource loading for enhanced security
- Referrer-Policy: Controls referrer information sharing
- Permissions-Policy: Restricts access to browser features

**Performance Optimization**:
- Static assets (/assets/*, CSS, JS) cached for 1 year with immutable directive

**Context-Specific Settings**:
- Production: NODE_ENV=production
- Deploy previews: NODE_ENV=preview
- Branch deploys: NODE_ENV=development

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

The contact form uses Netlify Forms. Ensure:
- Form name attribute matches the form ID
- Form is properly configured in Netlify dashboard
- Hidden input field includes form-name for JS-rendered forms

## Recent Changes

- Updated to Node.js v24
- Activated Renovate bot for automated dependency updates
- Fixed contact form configuration for Netlify Forms compatibility
