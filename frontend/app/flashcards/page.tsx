'use client';

import { useEffect, useState } from 'react';
import { api, type FlashcardResponse } from '@/lib/api';
import { HeroSection } from '../components/landing/HeroSection';
import { FeatureSection } from '../components/landing/FeatureSection';

type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

const QUALITY_LABELS: Record<ReviewQuality, string> = {
  0: 'Blackout', 1: 'Wrong', 2: 'Hard', 3: 'OK', 4: 'Good', 5: 'Perfect',
};

const QUALITY_COLORS: Record<ReviewQuality, string> = {
  0: 'bg-red-500 hover:bg-red-600',
  1: 'bg-red-400 hover:bg-red-500',
  2: 'bg-orange-400 hover:bg-orange-500',
  3: 'bg-yellow-400 hover:bg-yellow-500',
  4: 'bg-green-400 hover:bg-green-500',
  5: 'bg-green-600 hover:bg-green-700',
};

export default function FlashcardsPage() {
  const [cards, setCards] = useState<FlashcardResponse[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getDueFlashcards()
      .then((data) => {
        setCards(data);
        setDone(data.length === 0);
      })
      .catch(() => setError('Could not load flashcards. Make sure you are logged in.'))
      .finally(() => setLoading(false));
  }, []);

  async function review(quality: ReviewQuality) {
    const card = cards[index];
    if (!card) return;
    setReviewing(true);
    try {
      await api.reviewFlashcard(card.id, quality);
    } catch {
      // non-fatal — advance anyway
    } finally {
      setReviewing(false);
      setFlipped(false);
      if (index + 1 >= cards.length) {
        setDone(true);
      } else {
        setIndex((i) => i + 1);
      }
    }
  }

  return (
    <>
      <HeroSection
        headline="Master anything with spaced repetition."
        subheadline="AI generates flashcards from your course content. Our algorithm schedules reviews at exactly the right time."
        ctas={[{ label: 'Start Flashcards', href: '#review' }]}
      />

      <FeatureSection
        headline="AI-generated cards from your content"
        bullets={[
          'Automatically generate flashcards from any lesson',
          'Cards capture key concepts, definitions, and examples',
          'Review across all your courses in one session',
        ]}
        mockup={
          <div className="rounded-2xl bg-[#3b82f6] p-8 text-center shadow-xl">
            <div className="text-xs font-medium uppercase tracking-wide text-blue-200">Front</div>
            <div className="mt-3 text-lg font-semibold text-white">What is a hash collision?</div>
            <div className="mt-6 rounded-xl bg-white/10 p-4 text-sm text-blue-100">
              When two different keys produce the same hash value, requiring a resolution strategy like chaining.
            </div>
          </div>
        }
      />

      <FeatureSection
        headline="Spaced repetition that works"
        bullets={[
          'Cards you know well are shown less frequently',
          'Cards you struggle with appear more often',
          'The algorithm adapts to your personal memory curve',
        ]}
        mockup={
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
            <div className="mb-3 font-semibold text-[var(--text)]">Review Schedule</div>
            <div className="space-y-2">
              {[
                { card: 'What is gradient descent?', next: 'Tomorrow', ease: 'Easy' },
                { card: 'What is overfitting?', next: 'In 3 days', ease: 'Medium' },
                { card: 'Explain backpropagation', next: 'Today', ease: 'Hard' },
              ].map(({ card, next, ease }) => (
                <div key={card} className="flex items-center justify-between text-sm">
                  <span className="flex-1 truncate text-[var(--text)]">{card}</span>
                  <span className="ml-2 text-xs text-[var(--text-muted)]">{next}</span>
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${ease === 'Hard' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : ease === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>{ease}</span>
                </div>
              ))}
            </div>
          </div>
        }
        reversed
      />

      {/* Flashcard review section */}
      <section id="review" className="px-6 py-16">
        <div className="mx-auto max-w-xl">
          {loading ? (
            <p className="text-[var(--text-muted)] text-sm">Loading flashcards...</p>
          ) : error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--text)]">Flashcard Review</h2>
                {!done && (
                  <span className="text-sm text-[var(--text-muted)]">
                    {index + 1} / {cards.length}
                  </span>
                )}
              </div>

              {done ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
                  <div className="mb-3 text-4xl">🎉</div>
                  <div className="font-semibold text-[var(--text)]">All caught up!</div>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">No more cards due today. Come back tomorrow.</p>
                  <a
                    href="/dashboard"
                    className="mt-4 inline-block rounded-lg bg-[#3b82f6] px-4 py-2 text-sm text-white hover:bg-[#2563eb]"
                  >
                    Back to Dashboard
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-[var(--border)]">
                    <div
                      className="h-1.5 rounded-full bg-[#3b82f6] transition-all"
                      style={{ width: `${(index / cards.length) * 100}%` }}
                    />
                  </div>

                  {/* Card */}
                  <div
                    className="cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-sm transition-all hover:shadow"
                    onClick={() => setFlipped((f) => !f)}
                    style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                  >
                    {!flipped ? (
                      <>
                        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          Question — tap to reveal answer
                        </div>
                        <div className="text-lg font-medium text-[var(--text)]">{cards[index].front}</div>
                      </>
                    ) : (
                      <>
                        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#3b82f6]">
                          Answer
                        </div>
                        <div className="text-lg text-[var(--text)]">{cards[index].back}</div>
                      </>
                    )}
                  </div>

                  {/* Rating buttons — only shown after flip */}
                  {flipped && (
                    <div>
                      <p className="mb-2 text-center text-xs text-[var(--text-muted)]">How well did you know this?</p>
                      <div className="grid grid-cols-6 gap-1.5">
                        {(Object.keys(QUALITY_LABELS) as unknown as ReviewQuality[]).map((q) => (
                          <button
                            key={q}
                            onClick={() => review(q)}
                            disabled={reviewing}
                            className={`rounded-lg py-2 text-xs font-medium text-white disabled:opacity-50 ${QUALITY_COLORS[q]}`}
                          >
                            {QUALITY_LABELS[q]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!flipped && (
                    <p className="text-center text-xs text-[var(--text-muted)]">
                      Tap the card to reveal the answer before rating.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
