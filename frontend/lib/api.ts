const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  estimated_hours: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  order_index: number;
  duration_minutes: number;
}

export interface CourseDetail extends Course {
  lessons: Lesson[];
}

export interface CourseList {
  items: Course[];
  total: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface QuizGenerateResponse {
  quiz_id: string;
  title: string;
  questions: QuizQuestion[];
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  explanations: string[];
}

export interface StudyPlanTask {
  day: number;
  date: string;
  task: string;
  lesson_id: string | null;
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  user_id: string;
  course_id: string | null;
  title: string;
  goal: string;
  pace: string;
  daily_tasks: StudyPlanTask[];
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  enrolled_courses: Course[];
  total_courses_completed: number;
  streak_days: number;
  total_hours_studied: number;
  recent_activity: Array<Record<string, unknown>>;
}

export const api = {
  listCourses: (body?: Record<string, unknown>) =>
    fetchJson<CourseList>("/api/v1/learn/courses", {
      method: "POST",
      body: JSON.stringify(body || {}),
    }),
  getCourse: (id: string) =>
    fetchJson<CourseDetail>(`/api/v1/learn/courses/${id}`),
  enrollCourse: (id: string) =>
    fetchJson<{ enrollment_id: string; course_id: string; status: string }>(
      `/api/v1/learn/courses/${id}/enroll`,
      { method: "POST" }
    ),
  generateQuiz: (content: string, num_questions = 5) =>
    fetchJson<QuizGenerateResponse>("/api/v1/learn/quiz/generate", {
      method: "POST",
      body: JSON.stringify({ content, num_questions }),
    }),
  submitQuiz: (quizId: string, answers: number[]) =>
    fetchJson<QuizResult>(`/api/v1/learn/quiz/${quizId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
  createStudyPlan: (body: Record<string, unknown>) =>
    fetchJson<StudyPlan>("/api/v1/learn/study-plan", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getStudyPlan: (id: string) =>
    fetchJson<StudyPlan>(`/api/v1/learn/study-plan/${id}`),
  adjustStudyPlan: (id: string, body: Record<string, unknown>) =>
    fetchJson<StudyPlan>(`/api/v1/learn/study-plan/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  getHealth: () => fetchJson<{ status: string }>("/health"),
  getDashboard: () => fetchJson<DashboardData>("/api/v1/learn/dashboard"),
};
