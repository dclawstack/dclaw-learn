"use client";

import { useEffect, useState } from "react";
import { api, type Course } from "@/lib/api";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  async function search() {
    setLoading(true);
    try {
      const res = await api.listCourses({
        query: query || undefined,
        category: category || undefined,
      });
      setCourses(res.items);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Course Catalog</h1>

      <div className="mb-6 flex gap-3">
        <input
          type="text"
          placeholder="Search courses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg border px-4 py-2 text-sm focus:border-learn-500 focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border px-4 py-2 text-sm focus:border-learn-500 focus:outline-none"
        >
          <option value="">All categories</option>
          <option value="technology">Technology</option>
          <option value="science">Science</option>
          <option value="business">Business</option>
          <option value="arts">Arts</option>
        </select>
        <button
          onClick={search}
          className="rounded-lg bg-learn-600 px-4 py-2 text-sm text-white hover:bg-learn-700"
        >
          Search
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : courses.length === 0 ? (
        <p className="text-gray-500">No courses found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <a
              key={course.id}
              href={`/course/${course.id}`}
              className="rounded-xl border bg-white p-4 hover:shadow-sm"
            >
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-learn-600">
                {course.category}
              </div>
              <div className="mb-1 font-semibold text-gray-900">
                {course.title}
              </div>
              <div className="mb-3 text-sm text-gray-500 line-clamp-2">
                {course.description}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="rounded bg-gray-100 px-2 py-1">
                  {course.difficulty}
                </span>
                <span>{course.estimated_hours}h</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
