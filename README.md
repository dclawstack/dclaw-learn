# DClaw Learn

**Adaptive learning that works**

Adaptive learning platform built with Next.js and FastAPI.

## Architecture

```
dclaw-learn/
├── frontend/    → Next.js 14 (App Router), Tailwind CSS
├── backend/     → FastAPI, Pydantic v2, SQLAlchemy 2.0, asyncpg
├── helm/        → Kubernetes manifests
└── docker-compose.yml
```

## Quick Start

### Docker Compose (Recommended)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3008
- Backend API: http://localhost:8093
- API docs: http://localhost:8093/docs

### Local Development

**Backend**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
# Ensure PostgreSQL is running, then:
alembic upgrade head
uvicorn app.main:app --reload --port 8093
```

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Environment Variables

See `.env.example` in both `frontend/` and `backend/`.

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/learn/courses` | POST | List/search courses |
| `/api/v1/learn/courses/{id}/enroll` | POST | Enroll in a course |
| `/api/v1/learn/quiz/generate` | POST | Auto-generate quiz from content |
| `/api/v1/learn/quiz/{id}/submit` | POST | Submit quiz answers |
| `/api/v1/learn/study-plan` | POST | Create personalized study plan |
| `/api/v1/learn/study-plan/{id}` | GET | Get study plan |
| `/api/v1/learn/study-plan/{id}` | PATCH | Adjust study plan |
| `/health` | GET | Health check |

## License

Proprietary — DClaw Stack
