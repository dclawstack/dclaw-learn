'use client';

import { useEffect, useState } from 'react';
import { api, type Course } from '@/lib/api';
import { HeroSection } from '../components/landing/HeroSection';
import { FeatureSection } from '../components/landing/FeatureSection';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
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
    <>
      <HeroSection
        headline="Learn anything, your way."
        subheadline="Browse expert-curated courses across technology, science, and more. Track your progress and earn certificates."
        ctas={[
          { label: 'Browse All Courses', href: '#catalog' },
          { label: 'Enroll Now', href: '#catalog', variant: 'outline' },
        ]}
      />

      <FeatureSection
        headline="Smart search and filtering"
        bullets={[
          'Search courses by title, topic, or keyword',
          'Filter by category and difficulty level',
          'Sort by newest, most popular, or highest rated',
        ]}
        mockup={
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
            <div className="mb-4 flex gap-2">
              <div className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-muted)]">Search courses...</div>
              <div className="rounded-lg bg-[#3b82f6] px-4 py-2 text-sm text-white">Search</div>
            </div>
            <div className="flex gap-2">
              {['Technology', 'Science', 'Business'].map((cat) => (
                <span key={cat} className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-muted)]">{cat}</span>
              ))}
            </div>
          </div>
        }
      />

      <FeatureSection
        headline="Track your progress"
        bullets={[
          'See completion percentage for every enrolled course',
          'Pick up exactly where you left off',
          'Unlock certificates on course completion',
        ]}
        mockup={
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl space-y-4">
            {[
              { title: 'Intro to Python', pct: 75 },
              { title: 'Data Structures', pct: 40 },
              { title: 'ML Basics', pct: 10 },
            ].map(({ title, pct }) => (
              <div key={title}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-[var(--text)]">{title}</span>
                  <span className="text-[var(--text-muted)]">{pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--border)]">
                  <div className="h-2 rounded-full bg-[#3b82f6]" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        }
        reversed
      />

      {/* Course Catalog */}
      <section id="catalog" className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-6 text-2xl font-bold text-[var(--text)]">Course Catalog</h2>
          <div className="mb-6 flex gap-3">
            <input
              type="text"
              placeholder="Search courses..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm text-[var(--text)] focus:border-[#3b82f6] focus:outline-none"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm text-[var(--text)] focus:border-[#3b82f6] focus:outline-none"
            >
              <option value="">All categories</option>
              <option value="technology">Technology</option>
              <option value="science">Science</option>
              <option value="business">Business</option>
              <option value="arts">Arts</option>
            </select>
            <button
              onClick={search}
              className="rounded-lg bg-[#3b82f6] px-4 py-2 text-sm text-white hover:bg-[#2563eb]"
            >
              Search
            </button>
          </div>
          {loading ? (
            <p className="text-[var(--text-muted)]">Loading...</p>
          ) : courses.length === 0 ? (
            <p className="text-[var(--text-muted)]">No courses found.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {courses.map((course) => (
                <a
                  key={course.id}
                  href={`/course/${course.id}`}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:shadow-md transition"
                >
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[#3b82f6]">{course.category}</div>
                  <div className="mb-1 font-semibold text-[var(--text)]">{course.title}</div>
                  <div className="mb-3 text-sm text-[var(--text-muted)] line-clamp-2">{course.description}</div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span className="rounded bg-[var(--bg)] px-2 py-1">{course.difficulty}</span>
                    <span>{course.estimated_hours}h</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
