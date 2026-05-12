# Changelog

## v1.2.0 — 2026-05-11

### Added

**User Authentication**
- `User` model with email, name, bcrypt-hashed password, and role
- `POST /auth/register` and `POST /auth/login` endpoints returning JWT access tokens
- `get_current_user` / `get_optional_user` FastAPI dependencies
- Frontend login (`/login`) and register (`/register`) pages
- `NavBar.tsx` client component with login/logout and user name display
- `lib/auth.ts` — localStorage token management

**Lesson Progress Tracking**
- `POST /courses/{id}/lessons/{lesson_id}/complete` — marks a lesson done, returns completion percentage
- `completed_at` column on `user_progress` (set when 100% complete)
- Frontend: lesson "Complete" / "Done" buttons with green checkmark, live progress bar

**Certificates**
- `Certificate` model with unique `certificate_number` (SHA-256 of user_id + course_id)
- `GET /courses/{id}/certificate` — issues or retrieves a certificate (requires full completion)
- Frontend: "Get Certificate" button appears on course completion

**Real AI Quiz Generation**
- Ollama integration — calls `llama3` with a structured JSON prompt
- Automatic fallback to keyword extraction if Ollama is unavailable
- `OLLAMA_BASE_URL` config setting (default: `http://localhost:11434`)

**Video Lesson Support**
- `video_url` and `video_duration` columns on `lessons`
- Frontend: iframe embed player (YouTube and youtu.be URLs auto-converted)

**Content Recommendations**
- `GET /api/v1/learn/recommendations` — category + difficulty scoring, top 6 results
- Inline recommendations in `GET /dashboard`
- Frontend: "Recommended for You" section on dashboard

**Discussion Forums**
- `Thread` and `Post` models
- `GET/POST /courses/{id}/forum` — list/create threads
- `GET /forum/{thread_id}` — thread with all replies
- `POST /forum/{thread_id}/reply` — add a reply (auth required)
- Frontend: Forum tab on course detail page

**Assignments & Grading**
- `Assignment` and `Submission` models
- `GET/POST /courses/{id}/assignments` — list/create assignments
- `POST /assignments/{id}/submit` — text submission (auth required, one per user)
- `PATCH /submissions/{id}/grade` — score + feedback (auth required)
- Frontend: Assignments tab on course detail page with submission form and grade display

**Infrastructure**
- Alembic migration `2026_05_11_0002` covering all v1.2 schema changes
- `python-jose[cryptography]`, `passlib[bcrypt]`, `python-multipart` added to dependencies
- `frontend/.gitignore` added (excludes `node_modules/`, `.next/`)

### Changed

- `lib/api.ts` — attaches `Authorization: Bearer` header when token present; added all new API calls
- `app/layout.tsx` — uses `NavBar.tsx` client component (was inline server component)
- `courses.py` router — enroll endpoint now uses authenticated user ID when token present
- `dashboard.py` router — includes recommendations in response when authenticated
- Pre-flight checklist in `PLAN-v1.2.md` — all items verified and checked

---

## v1.0.0 — 2026-05-08

### Added

- Course CRUD with lessons (title, content, order, duration)
- Quiz generation (keyword-based) and submission with scoring
- Study plan creation with daily task generation and pace adjustment
- Dashboard with real aggregate data from PostgreSQL
- `UserProgress` model tracking enrollment and scores
- Docker Compose setup (PostgreSQL + FastAPI + Next.js)
- Helm chart for Kubernetes deployment
- Alembic initial migration
- Backend test suite (`pytest-asyncio`, `httpx.AsyncClient`)
- Sample course seed data (Introduction to Machine Learning)
