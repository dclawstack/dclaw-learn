import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FeatureSection } from '../app/components/landing/FeatureSection';

describe('FeatureSection', () => {
  it('renders headline and bullets', () => {
    render(
      <FeatureSection
        headline="Feature Headline"
        bullets={['Bullet one', 'Bullet two', 'Bullet three']}
        mockup={<div>mockup</div>}
      />
    );
    expect(screen.getByRole('heading', { name: /feature headline/i })).toBeTruthy();
    expect(screen.getByText('Bullet one')).toBeTruthy();
    expect(screen.getByText('Bullet two')).toBeTruthy();
  });

  it('renders mockup slot', () => {
    render(
      <FeatureSection
        headline="H"
        bullets={['b']}
        mockup={<div data-testid="my-mockup">mockup content</div>}
      />
    );
    expect(screen.getByTestId('my-mockup')).toBeTruthy();
  });

  it('renders with reversed layout when reversed prop is true', () => {
    const { container } = render(
      <FeatureSection
        headline="H"
        bullets={['b']}
        mockup={<div>m</div>}
        reversed
      />
    );
    expect(container.querySelector('.flex-row-reverse')).toBeTruthy();
  });
});
