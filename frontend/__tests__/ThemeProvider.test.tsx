import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeProvider, useTheme } from '../app/components/ThemeProvider';

function TestConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('defaults to dark theme', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>);
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('applies dark class to <html> on mount', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles to light and updates <html> class', async () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>);
    await act(async () => {
      screen.getByText('toggle').click();
    });
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persists theme to localStorage', async () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>);
    await act(async () => {
      screen.getByText('toggle').click();
    });
    expect(localStorage.getItem('dclaw-theme')).toBe('light');
  });

  it('reads theme from localStorage on mount', () => {
    localStorage.setItem('dclaw-theme', 'light');
    render(<ThemeProvider><TestConsumer /></ThemeProvider>);
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
