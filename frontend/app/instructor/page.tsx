'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { HeroSection } from '../components/landing/HeroSection';
import { FeatureSection } from '../components/landing/FeatureSection';

interface InstructorCourseStats {
  course_id: string;
  course_title: string;
  enrollment_count: number;
  avg_rating: number;
}

interface InstructorDashboard {
  courses: InstructorCourseStats[];
  total_students: number;
}

interface CourseCreateForm {
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours: number;
}

const EMPTY_FORM: CourseCreateForm = {
  title: '',
  description: '',
  category: 'technology',
  difficulty: 'beginner',
  estimated_hours: 5,
};

export default function InstructorPage() {
  const [dashboard, setDashboard] = useState<InstructorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CourseCreateForm>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  const user = typeof window !== 'undefined' ? getUser() : null;

  async function loadDashboard() {
    setLoading(true);
    try {
      const data = await fetch(
        '/api/v1/learn/instructor/dashboard',
        { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } }
      );
      if (!data.ok) throw new Error(await data.text());
      setDashboard(await data.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function createCourse() {
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      await fetch(
        '/api/v1/learn/instructor/courses',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify(form),
        }
      );
      setForm(EMPTY_FORM);
      setShowCreate(false);
      await loadDashboard();
    } catch {
      alert('Failed to create course');
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <HeroSection
        headline="Build and manage courses with ease."
        subheadline="Create structured courses, track student engagement, and manage enrollments — all in one place."
        ctas={[{ label: 'Go to Dashboard', href: '#dashboard' }]}
      />

      <FeatureSection
        headline="Course builder with rich content"
        bullets={[
          'Create courses with multiple lessons, each with video and text content',
          'Add assignments with custom rubrics and deadlines',
          'Publish when ready — control visibility at any time',
        ]}
        mockup={
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
            <div className="mb-3 font-semibold text-[var(--text)]">New Course</div>
            <div className="mb-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm text-[var(--text-muted)]">Course title...</div>
            <div className="mb-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm text-[var(--text-muted)] h-16">Description...</div>
            <div className="flex gap-2">
              <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-xs text-[var(--text-muted)]">Difficulty</div>
              <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-xs text-[var(--text-muted)]">Category</div>
            </div>
          </div>
        }
      />

      <FeatureSection
        headline="Student analytics at a glance"
        bullets={[
          'See enrollment counts and completion rates per course',
          'View average ratings and student feedback',
          'Identify which lessons students struggle with most',
        ]}
        mockup={
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
            <div className="mb-4 font-semibold text-[var(--text)]">Your Courses</div>
            {[
              { title: 'Intro to Python', students: 142, rating: 4.8 },
              { title: 'Data Structures', students: 87, rating: 4.6 },
            ].map(({ title, students, rating }) => (
              <div key={title} className="mb-3 flex items-center justify-between text-sm">
                <span className="text-[var(--text)]">{title}</span>
                <div className="flex gap-3 text-[var(--text-muted)]">
                  <span>{students} students</span>
                  <span className="text-yellow-500">★ {rating}</span>
                </div>
              </div>
            ))}
          </div>
        }
        reversed
      />

      <div id="dashboard" className="px-6 py-16">
        <div className="mx-auto max-w-4xl space-y-8">
          {loading && <p className="text-[var(--text-muted)] text-sm">Loading instructor dashboard...</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {!loading && !error && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text)]">Instructor Dashboard</h1>
              {user && <p className="text-sm text-[var(--text-muted)] mt-1">{user.name || user.email}</p>}
            </div>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="rounded-lg bg-[#3b82f6] px-4 py-2 text-sm text-white hover:bg-[#2563eb]"
            >
              {showCreate ? 'Cancel' : '+ New Course'}
            </button>
          </div>
          )}

          {/* Stats row */}
          {!loading && !error && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
              <div className="text-2xl font-bold text-[#3b82f6]">{dashboard?.courses.length ?? 0}</div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">Courses Created</div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
              <div className="text-2xl font-bold text-[#3b82f6]">{dashboard?.total_students ?? 0}</div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">Total Students</div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
              <div className="text-2xl font-bold text-[#3b82f6]">
                {dashboard && dashboard.courses.length > 0
                  ? (
                      dashboard.courses.reduce((s, c) => s + c.avg_rating, 0) /
                      dashboard.courses.filter((c) => c.avg_rating > 0).length || 0
                    ).toFixed(1)
                  : '—'}
              </div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">Avg Rating</div>
            </div>
          </div>
          )}

          {/* Create course form */}
          {!loading && !error && showCreate && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
              <h2 className="font-semibold text-[var(--text)]">New Course</h2>
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[#3b82f6] focus:outline-none"
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[#3b82f6] focus:outline-none resize-none"
              />
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[#3b82f6] focus:outline-none"
                />
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value as CourseCreateForm['difficulty'] })}
                  className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[#3b82f6] focus:outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <input
                  type="number"
                  min={1}
                  value={form.estimated_hours}
                  onChange={(e) => setForm({ ...form, estimated_hours: Number(e.target.value) })}
                  className="w-20 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[#3b82f6] focus:outline-none"
                  title="Estimated hours"
                />
              </div>
              <button
                onClick={createCourse}
                disabled={creating || !form.title.trim()}
                className="rounded-lg bg-[#3b82f6] px-4 py-2 text-sm text-white hover:bg-[#2563eb] disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          )}

          {/* Course list */}
          {!loading && !error && (
            dashboard && dashboard.courses.length === 0 ? (
              <p className="text-[var(--text-muted)] text-sm">No courses yet. Create your first one above.</p>
            ) : (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Your Courses
                </h2>
                <div className="space-y-3">
                  {dashboard?.courses.map((course) => (
                    <div
                      key={course.course_id}
                      className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                    >
                      <div>
                        <a
                          href={`/course/${course.course_id}`}
                          className="font-semibold text-[var(--text)] hover:text-[#3b82f6]"
                        >
                          {course.course_title}
                        </a>
                        <div className="mt-1 flex gap-3 text-xs text-[var(--text-muted)]">
                          <span>{course.enrollment_count} student{course.enrollment_count !== 1 ? 's' : ''}</span>
                          {course.avg_rating > 0 && (
                            <span>★ {course.avg_rating.toFixed(1)}</span>
                          )}
                        </div>
                      </div>
                      <a
                        href={`/instructor/analytics/${course.course_id}`}
                        className="text-xs text-[#3b82f6] hover:underline"
                      >
                        View analytics →
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )
          )}
        </div>
      </div>
    </>
  );
}
