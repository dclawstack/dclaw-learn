import { test, expect } from '@playwright/test';

test.describe('SeedWidget', () => {
  test('seed widget is visible on main landing page', async ({ page }) => {
    await page.goto('/');
    // Widget appears after checking data state
    await expect(page.getByText(/seed demo data|re-seed data/i)).toBeVisible({ timeout: 5000 });
  });

  test('seed widget is NOT visible on /courses page', async ({ page }) => {
    await page.goto('/courses');
    await expect(page.getByText(/seed demo data/i)).not.toBeVisible();
  });

  test('clear button appears when data exists', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=/seed demo data|re-seed data/i', { timeout: 5000 });
    // If "Re-seed Data" is shown, clear button should also be visible
    const hasData = await page.getByText(/re-seed data/i).isVisible();
    if (hasData) {
      await expect(page.getByText(/clear data/i)).toBeVisible();
    }
  });
});
