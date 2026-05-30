import { BookOpen, Brain, Calendar, Layers } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Structured Courses',
    description:
      'Expert-curated content with progress tracking, certificates, and hands-on lessons',
  },
  {
    icon: Brain,
    title: 'AI Quizzes',
    description:
      'Auto-generated questions from any content with instant feedback and weak-area tracking',
  },
  {
    icon: Calendar,
    title: 'Smart Study Plans',
    description:
      'Personalized day-by-day roadmaps that adapt to your pace and learning goals',
  },
  {
    icon: Layers,
    title: 'Spaced Repetition',
    description:
      'AI-generated flashcards scheduled at the optimal time to maximize long-term retention',
  },
];

const allCards = [...features, ...features];

export function FeatureCarousel() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-3xl font-black tracking-tight md:text-4xl">
          Everything you need to learn faster
        </h2>
        <p className="mt-4 text-center text-muted-foreground">
          One platform for the full learning lifecycle — from first lesson to mastery.
        </p>
      </div>

      {/* Carousel */}
      <div className="mt-12 overflow-hidden">
        <div className="animate-scroll flex w-max gap-6">
          {allCards.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="w-72 min-w-[288px] rounded-2xl border border-border bg-card p-6"
              >
                <div className="mb-4 inline-flex rounded-xl bg-brand-blue/10 p-3">
                  <Icon size={20} className="text-brand-blue" />
                </div>
                <h3 className="font-bold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
