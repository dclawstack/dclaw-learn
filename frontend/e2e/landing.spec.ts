import { test, expect } from '@playwright/test';

test.describe('Main landing page', () => {
  test('loads and shows hero headline', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /adaptive learning that works/i })).toBeVisible();
  });

  test('shows all 5 feature sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/learn from structured/i)).toBeVisible();
    await expect(page.getByText(/ai-powered quizzes/i)).toBeVisible();
    await expect(page.getByText(/personalized learning roadmap/i)).toBeVisible();
    await expect(page.getByText(/master anything with spaced/i)).toBeVisible();
    await expect(page.getByText(/build and manage courses/i)).toBeVisible();
  });

  test('CTA "Browse Courses" links to /courses', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: /browse courses/i }).first();
    await expect(link).toHaveAttribute('href', '/courses');
  });

  test('CTA footer "Get Started" links to /courses', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: /get started/i });
    await expect(link).toHaveAttribute('href', '/courses');
  });

  test('navbar has links to all feature pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /courses/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /study plans/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /flashcards/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /instructor/i })).toBeVisible();
  });
});
