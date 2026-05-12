# DClaw Learn — v1.2 Feature Roadmap

> **For coding agents:** Pick features from this list, implement them fully, and update this doc with a checkmark.
> **Do NOT change the basic stack.** See `AGENTS.md` for architecture lock.

## Pre-Flight Checklist — Do This First

Before implementing any v1.2 feature, verify:

- [x] `frontend/package-lock.json` is committed after any `npm install` / dependency change
- [x] `frontend/next-env.d.ts` exists and is committed (required for Next.js TypeScript builds)
- [x] `frontend/.gitignore` excludes `node_modules/` and `.next/`
- [x] `docker-compose.yml` healthchecks use `python urllib.request.urlopen()` (backend) and `wget -q --spider` (frontend)
- [x] `frontend/Dockerfile` declares `ARG NEXT_PUBLIC_API_URL` before `RUN npm run build`

## v1.0 Feature Inventory (Current)

- [x] Course CRUD with lessons
- [x] Quiz generation + submission (AI-generated from content)
- [x] Study plan creation with daily tasks
- [x] Dashboard with real aggregate data
- [x] Docker + Helm deployment
- [x] Alembic migrations
- [x] Backend tests

---

## v1.2 Roadmap

### P0 — Must Have

#### 1. User Authentication & Enrollment Tracking ✅
**Description:** Users can register, log in, and have their course progress properly tracked.
- **Backend:** Add `User` model (`id`, `email`, `name`, `hashed_password`, `role`). JWT auth with `python-jose` + `passlib[bcrypt]`. `get_current_user` / `get_optional_user` dependencies. Add `enrolled_at`, `completed_at` to `UserProgress`. Update enroll endpoint to use `current_user`.
- **Frontend:** Login/register pages (`/login`, `/register`). `lib/auth.ts` for token storage. `NavBar.tsx` client component with login/logout. Protected certificate button.
- **Files touched:** `backend/app/models.py`, `backend/app/core/auth.py`, `backend/app/routers/auth.py`, `backend/app/schemas.py`, `backend/app/config.py`, `backend/pyproject.toml`, `frontend/app/login/page.tsx`, `frontend/app/register/page.tsx`, `frontend/app/NavBar.tsx`, `frontend/lib/auth.ts`, `frontend/lib/api.ts`

#### 2. Real Quiz AI Generation ✅
**Description:** Uses Ollama (`llama3`) to generate meaningful questions from lesson content. Falls back to keyword extraction if Ollama is unavailable.
- **Backend:** `_generate_via_ollama()` calls `POST /api/generate` on Ollama. Parses JSON array from response. Falls back to `_generate_keyword_questions()`.
- **Frontend:** No changes needed — existing quiz UI works.
- **Files touched:** `backend/app/routers/quiz.py`, `backend/app/config.py`

#### 3. Lesson Progress Tracking ✅
**Description:** Track which lessons a user has completed within a course.
- **Backend:** `POST /courses/{course_id}/lessons/{lesson_id}/complete` — updates `completed_lesson_ids`, returns completion percentage, sets `completed_at` when all lessons done.
- **Frontend:** Progress bar reflects completed count. Lesson buttons show "Done" with green checkmark. "Complete" button marks lesson done.
- **Files touched:** `backend/app/routers/courses.py`, `backend/app/schemas.py`, `frontend/app/course/[id]/page.tsx`

#### 4. Certificates & Badges ✅
**Description:** Generate a certificate when a user completes a course.
- **Backend:** `Certificate` model with `certificate_number` (SHA-256 hash). `GET /courses/{course_id}/certificate` checks 100% completion, issues or returns existing cert.
- **Frontend:** "Get Certificate" button appears when course is 100% complete, shows cert number and issue date.
- **Files touched:** `backend/app/models.py`, `backend/app/routers/certificates.py`, `backend/app/schemas.py`, `frontend/app/course/[id]/page.tsx`

### P1 — Should Have

#### 5. Video Lesson Support ✅
**Description:** Lessons can contain video content (YouTube/Vimeo embed URLs).
- **Backend:** `video_url` and `video_duration` added to `Lesson` model and schema.
- **Frontend:** iframe embed player in lesson view (supports YouTube and youtu.be URLs).
- **Files touched:** `backend/app/models.py`, `backend/app/schemas.py`, `frontend/app/course/[id]/page.tsx`

#### 6. Content Recommendations ✅
**Description:** Recommend courses based on enrolled courses category and difficulty progression.
- **Backend:** `GET /api/v1/learn/recommendations` — scores courses by category match (+2) and next difficulty level (+3). Returns top 6.
- **Frontend:** "Recommended for You" section on dashboard (4 cards).
- **Files touched:** `backend/app/routers/recommendations.py`, `backend/app/routers/dashboard.py`, `frontend/app/dashboard/page.tsx`

#### 7. Discussion Forums Per Course ✅
**Description:** Students can ask questions and discuss course content.
- **Backend:** `Thread` and `Post` models. CRUD endpoints under `/courses/{id}/forum` and `/forum/{thread_id}`.
- **Frontend:** Forum tab on course detail. Thread list + new thread form (auth required).
- **Files touched:** `backend/app/models.py`, `backend/app/routers/forum.py`, `frontend/app/course/[id]/page.tsx`

#### 8. Assignments & Grading ✅
**Description:** Instructors can create assignments with due dates. Students submit text.
- **Backend:** `Assignment` and `Submission` models. CRUD + grading endpoints.
- **Frontend:** Assignments tab on course detail. Submission textarea. Grade display.
- **Files touched:** `backend/app/models.py`, `backend/app/routers/assignments.py`, `frontend/app/course/[id]/page.tsx`

### P2 — Could Have

#### 9. Spaced Repetition Flashcards
**Description:** AI-generated flashcards from lesson content using spaced repetition algorithm (SM-2).
- **Backend:** Generate flashcards via LLM. Track review intervals.
- **Frontend:** Flashcard study mode.

#### 10. Learning Analytics
**Description:** Detailed analytics for instructors and students (time spent, quiz scores, completion rates).
- **Backend:** Aggregate queries. Export to CSV.
- **Frontend:** Charts using a charting library.

---

## Implementation Priority

1. User Authentication & Enrollment Tracking (security foundation) ✅
2. Real Quiz AI Generation (core learning feature) ✅
3. Lesson Progress Tracking (engagement) ✅
4. Certificates & Badges (motivation) ✅
5. Video Lesson Support (content richness) ✅
6. Content Recommendations (discovery) ✅
7. Discussion Forums (community) ✅
8. Assignments & Grading (formal learning) ✅
9. Spaced Repetition Flashcards (retention)
10. Learning Analytics (insights)
