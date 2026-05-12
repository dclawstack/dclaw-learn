# Stack

## Technology Stack

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Frontend | Next.js | 14.2+ | App Router, SSR off (client components) |
| Frontend | React | 18.3+ | |
| Frontend | Tailwind CSS | 3.4+ | Custom `learn-*` color palette |
| Frontend | TypeScript | 5.4+ | Strict mode |
| Frontend | lucide-react | 0.378+ | Icons |
| Backend | Python | 3.11+ | |
| Backend | FastAPI | 0.111+ | Async, lifespan handler |
| Backend | Pydantic v2 | 2.7+ | `ConfigDict(from_attributes=True)` |
| Backend | SQLAlchemy | 2.0+ | `DeclarativeBase`, `mapped_column`, async |
| Backend | asyncpg | 0.29+ | PostgreSQL async driver |
| Backend | Alembic | 1.13+ | Schema migrations |
| Backend | python-jose | 3.3+ | JWT signing/verification |
| Backend | passlib[bcrypt] | 1.7.4+ | Password hashing |
| Backend | httpx | 0.27+ | Async HTTP client (Ollama calls) |
| Database | PostgreSQL | 16 | |
| AI (optional) | Ollama | any | Local LLM inference, model: llama3 |
| Build | Hatchling | latest | Python package build |
| Containers | Docker | 24+ | |
| Orchestration | Helm | 3 | Chart in `helm/` |

## Ports

| Service | Host Port | Container Port |
|---------|-----------|----------------|
| Frontend (Next.js) | 3008 | 3008 |
| Backend (FastAPI) | 8093 | 8093 |
| PostgreSQL | 5432 | 5432 |

## Frontend Dependencies (`frontend/package.json`)

```json
"dependencies": {
  "next": "^14.2.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "tailwind-merge": "^2.3.0",
  "clsx": "^2.1.0",
  "lucide-react": "^0.378.0",
  "class-variance-authority": "^0.7.0"
}
```

## Backend Dependencies (`backend/pyproject.toml`)

```toml
dependencies = [
  "fastapi>=0.111.0",
  "uvicorn[standard]>=0.30.0",
  "pydantic>=2.7.0",
  "pydantic-settings>=2.2.0",
  "sqlalchemy[asyncio]>=2.0.30",
  "asyncpg>=0.29.0",
  "alembic>=1.13.0",
  "python-dotenv>=1.0.0",
  "httpx>=0.27.0",
  "python-jose[cryptography]>=3.3.0",
  "passlib[bcrypt]>=1.7.4",
  "python-multipart>=0.0.9",
]
```
