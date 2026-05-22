# DClaw Learn — Landing Pages Design Spec

**Date:** 2026-05-22  
**Status:** Approved  
**Scope:** Main landing page + 4 feature landing pages, dark/light theme system, seed/clear widget, test suite

---

## Overview

Replace the current minimal homepage stub with a full public marketing landing page for DClaw Learn. Additionally, create dedicated landing pages for 4 major features: Courses, Study Plans, Flashcards, and Instructor Tools. All pages are public — no auth required. The app is deployed as part of a k3s app store panel; these pages serve as the demo-facing entry point.

---

## 1. Architecture

### Approach
Replace existing `page.tsx` stubs for the 5 target routes directly. No new routing namespace needed. Each page is a Next.js App Router Server Component (static shell) with isolated Client Components for interactivity (theme toggle, seed widget, flip animations).

### File Structure

```
frontend/
├── app/
│   ├── layout.tsx                        ← wrap with ThemeProvider
│   ├── page.tsx                          ← main landing page (replace)
│   ├── courses/page.tsx                  ← courses landing page (replace)
│   ├── study-plan/page.tsx               ← study plans landing page (replace)
│   ├── flashcards/page.tsx               ← flashcards landing page (replace)
│   ├── instructor/page.tsx               ← instructor tools landing page (replace)
│   └── components/
│       ├── ThemeProvider.tsx             ← new: context + localStorage
│       ├── ThemeToggle.tsx               ← new: sun/moon button
│       ├── SeedWidget.tsx                ← new: floating seed/clear button
│       └── landing/
│           ├── HeroSection.tsx           ← reusable: headline, subtext, CTAs
│           ├── FeatureSection.tsx        ← reusable: split layout (text + mockup)
│           └── FeatureGrid.tsx           ← reusable: card grid
├── lib/
│   └── seed.ts                           ← seed and clear API functions
├── __tests__/                            ← Vitest + React Testing Library
└── e2e/                                  ← Playwright E2E tests
```

---

## 2. Theme System

- **Strategy:** Tailwind `darkMode: 'class'` — `dark` class applied to `<html>` element
- **Default:** Dark theme
- **Persistence:** `localStorage` key `dclaw-theme`
- **Provider:** `ThemeProvider` client component wraps app in `layout.tsx`, reads storage on mount, applies class
- **Toggle:** `ThemeToggle` button in NavBar — sun icon (light mode), moon icon (dark mode)

### Color Palette

| Token | Dark | Light |
|---|---|---|
| Background | `#0f172a` (slate-900) | `#f8fafc` (slate-50) |
| Surface | `#1e293b` (slate-800) | `#ffffff` |
| Text primary | `#f1f5f9` (slate-100) | `#0f172a` (slate-900) |
| Text secondary | `#94a3b8` (slate-400) | `#64748b` (slate-500) |
| Accent | `#3b82f6` (blue-500) | `#3b82f6` (blue-500) |
| Accent hover | `#2563eb` (blue-600) | `#2563eb` (blue-600) |
| Border | `#334155` (slate-700) | `#e2e8f0` (slate-200) |

---

## 3. Main Landing Page (`/`)

### Structure (top to bottom)

1. **NavBar** — logo left, links (Courses, Study Plans, Flashcards, Instructor), ThemeToggle right
2. **Hero** — full-viewport centered section
   - Headline: "Adaptive learning that works."
   - Subheadline: "Personalized courses, AI-generated quizzes, and smart study plans to help you learn faster."
   - CTAs: "Browse Courses" → `/courses`, "Start Learning" → `/dashboard`
   - Background: animated blue gradient using `#3b82f6`
3. **Features Overview Grid** — 5 cards (Courses, Quiz, Study Plans, Flashcards, Instructor Tools)
   - Each card: icon, title, one-line description, arrow link to feature page/route
4. **Courses Section** — split layout (text left, mockup right)
   - Headline: "Learn from structured, expert-curated courses"
   - 3 bullet points: browse catalog, track progress, earn certificates
   - Mockup: course card preview
5. **Quiz Section** — reversed split (mockup left, text right)
   - Headline: "AI-powered quizzes that test what matters"
   - Bullets: auto-generate from content, instant feedback, track weak areas
   - Mockup: quiz question UI preview
6. **Study Plans Section** — split (text left, mockup right)
   - Headline: "Your personalized learning roadmap"
   - Bullets: AI-generated schedules, milestone tracking, adaptive adjustments
   - Mockup: timeline/schedule preview
7. **Flashcards Section** — reversed split (mockup left, text right)
   - Headline: "Master anything with spaced repetition"
   - Bullets: AI-generated cards, SRS algorithm, streak tracking
   - Mockup: animated flip card
8. **Instructor Section** — split (text left, mockup right)
   - Headline: "Build and manage courses with ease"
   - Bullets: course builder, student analytics, quiz creation
   - Mockup: dashboard stats preview
9. **CTA Footer Band** — full-width blue band
   - Text: "Ready to start learning?"
   - Button: "Get Started" → `/courses`
10. **SeedWidget** — floating bottom-right corner (only on this page)

---

## 4. Feature Landing Pages

All 4 pages share the same NavBar, theme system, and section structure. No SeedWidget.

### Courses (`/courses`)
- **Hero:** "Learn anything, your way." — CTAs: "Browse All Courses", "Enroll Now"
- **Sections:**
  1. Course catalog with search and filter
  2. AI-powered course recommendations
  3. Progress tracking per course
  4. Certificates on completion
- **Bottom:** Course cards grid populated from API (seed data when available)

### Study Plans (`/study-plan`)
- **Hero:** "Your personal learning roadmap." — CTA: "Create a Plan"
- **Sections:**
  1. AI-generated personalized schedules
  2. Milestone and deadline tracking
  3. Adaptive plan adjustments
  4. Multi-course coordination

### Flashcards (`/flashcards`)
- **Hero:** "Master anything with spaced repetition." — CTA: "Start Flashcards"
- **Sections:**
  1. AI-generated cards from course content
  2. Spaced repetition algorithm
  3. Deck management and organization
  4. Progress streaks and stats
- **Visual:** Animated CSS flip card demo in hero area

### Instructor Tools (`/instructor`)
- **Hero:** "Build and manage courses with ease." — CTA: "Go to Dashboard"
- **Sections:**
  1. Course builder with rich content
  2. Student analytics and engagement stats
  3. Quiz and assessment creation
  4. Enrollment management

---

## 5. Seed Data

### What Gets Seeded

| Resource | Count | Details |
|---|---|---|
| Courses | 4 | "Intro to Python", "Data Structures", "Machine Learning Basics", "Web Dev Fundamentals" — each with description, tags, difficulty |
| Study Plans | 2 | Linked to 2 of the courses, with milestones and deadlines |
| Flashcard Decks | 3 | One per topic, 5–10 cards each |
| Quizzes | 2 | With AI-generated questions linked to courses |

### `lib/seed.ts`

Exports two functions:
- `seedDemoData()` — sequential POST calls to backend API endpoints to create all resources
- `clearDemoData()` — DELETE calls to remove all seeded resources

### SeedWidget (`components/SeedWidget.tsx`)

- **Mount behavior:** GET `/api/v1/learn/courses` — if empty shows "Seed Demo Data", if populated shows "Re-seed Data"
- **States:** `idle | checking | seeding | clearing | done | error`
- **UI:** Floating pill button, bottom-right, `z-50`. Shows spinner during async ops, success/error toast on completion.
- **Clear flow:** Confirmation prompt before DELETE calls
- **Position:** Only rendered on the main landing page (`/`)

---

## 6. Test Suite

### Unit + Integration Tests (Vitest + React Testing Library)

Location: `frontend/__tests__/`

| Test file | What it covers |
|---|---|
| `ThemeProvider.test.tsx` | Default dark theme, toggle applies class to `<html>`, persists to localStorage |
| `ThemeToggle.test.tsx` | Button renders correct icon per theme, click calls toggle |
| `SeedWidget.test.tsx` | All 5 state transitions, API calls mocked with MSW, confirmation prompt on clear |
| `HeroSection.test.tsx` | Renders headline, subheadline, CTA links |
| `FeatureSection.test.tsx` | Renders text content, mockup slot, reversed layout variant |
| `seed.test.ts` | `seedDemoData` and `clearDemoData` call correct endpoints with correct payloads |

### E2E Tests (Playwright)

Location: `frontend/e2e/`

| Test file | Scenarios |
|---|---|
| `landing.spec.ts` | Main page loads, all 5 feature sections visible, CTA links navigate correctly |
| `theme.spec.ts` | Dark theme default, toggle switches to light, persists on reload |
| `seed-widget.spec.ts` | Widget visible on `/`, not visible on `/courses`, seed → data appears, clear → data gone |
| `feature-pages.spec.ts` | `/courses`, `/study-plan`, `/flashcards`, `/instructor` all load without errors, hero text visible, nav links work |

---

## 7. Constraints & Decisions

- **No auth required** — all 5 landing pages are fully public
- **SeedWidget only on `/`** — not a global persistent widget
- **No new routing namespace** — existing route structure preserved, stubs replaced in-place
- **Existing routes untouched** — quiz, analytics, search, dashboard, login, register pages are not modified
- **Seed data via real API** — backend must be running for seed/clear to work; widget shows error state gracefully if backend is down
- **Tailwind dark mode class strategy** — requires `darkMode: 'class'` in `tailwind.config.ts`
