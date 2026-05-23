import { getToken } from "./auth";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(path, { ...init, headers });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Auth types ───────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

// ── Course types ─────────────────────────────────────────────────────────────

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
  video_url: string | null;
  video_duration: number | null;
}

export interface CourseDetail extends Course {
  lessons: Lesson[];
}

export interface CourseList {
  items: Course[];
  total: number;
}

// ── Quiz types ───────────────────────────────────────────────────────────────

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

// ── Study Plan types ─────────────────────────────────────────────────────────

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

// ── Dashboard types ──────────────────────────────────────────────────────────

export interface DashboardData {
  enrolled_courses: Course[];
  total_courses_completed: number;
  streak_days: number;
  total_hours_studied: number;
  recent_activity: Array<Record<string, unknown>>;
  recommendations: Course[];
}

// ── Certificate types ────────────────────────────────────────────────────────

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  course_title: string;
  user_name: string;
}

// ── Progress types ───────────────────────────────────────────────────────────

export interface LessonCompleteResult {
  lesson_id: string;
  completed_lesson_ids: string[];
  completion_percentage: number;
  course_completed: boolean;
}

// ── Forum types ──────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  thread_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

export interface Thread {
  id: string;
  course_id: string;
  user_id: string;
  title: string;
  body: string;
  created_at: string;
  posts: Post[];
}

// ── Flashcard types ───────────────────────────────────────────────────────────

export interface FlashcardResponse {
  id: string;
  lesson_id: string;
  user_id: string;
  front: string;
  back: string;
  ease_factor: number;
  interval_days: number;
  review_count: number;
  due_date: string;
}

export interface FlashcardReviewResponse {
  id: string;
  next_due_date: string;
  interval_days: number;
  ease_factor: number;
}

// ── Analytics types ───────────────────────────────────────────────────────────

export interface CourseProgress {
  course_id: string;
  course_title: string;
  completion_percentage: number;
  avg_quiz_score: number | null;
}

export interface DailyActivity {
  date: string;
  lessons_completed: number;
}

export interface StudentAnalytics {
  total_lessons_completed: number;
  total_xp: number;
  streak_days: number;
  avg_quiz_score: number | null;
  course_progress: CourseProgress[];
  daily_activity: DailyActivity[];
}

// ── Rating types ─────────────────────────────────────────────────────────────

export interface CourseRating {
  id: string;
  user_id: string;
  course_id: string;
  stars: number;
  review: string;
  created_at: string;
}

export interface CourseRatingSummary {
  avg_rating: number;
  rating_count: number;
  ratings: CourseRating[];
}

// ── Search types ─────────────────────────────────────────────────────────────

export interface CourseSearchResult {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  estimated_hours: number;
}

export interface LessonSearchResult {
  id: string;
  title: string;
  course_id: string;
  course_title: string;
}

export interface SearchResponse {
  query: string;
  courses: CourseSearchResult[];
  lessons: LessonSearchResult[];
  total: number;
}

// ── Assignment types ─────────────────────────────────────────────────────────

export interface Submission {
  id: string;
  assignment_id: string;
  user_id: string;
  content: string;
  score: number | null;
  feedback: string | null;
  submitted_at: string;
  graded_at: string | null;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date: string | null;
  max_score: number;
  created_at: string;
  submissions: Submission[];
}

// ── API client ───────────────────────────────────────────────────────────────

export const api = {
  // Auth
  register: (email: string, name: string, password: string) =>
    fetchJson<AuthUser>("/api/v1/learn/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, name, password }),
    }),
  login: (email: string, password: string) =>
    fetchJson<TokenResponse>("/api/v1/learn/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, name: "", password }),
    }),

  // Courses
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
  completeLesson: (courseId: string, lessonId: string) =>
    fetchJson<LessonCompleteResult>(
      `/api/v1/learn/courses/${courseId}/lessons/${lessonId}/complete`,
      { method: "POST" }
    ),

  // Quiz
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

  // Study plan
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

  // Dashboard
  getHealth: () => fetchJson<{ status: string }>("/health"),
  getDashboard: () => fetchJson<DashboardData>("/api/v1/learn/dashboard"),

  // Certificates
  getCertificate: (courseId: string) =>
    fetchJson<Certificate>(`/api/v1/learn/courses/${courseId}/certificate`),

  // Recommendations
  getRecommendations: () =>
    fetchJson<CourseList>("/api/v1/learn/recommendations"),

  // Forum
  listThreads: (courseId: string) =>
    fetchJson<Thread[]>(`/api/v1/learn/courses/${courseId}/forum`),
  createThread: (courseId: string, title: string, body: string) =>
    fetchJson<Thread>(`/api/v1/learn/courses/${courseId}/forum`, {
      method: "POST",
      body: JSON.stringify({ title, body }),
    }),
  getThread: (threadId: string) =>
    fetchJson<Thread>(`/api/v1/learn/forum/${threadId}`),
  replyToThread: (threadId: string, body: string) =>
    fetchJson<Post>(`/api/v1/learn/forum/${threadId}/reply`, {
      method: "POST",
      body: JSON.stringify({ body }),
    }),

  // Assignments
  listAssignments: (courseId: string) =>
    fetchJson<Assignment[]>(`/api/v1/learn/courses/${courseId}/assignments`),
  createAssignment: (courseId: string, data: Record<string, unknown>) =>
    fetchJson<Assignment>(`/api/v1/learn/courses/${courseId}/assignments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  submitAssignment: (assignmentId: string, content: string) =>
    fetchJson<Submission>(`/api/v1/learn/assignments/${assignmentId}/submit`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  gradeSubmission: (submissionId: string, score: number, feedback: string) =>
    fetchJson<Submission>(`/api/v1/learn/submissions/${submissionId}/grade`, {
      method: "PATCH",
      body: JSON.stringify({ score, feedback }),
    }),

  // Search
  search: (q: string) =>
    fetchJson<SearchResponse>(`/api/v1/learn/search?q=${encodeURIComponent(q)}`),

  // Flashcards
  generateFlashcards: (lessonId: string) =>
    fetchJson<FlashcardResponse[]>(`/api/v1/learn/lessons/${lessonId}/flashcards/generate`, { method: "POST" }),
  reviewFlashcard: (cardId: string, quality: number) =>
    fetchJson<FlashcardReviewResponse>(`/api/v1/learn/flashcards/${cardId}/review`, {
      method: "POST",
      body: JSON.stringify({ quality }),
    }),
  getDueFlashcards: () =>
    fetchJson<FlashcardResponse[]>("/api/v1/learn/flashcards/due"),

  // Analytics
  getMyAnalytics: () =>
    fetchJson<StudentAnalytics>("/api/v1/learn/analytics/me"),

  // Ratings
  getCourseRatings: (courseId: string) =>
    fetchJson<CourseRatingSummary>(`/api/v1/learn/courses/${courseId}/ratings`),
  rateCourse: (courseId: string, stars: number, review: string) =>
    fetchJson<CourseRating>(`/api/v1/learn/courses/${courseId}/ratings`, {
      method: "POST",
      body: JSON.stringify({ stars, review }),
    }),
};
