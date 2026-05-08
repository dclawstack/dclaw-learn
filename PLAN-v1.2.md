# DClaw Learn — v1.2 Feature Roadmap

> **For coding agents:** Pick features from this list, implement them fully, and update this doc with a checkmark.
> **Do NOT change the basic stack.** See `AGENTS.md` for architecture lock.

## Pre-Flight Checklist — Do This First

Before implementing any v1.2 feature, verify:

- [ ] `frontend/package-lock.json` is committed after any `npm install` / dependency change
- [ ] `frontend/next-env.d.ts` exists and is committed (required for Next.js TypeScript builds)
- [ ] `frontend/.gitignore` excludes `node_modules/` and `.next/`
- [ ] `docker-compose.yml` healthchecks use `python urllib.request.urlopen()` (backend) and `wget -q --spider` (frontend)
- [ ] `frontend/Dockerfile` declares `ARG NEXT_PUBLIC_API_URL` before `RUN npm run build`

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

#### 1. User Authentication & Enrollment Tracking
**Description:** Users can register, log in, and have their course progress properly tracked.
- **Backend:** Add `User` model (`id`, `email`, `name`, `hashed_password`, `role`). Add JWT auth with `fastapi-users` or custom middleware. Add `enrolled_at`, `completed_at` to `UserProgress`. Update all endpoints to use `current_user`.
- **Frontend:** Login/register pages. Auth context. Protected routes. Logout button.
- **Files to touch:** `backend/app/models.py` (add User), `backend/app/core/auth.py`, `frontend/app/login/page.tsx`, `frontend/app/register/page.tsx`

#### 2. Real Quiz AI Generation
**Description:** Instead of keyword-based fake quizzes, use an LLM to generate meaningful questions from lesson content.
- **Backend:** Call Ollama/OpenRouter with a structured prompt: "Generate 5 multiple-choice questions from this text. Return JSON." Parse JSON, store questions in `Quiz.questions`. Handle parse failures gracefully.
- **Frontend:** No changes needed — existing quiz UI works.
- **Files to touch:** `backend/app/services/quiz_service.py`, `backend/app/api/v1/quiz.py`

#### 3. Lesson Progress Tracking
**Description:** Track which lessons a user has completed within a course.
- **Backend:** Add `completed_lesson_ids` to `UserProgress` (JSON array). Update on lesson completion. Calculate course completion percentage.
- **Frontend:** Progress bars on course cards. Checkmarks next to completed lessons.
- **Files to touch:** `backend/app/api/v1/courses.py`, `frontend/app/course/[id]/page.tsx`

#### 4. Certificates & Badges
**Description:** Generate a certificate when a user completes a course.
- **Backend:** Add `Certificate` model (`id`, `user_id`, `course_id`, `issued_at`, `certificate_number`). Generate PDF using HTML template + PDF library.
- **Frontend:** "Download Certificate" button on completed courses. Badge display on profile.
- **Files to touch:** `backend/app/models.py`, `backend/app/services/certificate_service.py`, `frontend/app/dashboard/page.tsx`

### P1 — Should Have

#### 5. Video Lesson Support
**Description:** Lessons can contain video content (URL or upload).
- **Backend:** Add `video_url` and `video_duration` to `Lesson`. Support YouTube/Vimeo embed URLs and direct video file uploads.
- **Frontend:** Video player component in lesson view. Track watch progress.
- **Files to touch:** `backend/app/models.py`, `backend/app/schemas.py`, `frontend/app/course/[id]/page.tsx`

#### 6. Content Recommendations
**Description:** Recommend courses based on completed courses and interests.
- **Backend:** Simple recommendation engine using category matching and difficulty progression. `GET /api/v1/learn/recommendations`.
- **Frontend:** "Recommended for You" section on dashboard.
- **Files to touch:** `backend/app/services/recommendation_service.py`, `backend/app/api/v1/courses.py`, `frontend/app/dashboard/page.tsx`

#### 7. Discussion Forums Per Course
**Description:** Students can ask questions and discuss course content.
- **Backend:** Add `Thread` and `Post` models. CRUD endpoints.
- **Frontend:** Forum tab on course detail. Thread list + reply form.
- **Files to touch:** `backend/app/models.py`, `backend/app/api/v1/forum.py`, `frontend/app/course/[id]/forum/page.tsx`

#### 8. Assignments & Grading
**Description:** Instructors can create assignments with due dates. Students submit text/code files.
- **Backend:** Add `Assignment` and `Submission` models. Grading workflow.
- **Frontend:** Assignment list, submission upload, grade display.
- **Files to touch:** `backend/app/models.py`, `backend/app/api/v1/assignments.py`, `frontend/app/course/[id]/assignments/page.tsx`

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

1. User Authentication & Enrollment Tracking (security foundation)
2. Real Quiz AI Generation (core learning feature)
3. Lesson Progress Tracking (engagement)
4. Certificates & Badges (motivation)
5. Video Lesson Support (content richness)
6. Content Recommendations (discovery)
7. Discussion Forums (community)
8. Assignments & Grading (formal learning)
9. Spaced Repetition Flashcards (retention)
10. Learning Analytics (insights)
