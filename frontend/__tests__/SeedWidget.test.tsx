import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/seed', () => ({
  hasDemoData: vi.fn(),
  seedDemoData: vi.fn(),
  clearDemoData: vi.fn(),
}));

import { hasDemoData, seedDemoData, clearDemoData } from '../lib/seed';
import { SeedWidget } from '../app/components/SeedWidget';

describe('SeedWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows "Seed Demo Data" when no data exists', async () => {
    vi.mocked(hasDemoData).mockResolvedValue(false);
    render(<SeedWidget />);
    await waitFor(() => {
      expect(screen.getByText(/seed demo data/i)).toBeTruthy();
    });
  });

  it('shows "Re-seed Data" when data already exists', async () => {
    vi.mocked(hasDemoData).mockResolvedValue(true);
    render(<SeedWidget />);
    await waitFor(() => {
      expect(screen.getByText(/re-seed data/i)).toBeTruthy();
    });
  });

  it('calls seedDemoData on seed button click', async () => {
    vi.mocked(hasDemoData).mockResolvedValue(false);
    vi.mocked(seedDemoData).mockResolvedValue(undefined);
    render(<SeedWidget />);
    await waitFor(() => screen.getByText(/seed demo data/i));
    await userEvent.click(screen.getByText(/seed demo data/i));
    expect(seedDemoData).toHaveBeenCalledOnce();
  });

  it('shows clear button when data exists and calls clearDemoData on click', async () => {
    vi.mocked(hasDemoData).mockResolvedValue(true);
    vi.mocked(clearDemoData).mockResolvedValue(undefined);
    render(<SeedWidget />);
    await waitFor(() => screen.getByText(/clear data/i));
    await userEvent.click(screen.getByText(/clear data/i));
    expect(clearDemoData).toHaveBeenCalledOnce();
  });
});
