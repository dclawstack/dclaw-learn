# Best Practices

## Security

**Change the JWT secret before going to production**

The default `JWT_SECRET` in `config.py` is a placeholder. Generate a strong secret and set it as an environment variable:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```
Anyone who knows the secret can forge tokens. Never commit it to version control.

**Use HTTPS in production**

JWTs are sent as Bearer tokens in plain HTTP headers. Without TLS, they are visible to anyone on the network. Configure TLS via nginx-ingress + cert-manager or any reverse proxy.

**Restrict CORS_ORIGINS**

In development, `CORS_ORIGINS` defaults to `http://localhost:3005`. In production, set it exactly to your frontend domain:
```
CORS_ORIGINS=https://learn.yourdomain.com
```

**Do not store sensitive data in lesson content**

Lesson `content` is stored as plain text in PostgreSQL and returned to any authenticated user. Do not put passwords, API keys, or private data there.

## Performance

**Tune PostgreSQL connections**

The async engine uses a connection pool. The default pool size from asyncpg is suitable for development. For production, set `pool_size` and `max_overflow` in `create_async_engine()` based on your expected concurrency.

**Keep lesson content reasonable in size**

Quiz generation sends up to 4000 characters of content to Ollama. Very large lessons slow down quiz generation without improving quality — split them into multiple lessons instead.

**Index frequently-queried columns**

`users.email` has a unique index (created by the migration). If you add queries filtering on other columns (e.g. `user_progress.user_id`), add an index in the migration.

## Data Management

**Run Alembic migrations before starting the backend in production**

In development, `Base.metadata.create_all` runs on startup. In production, rely on Alembic:
```bash
alembic upgrade head
```

**Back up PostgreSQL regularly**

The `postgres_data` Docker volume contains all user data. Back it up with `pg_dump`:
```bash
docker compose exec postgres pg_dump -U learn dclaw_learn > backup.sql
```

**Test restores**

A backup is only useful if it can be restored. Test periodically:
```bash
docker compose exec postgres psql -U learn dclaw_learn < backup.sql
```

## Development

**Follow the existing pattern for new features**

Every feature in v1.2 follows the same structure: `models.py` → `schemas.py` → `routers/<name>.py` → `main.py` → Alembic migration → `frontend/lib/api.ts`. Staying consistent makes the codebase predictable.

**Use `get_optional_user` for public endpoints that can be personalised**

Endpoints like `/dashboard` and `/recommendations` work for anonymous users but return better data when a token is present. Use `get_optional_user` (returns `User | None`) rather than `get_current_user` (raises 401).

**Never skip the Alembic migration**

Adding a column in `models.py` without a matching migration means the column exists in the ORM but not in the database, causing runtime errors. Always run:
```bash
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

**Write tests for every new router**

Use `httpx.AsyncClient` with `ASGITransport` and override the `get_db` dependency with a test session. See `backend/tests/conftest.py` for the pattern.

**Do not use `default_factory=` in `mapped_column()`**

SQLAlchemy's `mapped_column` does not support `default_factory`. Use `default=` instead (e.g. `default=list`, `default=dict`, `default=uuid.uuid4`). Using `default_factory` silently creates a shared mutable object across instances.
