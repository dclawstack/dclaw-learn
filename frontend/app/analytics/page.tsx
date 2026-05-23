"use client";

import { useEffect, useState } from "react";
import { api, type StudentAnalytics } from "@/lib/api";

export default function AnalyticsPage() {
  const [data, setData] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getMyAnalytics()
      .then(setData)
      .catch(() => setError("Could not load analytics. Make sure you are logged in."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400 text-sm">Loading analytics...</p>;
  if (error) return <p className="text-red-500 text-sm">{error}</p>;
  if (!data) return null;

  const maxActivity = Math.max(1, ...data.daily_activity.map((d) => d.lessons_completed));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Your Learning Analytics</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Lessons Completed", value: data.total_lessons_completed },
          { label: "Total XP", value: data.total_xp },
          { label: "Day Streak", value: `${data.streak_days} 🔥` },
          { label: "Avg Quiz Score", value: data.avg_quiz_score != null ? `${data.avg_quiz_score}%` : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border bg-white p-4 text-center">
            <div className="text-2xl font-bold text-learn-600">{value}</div>
            <div className="mt-1 text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Course progress */}
      {data.course_progress.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Course Progress
          </h2>
          <div className="space-y-3">
            {data.course_progress.map((cp) => (
              <div key={cp.course_id} className="rounded-xl border bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-gray-900">{cp.course_title}</span>
                  <span className="text-sm text-gray-500">{cp.completion_percentage}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-learn-500 transition-all"
                    style={{ width: `${cp.completion_percentage}%` }}
                  />
                </div>
                {cp.avg_quiz_score != null && (
                  <div className="mt-1 text-xs text-gray-400">
                    Avg quiz score: {cp.avg_quiz_score}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Activity heatmap (bar chart) */}
      {data.daily_activity.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Activity — Last 90 Days
          </h2>
          <div className="flex items-end gap-0.5 overflow-x-auto rounded-xl border bg-white p-4">
            {data.daily_activity.map((day) => (
              <div key={day.date} className="group relative flex flex-col items-center">
                <div
                  className="w-3 rounded-sm bg-learn-400 transition-all hover:bg-learn-600"
                  style={{ height: `${Math.max(4, (day.lessons_completed / maxActivity) * 64)}px` }}
                />
                <div className="absolute bottom-full mb-1 hidden rounded bg-gray-800 px-1.5 py-0.5 text-xs text-white group-hover:block whitespace-nowrap">
                  {day.date}: {day.lessons_completed} lesson{day.lessons_completed !== 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
