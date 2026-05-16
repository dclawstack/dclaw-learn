"use client";

import { useEffect, useState } from "react";
import { api, type FlashcardResponse } from "@/lib/api";

type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

const QUALITY_LABELS: Record<ReviewQuality, string> = {
  0: "Blackout",
  1: "Wrong",
  2: "Hard",
  3: "OK",
  4: "Good",
  5: "Perfect",
};

const QUALITY_COLORS: Record<ReviewQuality, string> = {
  0: "bg-red-500 hover:bg-red-600",
  1: "bg-red-400 hover:bg-red-500",
  2: "bg-orange-400 hover:bg-orange-500",
  3: "bg-yellow-400 hover:bg-yellow-500",
  4: "bg-green-400 hover:bg-green-500",
  5: "bg-green-600 hover:bg-green-700",
};

export default function FlashcardsPage() {
  const [cards, setCards] = useState<FlashcardResponse[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getDueFlashcards()
      .then((data) => {
        setCards(data);
        setDone(data.length === 0);
      })
      .catch(() => setError("Could not load flashcards. Make sure you are logged in."))
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

  if (loading) return <p className="text-gray-400 text-sm">Loading flashcards...</p>;
  if (error) return <p className="text-red-500 text-sm">{error}</p>;

  const card = cards[index];

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Flashcard Review</h1>
        {!done && (
          <span className="text-sm text-gray-500">
            {index + 1} / {cards.length}
          </span>
        )}
      </div>

      {done ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <div className="mb-3 text-4xl">🎉</div>
          <div className="font-semibold text-gray-900">All caught up!</div>
          <p className="mt-2 text-sm text-gray-500">No more cards due today. Come back tomorrow.</p>
          <a
            href="/dashboard"
            className="mt-4 inline-block rounded-lg bg-learn-600 px-4 py-2 text-sm text-white hover:bg-learn-700"
          >
            Back to Dashboard
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="h-1.5 w-full rounded-full bg-gray-100">
            <div
              className="h-1.5 rounded-full bg-learn-500 transition-all"
              style={{ width: `${(index / cards.length) * 100}%` }}
            />
          </div>

          {/* Card */}
          <div
            className="cursor-pointer rounded-xl border bg-white p-8 text-center shadow-sm transition-all hover:shadow"
            onClick={() => setFlipped((f) => !f)}
            style={{ minHeight: "220px", display: "flex", flexDirection: "column", justifyContent: "center" }}
          >
            {!flipped ? (
              <>
                <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Question — tap to reveal answer
                </div>
                <div className="text-lg font-medium text-gray-900">{card.front}</div>
              </>
            ) : (
              <>
                <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-learn-500">
                  Answer
                </div>
                <div className="text-lg text-gray-800">{card.back}</div>
              </>
            )}
          </div>

          {/* Rating buttons — only shown after flip */}
          {flipped && (
            <div>
              <p className="mb-2 text-center text-xs text-gray-400">How well did you know this?</p>
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
            <p className="text-center text-xs text-gray-400">
              Tap the card to reveal the answer before rating.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
