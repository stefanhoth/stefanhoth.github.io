import { expect, test } from "@playwright/test";

// Set (e.g. by the preview-deploy workflow) to run against a deployed Worker
// instead of the local preview server — see playwright.config.ts.
const REMOTE = Boolean(process.env.E2E_BASE_URL);

// These vault pages are served under a file-style `.md` URL by the
// Cloudflare Worker (worker/index.js + wrangler.jsonc's run_worker_first),
// not by Astro's static build directly — `astro preview` never runs that
// Worker code, so these only make sense against a real deployment.
const FILE_STYLE_PAGES = [
  "/employee-readme.md",
  "/manager-readme.md",
  "/projects.md",
];

for (const path of FILE_STYLE_PAGES) {
  test(`${path} exists and serves the rendered page`, async ({ page }) => {
    test.skip(
      !REMOTE,
      "The .md alias is served by the Cloudflare Worker, which the local `astro preview` server doesn't run",
    );

    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    expect(response?.headers()["content-type"]).toContain("text/html");
    await expect(page.locator("article.prose")).toBeVisible();
  });
}
