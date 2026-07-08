import { onRequestPost } from "../functions/contact.js";

// Requests that match a static asset are served by Cloudflare's asset layer
// without invoking this Worker — those get their headers from public/_headers.
// Keep the two header sets in sync. This set covers Worker-handled responses
// (POST /contact) and any request that falls through to the Worker.
const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  // "0" disables the legacy XSS auditor, which is deprecated and can itself
  // be abused for cross-site leaks in older browsers. CSP is the real defense.
  "X-XSS-Protection": "0",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  // script-src has no 'unsafe-inline': Astro is configured (assetsInlineLimit: 0)
  // to emit all scripts as external files. style-src keeps 'unsafe-inline' for
  // Astro's inlined stylesheets and the Turnstile widget's style attributes.
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-src https://challenges.cloudflare.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
};

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Vault pages with a `.md`-suffixed `permalink` frontmatter field are
// published as file-style `.md` URLs rather than the folder-style
// `/<slug>/` URL Astro's static build produces. Requests for the bare or
// trailing-slash form redirect to the `.md` URL; the `.md` request itself
// is served by fetching the built page directly, so the visible URL never
// gets a trailing slash. The slug list is generated at build time into
// /_file-style-pages.json (see astro.config.mjs) because this Worker is
// bundled from a plain checkout without access to build-generated modules.
let fileStyleSlugsPromise;

function loadFileStyleSlugs(url, env) {
  fileStyleSlugsPromise ??= env.ASSETS.fetch(
    new URL("/_file-style-pages.json", url),
  )
    .then((response) => (response.ok ? response.json() : []))
    .catch(() => {
      // Don't cache a transient failure for the isolate's lifetime.
      fileStyleSlugsPromise = undefined;
      return [];
    });
  return fileStyleSlugsPromise;
}

async function serveFileStyleAlias(url, request, env) {
  for (const slug of await loadFileStyleSlugs(url, env)) {
    if (url.pathname === `/${slug}.md`) {
      const assetRequest = new Request(new URL(`/${slug}/`, url), request);
      return await env.ASSETS.fetch(assetRequest);
    }
    if (url.pathname === `/${slug}` || url.pathname === `/${slug}/`) {
      return Response.redirect(new URL(`/${slug}.md`, url), 301);
    }
  }
  return null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/contact") {
      return withSecurityHeaders(await onRequestPost({ request, env }));
    }

    const fileStyleResponse = await serveFileStyleAlias(url, request, env);
    if (fileStyleResponse) {
      return withSecurityHeaders(fileStyleResponse);
    }

    return withSecurityHeaders(await env.ASSETS.fetch(request));
  },
};
