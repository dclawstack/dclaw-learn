# Configuration

## Backend Environment Variables

Set these in your `.env` file at `backend/.env` or as container environment variables.

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Async PostgreSQL connection string | `postgresql+asyncpg://learn:learn@localhost:5432/dclaw_learn` |
| `APP_ENV` | `development` or `production` | `development` |
| `LOG_LEVEL` | Logging level (`info`, `debug`, `warning`) | `info` |
| `CORS_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:3005` |
| `JWT_SECRET` | Secret key for signing JWT tokens — **change in production** | `change-me-in-production-use-a-long-random-string` |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `JWT_EXPIRE_MINUTES` | Token lifetime in minutes | `10080` (7 days) |
| `OLLAMA_BASE_URL` | Base URL of a running Ollama instance | `http://localhost:11434` |

### Generating a secure JWT_SECRET

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Set this in production — anyone with the secret can forge tokens.

### Ollama setup (optional — enables real AI quiz generation)

Install Ollama from [ollama.com](https://ollama.com), then pull the model:

```bash
ollama pull llama3
```

If `OLLAMA_BASE_URL` is unreachable or returns an error, the quiz endpoint automatically falls back to keyword-extraction questions. No configuration change is needed.

## Frontend Environment Variables

Set in `frontend/.env.local` for local dev, or as build-time `ARG` in Docker / Helm values.

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend base URL (no trailing slash) | `""` (same origin) |

For local dev:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8093
```

For Docker Compose the variable is set in `docker-compose.yml`:
```yaml
environment:
  NEXT_PUBLIC_API_URL: http://localhost:8093
```

> `NEXT_PUBLIC_API_URL` is baked into the JavaScript bundle at **build time**. Changing it requires a rebuild.

## Database

DClaw Learn uses PostgreSQL 16. The backend creates the schema automatically on startup using SQLAlchemy `metadata.create_all`. For schema migrations (adding columns, new tables), run Alembic:

```bash
# Apply all pending migrations
alembic upgrade head

# Show current revision
alembic current

# Generate a new migration after model changes
alembic revision --autogenerate -m "describe your change"
```

### Migrations shipped with v1.2

| Revision | Description |
|----------|-------------|
| `2026_05_08_0001` | Initial schema (courses, lessons, quizzes, user_progress, study_plans) |
| `2026_05_11_0002` | v1.2 features (users, certificates, threads, posts, assignments, submissions; video fields on lessons; completed_at on user_progress) |
