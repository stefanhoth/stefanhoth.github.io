import { expect, test } from "@playwright/test";

test("renders the form with a working Turnstile widget and enabled submit button", async ({
  page,
}) => {
  await page.goto("/");

  // The test sitekey resolves invisibly (no iframe) but populates the hidden
  // response token once solved — that's what proves the widget actually ran.
  const tokenInput = page.locator('input[name="cf-turnstile-response"]');
  await expect(tokenInput).toHaveValue(/\S+/, { timeout: 10_000 });
  await expect(page.locator('#contact button[type="submit"]')).toBeEnabled();
  await expect(page.locator("#contact-status")).toBeHidden();
});

test("shows a success banner and cleans the URL for ?sent=true", async ({ page }) => {
  await page.goto("/?sent=true");

  const status = page.locator("#contact-status");
  await expect(status).toBeVisible();
  await expect(status).toContainText("Thanks for your message");
  await expect(page).toHaveURL(/\/$/);
});

test("shows an error banner and cleans the URL for ?error=true", async ({ page }) => {
  await page.goto("/?error=true");

  const status = page.locator("#contact-status");
  await expect(status).toBeVisible();
  await expect(status).toContainText("Something went wrong");
  await expect(page).toHaveURL(/\/$/);
});

test("disables submit and warns when the Turnstile script fails to load", async ({ page }) => {
  await page.route("**/challenges.cloudflare.com/turnstile/v0/api.js", (route) => route.abort());

  await page.goto("/");

  const status = page.locator("#contact-status");
  await expect(status).toBeVisible({ timeout: 10_000 });
  await expect(status).toContainText("Bot protection failed to load");
  await expect(page.locator('#contact button[type="submit"]')).toBeDisabled();
});
