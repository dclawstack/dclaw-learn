import Link from 'next/link';

interface CTA {
  label: string;
  href: string;
  variant?: 'solid' | 'outline';
}

interface HeroSectionProps {
  headline: string;
  subheadline: string;
  ctas: CTA[];
  gradient?: boolean;
}

export function HeroSection({ headline, subheadline, ctas, gradient = true }: HeroSectionProps) {
  return (
    <section
      className={`flex min-h-[80vh] flex-col items-center justify-center px-6 text-center ${
        gradient
          ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900'
          : 'bg-[var(--bg)]'
      }`}
    >
      <h1 className={`mb-6 max-w-3xl text-5xl font-bold leading-tight drop-shadow-sm ${gradient ? 'text-white' : 'text-[var(--text)]'}`}>
        {headline}
      </h1>
      <p className={`mb-10 max-w-xl text-lg ${gradient ? 'text-blue-100' : 'text-[var(--text-muted)]'}`}>
        {subheadline}
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        {ctas.map((cta) => (
          <Link
            key={cta.href}
            href={cta.href}
            className={
              cta.variant === 'outline'
                ? `rounded-xl border-2 px-6 py-3 font-semibold transition ${gradient ? 'border-white text-white hover:bg-white hover:text-blue-900' : 'border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6] hover:text-white'}`
                : 'rounded-xl bg-[#3b82f6] px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-[#2563eb]'
            }
          >
            {cta.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
