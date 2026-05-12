# Common Issues

## Services won't start

**Symptom:** `docker compose up` exits immediately or containers keep restarting.

**Check:**
```bash
docker compose ps
docker compose logs backend
docker compose logs frontend
```

**Common causes:**

| Cause | Fix |
|-------|-----|
| Port 3008 or 8093 already in use | Stop the conflicting process or change the port in `docker-compose.yml` |
| PostgreSQL not ready before backend starts | The healthcheck should handle this; wait 30 s and retry |
| Missing `.env` file | `cp .env.example .env` |

---

## Backend: database connection refused

**Symptom:** Backend logs show `connection refused` or `asyncpg.exceptions.ConnectionFailureError`.

**Solutions:**

1. Confirm PostgreSQL is healthy:
   ```bash
   docker compose ps postgres   # should say "healthy"
   ```

2. Check `DATABASE_URL` is correct — for Docker Compose it must use the service name `postgres`, not `localhost`:
   ```
   DATABASE_URL=postgresql+asyncpg://learn:learn@postgres:5432/dclaw_learn
   ```

3. When running the backend outside Docker, PostgreSQL must be accessible on `localhost:5432`:
   ```bash
   psql -h localhost -U learn -d dclaw_learn
   ```

---

## Backend: Alembic migration errors

**Symptom:** `alembic upgrade head` fails with `DuplicateTable` or `column already exists`.

**Solutions:**

- The app uses `Base.metadata.create_all` on startup (dev mode), which can conflict with Alembic if you run both. In production, disable `create_all` and rely on Alembic exclusively.
- To check current migration state:
  ```bash
  alembic current
  alembic history
  ```
- To stamp the database to the latest revision without running SQL (if tables already exist):
  ```bash
  alembic stamp head
  ```

---

## Auth: 401 Unauthorized on protected endpoints

**Symptom:** Requests to `/certificate`, `/forum` (POST), or `/assignments/submit` return 401.

**Solutions:**

1. Confirm you are logged in — the nav bar should show your name, not "Sign In".
2. Check that `localStorage` contains the token:
   ```js
   // In the browser console:
   localStorage.getItem('dclaw_learn_token')
   ```
3. If the token is missing, log out and log in again.
4. Tokens expire after 7 days by default (`JWT_EXPIRE_MINUTES=10080`). Log in again to get a fresh token.
5. In production, verify `JWT_SECRET` is the same value the server used to issue the token. A secret rotation will invalidate all existing tokens.

---

## Auth: "Email already registered" on register

**Solution:** The email is already in the database. Use a different email or log in with the existing account.

---

## Quiz: questions look low-quality (keyword-based)

**Symptom:** Questions follow the pattern "What is discussed in: '...'?" with options like "not X".

**Cause:** Ollama is not running or `OLLAMA_BASE_URL` is wrong, so the fallback keyword extractor is used.

**Solutions:**

1. Install and start Ollama:
   ```bash
   ollama serve
   ollama pull llama3
   ```
2. Confirm `OLLAMA_BASE_URL` matches where Ollama is running:
   ```
   OLLAMA_BASE_URL=http://localhost:11434
   ```
3. Test Ollama directly:
   ```bash
   curl http://localhost:11434/api/generate \
     -d '{"model":"llama3","prompt":"Hello","stream":false}'
   ```

If Ollama is running in Docker or on a different host, update `OLLAMA_BASE_URL` to the correct address.

---

## Certificate: "Course not completed"

**Symptom:** Clicking "Get Certificate" shows an error about lessons not being completed.

**Cause:** The `completed_lesson_ids` in your `user_progress` row does not include all lesson IDs for the course.

**Solutions:**

1. Go back to the Lessons tab and click **Complete** on every lesson.
2. Make sure you are logged in — guest completions are not linked to your account.

---

## Frontend: blank page or "Course not found"

**Symptom:** The course detail page or dashboard shows nothing.

**Solutions:**

1. Check the browser console for network errors.
2. Confirm the backend is running:
   ```bash
   curl http://localhost:8093/health
   ```
3. Confirm `NEXT_PUBLIC_API_URL` is set correctly. For Docker Compose, the frontend container calls the backend container using the internal Docker network, but browsers call from the host. The `docker-compose.yml` sets `NEXT_PUBLIC_API_URL=http://localhost:8093`, which works from the host browser.

---

## Frontend: CORS errors in browser console

**Symptom:** `Access-Control-Allow-Origin` errors when the frontend calls the backend.

**Solutions:**

1. Verify `CORS_ORIGINS` in the backend includes the frontend origin:
   ```
   CORS_ORIGINS=http://localhost:3008
   ```
2. For local dev, the Docker Compose file sets this automatically. If you are running services manually, set it in `backend/.env`.

---

## Lesson completion: "Not enrolled in this course"

**Symptom:** Clicking **Complete** returns a 404.

**Solution:** You must enroll in the course before marking lessons complete. On the course detail page, click **Enroll** first (or ensure you were enrolled while logged in — guest enrollments use a random UUID that isn't linked to your user account).

---

## Docker: "port is already allocated"

**Symptom:** `docker compose up` fails with `Error response from daemon: Ports are not available`.

**Solution:** Another process is using the port.

```bash
# Find what is using port 8093
lsof -i :8093
# or
ss -tulpn | grep 8093

# Kill it, or change the host port in docker-compose.yml:
# ports:
#   - "8094:8093"   ← change left side only
```
