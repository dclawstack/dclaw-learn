# Graph Report - .  (2026-05-16)

## Corpus Check
- Corpus is ~19,124 words - fits in a single context window. You may not need a graph.

## Summary
- 412 nodes · 536 edges · 39 communities (32 shown, 7 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.73)
- Token cost: 9,800 input · 3,200 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Backend API Schemas & Routers|Backend API Schemas & Routers]]
- [[_COMMUNITY_Frontend Pages & Auth|Frontend Pages & Auth]]
- [[_COMMUNITY_Docs & Technical Concepts|Docs & Technical Concepts]]
- [[_COMMUNITY_Project Docs & Infrastructure|Project Docs & Infrastructure]]
- [[_COMMUNITY_Frontend Package Dependencies|Frontend Package Dependencies]]
- [[_COMMUNITY_Database Layer|Database Layer]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_App Manifest & Config|App Manifest & Config]]
- [[_COMMUNITY_JWT Auth Middleware|JWT Auth Middleware]]
- [[_COMMUNITY_Platform Feature Modules|Platform Feature Modules]]
- [[_COMMUNITY_Forum API|Forum API]]
- [[_COMMUNITY_Test Fixtures|Test Fixtures]]
- [[_COMMUNITY_Assignments API|Assignments API]]
- [[_COMMUNITY_Alembic Migration Runner|Alembic Migration Runner]]
- [[_COMMUNITY_Study Plan API|Study Plan API]]
- [[_COMMUNITY_App Startup & Seed|App Startup & Seed]]
- [[_COMMUNITY_AI Quiz Generation|AI Quiz Generation]]
- [[_COMMUNITY_Course Tests|Course Tests]]
- [[_COMMUNITY_App Configuration|App Configuration]]
- [[_COMMUNITY_Certificate API|Certificate API]]
- [[_COMMUNITY_Docs Metadata|Docs Metadata]]
- [[_COMMUNITY_Initial DB Migration|Initial DB Migration]]
- [[_COMMUNITY_v1.2 DB Migration|v1.2 DB Migration]]
- [[_COMMUNITY_Health Check Test|Health Check Test]]
- [[_COMMUNITY_App Package Init|App Package Init]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_Tailwind Config|Tailwind Config]]
- [[_COMMUNITY_Helm ServiceAccount|Helm ServiceAccount]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 15 edges
2. `Base` - 14 edges
3. `Agent Development Guide (AGENTS.md)` - 11 edges
4. `DClaw Learn v1.2 Feature Roadmap` - 11 edges
5. `Architecture Reference` - 11 edges
6. `Changelog` - 10 edges
7. `Ollama AI Integration` - 10 edges
8. `devDependencies` - 9 edges
9. `dependencies` - 8 edges
10. `api` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Docker Compose Configuration` --semantically_similar_to--> `Helm Chart: dclaw-learn`  [INFERRED] [semantically similar]
  docker-compose.yml → helm/dclaw-learn/Chart.yaml
- `Agent Development Guide (AGENTS.md)` --references--> `DClaw Learn v1.2 Feature Roadmap`  [EXTRACTED]
  AGENTS.md → PLAN-v1.2.md
- `GitHub Actions: Build Frontend Workflow` --implements--> `Next.js 14 Frontend Service`  [EXTRACTED]
  .github/workflows/build-frontend.yml → AGENTS.md
- `GitHub Actions: Build Backend Workflow` --implements--> `FastAPI Backend Service`  [EXTRACTED]
  .github/workflows/build-backend.yml → AGENTS.md
- `GitHub Actions: Deploy Learn Workflow` --references--> `Helm Chart: dclaw-learn`  [EXTRACTED]
  .github/workflows/deploy.yml → helm/dclaw-learn/Chart.yaml

## Hyperedges (group relationships)
- **CI/CD Pipeline: Build + Push to GHCR + Deploy via Helm** — workflows_build_frontend, workflows_build_backend, workflows_deploy, ghcr_registry, helm_chart [EXTRACTED 1.00]
- **Three-Tier Service Stack: Frontend + Backend + PostgreSQL** — nextjs_frontend, fastapi_backend, postgresql_db [EXTRACTED 1.00]
- **Backend Data Layer: SQLAlchemy + Repository Pattern + Dependency Injection** — sqlalchemy_async, repository_pattern, dependency_injection_get_db, alembic_migrations [EXTRACTED 1.00]
- **AI Quiz Generation with Ollama and Keyword-Extraction Fallback** — concept_ollama_integration, concept_quiz_fallback, reference_api [EXTRACTED 1.00]
- **v1.2 User-Facing Features: JWT Auth, Certificates, Recommendations** — concept_jwt_authentication, concept_certificate_issuance, concept_content_recommendations [EXTRACTED 1.00]
- **Schema Management Strategy: create_all in Dev vs Alembic in Production** — concept_alembic_migrations, concept_create_all_vs_alembic, troubleshooting_common_issues [INFERRED 0.95]

## Communities (39 total, 7 thin omitted)

### Community 0 - "Backend API Schemas & Routers"
Cohesion: 0.06
Nodes (52): AssignmentCreate, AssignmentResponse, CourseCreate, CourseDetailResponse, CourseListResponse, CourseResponse, CourseSearchRequest, DashboardResponse (+44 more)

### Community 1 - "Frontend Pages & Auth"
Cohesion: 0.06
Nodes (29): metadata, CourseDetailPage(), Tab, api, Assignment, AuthUser, Certificate, Course (+21 more)

### Community 2 - "Docs & Technical Concepts"
Cohesion: 0.1
Nodes (43): Alembic Database Migrations, Assignments and Grading, Certificate Issuance (SHA-256), Lesson Completion Percentage Calculation, Content Recommendations Engine, CORS Origins Configuration, create_all vs Alembic Migration Strategy, Per-Course Discussion Forum (+35 more)

### Community 3 - "Project Docs & Infrastructure"
Cohesion: 0.1
Nodes (31): Agent Development Guide (AGENTS.md), Alembic Database Migrations, Anti-Patterns Reference Table, Architecture Lock — Non-Negotiable Stack Choices, CloudNativePG Operator Dependency, DClaw Learn Adaptive Learning Platform, DClaw Operator DClawApp CRD, default_factory Anti-Pattern in mapped_column (+23 more)

### Community 4 - "Frontend Package Dependencies"
Cohesion: 0.07
Nodes (26): dependencies, class-variance-authority, clsx, lucide-react, next, react, react-dom, tailwind-merge (+18 more)

### Community 5 - "Database Layer"
Cohesion: 0.12
Nodes (24): Base, get_db(), Database configuration and session management., SQLAlchemy 2.0 declarative base., Yield an async database session for dependency injection., Assignment, Certificate, Course (+16 more)

### Community 6 - "TypeScript Configuration"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 7 - "App Manifest & Config"
Cohesion: 0.14
Nodes (13): api_base, app_id, billing_plan, category, color, description, entrypoint, icon (+5 more)

### Community 8 - "JWT Auth Middleware"
Cohesion: 0.18
Nodes (8): create_access_token(), hash_password(), JWT authentication utilities and dependencies., verify_password(), login(), User registration and login router., Authenticate and return a JWT access token., register()

### Community 9 - "Platform Feature Modules"
Cohesion: 0.25
Nodes (11): Assignments and Grading, Certificates and Badges on Course Completion, Content Recommendations Engine, Discussion Forums Per Course, JWT User Authentication, Learning Analytics (P2), Lesson Progress Tracking, Ollama AI Quiz Generation (llama3) (+3 more)

### Community 10 - "Forum API"
Cohesion: 0.2
Nodes (9): create_thread(), get_thread(), list_threads(), Discussion forum router., List all discussion threads for a course., Create a new discussion thread., Get a thread with all its replies., Post a reply to a thread. (+1 more)

### Community 11 - "Test Fixtures"
Cohesion: 0.2
Nodes (9): client(), db_session(), event_loop(), Pytest configuration and shared fixtures., Create an instance of the default event loop for the test session., Create all tables before tests and drop them after., Yield a fresh database session for each test., Yield an HTTP client with overridden DB dependency. (+1 more)

### Community 12 - "Assignments API"
Cohesion: 0.2
Nodes (9): create_assignment(), grade_submission(), list_assignments(), Assignments and grading router., Grade a submission (instructor action)., List all assignments for a course., Create an assignment (instructor action)., Submit an assignment. (+1 more)

### Community 13 - "Alembic Migration Runner"
Cohesion: 0.25
Nodes (7): Alembic environment configuration., Run migrations in 'offline' mode., In this scenario we need to create an Engine and associate a connection with the, Run migrations in 'online' mode., run_async_migrations(), run_migrations_offline(), run_migrations_online()

### Community 14 - "Study Plan API"
Cohesion: 0.28
Nodes (8): adjust_study_plan(), _build_daily_tasks(), create_study_plan(), get_study_plan(), Generate daily study tasks for a plan., Create a personalized study plan., Retrieve a study plan by ID., Adjust study plan pace or duration.

### Community 15 - "App Startup & Seed"
Cohesion: 0.25
Nodes (6): lifespan(), FastAPI application entrypoint., Application lifespan handler., Seed sample data for development., Create sample courses if none exist., seed_data()

### Community 16 - "AI Quiz Generation"
Cohesion: 0.32
Nodes (7): _generate_keyword_questions(), generate_quiz(), _generate_via_ollama(), Quiz generation and submission router., Try to generate questions using Ollama. Returns None if unavailable., Fallback: keyword-extraction quiz generation., Generate a quiz from provided content using AI, with keyword fallback.

### Community 17 - "Course Tests"
Cohesion: 0.29
Nodes (6): Listing courses when none exist returns empty list., Listing courses returns seeded courses., Getting a non-existent course returns 404., test_get_course_not_found(), test_list_courses_empty(), test_list_courses_with_data()

### Community 18 - "App Configuration"
Cohesion: 0.33
Nodes (4): Application configuration., Application settings loaded from environment., Settings, BaseSettings

### Community 19 - "Certificate API"
Cohesion: 0.4
Nodes (5): CertificateResponse, get_or_issue_certificate(), _make_cert_number(), Certificate issuance router., Issue (or retrieve) a certificate for a completed course.

### Community 20 - "Docs Metadata"
Cohesion: 0.4
Nodes (4): app_id, nav, title, version

## Knowledge Gaps
- **148 isolated node(s):** `Health endpoint returns ok.`, `Dashboard router tests.`, `Dashboard with no data returns zeros.`, `Dashboard aggregates real data correctly.`, `Pytest configuration and shared fixtures.` (+143 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UserProgress` connect `Database Layer` to `Backend API Schemas & Routers`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `enroll_course()` connect `Backend API Schemas & Routers` to `Database Layer`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `Base` (e.g. with `User` and `Course`) actually correct?**
  _`Base` has 11 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Health endpoint returns ok.`, `Dashboard router tests.`, `Dashboard with no data returns zeros.` to the rest of the system?**
  _148 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Backend API Schemas & Routers` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Frontend Pages & Auth` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Docs & Technical Concepts` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._