"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, type CourseDetail } from "@/lib/api";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const data = await api.getCourse(id);
        setCourse(data);
      } catch {
        setCourse(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!course) return <p className="text-gray-500">Course not found.</p>;

  const completedCount = 1;
  const totalLessons = course.lessons.length;
  const progress =
    totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <div className="mb-2 text-sm font-medium text-learn-600">
          {course.category} • {course.difficulty}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
        <p className="mt-2 text-gray-600">{course.description}</p>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">
            {completedCount}/{totalLessons} lessons
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-100">
          <div
            className="h-3 rounded-full bg-learn-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h2 className="mb-4 text-xl font-semibold text-gray-900">Lessons</h2>
      <div className="space-y-3">
        {course.lessons.map((lesson, index) => (
          <div
            key={lesson.id}
            className="flex items-center justify-between rounded-xl border bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-learn-100 text-sm font-bold text-learn-700">
                {index + 1}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {lesson.title}
                </div>
                <div className="text-xs text-gray-500">
                  {lesson.duration_minutes} min
                </div>
              </div>
            </div>
            <button className="rounded-lg bg-learn-600 px-3 py-1.5 text-sm text-white hover:bg-learn-700">
              Start
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
