import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to use dynamic imports and reset modules to isolate fetch mock per test
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  vi.resetModules();
});

describe('seedDemoData', () => {
  it('POSTs to /api/v1/learn/demo/seed', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'seeded' }),
    });
    const { seedDemoData } = await import('../lib/seed');
    await seedDemoData();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/demo/seed'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => 'Server error',
    });
    const { seedDemoData } = await import('../lib/seed');
    await expect(seedDemoData()).rejects.toThrow('Server error');
  });
});

describe('clearDemoData', () => {
  it('DELETEs to /api/v1/learn/demo/clear', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'cleared' }),
    });
    const { clearDemoData } = await import('../lib/seed');
    await clearDemoData();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/demo/clear'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

describe('hasDemoData', () => {
  it('returns true when courses exist', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ total: 3, items: [] }),
    });
    const { hasDemoData } = await import('../lib/seed');
    const result = await hasDemoData();
    expect(result).toBe(true);
  });

  it('returns false when no courses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ total: 0, items: [] }),
    });
    const { hasDemoData } = await import('../lib/seed');
    const result = await hasDemoData();
    expect(result).toBe(false);
  });

  it('returns false on fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const { hasDemoData } = await import('../lib/seed');
    const result = await hasDemoData();
    expect(result).toBe(false);
  });
});
