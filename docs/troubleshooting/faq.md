# Frequently Asked Questions

## Running the App

### How do I start DClaw Learn locally?

```bash
docker compose up -d
```

Then open http://localhost:3008. See [Installation](../getting-started/installation.md) for prerequisites.

### Do I need an account to use DClaw Learn?

No. Browsing courses, generating quizzes, and creating study plans all work without an account. An account is required for:
- Lesson completion tracking (linked to your user ID)
- Certificates
- Forum posting
- Assignment submission

### Can I run DClaw Learn without Docker?

Yes. Run the backend with `uvicorn` and the frontend with `npm run dev` separately. See [Installation — Running Without Docker](../getting-started/installation.md#running-without-docker).

### What ports does DClaw Learn use?

| Service | Port |
|---------|------|
| Frontend | 3008 |
| Backend | 8093 |
| PostgreSQL | 5432 |

---

## Features

### How does AI quiz generation work?

When you paste content and click **Generate Quiz**, the backend first tries to call a local Ollama instance (model: `llama3`) with a structured prompt requesting a JSON array of multiple-choice questions. If Ollama is unavailable or returns an error, the backend falls back to a keyword-extraction algorithm that produces simpler questions automatically — no configuration needed.

To get better questions, install Ollama and run `ollama pull llama3`.

### How is the completion percentage calculated?

The backend counts how many lesson IDs are in your `completed_lesson_ids` and divides by the total number of lessons for that course. Completing a lesson via the **Complete** button adds its ID to your progress record.

### How do certificates work?

After completing all lessons in a course, the **Get Certificate** button appears. Clicking it calls `GET /api/v1/learn/courses/{id}/certificate` which:
1. Verifies you have completed all lessons
2. Issues a unique `certificate_number` (a SHA-256 hash of your user ID + course ID)
3. Returns the certificate details in a JSON response

Certificates are stored in the database — re-clicking the button returns the same certificate.

### How do content recommendations work?

The recommendations engine looks at courses you are already enrolled in, notes their categories and difficulty levels, then scores other courses: +2 points for matching a category you've studied, +3 points if the difficulty is one level above your current maximum. The top 6 scores are returned.

### Can instructors grade assignments?

Yes. Any authenticated user can call `PATCH /api/v1/learn/submissions/{submission_id}/grade` with a score and feedback. A role-based permission system (restricting grading to `role=instructor`) is planned for a future release.

### Does the video player support uploaded files?

Currently, only embed URLs are supported (YouTube and youtu.be links are automatically converted to embed format). Direct video file uploads are planned for a future release.

---

## Data & Migrations

### How do I apply database migrations?

```bash
# Inside the backend container:
docker compose exec backend alembic upgrade head

# Or from the host with venv activated:
cd backend && alembic upgrade head
```

### Will upgrading to v1.2 break my existing data?

No. The v1.2 migration (`2026_05_11_0002`) only adds new tables and nullable columns to existing tables. Existing courses, lessons, quizzes, user_progress, and study_plans are untouched.

### How do I reset the database?

```bash
# Stop services, remove the volume, restart
docker compose down -v
docker compose up -d
```

This drops all data and re-seeds the sample course on startup.

### Where is sample data seeded from?

`backend/app/seed.py` — it runs on every startup but only inserts data if the `courses` table is empty.

---

## Development

### How do I add a new API endpoint?

1. Add/update a model in `backend/app/models.py`
2. Add schemas in `backend/app/schemas.py`
3. Create a router in `backend/app/routers/`
4. Register the router in `backend/app/main.py`
5. Generate a migration: `alembic revision --autogenerate -m "describe change"`
6. Apply: `alembic upgrade head`
7. Add the API call to `frontend/lib/api.ts`

### How do I run backend tests?

```bash
cd backend
pip install -e ".[dev]"
pytest
```

Tests use `httpx.AsyncClient` with an in-memory SQLite database (configured in `tests/conftest.py`).

### How do I change the JWT token lifetime?

Set `JWT_EXPIRE_MINUTES` in your `.env`:
```
JWT_EXPIRE_MINUTES=1440   # 24 hours
```

### How do I update DClaw Learn in production?

Update the image tag in your Helm values or DClawApp CRD and apply:
```bash
helm upgrade dclaw-learn ./helm --set backend.image.tag=1.3.0 --set frontend.image.tag=1.3.0
```

Always run `alembic upgrade head` after deploying a new version.
