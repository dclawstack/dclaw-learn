import Link from 'next/link';

/* ── Reusable HeroSection (used by courses, flashcards, instructor, study-plan pages) ── */

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

/* ── Landing-specific Hero (used only by the root landing page) ── */

const floatingCards = [
  { label: 'Python Basics', left: '8%', top: '20%', delay: '0s' },
  { label: 'Quiz: ML 101', left: '75%', top: '15%', delay: '1.2s' },
  { label: 'Study Plan', left: '85%', top: '55%', delay: '0.6s' },
  { label: 'Flashcard ★', left: '5%', top: '65%', delay: '1.8s' },
  { label: 'Certificate', left: '70%', top: '75%', delay: '0.3s' },
  { label: 'AI Tutor', left: '15%', top: '80%', delay: '2.1s' },
];

export function LandingHero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-14">
      {/* Background glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand-blue/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-1/4 top-1/2 h-[300px] w-[300px] rounded-full bg-brand-indigo/10 blur-2xl"
      />

      {/* Floating preview cards */}
      {floatingCards.map((card) => (
        <div
          key={card.label}
          aria-hidden
          className="animate-float pointer-events-none absolute rounded-lg border border-border/60 bg-card/80 px-3 py-2 text-xs font-medium text-muted-foreground backdrop-blur-sm"
          style={{ left: card.left, top: card.top, animationDelay: card.delay }}
        >
          {card.label}
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="rounded-full border border-brand-blue/30 bg-brand-blue/10 px-4 py-1.5 text-xs text-brand-blue">
          <span className="animate-pulse">✦</span> AI-Powered Learning Platform
        </div>

        {/* Headline */}
        <h1 className="mt-6 text-5xl font-black tracking-tight md:text-7xl">
          Master anything at{' '}
          <span className="bg-gradient-to-r from-brand-blue to-brand-indigo bg-clip-text text-transparent">
            your pace
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Personalized courses, AI-generated quizzes, smart study plans, and spaced-repetition
          flashcards — all in one platform.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/courses"
            className="rounded-xl bg-brand-blue px-8 py-3 font-semibold text-white shadow-lg shadow-brand-blue/30 transition-opacity hover:opacity-90"
          >
            Browse Courses
          </Link>
          <a
            href="#features"
            className="rounded-xl border border-border px-8 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
          >
            See Features
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-black text-brand-blue">100+</div>
            <div className="text-sm text-muted-foreground">Courses</div>
          </div>
          <div>
            <div className="text-3xl font-black text-brand-blue">10k+</div>
            <div className="text-sm text-muted-foreground">Questions</div>
          </div>
          <div>
            <div className="text-3xl font-black text-brand-blue">95%+</div>
            <div className="text-sm text-muted-foreground">Retention</div>
          </div>
        </div>
      </div>
    </section>
  );
}
