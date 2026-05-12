# Use Cases

## Individual Learners

**Self-paced study with AI quizzes**
A learner pastes a chapter from a textbook into the Quiz page. DClaw Learn generates 5 multiple-choice questions via Ollama, the learner answers them, and gets instant feedback with explanations. Lesson progress is tracked on the course detail page.

**Study plan for a fixed deadline**
A learner enrolls in "Introduction to Machine Learning" and creates a 4-week intense study plan. Each day's task is listed with a checkbox. They adjust the pace to "relaxed" mid-way when life gets busy — the plan regenerates automatically.

**Certificate for a portfolio**
After completing all lessons in a course, the learner clicks "Get Certificate". The certificate number is a unique identifier they can share or reference in a portfolio.

## Instructors / Course Creators

**Creating a structured course**
Using the API directly (or a future admin UI), an instructor creates a course with ordered lessons. They optionally attach a `video_url` (YouTube embed) to each lesson for richer content.

**Assignments and grading**
An instructor creates an assignment with a due date and maximum score. Students submit text answers via the Assignments tab. The instructor calls the grade endpoint with a score and feedback message, which appears instantly in the student's assignment view.

**Discussion moderation**
The instructor monitors the Forum tab of their course. Students post questions; the instructor or other students reply. No moderation tools exist yet — threads are public to all enrolled users.

## Teams / Organisations

**Internal training**
Deploy DClaw Learn on-premise via Docker Compose or Helm. Staff register accounts and enroll in internal training courses. Course completion and certificates are tracked in PostgreSQL.

**Rapid content prototyping**
Paste any document into the Quiz generator to quickly produce comprehension questions — useful for trainers who want to test whether a document was understood without writing questions manually.

## Developer Use Cases

**Extending the platform**
DClaw Learn is built on a clean FastAPI + SQLAlchemy 2.0 stack. Adding a new content type follows a predictable pattern: model → schema → router → migration → frontend API call. See [Architecture](../reference/architecture.md) for the module layout.

**Testing AI quiz quality**
The Ollama integration can be swapped to any OpenAI-compatible endpoint by pointing `OLLAMA_BASE_URL` at a compatible server and adjusting the request format in `backend/app/routers/quiz.py`.
