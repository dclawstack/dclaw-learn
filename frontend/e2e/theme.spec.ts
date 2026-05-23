import { test, expect } from '@playwright/test';

test.describe('Theme toggle', () => {
  test('page loads with dark theme by default', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
  });

  test('theme toggle switches to light mode', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /switch to light/i }).click();
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);
  });

  test('theme persists on reload', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /switch to light/i }).click();
    await page.reload();
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);
  });
});
