# DClaw Learn — v1.3 Product Roadmap

> **For coding agents:** Pick features from this list, implement them fully, and mark with ✅.
> **Do NOT change the basic stack.** See `AGENTS.md` for architecture lock.
> **Complexity key:** 0 = quick win, 1 = core differentiator, 2 = advanced/AI

---

## YC Gap Analysis

### Current Strengths
- Full-stack adaptive learning platform (FastAPI + Next.js 14)
- AI quiz generation via Ollama with keyword fallback
- JWT auth, progress tracking, certificates, forums, assignments
- Docker + Helm deployment, Alembic migrations, async SQLAlchemy

### Critical Gaps vs. YC Bar

| Gap | Why It Matters to YC |
|-----|----------------------|
| No "hair on fire" differentiator | Every EdTech startup has courses + quizzes. What makes a user choose DClaw over Coursera? |
| AI is only used for quiz generation | LLMs can power tutoring, feedback, adaptive pacing — none of that exists yet |
| No real-time features | Async learning is table-stakes; live study rooms or live code execution signal product ambition |
| No measurable learning outcomes | YC cares about metrics — time-to-competency, quiz score improvement, completion rates |
| Instructor tooling is minimal | Two-sided marketplace value requires instructors to have a compelling reason to create here |
| No social proof loop | No sharing, no leaderboards, no cohort learning — retention is low |
| Search is absent | Can't find content — discovery is broken for any realistic content volume |
| No streak / gamification system | Duolingo proved this drives DAU; it's absent |

---

## v1.3 Roadmap

### Complexity 0 — Quick Wins (implement first)

#### 0.1 Full-Text Course & Lesson Search
**The gap it closes:** Discovery is broken at scale. Users can't find what they want.
- **Backend:** `GET /api/v1/learn/search?q=` — query across `Course.title`, `Course.description`, `Lesson.title`, `Lesson.content` using `ILIKE`. Return ranked results (course matches first, then lesson matches with parent course).
- **Frontend:** Search bar in NavBar. Results page at `/search?q=`. Debounced input (300ms).
- **Files:** `backend/app/routers/search.py`, `backend/app/main.py`, `frontend/app/search/page.tsx`, `frontend/app/NavBar.tsx`
- **Tests:** `tests/test_search.py` — empty query, partial match, no results, lesson content match.

#### 0.2 Daily Learning Streaks & XP
**The gap it closes:** No engagement loop. Users don't return daily.
- **Backend:** Add `xp_total: int`, `streak_days: int`, `last_streak_date: date` to `User`. On `POST /lessons/{id}/complete`, award XP (10 per lesson) and update streak (increment if last activity was yesterday, reset if >1 day gap). `GET /api/v1/learn/me/stats` returns streak + XP.
- **Frontend:** Streak counter and XP in NavBar. "🔥 5-day streak" badge on dashboard.
- **Files:** `backend/app/models.py`, `backend/app/routers/users.py`, `backend/app/routers/courses.py`, `frontend/app/NavBar.tsx`, `frontend/app/dashboard/page.tsx`
- **Migration:** `alembic revision --autogenerate -m "add_xp_streak_to_users"`
- **Tests:** `tests/test_streaks.py`

#### 0.3 Course Rating & Reviews
**The gap it closes:** No social proof. Prospective students can't evaluate course quality.
- **Backend:** `CourseRating` model (`user_id`, `course_id`, `stars: int 1-5`, `review: text`, `created_at`). `POST /courses/{id}/ratings`, `GET /courses/{id}/ratings`. Aggregate `avg_rating` and `rating_count` into `CourseListResponse`.
- **Frontend:** Star rating widget on course detail page (post-enrollment). Display avg rating + count on course cards.
- **Files:** `backend/app/models.py`, `backend/app/routers/courses.py`, `backend/app/schemas.py`, `frontend/app/course/[id]/page.tsx`, `frontend/app/courses/page.tsx`
- **Migration:** `alembic revision --autogenerate -m "add_course_ratings"`
- **Tests:** `tests/test_ratings.py`

#### 0.4 Instructor Role & Course Ownership
**The gap it closes:** Currently anyone can create/modify any course. No two-sided marketplace.
- **Backend:** Gate `POST/PUT/DELETE /courses`, `POST /courses/{id}/lessons`, `POST /courses/{id}/assignments` behind `role == "instructor"`. Add `instructor_id: UUID` FK to `Course`. `GET /api/v1/learn/instructor/dashboard` returns their courses + enrollment counts + avg ratings.
- **Frontend:** Instructor dashboard at `/instructor`. Redirect non-instructors.
- **Files:** `backend/app/routers/courses.py`, `backend/app/routers/assignments.py`, `backend/app/models.py`, `backend/app/schemas.py`, `frontend/app/instructor/page.tsx`
- **Tests:** `tests/test_instructor_auth.py`

---

### Complexity 1 — Core Differentiators

#### 1.1 Spaced Repetition Flashcards (SM-2 Algorithm)
**The gap it closes:** Quiz-and-forget is not retention. SR is the #1 evidence-based learning technique.
- **Backend:** `Flashcard` model (`lesson_id`, `user_id`, `front`, `back`, `ease_factor: float default 2.5`, `interval_days: int default 1`, `due_date: datetime`, `review_count: int`). `POST /lessons/{id}/flashcards/generate` — call Ollama to generate 5 front/back pairs from lesson content; fall back to extracting key terms. `POST /flashcards/{id}/review` — accepts `quality: int (0-5)`, applies SM-2 update, returns next due date. `GET /api/v1/learn/flashcards/due` — returns all cards due today across all lessons.
- **SM-2 formula:** `new_ef = ef + (0.1 - (5-q)*(0.08 + (5-q)*0.02))`, `new_interval = 1 if q<3 else (1 if review_count==1 else (6 if review_count==2 else round(interval*ef)))`.
- **Frontend:** Flashcard study mode at `/flashcards`. Flip card animation (CSS transform). Review queue with progress indicator. "Cards due today" widget on dashboard.
- **Migration:** `alembic revision --autogenerate -m "add_flashcards"`
- **Tests:** `tests/test_flashcards.py` — generation, SM-2 update math, due-date queue.

#### 1.2 AI Tutor Chat (per-lesson context)
**The gap it closes:** Students get stuck; there's no help. This is the "hair on fire" feature for solo learners.
- **Backend:** `POST /lessons/{lesson_id}/chat` — accepts `{"message": str, "history": [...]}`. Builds a system prompt from the lesson `content` + course `title`. Calls Ollama (`llama3`) with the lesson as context. Streams response via `StreamingResponse`. Falls back to a canned "Ollama unavailable" reply.
- **Frontend:** Chat drawer/panel on lesson page. Message input, scrollable history, streaming text display (SSE or fetch-stream). No chat history is persisted server-side (client holds state).
- **Files:** `backend/app/routers/courses.py` (or new `chat.py`), `frontend/app/course/[id]/page.tsx`
- **Tests:** `tests/test_chat.py` — valid lesson, non-existent lesson, Ollama down (mock).

#### 1.3 Learning Analytics Dashboard
**The gap it closes:** No measurable outcomes = no YC retention story.
- **Backend:** `GET /api/v1/learn/analytics/me` — returns: total lessons completed, total XP, avg quiz score across all submissions, completion rate per course, daily activity heatmap (last 90 days from `UserProgress.last_activity_at`). `GET /api/v1/learn/instructor/analytics/{course_id}` — enrollment over time, avg completion %, avg quiz score, drop-off point (lesson where most users stop).
- **Frontend:** Student analytics page at `/analytics` — bar chart (daily completions), ring chart (completion rate per course), streak calendar heatmap. Instructor analytics embedded in `/instructor` dashboard.
- **Charting:** Use `recharts` (add to `package.json`).
- **Files:** `backend/app/routers/analytics.py`, `frontend/app/analytics/page.tsx`, `frontend/app/instructor/page.tsx`
- **Tests:** `tests/test_analytics.py`

#### 1.4 Quiz Attempt History & Score Tracking
**The gap it closes:** Quiz results are not persisted. Users can't see improvement over time.
- **Backend:** `QuizAttempt` model (`user_id`, `quiz_id`, `score: float`, `answers: JSON`, `taken_at: datetime`). On quiz submission, save attempt. `GET /quizzes/{id}/history` returns all attempts for the current user sorted by date. `POST /courses/{id}/quiz/submit` updates `UserProgress.overall_score` as the moving average.
- **Frontend:** "Past attempts" section below quiz. Score sparkline (last 5 attempts).
- **Migration:** `alembic revision --autogenerate -m "add_quiz_attempts"`
- **Tests:** `tests/test_quiz_history.py`

#### 1.5 Cohort-Based Learning (Study Groups)
**The gap it closes:** Solo learning has high dropout. Cohorts create accountability and social proof.
- **Backend:** `Cohort` model (`name`, `course_id`, `invite_code: str unique`, `max_members: int`, `created_by: user_id`). `CohortMember` join table. `POST /cohorts` (instructor), `POST /cohorts/join` (student, by invite code), `GET /cohorts/{id}` returns members + their progress. `GET /cohorts/{id}/leaderboard` — members sorted by XP.
- **Frontend:** "Join a cohort" CTA on course detail. Cohort page at `/cohorts/[id]` — member list with progress bars, leaderboard.
- **Migration:** `alembic revision --autogenerate -m "add_cohorts"`
- **Tests:** `tests/test_cohorts.py`

---

### Complexity 2 — Advanced / AI Features

#### 2.1 Adaptive Difficulty Engine
**The gap it closes:** One-size-fits-all pacing is not adaptive learning. True adaptivity is DClaw's core brand claim.
- **Backend:** After each quiz attempt, compute `mastery_score = avg(last_3_quiz_scores)`. If `mastery_score > 0.85`, flag the next lesson as "accelerated" (skip optional sections). If `mastery_score < 0.5`, inject a remediation flashcard set and recommend a prerequisite course. Store `mastery_score` per course in `UserProgress`. Expose via `GET /api/v1/learn/courses/{id}/next-lesson` which returns the recommended next lesson with a `difficulty_adjustment` flag.
- **Frontend:** "You're excelling — skipping to advanced content" / "Let's review before continuing" banners.
- **Tests:** `tests/test_adaptive.py`

#### 2.2 AI-Graded Assignment Feedback
**The gap it closes:** Instructor grading is a bottleneck. AI feedback unblocks async learning.
- **Backend:** `POST /submissions/{id}/ai-grade` — send `assignment.description` + `submission.content` to Ollama. Ask it to return `{"score": int, "feedback": str, "strengths": [...], "improvements": [...]}`. Parse and store in `Submission.feedback` + `Submission.score` (marked as AI-graded via `graded_by: "ai"`). Add `graded_by: str` column to `Submission`.
- **Frontend:** "Request AI feedback" button on submission. Display structured feedback with strengths/improvements sections.
- **Migration:** `alembic revision --autogenerate -m "add_graded_by_to_submissions"`
- **Tests:** `tests/test_ai_grading.py`

#### 2.3 Personalized Study Plan via LLM
**The gap it closes:** Current study plans use a static `_build_daily_tasks()` heuristic. LLM-generated plans are actually personalized.
- **Backend:** Replace `_build_daily_tasks()` in `study_plan.py` with an Ollama call. Send: user's goal, course syllabus (lesson titles + durations), pace preference, and available hours/day. Ask LLM to return a structured JSON array of daily tasks with specific lesson targets and review sessions. Fall back to existing heuristic if Ollama unavailable.
- **Frontend:** No changes needed — existing study plan UI works.
- **Tests:** `tests/test_study_plan.py` — LLM path (mock), fallback path.

---

## Implementation Order

| Priority | Feature | Complexity | Value |
|----------|---------|------------|-------|
| 1 | 0.1 Full-Text Search | 0 | Discovery |
| 2 | 0.2 Streaks & XP | 0 | Retention / DAU |
| 3 | 0.4 Instructor Roles | 0 | Marketplace foundation |
| 4 | 0.3 Course Ratings | 0 | Social proof |
| 5 | 1.4 Quiz Attempt History | 1 | Core learning loop |
| 6 | 1.1 Spaced Repetition Flashcards | 1 | #1 retention differentiator |
| 7 | 1.2 AI Tutor Chat | 1 | "Hair on fire" feature |
| 8 | 1.3 Learning Analytics | 1 | YC metrics story |
| 9 | 1.5 Cohort Learning | 1 | Social / virality |
| 10 | 2.1 Adaptive Difficulty | 2 | Core brand claim |
| 11 | 2.2 AI Assignment Grading | 2 | Instructor scale |
| 12 | 2.3 LLM Study Plans | 2 | Personalization |

---

## Pre-Flight Checklist (carry-over from v1.2)

- [ ] All new models have alembic migrations
- [ ] All new endpoints have pytest tests
- [ ] `frontend/package-lock.json` committed after any `npm install`
- [ ] No `default_factory=` in `mapped_column()` — use `default=` only
- [ ] All relationships use `lazy="selectin"`
- [ ] No hardcoded `localhost:PORT` in frontend — use `NEXT_PUBLIC_API_URL`
