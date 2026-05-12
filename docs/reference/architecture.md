# Architecture

## System Overview

```
Browser
  │
  ▼
Next.js 14 (port 3008)
  │  lib/api.ts — typed fetch wrapper (attaches JWT Bearer token)
  │
  ▼
FastAPI (port 8093)  ─── /api/v1/learn/*
  │  app/core/auth.py  — JWT decode, get_current_user / get_optional_user
  │  app/routers/      — one file per domain
  │  app/models.py     — SQLAlchemy 2.0 ORM models
  │  app/schemas.py    — Pydantic v2 request/response schemas
  │
  ▼
PostgreSQL 16 (port 5432)
  database: dclaw_learn
```

External (optional):
```
FastAPI quiz router ──▶ Ollama (port 11434) ─ llama3 model
                        Falls back to keyword extraction if unavailable
```

## Backend Module Structure

```
backend/app/
├── main.py          # FastAPI app, CORS middleware, router registration, lifespan
├── config.py        # pydantic-settings: DATABASE_URL, JWT_*, OLLAMA_BASE_URL, …
├── database.py      # Base(DeclarativeBase), async engine, get_db() dependency
├── models.py        # All SQLAlchemy models (single file)
├── schemas.py       # All Pydantic v2 schemas (single file)
├── seed.py          # Seeds sample ML course on first startup
├── core/
│   └── auth.py      # hash_password, verify_password, create_access_token,
│                    # get_current_user, get_optional_user
└── routers/
    ├── auth.py          # POST /auth/register, /auth/login
    ├── courses.py       # course listing, enroll, lesson completion
    ├── quiz.py          # AI quiz generation + submission
    ├── study_plan.py    # study plan CRUD
    ├── dashboard.py     # aggregate metrics + inline recommendations
    ├── certificates.py  # certificate issuance
    ├── recommendations.py # standalone GET /recommendations
    ├── forum.py         # thread + post CRUD
    ├── assignments.py   # assignment CRUD + submission + grading
    └── health.py        # GET /health
```

## Database Schema

### Core tables (v1.0)

| Table | Key columns |
|-------|------------|
| `courses` | id, title, description, category, difficulty, estimated_hours, course_metadata |
| `lessons` | id, course_id, title, content, order_index, duration_minutes, **video_url**, **video_duration** |
| `quizzes` | id, lesson_id, course_id, title, questions (JSON) |
| `user_progress` | id, user_id, course_id, completed_lesson_ids (JSON), overall_score, streak_days, enrolled_at, **completed_at** |
| `study_plans` | id, user_id, course_id, title, goal, pace, daily_tasks (JSON), start_date, end_date |

### New tables (v1.2)

| Table | Key columns |
|-------|------------|
| `users` | id, email (unique), name, hashed_password, role |
| `certificates` | id, user_id→users, course_id→courses, certificate_number (unique), issued_at |
| `threads` | id, course_id→courses, user_id, title, body |
| `posts` | id, thread_id→threads, user_id, body |
| `assignments` | id, course_id→courses, title, description, due_date, max_score |
| `submissions` | id, assignment_id→assignments, user_id, content, score, feedback, submitted_at, graded_at |

Bold columns in v1.0 tables indicate columns added in the v1.2 migration.

## Authentication Flow

```
POST /api/v1/learn/auth/register  →  creates User, returns UserResponse
POST /api/v1/learn/auth/login     →  verifies password, returns { access_token, user }

Client stores token in localStorage (lib/auth.ts)
lib/api.ts attaches: Authorization: Bearer <token>

Backend:
  HTTPBearer extracts token → jose.jwt.decode → loads User from DB
  get_current_user  → raises 401 if not present (protected routes)
  get_optional_user → returns None if not present (public routes with optional auth)
```

## Request Lifecycle

```
1. Browser calls fetchJson() in lib/api.ts
2. Token from localStorage added as Authorization header
3. FastAPI HTTPBearer extracts token (auto_error=False)
4. Dependency chain: _get_user_from_token → get_current_user / get_optional_user
5. Router handler runs with db: AsyncSession and current_user
6. SQLAlchemy async query runs against PostgreSQL
7. Pydantic schema serialises ORM object → JSON response
```

## AI Quiz Generation

```
POST /api/v1/learn/quiz/generate
  │
  ├── Try: httpx POST to OLLAMA_BASE_URL/api/generate (model: llama3, timeout: 30s)
  │         Parse JSON array from response
  │         Return list[QuizQuestion] if valid
  │
  └── Fallback: keyword-extraction from sentence splitting
                Always returns questions, never errors
```
