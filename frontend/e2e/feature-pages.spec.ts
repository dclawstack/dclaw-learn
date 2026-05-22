import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/courses', heading: /learn anything, your way/i },
  { path: '/study-plan', heading: /your personal learning roadmap/i },
  { path: '/flashcards', heading: /master anything with spaced repetition/i },
  { path: '/instructor', heading: /build and manage courses with ease/i },
];

for (const { path, heading } of PAGES) {
  test(`${path} loads with hero heading`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  });

  test(`${path} has working navbar`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByText(/dclaw learn/i)).toBeVisible();
  });
}

test('navigating from landing page to /courses works', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /browse courses/i }).first().click();
  await expect(page).toHaveURL('/courses');
  await expect(page.getByRole('heading', { name: /learn anything, your way/i })).toBeVisible();
});
