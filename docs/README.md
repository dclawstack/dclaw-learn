# DClaw Learn

> Adaptive learning that works

**Category:** Education
**Version:** 1.2.0
**Status:** Live

## Overview

DClaw Learn is an adaptive learning platform providing AI-powered courses, quizzes, study plans, progress tracking, discussion forums, and assignments. It is built on FastAPI + PostgreSQL (backend) and Next.js 14 (frontend), deployable via Docker Compose locally or via Helm on Kubernetes.

## Features

| Feature | Status |
|---------|--------|
| Course catalog with lessons | v1.0 |
| AI quiz generation (Ollama + fallback) | v1.2 |
| Study plans | v1.0 |
| User authentication (JWT) | v1.2 |
| Lesson progress tracking | v1.2 |
| Certificates on completion | v1.2 |
| Video lesson support | v1.2 |
| Content recommendations | v1.2 |
| Discussion forums per course | v1.2 |
| Assignments & grading | v1.2 |

## Quick Links

- [Getting Started](./getting-started/index.md)
- [Guides](./guides/index.md)
- [API Reference](./reference/api.md)
- [Architecture](./reference/architecture.md)
- [Troubleshooting](./troubleshooting/common-issues.md)
- [Changelog](./releases/changelog.md)

## Ports (local dev)

| Service | Port |
|---------|------|
| Frontend (Next.js) | 3008 |
| Backend (FastAPI) | 8093 |
| PostgreSQL | 5432 |
