import { expect, test, type Page } from "@playwright/test";

async function mockAnonymousAuthState(page: Page, isSetupComplete: boolean) {
  await page.route("**/api/auth/setup-status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: { isSetupComplete },
        success: true,
        status: 200,
      }),
    });
  });

  await page.route("**/api/users/me", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        statusCode: 401,
        message: "Unauthorized",
      }),
    });
  });
}

test.describe("auth redirect regression", () => {
  test("redirects login to setup when setup is incomplete", async ({ page }) => {
    await mockAnonymousAuthState(page, false);

    await page.goto("/login");

    await expect(page).toHaveURL(/\/setup\/register$/);
    await expect(page.getByRole("heading", { name: /create workspace/i })).toBeVisible();
  });

  test("redirects signup to setup when setup is incomplete", async ({ page }) => {
    await mockAnonymousAuthState(page, false);

    await page.goto("/signup");

    await expect(page).toHaveURL(/\/setup\/register$/);
    await expect(page.getByRole("heading", { name: /create workspace/i })).toBeVisible();
  });

  test("redirects setup to login when setup is already complete", async ({ page }) => {
    await mockAnonymousAuthState(page, true);

    await page.goto("/setup/register");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
  });
});
