/**
 * Backend-frontend integration tests.
 * These tests require BOTH servers running:
 *   - Backend: uvicorn app.main:app --port 8093
 *   - Frontend: npm run dev (port 3008)
 *
 * They verify that Next.js rewrites proxy API calls correctly to FastAPI,
 * that seeded data appears in the UI, and that all major data-fetching
 * routes return real content (not 404s).
 */
import { test, expect } from '@playwright/test';

// ── Proxy health ─────────────────────────────────────────────────────────────

test.describe('Proxy rewrite — backend reachable', () => {
  test('GET /health proxies to backend and returns ok', async ({ request }) => {
    const res = await request.get('/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('status');
  });

  test('Next.js does NOT 404 on /api/v1/learn/ routes', async ({ request }) => {
    // A POST to /api/v1/learn/courses should reach FastAPI (200 or 422), never 404
    const res = await request.post('/api/v1/learn/courses', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).not.toBe(404);
  });
});

// ── Seed / clear cycle ────────────────────────────────────────────────────────

test.describe('Demo seed/clear cycle', () => {
  test('POST /api/v1/learn/demo/seed returns 200', async ({ request }) => {
    const res = await request.post('/api/v1/learn/demo/seed');
    expect(res.status()).toBe(200);
  });

  test('after seeding, courses list returns at least 4 courses', async ({ request }) => {
    await request.post('/api/v1/learn/demo/seed');
    const res = await request.post('/api/v1/learn/courses', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.total).toBeGreaterThanOrEqual(4);
    expect(body.items.length).toBeGreaterThanOrEqual(4);
  });

  test('after seeding, flashcards endpoint returns items', async ({ request }) => {
    await request.post('/api/v1/learn/demo/seed');
    const res = await request.get('/api/v1/learn/flashcards/due');
    // 200 with data, or 401 if auth required — either way not 404
    expect(res.status()).not.toBe(404);
  });

  test('DELETE /api/v1/learn/demo/clear returns 200', async ({ request }) => {
    await request.post('/api/v1/learn/demo/seed');
    const res = await request.delete('/api/v1/learn/demo/clear');
    expect(res.status()).toBe(200);
  });

  test('after clearing, courses list returns 0 demo courses', async ({ request }) => {
    await request.post('/api/v1/learn/demo/seed');
    await request.delete('/api/v1/learn/demo/clear');
    const res = await request.post('/api/v1/learn/courses', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    // Demo courses are gone; total may be 0 or contain non-demo courses
    const demoTitles = ['Intro to Python', 'Data Structures & Algorithms', 'Machine Learning Basics', 'Web Dev Fundamentals'];
    const remaining = body.items.filter((c: { title: string }) => demoTitles.includes(c.title));
    expect(remaining.length).toBe(0);
  });

  test('re-seeding after clear restores courses', async ({ request }) => {
    await request.post('/api/v1/learn/demo/seed');
    await request.delete('/api/v1/learn/demo/clear');
    await request.post('/api/v1/learn/demo/seed');
    const res = await request.post('/api/v1/learn/courses', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
    const body = await res.json();
    expect(body.total).toBeGreaterThanOrEqual(4);
  });
});

// ── UI reflects seeded data ───────────────────────────────────────────────────

test.describe('UI shows seeded data', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('/api/v1/learn/demo/seed');
  });

  test('/courses page shows seeded course titles', async ({ page }) => {
    await page.goto('/courses');
    await expect(page.getByText('Intro to Python')).toBeVisible({ timeout: 8000 });
  });

  test('/courses page shows all 4 demo courses', async ({ page }) => {
    await page.goto('/courses');
    await expect(page.getByText('Intro to Python')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('Data Structures & Algorithms')).toBeVisible();
    await expect(page.getByText('Machine Learning Basics')).toBeVisible();
    await expect(page.getByText('Web Dev Fundamentals')).toBeVisible();
  });

  test('SeedWidget shows Re-seed Data after seeding', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/re-seed data/i)).toBeVisible({ timeout: 8000 });
  });

  test('SeedWidget Clear button removes courses from /courses', async ({ page }) => {
    await page.goto('/');
    // Wait for widget to show seeded state
    await expect(page.getByText(/re-seed data/i)).toBeVisible({ timeout: 8000 });
    // Click clear
    await page.getByText(/clear data/i).click();
    // Widget returns to seed state
    await expect(page.getByText(/seed demo data/i)).toBeVisible({ timeout: 8000 });
    // Navigate to courses — demo courses should be gone
    await page.goto('/courses');
    await expect(page.getByText('Intro to Python')).not.toBeVisible({ timeout: 5000 });
  });
});

// ── Dashboard and analytics ───────────────────────────────────────────────────

test.describe('Dashboard and analytics API routes reachable', () => {
  test('GET /api/v1/learn/dashboard does not 404', async ({ request }) => {
    const res = await request.get('/api/v1/learn/dashboard');
    expect(res.status()).not.toBe(404);
  });

  test('GET /api/v1/learn/analytics/me does not 404', async ({ request }) => {
    const res = await request.get('/api/v1/learn/analytics/me');
    expect(res.status()).not.toBe(404);
  });

  test('GET /api/v1/learn/instructor/dashboard does not 404', async ({ request }) => {
    const res = await request.get('/api/v1/learn/instructor/dashboard');
    expect(res.status()).not.toBe(404);
  });

  test('GET /api/v1/learn/flashcards/due does not 404', async ({ request }) => {
    const res = await request.get('/api/v1/learn/flashcards/due');
    expect(res.status()).not.toBe(404);
  });
});
