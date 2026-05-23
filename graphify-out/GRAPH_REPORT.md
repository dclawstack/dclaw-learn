# Graph Report - .  (2026-05-16)

## Corpus Check
- 41 files · ~31,046 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 618 nodes · 1024 edges · 35 communities (30 shown, 5 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 151 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_SQLAlchemy Data Models|SQLAlchemy Data Models]]
- [[_COMMUNITY_Pydantic Schemas & Response Types|Pydantic Schemas & Response Types]]
- [[_COMMUNITY_Test Suite & Fixtures|Test Suite & Fixtures]]
- [[_COMMUNITY_Docs, Architecture & AI Integration|Docs, Architecture & AI Integration]]
- [[_COMMUNITY_Frontend Package & Dependencies|Frontend Package & Dependencies]]
- [[_COMMUNITY_Frontend Pages & Auth|Frontend Pages & Auth]]
- [[_COMMUNITY_API Client & Auth Middleware|API Client & Auth Middleware]]
- [[_COMMUNITY_Ollama AI & Study Planning|Ollama AI & Study Planning]]
- [[_COMMUNITY_Project Infra & Services|Project Infra & Services]]
- [[_COMMUNITY_JWT Auth & Adaptive Learning|JWT Auth & Adaptive Learning]]
- [[_COMMUNITY_Alembic Migrations|Alembic Migrations]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Flashcard & SM-2 Algorithm|Flashcard & SM-2 Algorithm]]
- [[_COMMUNITY_v1.3 Roadmap & Mastery Score|v1.3 Roadmap & Mastery Score]]
- [[_COMMUNITY_Search Tests|Search Tests]]
- [[_COMMUNITY_Course Enrollment Router|Course Enrollment Router]]
- [[_COMMUNITY_Password Auth & Hashing|Password Auth & Hashing]]
- [[_COMMUNITY_Forum Router|Forum Router]]
- [[_COMMUNITY_Test Config & Session Fixtures|Test Config & Session Fixtures]]
- [[_COMMUNITY_Analytics Tests|Analytics Tests]]
- [[_COMMUNITY_App Startup & Seeding|App Startup & Seeding]]
- [[_COMMUNITY_Alembic Migration Environment|Alembic Migration Environment]]
- [[_COMMUNITY_Course Tests|Course Tests]]
- [[_COMMUNITY_App Config & CORS|App Config & CORS]]
- [[_COMMUNITY_Dashboard Tests|Dashboard Tests]]
- [[_COMMUNITY_Health Check Tests|Health Check Tests]]
- [[_COMMUNITY_Flashcard Review Tests|Flashcard Review Tests]]
- [[_COMMUNITY_Backend Package Init|Backend Package Init]]
- [[_COMMUNITY_Tailwind Config|Tailwind Config]]
- [[_COMMUNITY_Helm ServiceAccount|Helm ServiceAccount]]

## God Nodes (most connected - your core abstractions)
1. `create_access_token()` - 32 edges
2. `_make_user()` - 21 edges
3. `Course` - 18 edges
4. `_setup()` - 18 edges
5. `User` - 17 edges
6. `UserProgress` - 16 edges
7. `Lesson` - 16 edges
8. `compilerOptions` - 15 edges
9. `api client (lib/api.ts)` - 14 edges
10. `Assignment` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Ollama AI Quiz Generation (llama3)` --semantically_similar_to--> `Spaced Repetition Flashcards (SM-2)`  [INFERRED] [semantically similar]
  PLAN-v1.2.md → docs/releases/roadmap.md
- `Migration: add course_ratings table` --references--> `DClaw Learn v1.3 Product Roadmap`  [INFERRED]
  backend/alembic/versions/2026_05_16_0004_v1_3_course_ratings.py → PLAN-v1.3.md
- `Migration: add quiz_attempts table` --references--> `DClaw Learn v1.3 Product Roadmap`  [INFERRED]
  backend/alembic/versions/2026_05_16_0006_v1_3_quiz_attempts.py → PLAN-v1.3.md
- `Migration: add flashcards table` --references--> `DClaw Learn v1.3 Product Roadmap`  [INFERRED]
  backend/alembic/versions/2026_05_16_0007_v1_3_flashcards.py → PLAN-v1.3.md
- `Migration: add mastery_score to user_progress` --references--> `DClaw Learn v1.3 Product Roadmap`  [INFERRED]
  backend/alembic/versions/2026_05_16_0009_v1_3_mastery_score.py → PLAN-v1.3.md

## Hyperedges (group relationships)
- **Ollama Graceful Degradation: Study Plan, AI Grading, Chat all fall back when Ollama is down** — routers_study_plan_generate_via_llm, routers_assignments_ai_grade_submission, routers_chat_stream_ollama, concept_ollama_fallback_pattern [EXTRACTED 1.00]
- **Adaptive Learning Pipeline: mastery_score → next-lesson endpoint → NextLessonResponse** — concept_mastery_score, routers_courses_get_next_lesson, app_schemas_nextlessonresponse, concept_adaptive_difficulty [EXTRACTED 1.00]
- **Gamification System: XP + Streak tracked on User, awarded on lesson completion** — app_models_user, routers_courses_complete_lesson, concept_xp_streak_gamification [EXTRACTED 1.00]
- **Ollama AI with Keyword Fallback — Quiz and Flashcard Generation** — routers_quiz_generate_via_ollama, routers_quiz_generate_keyword_questions, routers_flashcards_generate_flashcards_via_ollama, routers_flashcards_extract_keyword_flashcards [EXTRACTED 1.00]
- **JWT Auth Dependency Chain: token decode -> user lookup -> role check** — core_auth_get_user_from_token, core_auth_get_current_user, core_auth_require_instructor [EXTRACTED 1.00]
- **v1.3 Alembic Migration Chain (0003 -> 0009)** — versions_0003_v1_3_xp_streak, versions_0004_v1_3_course_ratings, versions_0005_v1_3_instructor_id, versions_0006_v1_3_quiz_attempts, versions_0007_v1_3_flashcards, versions_0008_v1_3_graded_by, versions_0009_v1_3_mastery_score [EXTRACTED 1.00]

## Communities (35 total, 5 thin omitted)

### Community 0 - "SQLAlchemy Data Models"
Cohesion: 0.07
Nodes (51): get_db(), Database configuration and session management., SQLAlchemy 2.0 declarative base., Yield an async database session for dependency injection., QuizAttempt, SQLAlchemy database models., User, UserProgress (+43 more)

### Community 1 - "Pydantic Schemas & Response Types"
Cohesion: 0.06
Nodes (54): AiGradeFeedback, AssignmentCreate, AssignmentResponse, CertificateResponse, CourseCreate, CourseDetailResponse, CourseListResponse, CourseRatingCreate (+46 more)

### Community 2 - "Test Suite & Fixtures"
Cohesion: 0.06
Nodes (48): Instructor Role-Gating, XP and Streak Gamification, CourseRating, complete_lesson(), Mark a lesson as completed for the current user., Instructor role can create a course., Student role is rejected from creating a course (403)., Instructor dashboard only shows courses they own. (+40 more)

### Community 3 - "Docs, Architecture & AI Integration"
Cohesion: 0.08
Nodes (51): Alembic Database Migrations, Assignments and Grading, Certificates and Badges on Course Completion, Certificate Issuance (SHA-256), Lesson Completion Percentage Calculation, CORS Origins Configuration, create_all vs Alembic Migration Strategy, Per-Course Discussion Forum (+43 more)

### Community 4 - "Frontend Package & Dependencies"
Cohesion: 0.05
Nodes (39): allow, app_id, nav, title, version, dependencies, class-variance-authority, clsx (+31 more)

### Community 5 - "Frontend Pages & Auth"
Cohesion: 0.07
Nodes (21): metadata, QUALITY_COLORS, QUALITY_LABELS, ReviewQuality, CourseDetailPage(), Tab, EMPTY_FORM, api (+13 more)

### Community 6 - "API Client & Auth Middleware"
Cohesion: 0.07
Nodes (39): AnalyticsPage Component, Flashcard, Quiz, NavBar Component, Instructor Role Guard, get_current_user(), get_optional_user(), require_instructor() (+31 more)

### Community 7 - "Ollama AI & Study Planning"
Cohesion: 0.07
Nodes (33): AiGradeFeedback schema, AI vs Human Grade Precedence, Ollama LLM Fallback Pattern, StudyPlan, adjust_study_plan(), _build_daily_tasks(), create_study_plan(), _generate_via_llm() (+25 more)

### Community 8 - "Project Infra & Services"
Cohesion: 0.1
Nodes (30): Agent Development Guide (AGENTS.md), Anti-Patterns Reference Table, Architecture Lock — Non-Negotiable Stack Choices, CloudNativePG Operator Dependency, DClaw Learn Adaptive Learning Platform, DClaw Operator DClawApp CRD, default_factory Anti-Pattern in mapped_column, Dependency Injection via Depends(get_db) (+22 more)

### Community 9 - "JWT Auth & Adaptive Learning"
Cohesion: 0.16
Nodes (20): JWT Bearer Authentication, create_access_token(), Quiz submission updates mastery_score on UserProgress., User with no quiz history gets normal adjustment., User with mastery >= 0.85 gets accelerated flag., User with mastery < 0.5 (but > 0) gets remediation flag., When all lessons are completed, lesson_id is null., _setup() (+12 more)

### Community 10 - "Alembic Migrations"
Cohesion: 0.14
Nodes (11): downgrade(), Initial migration  Revision ID: 2026_05_08_0001 Revises: Create Date: 2026-05-08, upgrade(), v1.2 features: users, certificates, forum, assignments, video fields  Revision I, v1.3: add xp_total, streak_days, last_streak_date to users  Revision ID: 2026_05, v1.3: add course_ratings table  Revision ID: 2026_05_16_0004 Revises: 2026_05_16, v1.3: add instructor_id to courses  Revision ID: 2026_05_16_0005 Revises: 2026_0, v1.3: add quiz_attempts table  Revision ID: 2026_05_16_0006 Revises: 2026_05_16_ (+3 more)

### Community 11 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 12 - "Flashcard & SM-2 Algorithm"
Cohesion: 0.15
Nodes (16): Apply SM-2 algorithm. Returns (new_ease_factor, new_interval_days)., _sm2_update(), GET /flashcards/due returns cards due now., Quality 5 (perfect) increases interval., Quality < 3 resets interval to 1., Ease factor never drops below 1.3., First review (review_count=0) interval is 1 regardless of quality., Second review (review_count=1) with passing quality gives interval 6. (+8 more)

### Community 13 - "v1.3 Roadmap & Mastery Score"
Cohesion: 0.17
Nodes (15): NextLessonResponse, Adaptive Difficulty Engine, Mastery Score (UserProgress.mastery_score), SM-2 Spaced Repetition Algorithm, DClaw Learn v1.3 Product Roadmap, get_next_lesson(), Return the recommended next lesson with adaptive difficulty adjustment., SM-2 algorithm unit tests (+7 more)

### Community 14 - "Search Tests"
Cohesion: 0.17
Nodes (11): Full-text search router tests., Empty query returns empty results., Matches course by title substring., Matches course by description substring., Matches lesson by title and returns its parent course title., Query with no matches returns empty results., test_search_course_by_description(), test_search_course_by_title() (+3 more)

### Community 15 - "Course Enrollment Router"
Cohesion: 0.17
Nodes (11): add_lesson(), create_course(), enroll_course(), get_course(), list_courses(), Course management router., Create a new course (instructor only)., Add a lesson to a course (instructor only). (+3 more)

### Community 16 - "Password Auth & Hashing"
Cohesion: 0.22
Nodes (10): _get_user_from_token(), hash_password(), JWT authentication utilities and dependencies., verify_password(), login(), User registration and login router., Authenticate and return a JWT access token., register() (+2 more)

### Community 17 - "Forum Router"
Cohesion: 0.2
Nodes (9): create_thread(), get_thread(), list_threads(), Discussion forum router., List all discussion threads for a course., Create a new discussion thread., Get a thread with all its replies., Post a reply to a thread. (+1 more)

### Community 18 - "Test Config & Session Fixtures"
Cohesion: 0.2
Nodes (9): client(), db_session(), event_loop(), Pytest configuration and shared fixtures., Create an instance of the default event loop for the test session., Create all tables before tests and drop them after., Yield a fresh database session for each test., Yield an HTTP client with overridden DB dependency. (+1 more)

### Community 19 - "Analytics Tests"
Cohesion: 0.25
Nodes (8): _make_enrolled_user(), Learning analytics router tests., Student analytics endpoint returns completion and XP data., Unauthenticated request returns 401., Instructor course analytics returns enrollment counts., test_instructor_analytics_returns_course_data(), test_student_analytics_requires_auth(), test_student_analytics_returns_data()

### Community 20 - "App Startup & Seeding"
Cohesion: 0.22
Nodes (7): FastAPI app instance, lifespan(), FastAPI application entrypoint., Application lifespan handler., Seed sample data for development., Create sample courses if none exist., seed_data()

### Community 21 - "Alembic Migration Environment"
Cohesion: 0.32
Nodes (6): Alembic environment configuration., Run migrations in 'offline' mode., In this scenario we need to create an Engine and associate a connection with the, run_async_migrations(), run_migrations_offline(), run_migrations_online()

### Community 22 - "Course Tests"
Cohesion: 0.29
Nodes (6): Listing courses when none exist returns empty list., Listing courses returns seeded courses., Getting a non-existent course returns 404., test_get_course_not_found(), test_list_courses_empty(), test_list_courses_with_data()

### Community 23 - "App Config & CORS"
Cohesion: 0.33
Nodes (4): Application configuration., Application settings loaded from environment., Settings, BaseSettings

### Community 24 - "Dashboard Tests"
Cohesion: 0.33
Nodes (5): Dashboard router tests., Dashboard with no data returns zeros., Dashboard aggregates real data correctly., test_dashboard_empty(), test_dashboard_with_data()

## Knowledge Gaps
- **236 isolated node(s):** `Health endpoint returns ok.`, `Dashboard router tests.`, `Dashboard with no data returns zeros.`, `Dashboard aggregates real data correctly.`, `Pytest configuration and shared fixtures.` (+231 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Assignment` connect `SQLAlchemy Data Models` to `Pydantic Schemas & Response Types`, `Docs, Architecture & AI Integration`, `Frontend Pages & Auth`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **Why does `Assignments and Grading` connect `Docs, Architecture & AI Integration` to `SQLAlchemy Data Models`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Why does `DClaw Learn v1.2 Feature Roadmap` connect `Docs, Architecture & AI Integration` to `Project Infra & Services`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Are the 29 inferred relationships involving `create_access_token()` (e.g. with `test_next_lesson_normal_pace()` and `test_next_lesson_accelerated_for_high_mastery()`) actually correct?**
  _`create_access_token()` has 29 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `_make_user()` (e.g. with `User` and `hash_password()`) actually correct?**
  _`_make_user()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `Course` (e.g. with `LessonSearchResult` and `CourseSearchResult`) actually correct?**
  _`Course` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `_setup()` (e.g. with `User` and `UserProgress`) actually correct?**
  _`_setup()` has 3 INFERRED edges - model-reasoned connections that need verification._