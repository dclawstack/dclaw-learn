import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FeatureGrid } from '../app/components/landing/FeatureGrid';
import { BookOpen, Brain } from 'lucide-react';

const CARDS = [
  { icon: BookOpen, title: 'Courses', description: 'Browse courses', href: '/courses' },
  { icon: Brain, title: 'Quizzes', description: 'Take quizzes', href: '/quiz' },
];

describe('FeatureGrid', () => {
  it('renders default heading', () => {
    render(<FeatureGrid cards={CARDS} />);
    expect(screen.getByRole('heading', { name: /everything you need to learn faster/i })).toBeTruthy();
  });

  it('renders custom heading when provided', () => {
    render(<FeatureGrid cards={CARDS} heading="Custom Heading" />);
    expect(screen.getByRole('heading', { name: /custom heading/i })).toBeTruthy();
  });

  it('renders all cards with correct hrefs', () => {
    render(<FeatureGrid cards={CARDS} />);
    const coursesLink = screen.getByRole('link', { name: /courses/i });
    const quizLink = screen.getByRole('link', { name: /quizzes/i });
    expect(coursesLink.getAttribute('href')).toBe('/courses');
    expect(quizLink.getAttribute('href')).toBe('/quiz');
  });

  it('renders card titles and descriptions', () => {
    render(<FeatureGrid cards={CARDS} />);
    expect(screen.getByText('Courses')).toBeTruthy();
    expect(screen.getByText('Browse courses')).toBeTruthy();
  });
});
