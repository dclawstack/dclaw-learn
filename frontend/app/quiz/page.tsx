"use client";

import { useState } from "react";
import { api, type QuizQuestion, type QuizResult } from "@/lib/api";

export default function QuizPage() {
  const [content, setContent] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizId, setQuizId] = useState("");
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await api.generateQuiz(content, 5);
      setQuestions(res.questions);
      setQuizId(res.quiz_id);
      setAnswers(new Array(res.questions.length).fill(-1));
      setResult(null);
    } catch {
      alert("Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!quizId) return;
    setLoading(true);
    try {
      const res = await api.submitQuiz(quizId, answers);
      setResult(res);
    } catch {
      alert("Failed to submit quiz");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Quiz</h1>

      {questions.length === 0 && !result && (
        <div className="rounded-xl border bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Paste content to generate a quiz
          </label>
          <textarea
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your study material here..."
            className="mb-3 w-full rounded-lg border p-3 text-sm focus:border-learn-500 focus:outline-none"
          />
          <button
            onClick={generate}
            disabled={loading || !content.trim()}
            className="rounded-lg bg-learn-600 px-4 py-2 text-sm text-white hover:bg-learn-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Quiz"}
          </button>
        </div>
      )}

      {questions.length > 0 && !result && (
        <div className="space-y-6">
          {questions.map((q, qi) => (
            <div key={qi} className="rounded-xl border bg-white p-4">
              <div className="mb-3 font-medium text-gray-900">
                {qi + 1}. {q.question}
              </div>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <label
                    key={oi}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 ${
                      answers[qi] === oi
                        ? "border-learn-500 bg-learn-50"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${qi}`}
                      checked={answers[qi] === oi}
                      onChange={() => {
                        const next = [...answers];
                        next[qi] = oi;
                        setAnswers(next);
                      }}
                      className="h-4 w-4 text-learn-600"
                    />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={submit}
            disabled={loading || answers.some((a) => a === -1)}
            className="w-full rounded-lg bg-learn-600 py-2.5 text-sm font-medium text-white hover:bg-learn-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Quiz"}
          </button>
        </div>
      )}

      {result && (
        <div className="rounded-xl border bg-white p-6">
          <div className="mb-4 text-center">
            <div className="text-4xl font-bold text-learn-600">
              {result.score}/{result.total}
            </div>
            <div className="text-sm text-gray-500">
              {result.percentage.toFixed(0)}% correct
            </div>
          </div>
          <div className="space-y-3">
            {result.explanations.map((ex, i) => (
              <div
                key={i}
                className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700"
              >
                <span className="font-medium">Q{i + 1}:</span> {ex}
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              setQuestions([]);
              setResult(null);
              setQuizId("");
              setContent("");
            }}
            className="mt-6 w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Try Another Quiz
          </button>
        </div>
      )}
    </div>
  );
}
