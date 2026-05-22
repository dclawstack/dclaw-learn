import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeroSection } from '../app/components/landing/HeroSection';

describe('HeroSection', () => {
  it('renders headline', () => {
    render(
      <HeroSection
        headline="Test Headline"
        subheadline="Test sub"
        ctas={[{ label: 'Go', href: '/go' }]}
      />
    );
    expect(screen.getByRole('heading', { name: /test headline/i })).toBeTruthy();
  });

  it('renders subheadline', () => {
    render(
      <HeroSection
        headline="H"
        subheadline="Test subheadline"
        ctas={[{ label: 'Go', href: '/go' }]}
      />
    );
    expect(screen.getByText('Test subheadline')).toBeTruthy();
  });

  it('renders all CTA links with correct hrefs', () => {
    render(
      <HeroSection
        headline="H"
        subheadline="S"
        ctas={[
          { label: 'Primary', href: '/primary' },
          { label: 'Secondary', href: '/secondary', variant: 'outline' },
        ]}
      />
    );
    const primary = screen.getByRole('link', { name: /primary/i });
    const secondary = screen.getByRole('link', { name: /secondary/i });
    expect(primary.getAttribute('href')).toBe('/primary');
    expect(secondary.getAttribute('href')).toBe('/secondary');
  });
});
