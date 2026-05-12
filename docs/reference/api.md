# API Reference

## Base URL

```
http://localhost:8093        (local dev)
https://learn.yourdomain.com (production)
```

Interactive Swagger UI: `http://localhost:8093/docs`
OpenAPI JSON: `http://localhost:8093/openapi.json`

## Authentication

Most endpoints are public. Endpoints that create or retrieve user-specific data (certificate, forum posting, assignment submission) require a Bearer token.

```bash
# Register
curl -X POST http://localhost:8093/api/v1/learn/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","name":"Your Name","password":"secret123"}'

# Login — get access_token
curl -X POST http://localhost:8093/api/v1/learn/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"secret123"}'

# Use token on protected endpoints
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:8093/api/v1/learn/courses/<id>/certificate
```

---

## Endpoints

### Health

```
GET /health
```
Response: `{"status":"ok","version":"0.1.0"}`

---

### Auth

#### Register
```
POST /api/v1/learn/auth/register
```
Body: `{ email, name, password }`
Response: `UserResponse` — `{ id, email, name, role, created_at }`

#### Login
```
POST /api/v1/learn/auth/login
```
Body: `{ email, password }`
Response: `{ access_token, token_type, user: UserResponse }`

---

### Courses

#### List / Search Courses
```
POST /api/v1/learn/courses
```
Body (all optional): `{ query?, category?, difficulty? }`
Response: `{ items: Course[], total: int }`

#### Get Course Detail
```
GET /api/v1/learn/courses/{course_id}
```
Response: `CourseDetail` — includes `lessons[]` with `video_url`, `video_duration`

#### Enroll in Course
```
POST /api/v1/learn/courses/{course_id}/enroll
```
Auth: optional (uses authenticated user's ID if token present, otherwise generates guest ID)
Body: `{ user_id? }` (ignored if authenticated)
Response: `{ enrollment_id, course_id, status }`

#### Complete a Lesson
```
POST /api/v1/learn/courses/{course_id}/lessons/{lesson_id}/complete
```
Auth: optional
Response: `{ lesson_id, completed_lesson_ids, completion_percentage, course_completed }`

---

### Certificates

#### Get or Issue Certificate
```
GET /api/v1/learn/courses/{course_id}/certificate
```
Auth: **required**
Returns 400 if course is not fully completed.
Response: `{ id, user_id, course_id, certificate_number, issued_at, course_title, user_name }`

---

### Quiz

#### Generate Quiz
```
POST /api/v1/learn/quiz/generate
```
Body: `{ content: string, num_questions?: int (1–20, default 5) }`
Response: `{ quiz_id, title, questions: QuizQuestion[] }`

`QuizQuestion`: `{ question, options: string[4], correct_index: int, explanation }`

Uses Ollama (llama3) if available, falls back to keyword extraction.

#### Submit Quiz
```
POST /api/v1/learn/quiz/{quiz_id}/submit
```
Body: `{ answers: int[] }` — index of chosen option for each question
Response: `{ score, total, percentage, explanations: string[] }`

---

### Study Plan

#### Create Study Plan
```
POST /api/v1/learn/study-plan
```
Body: `{ title, goal, pace: "relaxed"|"moderate"|"intense", weeks: 1–52, course_id? }`
Response: `StudyPlanResponse` with `daily_tasks[]`

#### Get Study Plan
```
GET /api/v1/learn/study-plan/{plan_id}
```

#### Adjust Study Plan
```
PATCH /api/v1/learn/study-plan/{plan_id}
```
Body: `{ pace?, weeks? }`

---

### Dashboard

```
GET /api/v1/learn/dashboard
```
Auth: optional (recommendations only appear when authenticated)
Response:
```json
{
  "enrolled_courses": [...],
  "total_courses_completed": 2,
  "streak_days": 5,
  "total_hours_studied": 24.0,
  "recent_activity": [...],
  "recommendations": [...]
}
```

---

### Recommendations

```
GET /api/v1/learn/recommendations
```
Auth: optional
Returns up to 6 courses not yet enrolled in, scored by category match and difficulty progression.

---

### Forum

#### List Threads
```
GET /api/v1/learn/courses/{course_id}/forum
```

#### Create Thread
```
POST /api/v1/learn/courses/{course_id}/forum
```
Auth: **required**
Body: `{ title, body? }`

#### Get Thread (with replies)
```
GET /api/v1/learn/forum/{thread_id}
```

#### Reply to Thread
```
POST /api/v1/learn/forum/{thread_id}/reply
```
Auth: **required**
Body: `{ body }`

---

### Assignments

#### List Assignments
```
GET /api/v1/learn/courses/{course_id}/assignments
```

#### Create Assignment
```
POST /api/v1/learn/courses/{course_id}/assignments
```
Auth: **required**
Body: `{ title, description?, due_date?, max_score? }`

#### Submit Assignment
```
POST /api/v1/learn/assignments/{assignment_id}/submit
```
Auth: **required**
Body: `{ content }` — text submission (one submission per user)
Returns 409 if already submitted.

#### Grade Submission
```
PATCH /api/v1/learn/submissions/{submission_id}/grade
```
Auth: **required**
Body: `{ score: int, feedback?: string }`

---

## Error Responses

FastAPI returns standard HTTP errors as JSON:

```json
{ "detail": "Course not found" }
```

Common status codes:

| Code | Meaning |
|------|---------|
| 400 | Bad request (e.g. course not completed for certificate) |
| 401 | Unauthenticated (missing or invalid Bearer token) |
| 404 | Resource not found |
| 409 | Conflict (already enrolled, already submitted) |
| 422 | Validation error (Pydantic) |
