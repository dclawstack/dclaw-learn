"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

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
  difficulty: "beginner" | "intermediate" | "advanced";
  estimated_hours: number;
}

const EMPTY_FORM: CourseCreateForm = {
  title: "",
  description: "",
  category: "technology",
  difficulty: "beginner",
  estimated_hours: 5,
};

export default function InstructorPage() {
  const [dashboard, setDashboard] = useState<InstructorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CourseCreateForm>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  const user = typeof window !== "undefined" ? getUser() : null;

  async function loadDashboard() {
    setLoading(true);
    try {
      const data = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ""}/api/v1/learn/instructor/dashboard`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } }
      );
      if (!data.ok) throw new Error(await data.text());
      setDashboard(await data.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
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
        `${process.env.NEXT_PUBLIC_API_URL || ""}/api/v1/learn/instructor/courses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify(form),
        }
      );
      setForm(EMPTY_FORM);
      setShowCreate(false);
      await loadDashboard();
    } catch {
      alert("Failed to create course");
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <p className="text-gray-400 text-sm">Loading instructor dashboard...</p>;
  if (error) return <p className="text-red-500 text-sm">{error}</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
          {user && <p className="text-sm text-gray-500 mt-1">{user.name || user.email}</p>}
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-lg bg-learn-600 px-4 py-2 text-sm text-white hover:bg-learn-700"
        >
          {showCreate ? "Cancel" : "+ New Course"}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 text-center">
          <div className="text-2xl font-bold text-learn-600">{dashboard?.courses.length ?? 0}</div>
          <div className="mt-1 text-xs text-gray-500">Courses Created</div>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center">
          <div className="text-2xl font-bold text-learn-600">{dashboard?.total_students ?? 0}</div>
          <div className="mt-1 text-xs text-gray-500">Total Students</div>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center">
          <div className="text-2xl font-bold text-learn-600">
            {dashboard && dashboard.courses.length > 0
              ? (
                  dashboard.courses.reduce((s, c) => s + c.avg_rating, 0) /
                  dashboard.courses.filter((c) => c.avg_rating > 0).length || 0
                ).toFixed(1)
              : "—"}
          </div>
          <div className="mt-1 text-xs text-gray-500">Avg Rating</div>
        </div>
      </div>

      {/* Create course form */}
      {showCreate && (
        <div className="rounded-xl border bg-white p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">New Course</h2>
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-learn-500 focus:outline-none"
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-learn-500 focus:outline-none resize-none"
          />
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="flex-1 rounded-lg border px-3 py-2 text-sm focus:border-learn-500 focus:outline-none"
            />
            <select
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value as CourseCreateForm["difficulty"] })}
              className="rounded-lg border px-3 py-2 text-sm focus:border-learn-500 focus:outline-none"
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
              className="w-20 rounded-lg border px-3 py-2 text-sm focus:border-learn-500 focus:outline-none"
              title="Estimated hours"
            />
          </div>
          <button
            onClick={createCourse}
            disabled={creating || !form.title.trim()}
            className="rounded-lg bg-learn-600 px-4 py-2 text-sm text-white hover:bg-learn-700 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Course"}
          </button>
        </div>
      )}

      {/* Course list */}
      {dashboard && dashboard.courses.length === 0 ? (
        <p className="text-gray-500 text-sm">No courses yet. Create your first one above.</p>
      ) : (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Your Courses
          </h2>
          <div className="space-y-3">
            {dashboard?.courses.map((course) => (
              <div
                key={course.course_id}
                className="flex items-center justify-between rounded-xl border bg-white p-4"
              >
                <div>
                  <a
                    href={`/course/${course.course_id}`}
                    className="font-semibold text-gray-900 hover:text-learn-600"
                  >
                    {course.course_title}
                  </a>
                  <div className="mt-1 flex gap-3 text-xs text-gray-400">
                    <span>{course.enrollment_count} student{course.enrollment_count !== 1 ? "s" : ""}</span>
                    {course.avg_rating > 0 && (
                      <span>★ {course.avg_rating.toFixed(1)}</span>
                    )}
                  </div>
                </div>
                <a
                  href={`/instructor/analytics/${course.course_id}`}
                  className="text-xs text-learn-600 hover:underline"
                >
                  View analytics →
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
