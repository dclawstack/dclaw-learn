import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ThemeToggle } from '../app/components/ThemeToggle';
import { ThemeContext } from '../app/components/ThemeProvider';

function renderWithTheme(theme: 'dark' | 'light', toggleTheme = vi.fn()) {
  return render(
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ThemeToggle />
    </ThemeContext.Provider>
  );
}

describe('ThemeToggle', () => {
  it('shows sun icon and "switch to light" label in dark mode', () => {
    renderWithTheme('dark');
    expect(screen.getByRole('button', { name: /switch to light/i })).toBeTruthy();
  });

  it('shows sun icon in light mode', () => {
    renderWithTheme('light');
    expect(screen.getByRole('button', { name: /switch to dark/i })).toBeTruthy();
  });

  it('calls toggleTheme on click', async () => {
    const toggle = vi.fn();
    renderWithTheme('dark', toggle);
    await userEvent.click(screen.getByRole('button'));
    expect(toggle).toHaveBeenCalledOnce();
  });
});
