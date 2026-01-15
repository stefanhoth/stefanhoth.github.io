# Stefan Hoth - Personal Website

Personal portfolio and contact website built with modern web technologies.

## Tech Stack

- **[Astro](https://astro.build)** - Modern static site generator
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[React](https://react.dev)** - For interactive UI components
- **[TypeScript](https://www.typescriptlang.org)** - Type-safe development
- **[Biome](https://biomejs.dev)** - Fast linter and formatter

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

```bash
# Lint code
npm run lint

# Format code
npm run format

# Auto-fix linting issues
npm run lint:fix
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

## License

Personal website - All rights reserved.
