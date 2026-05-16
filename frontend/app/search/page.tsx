"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, type SearchResponse } from "@/lib/api";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function runSearch(q: string) {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const data = await api.search(q);
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    runSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.push(`/search?q=${encodeURIComponent(val)}`);
    }, 300);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Search</h1>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search courses and lessons..."
          autoFocus
          className="flex-1 rounded-lg border px-4 py-2 text-sm focus:border-learn-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-learn-600 px-4 py-2 text-sm text-white hover:bg-learn-700"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-gray-400 text-sm">Searching...</p>}

      {!loading && results && (
        <div className="space-y-8">
          {results.total === 0 && (
            <p className="text-gray-500 text-sm">
              No results for &ldquo;{results.query}&rdquo;.
            </p>
          )}

          {results.courses.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Courses ({results.courses.length})
              </h2>
              <div className="space-y-2">
                {results.courses.map((course) => (
                  <a
                    key={course.id}
                    href={`/course/${course.id}`}
                    className="block rounded-xl border bg-white p-4 hover:shadow-sm"
                  >
                    <div className="mb-1 font-semibold text-gray-900">{course.title}</div>
                    {course.description && (
                      <div className="text-sm text-gray-500 line-clamp-2">{course.description}</div>
                    )}
                    <div className="mt-2 flex gap-2 text-xs text-gray-400">
                      <span className="rounded bg-gray-100 px-2 py-0.5">{course.category}</span>
                      <span className="rounded bg-gray-100 px-2 py-0.5">{course.difficulty}</span>
                      <span>{course.estimated_hours}h</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {results.lessons.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Lessons ({results.lessons.length})
              </h2>
              <div className="space-y-2">
                {results.lessons.map((lesson) => (
                  <a
                    key={lesson.id}
                    href={`/course/${lesson.course_id}`}
                    className="block rounded-xl border bg-white p-4 hover:shadow-sm"
                  >
                    <div className="mb-1 font-semibold text-gray-900">{lesson.title}</div>
                    <div className="text-xs text-gray-400">
                      in <span className="text-learn-600">{lesson.course_title}</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="text-gray-400 text-sm">Loading...</p>}>
      <SearchContent />
    </Suspense>
  );
}
