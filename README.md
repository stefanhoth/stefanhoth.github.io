# Stefan Hoth's Personal Website

Welcome! This is my personal portfolio website where you can find information about my background, experience, and current projects.

## Get in Touch

Have questions or want to reach out? Please use the **contact form on the website** to send me a message directly. I'd love to hear from you!

## Tech Stack

If you want to look under the hood, here's what powers this site:

- **Framework**: Astro 5.16.6
- **Styling**: Tailwind CSS 4.1.18
- **UI Components**: Radix UI + shadcn/ui pattern
- **Languages**: TypeScript, Astro components
- **Linting & Formatting**: Biome 2.3.10
- **Deployment**: Netlify (automatic deployments on main branch)

## Development

### Getting Started

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
npm run format       # Format code
npm run lint:fix     # Auto-fix linting issues
```

## Deployment

This site is deployed on [Netlify](https://www.netlify.com) with automatic deployments from the main branch.

The Netlify configuration (`netlify.toml`) includes:
- Build settings optimized for Astro
- Domain redirects to primary domain
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- Performance optimizations with cache headers

## Documentation

For detailed documentation about the codebase, architecture, and development guidelines, see [CLAUDE.MD](./CLAUDE.MD).

---

Built with modern web technologies. Deployed via Netlify.
