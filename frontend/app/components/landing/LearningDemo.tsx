import Link from 'next/link';

const checks = [
  'AI generates quizzes from any course or text',
  'Instant feedback with detailed explanations',
  'Weak-area tracking across all attempts',
  'One-click study plan from quiz results',
];

export function LearningDemo() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-2">
        {/* Left column */}
        <div>
          <h2 className="text-3xl font-black tracking-tight md:text-4xl">
            See AI quizzes in action
          </h2>
          <p className="mt-4 text-muted-foreground">
            Paste any content and the AI generates targeted questions, scores your answers,
            and builds a study plan around your weak areas — all in real time.
          </p>

          {/* Question box */}
          <div className="mt-8 rounded-xl bg-muted p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Question
            </p>
            <p className="text-sm text-foreground">
              What is the primary advantage of using gradient descent in machine learning
              optimization?
            </p>
          </div>

          {/* Arrow */}
          <div className="my-3 flex items-center justify-center gap-2 text-brand-blue">
            <div className="h-px flex-1 bg-brand-blue/20" />
            <span className="text-xs font-medium">AI Feedback</span>
            <div className="h-px flex-1 bg-brand-blue/20" />
          </div>

          {/* Answer box */}
          <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-blue">
              Correct Answer
            </p>
            <p className="text-sm text-foreground">
              Gradient descent iteratively minimizes the loss function, allowing models to
              converge toward optimal parameters even in high-dimensional spaces.
            </p>
          </div>
        </div>

        {/* Right column */}
        <div>
          <ul className="space-y-4">
            {checks.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 text-lg font-bold text-brand-blue">✓</span>
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/quiz"
            className="mt-10 inline-block rounded-xl bg-brand-blue px-8 py-3 font-semibold text-white shadow-lg shadow-brand-blue/30 transition-opacity hover:opacity-90"
          >
            Try it now
          </Link>
        </div>
      </div>
    </section>
  );
}
