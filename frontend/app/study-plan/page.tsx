"use client";

import { useState } from "react";
import { api, type StudyPlan, type StudyPlanTask } from "@/lib/api";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function StudyPlanPage() {
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [pace, setPace] = useState<"relaxed" | "moderate" | "intense">(
    "moderate"
  );
  const [weeks, setWeeks] = useState(4);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);

  async function create() {
    if (!title.trim() || !goal.trim()) return;
    setLoading(true);
    try {
      const res = await api.createStudyPlan({
        title,
        goal,
        pace,
        weeks,
      });
      setPlan(res);
    } catch {
      alert("Failed to create study plan");
    } finally {
      setLoading(false);
    }
  }

  async function adjust(newPace?: string, newWeeks?: number) {
    if (!plan) return;
    setLoading(true);
    try {
      const res = await api.adjustStudyPlan(plan.id, {
        pace: newPace,
        weeks: newWeeks,
      });
      setPlan(res);
    } catch {
      alert("Failed to adjust plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Study Plan</h1>

      {!plan && (
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Plan Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Learn Python in 4 weeks"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-learn-500 focus:outline-none"
            />
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Goal
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Build a web scraper"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-learn-500 focus:outline-none"
            />
          </div>
          <div className="mb-3 flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Pace
              </label>
              <select
                value={pace}
                onChange={(e) =>
                  setPace(e.target.value as "relaxed" | "moderate" | "intense")
                }
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-learn-500 focus:outline-none"
              >
                <option value="relaxed">Relaxed</option>
                <option value="moderate">Moderate</option>
                <option value="intense">Intense</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Weeks
              </label>
              <input
                type="number"
                min={1}
                max={52}
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value))}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-learn-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={create}
            disabled={loading || !title.trim() || !goal.trim()}
            className="rounded-lg bg-learn-600 px-4 py-2 text-sm text-white hover:bg-learn-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Plan"}
          </button>
        </div>
      )}

      {plan && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xl font-semibold text-gray-900">
                {plan.title}
              </div>
              <div className="text-sm text-gray-500">{plan.goal}</div>
            </div>
            <div className="flex gap-2">
              <select
                value={plan.pace}
                onChange={(e) => adjust(e.target.value)}
                className="rounded-lg border px-3 py-1.5 text-sm focus:border-learn-500 focus:outline-none"
              >
                <option value="relaxed">Relaxed</option>
                <option value="moderate">Moderate</option>
                <option value="intense">Intense</option>
              </select>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="space-y-4">
            {plan.daily_tasks.map((task: StudyPlanTask) => (
              <div
                key={task.day}
                className="flex items-center gap-3 rounded-xl border bg-white p-3"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  readOnly
                  className="h-4 w-4 rounded text-learn-600"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {task.task}
                  </div>
                  <div className="text-xs text-gray-500">
                    Day {task.day} • {formatDate(task.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
