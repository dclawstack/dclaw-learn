"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, type Assignment, type CourseDetail, type Thread } from "@/lib/api";
import { getUser } from "@/lib/auth";

type Tab = "lessons" | "forum" | "assignments";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = getUser();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [completionPct, setCompletionPct] = useState(0);
  const [tab, setTab] = useState<Tab>("lessons");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newThread, setNewThread] = useState({ title: "", body: "" });
  const [submissionContent, setSubmissionContent] = useState<Record<string, string>>({});

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

  async function loadTab(t: Tab) {
    setTab(t);
    if (t === "forum" && threads.length === 0) {
      try {
        setThreads(await api.listThreads(id));
      } catch {}
    }
    if (t === "assignments" && assignments.length === 0) {
      try {
        setAssignments(await api.listAssignments(id));
      } catch {}
    }
  }

  async function handleComplete(lessonId: string) {
    try {
      const res = await api.completeLesson(id, lessonId);
      setCompletedIds(new Set(res.completed_lesson_ids));
      setCompletionPct(res.completion_percentage);
    } catch {}
  }

  async function handleCreateThread() {
    if (!newThread.title.trim()) return;
    try {
      const t = await api.createThread(id, newThread.title, newThread.body);
      setThreads((prev) => [t, ...prev]);
      setNewThread({ title: "", body: "" });
    } catch {}
  }

  async function handleSubmitAssignment(assignmentId: string) {
    const content = submissionContent[assignmentId];
    if (!content?.trim()) return;
    try {
      await api.submitAssignment(assignmentId, content);
      const updated = await api.listAssignments(id);
      setAssignments(updated);
      setSubmissionContent((prev) => ({ ...prev, [assignmentId]: "" }));
    } catch {}
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!course) return <p className="text-gray-500">Course not found.</p>;

  const totalLessons = course.lessons.length;
  const completedCount = completedIds.size;
  const progress = completionPct || (totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0);

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
        {progress >= 100 && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm font-medium text-green-600">Course complete!</span>
            {user && (
              <button
                onClick={async () => {
                  try {
                    const cert = await api.getCertificate(id);
                    alert(
                      `Certificate issued!\nNumber: ${cert.certificate_number}\nIssued: ${new Date(cert.issued_at).toLocaleDateString()}`
                    );
                  } catch (err: unknown) {
                    alert(err instanceof Error ? err.message : "Failed");
                  }
                }}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
              >
                Get Certificate
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b">
        {(["lessons", "forum", "assignments"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => loadTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              tab === t
                ? "border-b-2 border-learn-600 text-learn-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Lessons tab */}
      {tab === "lessons" && (
        <div className="space-y-3">
          {course.lessons.map((lesson, index) => {
            const done = completedIds.has(lesson.id);
            return (
              <div key={lesson.id} className="rounded-xl border bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        done
                          ? "bg-green-100 text-green-700"
                          : "bg-learn-100 text-learn-700"
                      }`}
                    >
                      {done ? "✓" : index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{lesson.title}</div>
                      <div className="text-xs text-gray-500">
                        {lesson.duration_minutes} min
                        {lesson.video_url && " • Video"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleComplete(lesson.id)}
                    disabled={done}
                    className={`rounded-lg px-3 py-1.5 text-sm ${
                      done
                        ? "cursor-not-allowed bg-gray-100 text-gray-400"
                        : "bg-learn-600 text-white hover:bg-learn-700"
                    }`}
                  >
                    {done ? "Done" : "Complete"}
                  </button>
                </div>
                {lesson.video_url && (
                  <div className="mt-3">
                    <iframe
                      src={lesson.video_url
                        .replace("watch?v=", "embed/")
                        .replace("youtu.be/", "www.youtube.com/embed/")}
                      className="w-full rounded-lg"
                      height={220}
                      allowFullScreen
                      title={lesson.title}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Forum tab */}
      {tab === "forum" && (
        <div className="space-y-4">
          {user && (
            <div className="rounded-xl border bg-white p-4">
              <h3 className="mb-3 font-medium text-gray-900">Start a discussion</h3>
              <input
                type="text"
                placeholder="Thread title"
                value={newThread.title}
                onChange={(e) => setNewThread((p) => ({ ...p, title: e.target.value }))}
                className="mb-2 w-full rounded-lg border px-3 py-2 text-sm focus:border-learn-500 focus:outline-none"
              />
              <textarea
                placeholder="Your question or message..."
                value={newThread.body}
                onChange={(e) => setNewThread((p) => ({ ...p, body: e.target.value }))}
                rows={3}
                className="mb-2 w-full rounded-lg border px-3 py-2 text-sm focus:border-learn-500 focus:outline-none"
              />
              <button
                onClick={handleCreateThread}
                className="rounded-lg bg-learn-600 px-4 py-2 text-sm text-white hover:bg-learn-700"
              >
                Post
              </button>
            </div>
          )}
          {threads.length === 0 ? (
            <p className="text-sm text-gray-500">No discussions yet.</p>
          ) : (
            threads.map((thread) => (
              <div key={thread.id} className="rounded-xl border bg-white p-4">
                <div className="font-medium text-gray-900">{thread.title}</div>
                {thread.body && (
                  <p className="mt-1 text-sm text-gray-600">{thread.body}</p>
                )}
                <div className="mt-1 text-xs text-gray-400">
                  {thread.posts.length} replies
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Assignments tab */}
      {tab === "assignments" && (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <p className="text-sm text-gray-500">No assignments yet.</p>
          ) : (
            assignments.map((a) => {
              const mySubmission = user
                ? a.submissions.find((s) => s.user_id === user.id)
                : undefined;
              return (
                <div key={a.id} className="rounded-xl border bg-white p-4">
                  <div className="font-medium text-gray-900">{a.title}</div>
                  <p className="mt-1 text-sm text-gray-600">{a.description}</p>
                  {a.due_date && (
                    <div className="mt-1 text-xs text-gray-400">
                      Due: {new Date(a.due_date).toLocaleDateString()}
                    </div>
                  )}
                  {mySubmission ? (
                    <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm">
                      <div className="font-medium text-green-700">Submitted</div>
                      {mySubmission.score !== null && (
                        <div className="text-green-600">
                          Score: {mySubmission.score}/{a.max_score}
                          {mySubmission.feedback && ` — ${mySubmission.feedback}`}
                        </div>
                      )}
                    </div>
                  ) : user ? (
                    <div className="mt-3">
                      <textarea
                        placeholder="Your submission..."
                        value={submissionContent[a.id] || ""}
                        onChange={(e) =>
                          setSubmissionContent((p) => ({ ...p, [a.id]: e.target.value }))
                        }
                        rows={3}
                        className="mb-2 w-full rounded-lg border px-3 py-2 text-sm focus:border-learn-500 focus:outline-none"
                      />
                      <button
                        onClick={() => handleSubmitAssignment(a.id)}
                        className="rounded-lg bg-learn-600 px-4 py-2 text-sm text-white hover:bg-learn-700"
                      >
                        Submit
                      </button>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">
                      <a href="/login" className="text-learn-600 hover:underline">
                        Sign in
                      </a>{" "}
                      to submit.
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
