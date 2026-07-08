import { defineConfig, devices } from "@playwright/test";

// Cloudflare's public, documented Turnstile test sitekey that always passes
// invisibly. Not a secret — see https://developers.cloudflare.com/turnstile/troubleshooting/testing/
const TURNSTILE_TEST_SITEKEY = "1x00000000000000000000BB";

// When set (e.g. to a PR preview deployment on workers.dev), the suite runs
// against that URL instead of building and serving the site locally.
const remoteBaseURL = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: remoteBaseURL ?? "http://localhost:4322",
    trace: "retain-on-failure",
  },
  webServer: remoteBaseURL
    ? undefined
    : {
        // `astro dev` daemonizes itself by default (Astro 7), which confuses
        // Playwright's process supervision — build + preview instead, which
        // runs as a plain foreground server.
        command: "npm run build && npm run preview -- --port 4322",
        url: "http://localhost:4322",
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        env: {
          PUBLIC_TURNSTILE_SITE_KEY: TURNSTILE_TEST_SITEKEY,
        },
      },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
