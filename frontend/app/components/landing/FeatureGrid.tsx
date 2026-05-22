import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';

interface FeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

interface FeatureGridProps {
  cards: FeatureCard[];
  heading?: string;
}

export function FeatureGrid({ cards, heading = 'Everything you need to learn faster' }: FeatureGridProps) {
  return (
    <section className="bg-[var(--surface)] px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-12 text-center text-3xl font-bold text-[var(--text)]">
          {heading}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 transition hover:border-[#3b82f6] hover:shadow-lg"
            >
              <card.icon className="mb-4 h-8 w-8 text-[#3b82f6]" />
              <h3 className="mb-2 font-semibold text-[var(--text)]">{card.title}</h3>
              <p className="mb-4 text-sm text-[var(--text-muted)]">{card.description}</p>
              <span className="flex items-center gap-1 text-sm font-medium text-[#3b82f6] group-hover:gap-2 transition-all">
                Explore <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
