"use client";

import { useEffect, useState } from "react";
import { api, type Course } from "@/lib/api";

export default function DashboardPage() {
  const [enrolled, setEnrolled] = useState<Course[]>([]);
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [streak, setStreak] = useState(0);
  const [hours, setHours] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getDashboard();
        setEnrolled(data.enrolled_courses.slice(0, 5));
        setStreak(data.streak_days);
        setHours(data.total_hours_studied);
        setCompleted(data.total_courses_completed);
        setRecommendations(data.recommendations.slice(0, 4));
      } catch {
        setEnrolled([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm text-gray-500">Current Streak</div>
          <div className="text-3xl font-bold text-learn-600">{streak} days</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm text-gray-500">Hours Studied</div>
          <div className="text-3xl font-bold text-learn-600">{hours}h</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm text-gray-500">Courses Enrolled</div>
          <div className="text-3xl font-bold text-learn-600">{enrolled.length}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm text-gray-500">Completed</div>
          <div className="text-3xl font-bold text-learn-600">{completed}</div>
        </div>
      </div>

      <h2 className="mb-4 text-xl font-semibold text-gray-900">Enrolled Courses</h2>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : enrolled.length === 0 ? (
        <p className="text-gray-500">
          No courses yet.{" "}
          <a href="/courses" className="text-learn-600 hover:underline">
            Browse courses
          </a>
        </p>
      ) : (
        <div className="mb-8 grid gap-4">
          {enrolled.map((course) => (
            <a
              key={course.id}
              href={`/course/${course.id}`}
              className="rounded-xl border bg-white p-4 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{course.title}</div>
                  <div className="text-sm text-gray-500">
                    {course.category} • {course.difficulty}
                  </div>
                </div>
                <div className="text-sm font-medium text-learn-600">
                  {course.estimated_hours}h
                </div>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-learn-500" style={{ width: "0%" }} />
              </div>
            </a>
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Recommended for You</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {recommendations.map((course) => (
              <a
                key={course.id}
                href={`/course/${course.id}`}
                className="rounded-xl border bg-white p-4 hover:shadow-sm"
              >
                <div className="mb-1 text-xs font-medium uppercase tracking-wide text-learn-600">
                  {course.category}
                </div>
                <div className="font-semibold text-gray-900">{course.title}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <span className="rounded bg-gray-100 px-2 py-0.5">{course.difficulty}</span>
                  <span>{course.estimated_hours}h</span>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
