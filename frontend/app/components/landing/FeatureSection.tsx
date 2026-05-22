import type { ReactNode } from 'react';

interface FeatureSectionProps {
  headline: string;
  bullets: string[];
  mockup: ReactNode;
  reversed?: boolean;
}

export function FeatureSection({ headline, bullets, mockup, reversed = false }: FeatureSectionProps) {
  return (
    <section className="px-6 py-20">
      <div
        className={`mx-auto flex max-w-5xl items-center gap-16 flex-wrap ${
          reversed ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <div className="flex-1 min-w-[280px]">
          <h2 className="mb-6 text-3xl font-bold text-[var(--text)]">{headline}</h2>
          <ul className="space-y-3">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-[var(--text-muted)]">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#3b82f6]" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 min-w-[280px]">{mockup}</div>
      </div>
    </section>
  );
}
