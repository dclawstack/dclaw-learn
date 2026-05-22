# Landing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full public marketing landing page for DClaw Learn plus landing pages for Courses, Study Plans, Flashcards, and Instructor Tools — with dark/light theme system, seed/clear demo data widget, and a comprehensive test suite.

**Architecture:** Replace existing minimal `page.tsx` stubs for 5 routes with rich landing pages built from shared `HeroSection`, `FeatureSection`, and `FeatureGrid` components. Theme is managed by a `ThemeProvider` client component that writes `dark`/`light` to `<html>` and persists to `localStorage`. A `SeedWidget` floating button on `/` calls a new backend `/api/v1/learn/demo` router to seed or clear demo data.

**Tech Stack:** Next.js 14 (App Router), React 18, Tailwind CSS (class-based dark mode), lucide-react icons, Vitest + React Testing Library (unit/integration), Playwright (E2E), FastAPI (new demo seed/clear router), SQLAlchemy 2.0 async

---

## File Map

### New files (frontend)
| File | Responsibility |
|---|---|
| `frontend/app/components/ThemeProvider.tsx` | Context + localStorage persistence for dark/light theme |
| `frontend/app/components/ThemeToggle.tsx` | Sun/moon button that calls theme context |
| `frontend/app/components/SeedWidget.tsx` | Floating pill button for seed/clear, state machine |
| `frontend/app/components/landing/HeroSection.tsx` | Reusable hero: headline, subheadline, CTAs, optional gradient bg |
| `frontend/app/components/landing/FeatureSection.tsx` | Reusable split section: text + mockup, optional reversed layout |
| `frontend/app/components/landing/FeatureGrid.tsx` | Card grid for feature overview |
| `frontend/lib/seed.ts` | `seedDemoData()` and `clearDemoData()` functions |
| `frontend/__tests__/ThemeProvider.test.tsx` | Theme provider unit tests |
| `frontend/__tests__/ThemeToggle.test.tsx` | Theme toggle unit tests |
| `frontend/__tests__/SeedWidget.test.tsx` | Seed widget state machine tests |
| `frontend/__tests__/HeroSection.test.tsx` | Hero section render tests |
| `frontend/__tests__/FeatureSection.test.tsx` | Feature section render tests |
| `frontend/__tests__/seed.test.ts` | Seed/clear API call tests |
| `frontend/e2e/landing.spec.ts` | Main landing page E2E |
| `frontend/e2e/theme.spec.ts` | Theme toggle E2E |
| `frontend/e2e/seed-widget.spec.ts` | Seed widget E2E |
| `frontend/e2e/feature-pages.spec.ts` | Feature landing pages E2E |
| `frontend/e2e/integration.spec.ts` | Backend-frontend integration: proxy, seed/clear cycle, UI data, API 404 regression |

### Modified files (frontend)
| File | Change |
|---|---|
| `frontend/tailwind.config.ts` | Add `darkMode: 'class'` |
| `frontend/app/layout.tsx` | Wrap with `ThemeProvider`, apply dark-mode classes to `<html>` and `<body>` |
| `frontend/app/globals.css` | Add dark mode CSS variables |
| `frontend/app/NavBar.tsx` | Add `ThemeToggle`, update link styles for dark mode, add Instructor link |
| `frontend/app/page.tsx` | Full main landing page |
| `frontend/app/courses/page.tsx` | Add hero + feature sections above existing course list |
| `frontend/app/study-plan/page.tsx` | Add hero + feature sections above existing form |
| `frontend/app/flashcards/page.tsx` | Add hero + feature sections above existing flashcard UI |
| `frontend/app/instructor/page.tsx` | Add hero + feature sections above existing instructor UI |
| `frontend/package.json` | Add vitest, @testing-library/react, msw, playwright dev deps |
| `frontend/next.config.js` | Fix proxy rewrite — always active, fallback to `http://localhost:8093` |
| `frontend/lib/api.ts` | Remove `API_BASE` prefix — use relative paths, rely on Next.js rewrite proxy |
| `frontend/lib/seed.ts` | Remove `API_BASE` prefix — use relative paths |

### New files (backend)
| File | Responsibility |
|---|---|
| `backend/app/routers/demo.py` | `/demo/seed` POST and `/demo/clear` DELETE endpoints |

### Modified files (backend)
| File | Change |
|---|---|
| `backend/app/main.py` | Register demo router |
| `backend/requirements.txt` | Pinned full dependency list (generated from uv.lock) |

---

## Python Dependencies

The backend uses **Python ≥ 3.11** and is managed with `uv` (`pyproject.toml` + `uv.lock`). A standard `venv/` is also provided for environments without `uv`.

### Virtual environments

| Path | Tool | Purpose |
|---|---|---|
| `backend/.venv/` | uv | Primary — used by `uv run`, created by `uv sync` |
| `backend/venv/` | stdlib venv | Fallback — created via `python3 -m venv venv && pip install -r requirements.txt` |

To set up with uv (recommended):
```bash
cd backend
uv sync
```

To set up with pip (fallback):
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Runtime dependencies

Declared in `pyproject.toml` `[project.dependencies]`:

| Package | Version constraint | Purpose |
|---|---|---|
| `fastapi` | `>=0.111.0` | Web framework, routing, dependency injection |
| `uvicorn[standard]` | `>=0.30.0` | ASGI server (includes uvloop, httptools, websockets) |
| `pydantic` | `>=2.7.0` | Data validation and serialisation |
| `email-validator` | `>=2.0.0` | Required by `pydantic[email]` for `EmailStr` fields |
| `pydantic-settings` | `>=2.2.0` | Settings from env vars / `.env` file |
| `sqlalchemy[asyncio]` | `>=2.0.30` | ORM + async query engine |
| `asyncpg` | `>=0.29.0` | Async PostgreSQL driver |
| `alembic` | `>=1.13.0` | Database migrations |
| `python-dotenv` | `>=1.0.0` | `.env` file loading |
| `httpx` | `>=0.27.0` | Async HTTP client (used in tests and API calls) |
| `python-jose[cryptography]` | `>=3.3.0` | JWT encoding/decoding |
| `passlib[bcrypt]` | `>=1.7.4` | Password hashing |
| `python-multipart` | `>=0.0.9` | Form/multipart request parsing |

### Dev dependencies

Declared in `pyproject.toml` `[project.optional-dependencies.dev]`:

| Package | Version constraint | Purpose |
|---|---|---|
| `pytest` | `>=8.2.0` | Test runner |
| `pytest-asyncio` | `>=0.23.0` | Async test support |
| `ruff` | `>=0.4.0` | Linter + formatter |
| `mypy` | `>=1.10.0` | Static type checker |

### Pinned versions (`requirements.txt`)

`backend/requirements.txt` contains the full pinned dependency tree exported from `uv.lock`, including all transitive dependencies. Key pinned versions:

```
fastapi==0.136.1
uvicorn==0.47.0
pydantic==2.13.4
email-validator==2.3.0
sqlalchemy==2.0.49
asyncpg==0.31.0
alembic==1.18.4
httpx==0.28.1
python-jose==3.5.0
passlib==1.7.4
bcrypt==5.0.0
python-multipart==0.0.29
python-dotenv==1.2.2
```

---

## Task 1: Configure Tailwind dark mode + install test deps

**Files:**
- Modify: `frontend/tailwind.config.ts`
- Modify: `frontend/app/globals.css`
- Modify: `frontend/package.json`

- [ ] **Step 1: Enable dark mode class strategy in Tailwind**

Edit `frontend/tailwind.config.ts` — add `darkMode: 'class'` at the top level:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        learn: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
```

- [ ] **Step 2: Update globals.css with dark mode CSS variables**

Replace the contents of `frontend/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #f8fafc;
  --surface: #ffffff;
  --text: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;
}

.dark {
  --bg: #0f172a;
  --surface: #1e293b;
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --border: #334155;
}

body {
  background-color: var(--bg);
  color: var(--text);
}
```

- [ ] **Step 3: Install test dependencies**

```bash
cd frontend
npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom msw @playwright/test
```

- [ ] **Step 4: Add test scripts and vitest config to package.json**

In `frontend/package.json`, update `"scripts"` and add `"vitest"` config:

```json
{
  "scripts": {
    "dev": "next dev -p 3008",
    "build": "next build",
    "start": "next start -p 3008",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 5: Create vitest config**

Create `frontend/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 6: Create vitest setup file**

Create `frontend/vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 7: Create Playwright config**

Create `frontend/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3008',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3008',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
```

- [ ] **Step 8: Verify no errors**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 9: Commit**

```bash
git add frontend/tailwind.config.ts frontend/app/globals.css frontend/package.json frontend/vitest.config.ts frontend/vitest.setup.ts frontend/playwright.config.ts
git commit -m "feat: configure dark mode, vitest, and playwright"
```

---

## Task 2: ThemeProvider and ThemeToggle

**Files:**
- Create: `frontend/app/components/ThemeProvider.tsx`
- Create: `frontend/app/components/ThemeToggle.tsx`
- Create: `frontend/__tests__/ThemeProvider.test.tsx`
- Create: `frontend/__tests__/ThemeToggle.test.tsx`
- Modify: `frontend/app/layout.tsx`

- [ ] **Step 1: Write failing tests for ThemeProvider**

Create `frontend/__tests__/ThemeProvider.test.tsx`:

```typescript
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeProvider, useTheme } from '../app/components/ThemeProvider';

function TestConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('defaults to dark theme', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>);
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('applies dark class to <html> on mount', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles to light and updates <html> class', async () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>);
    await act(async () => {
      screen.getByText('toggle').click();
    });
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persists theme to localStorage', async () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>);
    await act(async () => {
      screen.getByText('toggle').click();
    });
    expect(localStorage.getItem('dclaw-theme')).toBe('light');
  });

  it('reads theme from localStorage on mount', () => {
    localStorage.setItem('dclaw-theme', 'light');
    render(<ThemeProvider><TestConsumer /></ThemeProvider>);
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd frontend && npx vitest run __tests__/ThemeProvider.test.tsx
```

Expected: FAIL — `ThemeProvider` not found

- [ ] **Step 3: Implement ThemeProvider**

Create `frontend/app/components/ThemeProvider.tsx`:

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('dclaw-theme') as Theme | null;
    const initial = stored === 'light' ? 'light' : 'dark';
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  function toggleTheme() {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('dclaw-theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

- [ ] **Step 4: Write failing tests for ThemeToggle**

Create `frontend/__tests__/ThemeToggle.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ThemeToggle } from '../app/components/ThemeToggle';
import { ThemeContext } from '../app/components/ThemeProvider';

function renderWithTheme(theme: 'dark' | 'light', toggleTheme = vi.fn()) {
  return render(
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ThemeToggle />
    </ThemeContext.Provider>
  );
}

describe('ThemeToggle', () => {
  it('shows moon icon in dark mode', () => {
    renderWithTheme('dark');
    expect(screen.getByRole('button', { name: /switch to light/i })).toBeTruthy();
  });

  it('shows sun icon in light mode', () => {
    renderWithTheme('light');
    expect(screen.getByRole('button', { name: /switch to dark/i })).toBeTruthy();
  });

  it('calls toggleTheme on click', async () => {
    const toggle = vi.fn();
    renderWithTheme('dark', toggle);
    await userEvent.click(screen.getByRole('button'));
    expect(toggle).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 5: Implement ThemeToggle**

Create `frontend/app/components/ThemeToggle.tsx`:

```typescript
'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
```

- [ ] **Step 6: Export ThemeContext from ThemeProvider for tests**

Update `frontend/app/components/ThemeProvider.tsx` — export the context:

```typescript
export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
});
```

(Replace the non-exported `const ThemeContext` line with the exported one above — all other code stays the same.)

- [ ] **Step 7: Update layout.tsx to use ThemeProvider**

Replace `frontend/app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import './globals.css';
import NavBar from './NavBar';
import { ThemeProvider } from './components/ThemeProvider';

export const metadata: Metadata = {
  title: 'DClaw Learn',
  description: 'Adaptive learning that works',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
        <ThemeProvider>
          <NavBar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Run all theme tests**

```bash
cd frontend && npx vitest run __tests__/ThemeProvider.test.tsx __tests__/ThemeToggle.test.tsx
```

Expected: all PASS

- [ ] **Step 9: Commit**

```bash
git add frontend/app/components/ThemeProvider.tsx frontend/app/components/ThemeToggle.tsx frontend/app/layout.tsx frontend/__tests__/ThemeProvider.test.tsx frontend/__tests__/ThemeToggle.test.tsx
git commit -m "feat: add ThemeProvider and ThemeToggle with dark mode support"
```

---

## Task 3: Landing component primitives (HeroSection, FeatureSection, FeatureGrid)

**Files:**
- Create: `frontend/app/components/landing/HeroSection.tsx`
- Create: `frontend/app/components/landing/FeatureSection.tsx`
- Create: `frontend/app/components/landing/FeatureGrid.tsx`
- Create: `frontend/__tests__/HeroSection.test.tsx`
- Create: `frontend/__tests__/FeatureSection.test.tsx`

- [ ] **Step 1: Write failing tests for HeroSection**

Create `frontend/__tests__/HeroSection.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeroSection } from '../app/components/landing/HeroSection';

describe('HeroSection', () => {
  it('renders headline', () => {
    render(
      <HeroSection
        headline="Test Headline"
        subheadline="Test sub"
        ctas={[{ label: 'Go', href: '/go' }]}
      />
    );
    expect(screen.getByRole('heading', { name: /test headline/i })).toBeTruthy();
  });

  it('renders subheadline', () => {
    render(
      <HeroSection
        headline="H"
        subheadline="Test subheadline"
        ctas={[{ label: 'Go', href: '/go' }]}
      />
    );
    expect(screen.getByText('Test subheadline')).toBeTruthy();
  });

  it('renders all CTA links with correct hrefs', () => {
    render(
      <HeroSection
        headline="H"
        subheadline="S"
        ctas={[
          { label: 'Primary', href: '/primary' },
          { label: 'Secondary', href: '/secondary', variant: 'outline' },
        ]}
      />
    );
    const primary = screen.getByRole('link', { name: /primary/i });
    const secondary = screen.getByRole('link', { name: /secondary/i });
    expect(primary.getAttribute('href')).toBe('/primary');
    expect(secondary.getAttribute('href')).toBe('/secondary');
  });
});
```

- [ ] **Step 2: Write failing tests for FeatureSection**

Create `frontend/__tests__/FeatureSection.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FeatureSection } from '../app/components/landing/FeatureSection';

describe('FeatureSection', () => {
  it('renders headline and bullets', () => {
    render(
      <FeatureSection
        headline="Feature Headline"
        bullets={['Bullet one', 'Bullet two', 'Bullet three']}
        mockup={<div>mockup</div>}
      />
    );
    expect(screen.getByRole('heading', { name: /feature headline/i })).toBeTruthy();
    expect(screen.getByText('Bullet one')).toBeTruthy();
    expect(screen.getByText('Bullet two')).toBeTruthy();
  });

  it('renders mockup slot', () => {
    render(
      <FeatureSection
        headline="H"
        bullets={['b']}
        mockup={<div data-testid="my-mockup">mockup content</div>}
      />
    );
    expect(screen.getByTestId('my-mockup')).toBeTruthy();
  });

  it('renders with reversed layout when reversed prop is true', () => {
    const { container } = render(
      <FeatureSection
        headline="H"
        bullets={['b']}
        mockup={<div>m</div>}
        reversed
      />
    );
    expect(container.querySelector('.flex-row-reverse')).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd frontend && npx vitest run __tests__/HeroSection.test.tsx __tests__/FeatureSection.test.tsx
```

Expected: FAIL — components not found

- [ ] **Step 4: Implement HeroSection**

Create `frontend/app/components/landing/HeroSection.tsx`:

```typescript
import Link from 'next/link';

interface CTA {
  label: string;
  href: string;
  variant?: 'solid' | 'outline';
}

interface HeroSectionProps {
  headline: string;
  subheadline: string;
  ctas: CTA[];
  gradient?: boolean;
}

export function HeroSection({ headline, subheadline, ctas, gradient = true }: HeroSectionProps) {
  return (
    <section
      className={`flex min-h-[80vh] flex-col items-center justify-center px-6 text-center ${
        gradient
          ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900'
          : 'bg-[var(--bg)]'
      }`}
    >
      <h1 className="mb-6 max-w-3xl text-5xl font-bold leading-tight text-white drop-shadow-sm">
        {headline}
      </h1>
      <p className="mb-10 max-w-xl text-lg text-blue-100 dark:text-blue-200">
        {subheadline}
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        {ctas.map((cta) => (
          <Link
            key={cta.href}
            href={cta.href}
            className={
              cta.variant === 'outline'
                ? 'rounded-xl border-2 border-white px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-blue-900'
                : 'rounded-xl bg-[#3b82f6] px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-[#2563eb]'
            }
          >
            {cta.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Implement FeatureSection**

Create `frontend/app/components/landing/FeatureSection.tsx`:

```typescript
interface FeatureSectionProps {
  headline: string;
  bullets: string[];
  mockup: React.ReactNode;
  reversed?: boolean;
}

export function FeatureSection({ headline, bullets, mockup, reversed = false }: FeatureSectionProps) {
  return (
    <section className="px-6 py-20">
      <div
        className={`mx-auto flex max-w-5xl items-center gap-16 ${
          reversed ? 'flex-row-reverse' : 'flex-row'
        } flex-wrap`}
      >
        <div className="flex-1 min-w-[280px]">
          <h2 className="mb-6 text-3xl font-bold text-[var(--text)]">{headline}</h2>
          <ul className="space-y-3">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-[var(--text-muted)]">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#3b82f6]" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 min-w-[280px]">{mockup}</div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Implement FeatureGrid**

Create `frontend/app/components/landing/FeatureGrid.tsx`:

```typescript
import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';

interface FeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

interface FeatureGridProps {
  cards: FeatureCard[];
}

export function FeatureGrid({ cards }: FeatureGridProps) {
  return (
    <section className="bg-[var(--surface)] px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-12 text-center text-3xl font-bold text-[var(--text)]">
          Everything you need to learn faster
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 transition hover:border-[#3b82f6] hover:shadow-lg"
            >
              <card.icon className="mb-4 h-8 w-8 text-[#3b82f6]" />
              <h3 className="mb-2 font-semibold text-[var(--text)]">{card.title}</h3>
              <p className="mb-4 text-sm text-[var(--text-muted)]">{card.description}</p>
              <span className="flex items-center gap-1 text-sm font-medium text-[#3b82f6] group-hover:gap-2 transition-all">
                Explore <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Run all component tests**

```bash
cd frontend && npx vitest run __tests__/HeroSection.test.tsx __tests__/FeatureSection.test.tsx
```

Expected: all PASS

- [ ] **Step 8: Commit**

```bash
git add frontend/app/components/landing/ frontend/__tests__/HeroSection.test.tsx frontend/__tests__/FeatureSection.test.tsx
git commit -m "feat: add HeroSection, FeatureSection, FeatureGrid landing components"
```

---

## Task 4: Update NavBar with dark mode support and theme toggle

**Files:**
- Modify: `frontend/app/NavBar.tsx`

- [ ] **Step 1: Update NavBar**

Replace `frontend/app/NavBar.tsx` with this version that adds `ThemeToggle`, dark-mode-aware classes, and Instructor link:

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearAuth, getUser, type AuthUser } from '@/lib/auth';
import { ThemeToggle } from './components/ThemeToggle';

export default function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  function handleLogout() {
    clearAuth();
    setUser(null);
    router.push('/');
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (val.trim()) router.push(`/search?q=${encodeURIComponent(val)}`);
    }, 300);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-3 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="/" className="text-lg font-bold text-[#3b82f6]">
            📚 DClaw Learn
          </a>
          <div className="hidden gap-4 text-sm text-[var(--text-muted)] md:flex">
            <a href="/courses" className="hover:text-[#3b82f6]">Courses</a>
            <a href="/study-plan" className="hover:text-[#3b82f6]">Study Plans</a>
            <a href="/flashcards" className="hover:text-[#3b82f6]">Flashcards</a>
            <a href="/instructor" className="hover:text-[#3b82f6]">Instructor</a>
            <a href="/dashboard" className="hover:text-[#3b82f6]">Dashboard</a>
            <a href="/analytics" className="hover:text-[#3b82f6]">Analytics</a>
          </div>
        </div>
        <form onSubmit={handleSearchSubmit} className="mx-4 flex flex-1 max-w-xs items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm text-[var(--text)] focus:border-[#3b82f6] focus:outline-none"
          />
        </form>
        <div className="flex items-center gap-3 text-sm">
          <ThemeToggle />
          {user ? (
            <>
              <span className="text-[var(--text-muted)]">{user.name || user.email}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-[var(--text)] hover:bg-[var(--bg)]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="text-[var(--text-muted)] hover:text-[#3b82f6]">Sign In</a>
              <a
                href="/register"
                className="rounded-lg bg-[#3b82f6] px-3 py-1.5 text-white hover:bg-[#2563eb]"
              >
                Register
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/app/NavBar.tsx
git commit -m "feat: update NavBar with dark mode support and ThemeToggle"
```

---

## Task 5: Main landing page (`/`)

**Files:**
- Modify: `frontend/app/page.tsx`

- [ ] **Step 1: Replace the main landing page**

Replace `frontend/app/page.tsx`:

```typescript
import { BookOpen, Brain, Calendar, Layers, GraduationCap } from 'lucide-react';
import { HeroSection } from './components/landing/HeroSection';
import { FeatureSection } from './components/landing/FeatureSection';
import { FeatureGrid } from './components/landing/FeatureGrid';
import { SeedWidget } from './components/SeedWidget';

const FEATURE_CARDS = [
  {
    icon: BookOpen,
    title: 'Courses',
    description: 'Browse expert-curated courses with structured lessons and progress tracking.',
    href: '/courses',
  },
  {
    icon: Brain,
    title: 'AI Quizzes',
    description: 'Auto-generate quizzes from any content. Get instant feedback and track weak areas.',
    href: '/quiz',
  },
  {
    icon: Calendar,
    title: 'Study Plans',
    description: 'Personalized learning roadmaps that adapt to your pace and schedule.',
    href: '/study-plan',
  },
  {
    icon: Layers,
    title: 'Flashcards',
    description: 'AI-generated flashcards with spaced repetition to maximize retention.',
    href: '/flashcards',
  },
  {
    icon: GraduationCap,
    title: 'Instructor Tools',
    description: 'Build courses, track student progress, and manage enrollments.',
    href: '/instructor',
  },
];

export default function HomePage() {
  return (
    <>
      <HeroSection
        headline="Adaptive learning that works."
        subheadline="Personalized courses, AI-generated quizzes, and smart study plans to help you learn faster and retain more."
        ctas={[
          { label: 'Browse Courses', href: '/courses' },
          { label: 'Start Learning', href: '/dashboard', variant: 'outline' },
        ]}
      />

      <FeatureGrid cards={FEATURE_CARDS} />

      <FeatureSection
        headline="Learn from structured, expert-curated courses"
        bullets={[
          'Browse a growing catalog of courses across technology, science, and more',
          'Track your progress lesson by lesson with completion percentages',
          'Earn certificates when you finish a course',
        ]}
        mockup={
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
            <div className="mb-3 text-xs font-medium uppercase tracking-wide text-[#3b82f6]">Technology</div>
            <div className="mb-1 font-semibold text-[var(--text)]">Introduction to Machine Learning</div>
            <div className="mb-4 text-sm text-[var(--text-muted)]">Learn the fundamentals of ML with hands-on projects.</div>
            <div className="mb-4 flex gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">Beginner</span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-slate-700 dark:text-gray-300">12h</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-slate-700">
              <div className="h-2 w-3/5 rounded-full bg-[#3b82f6]" />
            </div>
            <div className="mt-1 text-right text-xs text-[var(--text-muted)]">60% complete</div>
          </div>
        }
      />

      <FeatureSection
        headline="AI-powered quizzes that test what matters"
        bullets={[
          'Auto-generate quiz questions from any course content or text',
          'Get instant feedback with detailed explanations for each answer',
          'Track your weak areas and revisit them intelligently',
        ]}
        mockup={
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
            <div className="mb-4 text-sm font-medium text-[var(--text)]">What is supervised learning?</div>
            <div className="space-y-2">
              {['Learning from labeled training data', 'Clustering unlabeled data', 'Reinforcement from an environment', 'Neural network architecture'].map((opt, i) => (
                <div key={opt} className={`rounded-lg border px-4 py-2 text-sm ${i === 0 ? 'border-green-500 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>
                  {opt}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-green-50 p-3 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300">
              ✓ Correct! Supervised learning uses labeled data to train models.
            </div>
          </div>
        }
        reversed
      />

      <FeatureSection
        headline="Your personalized learning roadmap"
        bullets={[
          'AI generates a day-by-day schedule based on your goal and pace',
          'Track milestones and stay on course with deadline reminders',
          'Adjust your plan on the fly — relaxed, moderate, or intense',
        ]}
        mockup={
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
            <div className="mb-4 font-semibold text-[var(--text)]">Python Mastery — Week 1</div>
            <div className="space-y-2">
              {[
                { day: 'Mon', task: 'Variables & Data Types', done: true },
                { day: 'Tue', task: 'Control Flow', done: true },
                { day: 'Wed', task: 'Functions', done: false },
                { day: 'Thu', task: 'Lists & Dicts', done: false },
              ].map(({ day, task, done }) => (
                <div key={day} className="flex items-center gap-3 text-sm">
                  <span className="w-8 text-xs font-medium text-[var(--text-muted)]">{day}</span>
                  <span className={`flex-1 ${done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text)]'}`}>{task}</span>
                  <span className={`h-4 w-4 rounded-full ${done ? 'bg-[#3b82f6]' : 'border-2 border-[var(--border)]'}`} />
                </div>
              ))}
            </div>
          </div>
        }
      />

      <FeatureSection
        headline="Master anything with spaced repetition"
        bullets={[
          'AI generates flashcards automatically from lesson content',
          'Spaced repetition algorithm schedules cards at the optimal time',
          'Track your streaks and see your retention improve over time',
        ]}
        mockup={
          <div className="perspective-1000 relative h-48 w-full">
            <div className="rounded-2xl border border-[var(--border)] bg-[#3b82f6] p-8 text-center shadow-xl">
              <div className="text-xs font-medium uppercase tracking-wide text-blue-200">Front</div>
              <div className="mt-3 text-lg font-semibold text-white">What is gradient descent?</div>
              <div className="mt-4 text-xs text-blue-200">Tap to reveal answer →</div>
            </div>
          </div>
        }
        reversed
      />

      <FeatureSection
        headline="Build and manage courses with ease"
        bullets={[
          'Create structured courses with lessons, assignments, and quizzes',
          'View student engagement analytics and completion rates',
          'Manage enrollments and issue certificates',
        ]}
        mockup={
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
            <div className="mb-4 font-semibold text-[var(--text)]">Instructor Dashboard</div>
            <div className="space-y-3">
              {[
                { title: 'Intro to Python', students: 142, rating: 4.8 },
                { title: 'Data Structures', students: 87, rating: 4.6 },
                { title: 'ML Basics', students: 203, rating: 4.9 },
              ].map(({ title, students, rating }) => (
                <div key={title} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text)]">{title}</span>
                  <div className="flex gap-3 text-[var(--text-muted)]">
                    <span>{students} students</span>
                    <span className="text-yellow-500">★ {rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
      />

      {/* CTA Footer Band */}
      <section className="bg-[#3b82f6] px-6 py-20 text-center">
        <h2 className="mb-4 text-3xl font-bold text-white">Ready to start learning?</h2>
        <p className="mb-8 text-blue-100">Join thousands of learners building real skills with DClaw Learn.</p>
        <a
          href="/courses"
          className="inline-block rounded-xl bg-white px-8 py-3 font-semibold text-[#2563eb] shadow-lg transition hover:bg-blue-50"
        >
          Get Started
        </a>
      </section>

      <SeedWidget />
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Expected: only SeedWidget import error (not created yet — acceptable)

- [ ] **Step 3: Commit**

```bash
git add frontend/app/page.tsx
git commit -m "feat: build main landing page with hero, feature sections, and CTA band"
```

---

## Task 6: Backend demo seed/clear router

**Files:**
- Create: `backend/app/routers/demo.py`
- Modify: `backend/app/main.py`

- [ ] **Step 1: Create the demo router**

Create `backend/app/routers/demo.py`:

```python
"""Demo data seed/clear endpoints for development and demonstration."""

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Course, Flashcard, Lesson, Quiz, QuizAnswer, StudyPlan

router = APIRouter(tags=["demo"])

# Fixed UUIDs so re-seeding is idempotent
DEMO_COURSE_IDS = [
    uuid.UUID("aaaaaaaa-0001-0001-0001-000000000001"),
    uuid.UUID("aaaaaaaa-0002-0002-0002-000000000002"),
    uuid.UUID("aaaaaaaa-0003-0003-0003-000000000003"),
    uuid.UUID("aaaaaaaa-0004-0004-0004-000000000004"),
]

DEMO_COURSES = [
    {
        "id": DEMO_COURSE_IDS[0],
        "title": "Intro to Python",
        "description": "Learn Python from scratch with hands-on exercises covering variables, functions, and OOP.",
        "category": "technology",
        "difficulty": "beginner",
        "estimated_hours": 8,
        "course_metadata": {"instructor": "Dr. Ada Lovelace", "language": "en", "demo": True},
    },
    {
        "id": DEMO_COURSE_IDS[1],
        "title": "Data Structures & Algorithms",
        "description": "Master arrays, trees, graphs, and sorting algorithms with real interview problems.",
        "category": "technology",
        "difficulty": "intermediate",
        "estimated_hours": 15,
        "course_metadata": {"instructor": "Prof. Alan Turing", "language": "en", "demo": True},
    },
    {
        "id": DEMO_COURSE_IDS[2],
        "title": "Machine Learning Basics",
        "description": "Understand supervised and unsupervised learning, model evaluation, and scikit-learn.",
        "category": "technology",
        "difficulty": "intermediate",
        "estimated_hours": 12,
        "course_metadata": {"instructor": "Dr. Grace Hopper", "language": "en", "demo": True},
    },
    {
        "id": DEMO_COURSE_IDS[3],
        "title": "Web Dev Fundamentals",
        "description": "Build modern web apps with HTML, CSS, JavaScript, and React.",
        "category": "technology",
        "difficulty": "beginner",
        "estimated_hours": 10,
        "course_metadata": {"instructor": "Dr. Tim Berners-Lee", "language": "en", "demo": True},
    },
]

DEMO_LESSONS = [
    # Intro to Python
    {"id": uuid.UUID("bbbbbbbb-0001-0001-0001-000000000001"), "course_id": DEMO_COURSE_IDS[0], "title": "Variables and Types", "content": "Python variables are dynamically typed. Use int, str, float, and bool.", "order_index": 1, "duration_minutes": 30},
    {"id": uuid.UUID("bbbbbbbb-0002-0002-0002-000000000002"), "course_id": DEMO_COURSE_IDS[0], "title": "Functions", "content": "Define reusable blocks of code with def. Use parameters and return values.", "order_index": 2, "duration_minutes": 45},
    # Data Structures
    {"id": uuid.UUID("bbbbbbbb-0003-0003-0003-000000000003"), "course_id": DEMO_COURSE_IDS[1], "title": "Arrays and Lists", "content": "Arrays store elements at contiguous memory locations. Python lists are dynamic arrays.", "order_index": 1, "duration_minutes": 40},
    {"id": uuid.UUID("bbbbbbbb-0004-0004-0004-000000000004"), "course_id": DEMO_COURSE_IDS[1], "title": "Hash Maps", "content": "Hash maps provide O(1) average lookup using a hash function.", "order_index": 2, "duration_minutes": 50},
    # ML Basics
    {"id": uuid.UUID("bbbbbbbb-0005-0005-0005-000000000005"), "course_id": DEMO_COURSE_IDS[2], "title": "Supervised Learning", "content": "Supervised learning trains on labeled data. Examples: linear regression, decision trees.", "order_index": 1, "duration_minutes": 60},
    # Web Dev
    {"id": uuid.UUID("bbbbbbbb-0006-0006-0006-000000000006"), "course_id": DEMO_COURSE_IDS[3], "title": "HTML Basics", "content": "HTML defines the structure of web pages using tags like div, p, h1, and a.", "order_index": 1, "duration_minutes": 30},
]

DEMO_STUDY_PLAN_ID = uuid.UUID("cccccccc-0001-0001-0001-000000000001")

DEMO_FLASHCARD_IDS = [
    uuid.UUID("dddddddd-0001-0001-0001-000000000001"),
    uuid.UUID("dddddddd-0002-0002-0002-000000000002"),
    uuid.UUID("dddddddd-0003-0003-0003-000000000003"),
    uuid.UUID("dddddddd-0004-0004-0004-000000000004"),
    uuid.UUID("dddddddd-0005-0005-0005-000000000005"),
]

DEMO_FLASHCARDS = [
    {"id": DEMO_FLASHCARD_IDS[0], "lesson_id": uuid.UUID("bbbbbbbb-0001-0001-0001-000000000001"), "user_id": None, "front": "What is a Python list?", "back": "A dynamic, ordered, mutable sequence that can hold items of different types."},
    {"id": DEMO_FLASHCARD_IDS[1], "lesson_id": uuid.UUID("bbbbbbbb-0001-0001-0001-000000000001"), "user_id": None, "front": "What does `len()` do?", "back": "Returns the number of items in a sequence (list, string, tuple, etc.)."},
    {"id": DEMO_FLASHCARD_IDS[2], "lesson_id": uuid.UUID("bbbbbbbb-0003-0003-0003-000000000003"), "user_id": None, "front": "What is the time complexity of array access by index?", "back": "O(1) — constant time, because elements are stored at contiguous memory addresses."},
    {"id": DEMO_FLASHCARD_IDS[3], "lesson_id": uuid.UUID("bbbbbbbb-0004-0004-0004-000000000004"), "user_id": None, "front": "What is a hash collision?", "back": "When two different keys produce the same hash value, requiring a resolution strategy like chaining."},
    {"id": DEMO_FLASHCARD_IDS[4], "lesson_id": uuid.UUID("bbbbbbbb-0005-0005-0005-000000000005"), "user_id": None, "front": "What is gradient descent?", "back": "An optimization algorithm that iteratively adjusts model parameters to minimize a loss function."},
]


@router.post("/demo/seed", status_code=201)
async def seed_demo_data(db: AsyncSession = Depends(get_db)) -> dict:
    """Seed demo courses, lessons, flashcards, and a study plan. Idempotent."""
    now = datetime.now(timezone.utc)
    due = now + timedelta(days=1)

    # Upsert courses
    for data in DEMO_COURSES:
        existing = await db.get(Course, data["id"])
        if existing is None:
            db.add(Course(**data))

    await db.flush()

    # Upsert lessons
    for data in DEMO_LESSONS:
        existing = await db.get(Lesson, data["id"])
        if existing is None:
            db.add(Lesson(**data))

    await db.flush()

    # Upsert flashcards
    for data in DEMO_FLASHCARDS:
        existing = await db.get(Flashcard, data["id"])
        if existing is None:
            db.add(Flashcard(
                id=data["id"],
                lesson_id=data["lesson_id"],
                user_id=data["user_id"],
                front=data["front"],
                back=data["back"],
                ease_factor=2.5,
                interval_days=1,
                review_count=0,
                due_date=due,
            ))

    # Upsert study plan
    existing_plan = await db.get(StudyPlan, DEMO_STUDY_PLAN_ID)
    if existing_plan is None:
        db.add(StudyPlan(
            id=DEMO_STUDY_PLAN_ID,
            user_id=None,
            course_id=DEMO_COURSE_IDS[0],
            title="Python in 4 Weeks",
            goal="Complete Intro to Python course",
            pace="moderate",
            daily_tasks=[
                {"day": i + 1, "date": (now + timedelta(days=i)).strftime("%Y-%m-%d"), "task": f"Study session {i + 1}", "lesson_id": None, "completed": i < 3}
                for i in range(14)
            ],
            start_date=now,
            end_date=now + timedelta(weeks=4),
        ))

    await db.commit()
    return {"status": "seeded", "courses": len(DEMO_COURSES), "flashcards": len(DEMO_FLASHCARDS)}


@router.delete("/demo/clear", status_code=200)
async def clear_demo_data(db: AsyncSession = Depends(get_db)) -> dict:
    """Remove all demo data seeded by /demo/seed."""
    # Delete flashcards for demo lessons
    demo_lesson_ids = [d["id"] for d in DEMO_LESSONS]
    await db.execute(delete(Flashcard).where(Flashcard.lesson_id.in_(demo_lesson_ids)))

    # Delete study plan
    await db.execute(delete(StudyPlan).where(StudyPlan.id == DEMO_STUDY_PLAN_ID))

    # Delete courses (cascades to lessons, quizzes, enrollments)
    await db.execute(delete(Course).where(Course.id.in_(DEMO_COURSE_IDS)))

    await db.commit()
    return {"status": "cleared"}
```

- [ ] **Step 2: Register demo router in main.py**

In `backend/app/main.py`, add the import and `include_router` call. Add after the existing imports:

```python
from app.routers import analytics, assignments, auth, certificates, chat, courses, dashboard, demo, flashcards, forum, health, quiz, ratings, recommendations, search, study_plan
```

Add after the last `app.include_router` line:

```python
app.include_router(demo.router, prefix="/api/v1/learn")
```

- [ ] **Step 3: Check models for user_id nullable on Flashcard and StudyPlan**

```bash
grep -n "user_id" /home/siddharth/Desktop/dclaw/dclaw-learn/backend/app/models.py | head -20
```

If `user_id` is non-nullable on `Flashcard` or `StudyPlan`, the seed data needs a placeholder UUID instead of `None`. In that case, use `uuid.UUID("00000000-0000-0000-0000-000000000000")` for `user_id` in the demo data above.

- [ ] **Step 4: Verify backend starts**

```bash
cd backend && python -c "from app.main import app; print('OK')"
```

Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add backend/app/routers/demo.py backend/app/main.py
git commit -m "feat: add demo seed/clear API endpoints"
```

---

## Task 7: Frontend seed lib and SeedWidget

**Files:**
- Create: `frontend/lib/seed.ts`
- Create: `frontend/app/components/SeedWidget.tsx`
- Create: `frontend/__tests__/seed.test.ts`
- Create: `frontend/__tests__/SeedWidget.test.tsx`

- [ ] **Step 1: Write failing tests for seed.ts**

Create `frontend/__tests__/seed.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('seedDemoData', () => {
  it('POSTs to /api/v1/learn/demo/seed', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'seeded' }) });
    const { seedDemoData } = await import('../lib/seed');
    await seedDemoData();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/demo/seed'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, text: async () => 'Server error' });
    const { seedDemoData } = await import('../lib/seed');
    await expect(seedDemoData()).rejects.toThrow('Server error');
  });
});

describe('clearDemoData', () => {
  it('DELETEs to /api/v1/learn/demo/clear', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'cleared' }) });
    const { clearDemoData } = await import('../lib/seed');
    await clearDemoData();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/demo/clear'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
```

- [ ] **Step 2: Implement seed.ts**

Create `frontend/lib/seed.ts`:

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function request(path: string, method: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, { method });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
}

export async function seedDemoData(): Promise<void> {
  await request('/api/v1/learn/demo/seed', 'POST');
}

export async function clearDemoData(): Promise<void> {
  await request('/api/v1/learn/demo/clear', 'DELETE');
}

export async function hasDemoData(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/learn/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.total > 0;
  } catch {
    return false;
  }
}
```

- [ ] **Step 3: Run seed tests**

```bash
cd frontend && npx vitest run __tests__/seed.test.ts
```

Expected: all PASS

- [ ] **Step 4: Write failing tests for SeedWidget**

Create `frontend/__tests__/SeedWidget.test.tsx`:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/seed', () => ({
  hasDemoData: vi.fn(),
  seedDemoData: vi.fn(),
  clearDemoData: vi.fn(),
}));

import { hasDemoData, seedDemoData, clearDemoData } from '../lib/seed';
import { SeedWidget } from '../app/components/SeedWidget';

describe('SeedWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows "Seed Demo Data" when no data exists', async () => {
    vi.mocked(hasDemoData).mockResolvedValue(false);
    render(<SeedWidget />);
    await waitFor(() => {
      expect(screen.getByText(/seed demo data/i)).toBeTruthy();
    });
  });

  it('shows "Re-seed Data" when data already exists', async () => {
    vi.mocked(hasDemoData).mockResolvedValue(true);
    render(<SeedWidget />);
    await waitFor(() => {
      expect(screen.getByText(/re-seed data/i)).toBeTruthy();
    });
  });

  it('calls seedDemoData on seed button click', async () => {
    vi.mocked(hasDemoData).mockResolvedValue(false);
    vi.mocked(seedDemoData).mockResolvedValue(undefined);
    render(<SeedWidget />);
    await waitFor(() => screen.getByText(/seed demo data/i));
    await userEvent.click(screen.getByText(/seed demo data/i));
    expect(seedDemoData).toHaveBeenCalledOnce();
  });

  it('shows clear button and calls clearDemoData', async () => {
    vi.mocked(hasDemoData).mockResolvedValue(true);
    vi.mocked(clearDemoData).mockResolvedValue(undefined);
    render(<SeedWidget />);
    await waitFor(() => screen.getByText(/clear/i));
    await userEvent.click(screen.getByText(/clear/i));
    expect(clearDemoData).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 5: Implement SeedWidget**

Create `frontend/app/components/SeedWidget.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Database, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { hasDemoData, seedDemoData, clearDemoData } from '@/lib/seed';

type WidgetState = 'checking' | 'empty' | 'seeded' | 'seeding' | 'clearing' | 'error';

export function SeedWidget() {
  const [state, setState] = useState<WidgetState>('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    hasDemoData().then((has) => setState(has ? 'seeded' : 'empty')).catch(() => setState('empty'));
  }, []);

  async function handleSeed() {
    setState('seeding');
    setError('');
    try {
      await seedDemoData();
      setState('seeded');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
      setState('error');
    }
  }

  async function handleClear() {
    setState('clearing');
    setError('');
    try {
      await clearDemoData();
      setState('empty');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
      setState('error');
    }
  }

  if (state === 'checking') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {error && (
        <div className="rounded-lg bg-red-500 px-3 py-2 text-xs text-white shadow">{error}</div>
      )}
      <div className="flex gap-2">
        {state === 'seeded' && (
          <button
            onClick={handleClear}
            disabled={state === 'clearing'}
            className="flex items-center gap-2 rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-lg transition hover:bg-red-50 dark:border-red-700 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            <Trash2 size={14} />
            Clear Data
          </button>
        )}
        <button
          onClick={handleSeed}
          disabled={state === 'seeding' || state === 'clearing'}
          className="flex items-center gap-2 rounded-full bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-[#2563eb] disabled:opacity-50"
        >
          {state === 'seeding' ? (
            <Loader2 size={14} className="animate-spin" />
          ) : state === 'seeded' ? (
            <RefreshCw size={14} />
          ) : (
            <Database size={14} />
          )}
          {state === 'seeding' ? 'Seeding...' : state === 'seeded' ? 'Re-seed Data' : 'Seed Demo Data'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Run SeedWidget tests**

```bash
cd frontend && npx vitest run __tests__/SeedWidget.test.tsx
```

Expected: all PASS

- [ ] **Step 7: Commit**

```bash
git add frontend/lib/seed.ts frontend/app/components/SeedWidget.tsx frontend/__tests__/seed.test.ts frontend/__tests__/SeedWidget.test.tsx
git commit -m "feat: add seed/clear lib and SeedWidget floating button"
```

---

## Task 8: Feature landing pages (Courses, Study Plans, Flashcards, Instructor)

**Files:**
- Modify: `frontend/app/courses/page.tsx`
- Modify: `frontend/app/study-plan/page.tsx`
- Modify: `frontend/app/flashcards/page.tsx`
- Modify: `frontend/app/instructor/page.tsx`

- [ ] **Step 1: Update courses/page.tsx**

Prepend a landing hero + feature sections above the existing course list. Replace the file content:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { BookOpen, TrendingUp, Award, Search } from 'lucide-react';
import { api, type Course } from '@/lib/api';
import { HeroSection } from '../components/landing/HeroSection';
import { FeatureSection } from '../components/landing/FeatureSection';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  async function search() {
    setLoading(true);
    try {
      const res = await api.listCourses({
        query: query || undefined,
        category: category || undefined,
      });
      setCourses(res.items);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <HeroSection
        headline="Learn anything, your way."
        subheadline="Browse expert-curated courses across technology, science, and more. Track your progress and earn certificates."
        ctas={[
          { label: 'Browse All Courses', href: '#catalog' },
          { label: 'Enroll Now', href: '#catalog', variant: 'outline' },
        ]}
      />

      <FeatureSection
        headline="Smart search and filtering"
        bullets={[
          'Search courses by title, topic, or keyword',
          'Filter by category and difficulty level',
          'Sort by newest, most popular, or highest rated',
        ]}
        mockup={
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
            <div className="mb-4 flex gap-2">
              <div className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-muted)]">Search courses...</div>
              <div className="rounded-lg bg-[#3b82f6] px-4 py-2 text-sm text-white">Search</div>
            </div>
            <div className="flex gap-2">
              {['Technology', 'Science', 'Business'].map((cat) => (
                <span key={cat} className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-muted)]">{cat}</span>
              ))}
            </div>
          </div>
        }
      />

      <FeatureSection
        headline="Track your progress"
        bullets={[
          'See completion percentage for every enrolled course',
          'Pick up exactly where you left off',
          'Unlock certificates on course completion',
        ]}
        mockup={
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl space-y-4">
            {[
              { title: 'Intro to Python', pct: 75 },
              { title: 'Data Structures', pct: 40 },
              { title: 'ML Basics', pct: 10 },
            ].map(({ title, pct }) => (
              <div key={title}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-[var(--text)]">{title}</span>
                  <span className="text-[var(--text-muted)]">{pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--border)]">
                  <div className="h-2 rounded-full bg-[#3b82f6]" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        }
        reversed
      />

      {/* Course Catalog */}
      <section id="catalog" className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-6 text-2xl font-bold text-[var(--text)]">Course Catalog</h2>
          <div className="mb-6 flex gap-3">
            <input
              type="text"
              placeholder="Search courses..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm text-[var(--text)] focus:border-[#3b82f6] focus:outline-none"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm text-[var(--text)] focus:border-[#3b82f6] focus:outline-none"
            >
              <option value="">All categories</option>
              <option value="technology">Technology</option>
              <option value="science">Science</option>
              <option value="business">Business</option>
              <option value="arts">Arts</option>
            </select>
            <button
              onClick={search}
              className="rounded-lg bg-[#3b82f6] px-4 py-2 text-sm text-white hover:bg-[#2563eb]"
            >
              Search
            </button>
          </div>
          {loading ? (
            <p className="text-[var(--text-muted)]">Loading...</p>
          ) : courses.length === 0 ? (
            <p className="text-[var(--text-muted)]">No courses found.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {courses.map((course) => (
                <a
                  key={course.id}
                  href={`/course/${course.id}`}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:shadow-md transition"
                >
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[#3b82f6]">{course.category}</div>
                  <div className="mb-1 font-semibold text-[var(--text)]">{course.title}</div>
                  <div className="mb-3 text-sm text-[var(--text-muted)] line-clamp-2">{course.description}</div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span className="rounded bg-[var(--bg)] px-2 py-1">{course.difficulty}</span>
                    <span>{course.estimated_hours}h</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Update study-plan/page.tsx**

Prepend landing sections above the existing form. Replace `frontend/app/study-plan/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Calendar, Target, Zap, BarChart2 } from 'lucide-react';
import { api, type StudyPlan, type StudyPlanTask } from '@/lib/api';
import { HeroSection } from '../components/landing/HeroSection';
import { FeatureSection } from '../components/landing/FeatureSection';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function StudyPlanPage() {
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [pace, setPace] = useState<'relaxed' | 'moderate' | 'intense'>('moderate');
  const [weeks, setWeeks] = useState(4);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    setLoading(true);
    setError('');
    try {
      const result = await api.createStudyPlan({ title, goal, pace, weeks });
      setPlan(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <HeroSection
        headline="Your personal learning roadmap."
        subheadline="AI generates a day-by-day schedule tailored to your goals, pace, and available time. Adapt it anytime."
        ctas={[{ label: 'Create a Plan', href: '#planner' }]}
      />

      <FeatureSection
        headline="AI-generated personalized schedules"
        bullets={[
          'Tell the AI your learning goal and preferred pace',
          'Get a structured day-by-day plan generated instantly',
          'Each session is sized to fit your available time',
        ]}
        mockup={
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
            <div className="mb-3 font-semibold text-[var(--text)]">Python in 4 Weeks</div>
            <div className="space-y-2">
              {['Day 1 — Variables & Types (30 min)', 'Day 2 — Control Flow (45 min)', 'Day 3 — Functions (45 min)', 'Day 4 — Lists & Dicts (30 min)'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        }
      />

      <FeatureSection
        headline="Adapt on the fly"
        bullets={[
          'Switch between relaxed, moderate, and intense pace',
          'Extend or shorten the duration at any time',
          'Completed tasks are preserved when you adjust',
        ]}
        mockup={
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
            <div className="mb-3 font-semibold text-[var(--text)]">Adjust Plan</div>
            <div className="flex gap-2">
              {['Relaxed', 'Moderate', 'Intense'].map((p) => (
                <div key={p} className={`rounded-lg border px-3 py-2 text-sm ${p === 'Moderate' ? 'border-[#3b82f6] bg-blue-50 text-[#3b82f6] dark:bg-blue-900/30' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>{p}</div>
              ))}
            </div>
          </div>
        }
        reversed
      />

      {/* Plan creator */}
      <section id="planner" className="px-6 py-16">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-6 text-2xl font-bold text-[var(--text)]">Create a Study Plan</h2>
          {!plan ? (
            <div className="space-y-4">
              <input
                placeholder="Plan title (e.g. Python in 4 Weeks)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm text-[var(--text)] focus:border-[#3b82f6] focus:outline-none"
              />
              <textarea
                placeholder="Your learning goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm text-[var(--text)] focus:border-[#3b82f6] focus:outline-none"
              />
              <div className="flex gap-3">
                <select
                  value={pace}
                  onChange={(e) => setPace(e.target.value as typeof pace)}
                  className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm text-[var(--text)] focus:border-[#3b82f6] focus:outline-none"
                >
                  <option value="relaxed">Relaxed</option>
                  <option value="moderate">Moderate</option>
                  <option value="intense">Intense</option>
                </select>
                <input
                  type="number"
                  min={1} max={52}
                  value={weeks}
                  onChange={(e) => setWeeks(Number(e.target.value))}
                  className="w-24 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm text-[var(--text)] focus:border-[#3b82f6] focus:outline-none"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                onClick={handleCreate}
                disabled={loading || !title || !goal}
                className="w-full rounded-lg bg-[#3b82f6] py-2 text-sm font-medium text-white hover:bg-[#2563eb] disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Plan'}
              </button>
            </div>
          ) : (
            <div>
              <h3 className="mb-4 text-lg font-semibold text-[var(--text)]">{plan.title}</h3>
              <div className="space-y-2">
                {plan.daily_tasks.slice(0, 7).map((task: StudyPlanTask) => (
                  <div key={task.day} className="flex items-center gap-3 rounded-lg border border-[var(--border)] px-4 py-2 text-sm">
                    <span className="w-6 text-center text-xs font-medium text-[var(--text-muted)]">{task.day}</span>
                    <span className="flex-1 text-[var(--text)]">{task.task}</span>
                    <span className="text-xs text-[var(--text-muted)]">{formatDate(task.date)}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setPlan(null)} className="mt-4 text-sm text-[#3b82f6] hover:underline">
                Create another plan
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 3: Update flashcards/page.tsx**

Read the current file to understand its structure, then prepend landing sections. Replace `frontend/app/flashcards/page.tsx` — keep all existing flashcard review logic intact, only add the hero + feature sections at the top:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Layers, Repeat, TrendingUp, Zap } from 'lucide-react';
import { api, type FlashcardResponse } from '@/lib/api';
import { HeroSection } from '../components/landing/HeroSection';
import { FeatureSection } from '../components/landing/FeatureSection';

type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

const QUALITY_LABELS: Record<ReviewQuality, string> = {
  0: 'Blackout', 1: 'Wrong', 2: 'Hard', 3: 'OK', 4: 'Good', 5: 'Perfect',
};

const QUALITY_COLORS: Record<ReviewQuality, string> = {
  0: 'bg-red-500 hover:bg-red-600',
  1: 'bg-red-400 hover:bg-red-500',
  2: 'bg-orange-400 hover:bg-orange-500',
  3: 'bg-yellow-400 hover:bg-yellow-500',
  4: 'bg-green-400 hover:bg-green-500',
  5: 'bg-green-600 hover:bg-green-700',
};

export default function FlashcardsPage() {
  const [cards, setCards] = useState<FlashcardResponse[]>([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    api.getDueFlashcards().then((res) => { setCards(res); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function handleReview(quality: ReviewQuality) {
    if (!cards[current]) return;
    try {
      await api.reviewFlashcard(cards[current].id, quality);
    } catch {}
    if (current + 1 >= cards.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setFlipped(false);
    }
  }

  return (
    <>
      <HeroSection
        headline="Master anything with spaced repetition."
        subheadline="AI generates flashcards from your course content. Our algorithm schedules reviews at exactly the right time."
        ctas={[
          { label: 'Start Flashcards', href: '#review' },
        ]}
      />

      <FeatureSection
        headline="AI-generated cards from your content"
        bullets={[
          'Automatically generate flashcards from any lesson',
          'Cards capture key concepts, definitions, and examples',
          'Review across all your courses in one session',
        ]}
        mockup={
          <div className="rounded-2xl bg-[#3b82f6] p-8 text-center shadow-xl">
            <div className="text-xs font-medium uppercase tracking-wide text-blue-200">Front</div>
            <div className="mt-3 text-lg font-semibold text-white">What is a hash collision?</div>
            <div className="mt-6 rounded-xl bg-white/10 p-4 text-sm text-blue-100">
              When two different keys produce the same hash value, requiring a resolution strategy like chaining.
            </div>
          </div>
        }
      />

      <FeatureSection
        headline="Spaced repetition that works"
        bullets={[
          'Cards you know well are shown less frequently',
          'Cards you struggle with appear more often',
          'The algorithm adapts to your personal memory curve',
        ]}
        mockup={
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
            <div className="mb-3 font-semibold text-[var(--text)]">Review Schedule</div>
            <div className="space-y-2">
              {[
                { card: 'What is gradient descent?', next: 'Tomorrow', ease: 'Easy' },
                { card: 'What is overfitting?', next: 'In 3 days', ease: 'Medium' },
                { card: 'Explain backpropagation', next: 'Today', ease: 'Hard' },
              ].map(({ card, next, ease }) => (
                <div key={card} className="flex items-center justify-between text-sm">
                  <span className="flex-1 truncate text-[var(--text)]">{card}</span>
                  <span className="ml-2 text-xs text-[var(--text-muted)]">{next}</span>
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${ease === 'Hard' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : ease === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>{ease}</span>
                </div>
              ))}
            </div>
          </div>
        }
        reversed
      />

      {/* Flashcard review section */}
      <section id="review" className="px-6 py-16">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-6 text-2xl font-bold text-[var(--text)]">Due for Review</h2>
          {loading ? (
            <p className="text-[var(--text-muted)]">Loading cards...</p>
          ) : done ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
              <div className="mb-2 text-2xl">🎉</div>
              <p className="font-semibold text-[var(--text)]">All cards reviewed!</p>
              <button onClick={() => { setCurrent(0); setDone(false); setFlipped(false); }} className="mt-4 text-sm text-[#3b82f6] hover:underline">Review again</button>
            </div>
          ) : cards.length === 0 ? (
            <p className="text-[var(--text-muted)]">No cards due. Use seed data to populate some cards.</p>
          ) : (
            <div>
              <p className="mb-4 text-sm text-[var(--text-muted)]">{current + 1} / {cards.length}</p>
              <div
                className="mb-6 min-h-[160px] cursor-pointer rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow select-none"
                onClick={() => setFlipped((f) => !f)}
              >
                <div className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">{flipped ? 'Answer' : 'Question'}</div>
                <div className="mt-4 text-[var(--text)]">{flipped ? cards[current].back : cards[current].front}</div>
                {!flipped && <div className="mt-4 text-xs text-[var(--text-muted)]">Click to reveal</div>}
              </div>
              {flipped && (
                <div className="grid grid-cols-3 gap-2">
                  {([0, 1, 2, 3, 4, 5] as ReviewQuality[]).map((q) => (
                    <button key={q} onClick={() => handleReview(q)} className={`rounded-lg py-2 text-sm font-medium text-white ${QUALITY_COLORS[q]}`}>
                      {QUALITY_LABELS[q]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 4: Update instructor/page.tsx**

Read the current file structure, then prepend landing sections. Replace `frontend/app/instructor/page.tsx` — keep all existing instructor dashboard logic intact, only prepend the hero + feature sections:

Read the existing file first:
```bash
cat /home/siddharth/Desktop/dclaw/dclaw-learn/frontend/app/instructor/page.tsx
```

Then prepend this block right before the existing `export default function` JSX return:

Add at the top of the return statement, before the existing instructor UI:

```typescript
// At the top of the file, add imports:
import { HeroSection } from '../components/landing/HeroSection';
import { FeatureSection } from '../components/landing/FeatureSection';
```

And wrap the existing JSX in a fragment `<>`, adding the hero and feature sections before the existing instructor content:

```typescript
return (
  <>
    <HeroSection
      headline="Build and manage courses with ease."
      subheadline="Create structured courses, track student engagement, and manage enrollments — all in one place."
      ctas={[{ label: 'Go to Dashboard', href: '#dashboard' }]}
    />

    <FeatureSection
      headline="Course builder with rich content"
      bullets={[
        'Create courses with multiple lessons, each with video and text content',
        'Add assignments with custom rubrics and deadlines',
        'Publish when ready — control visibility at any time',
      ]}
      mockup={
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
          <div className="mb-3 font-semibold text-[var(--text)]">New Course</div>
          <div className="mb-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm text-[var(--text-muted)]">Course title...</div>
          <div className="mb-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm text-[var(--text-muted)] h-16">Description...</div>
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-xs text-[var(--text-muted)]">Difficulty</div>
            <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-xs text-[var(--text-muted)]">Category</div>
          </div>
        </div>
      }
    />

    <FeatureSection
      headline="Student analytics at a glance"
      bullets={[
        'See enrollment counts and completion rates per course',
        'View average ratings and student feedback',
        'Identify which lessons students struggle with most',
      ]}
      mockup={
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
          <div className="mb-4 font-semibold text-[var(--text)]">Your Courses</div>
          {[
            { title: 'Intro to Python', students: 142, rating: 4.8 },
            { title: 'Data Structures', students: 87, rating: 4.6 },
          ].map(({ title, students, rating }) => (
            <div key={title} className="mb-3 flex items-center justify-between text-sm">
              <span className="text-[var(--text)]">{title}</span>
              <div className="flex gap-3 text-[var(--text-muted)]">
                <span>{students} students</span>
                <span className="text-yellow-500">★ {rating}</span>
              </div>
            </div>
          ))}
        </div>
      }
      reversed
    />

    {/* Existing instructor dashboard */}
    <div id="dashboard" className="px-6 py-16">
      {/* --- paste existing instructor page JSX here --- */}
    </div>
  </>
);
```

**Note:** The actual instructor page replacement requires reading the full current file. When implementing this step, read `frontend/app/instructor/page.tsx` in full, then replace it with: all existing state/logic preserved, imports for HeroSection/FeatureSection added, the return wrapped in `<>` with the hero + feature sections prepended, and the existing JSX placed inside a `<div id="dashboard" className="px-6 py-16">`.

- [ ] **Step 5: Verify TypeScript for all changed pages**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add frontend/app/courses/page.tsx frontend/app/study-plan/page.tsx frontend/app/flashcards/page.tsx frontend/app/instructor/page.tsx
git commit -m "feat: add hero and feature sections to courses, study-plan, flashcards, instructor pages"
```

---

## Task 9: E2E tests

**Files:**
- Create: `frontend/e2e/landing.spec.ts`
- Create: `frontend/e2e/theme.spec.ts`
- Create: `frontend/e2e/seed-widget.spec.ts`
- Create: `frontend/e2e/feature-pages.spec.ts`

- [ ] **Step 1: Create landing page E2E test**

Create `frontend/e2e/landing.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Main landing page', () => {
  test('loads and shows hero headline', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /adaptive learning that works/i })).toBeVisible();
  });

  test('shows all 5 feature sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/learn from structured/i)).toBeVisible();
    await expect(page.getByText(/ai-powered quizzes/i)).toBeVisible();
    await expect(page.getByText(/personalized learning roadmap/i)).toBeVisible();
    await expect(page.getByText(/master anything with spaced/i)).toBeVisible();
    await expect(page.getByText(/build and manage courses/i)).toBeVisible();
  });

  test('CTA "Browse Courses" links to /courses', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: /browse courses/i }).first();
    await expect(link).toHaveAttribute('href', '/courses');
  });

  test('CTA footer "Get Started" links to /courses', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: /get started/i });
    await expect(link).toHaveAttribute('href', '/courses');
  });

  test('navbar has links to all feature pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /courses/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /study plans/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /flashcards/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /instructor/i })).toBeVisible();
  });
});
```

- [ ] **Step 2: Create theme E2E test**

Create `frontend/e2e/theme.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Theme toggle', () => {
  test('page loads with dark theme by default', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
  });

  test('theme toggle switches to light mode', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /switch to light/i }).click();
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);
  });

  test('theme persists on reload', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /switch to light/i }).click();
    await page.reload();
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);
  });
});
```

- [ ] **Step 3: Create seed widget E2E test**

Create `frontend/e2e/seed-widget.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('SeedWidget', () => {
  test('seed widget is visible on main landing page', async ({ page }) => {
    await page.goto('/');
    // Widget appears after checking data state
    await expect(page.getByText(/seed demo data|re-seed data/i)).toBeVisible({ timeout: 5000 });
  });

  test('seed widget is NOT visible on /courses page', async ({ page }) => {
    await page.goto('/courses');
    await expect(page.getByText(/seed demo data/i)).not.toBeVisible();
  });

  test('clear button appears when data exists', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=/seed demo data|re-seed data/i', { timeout: 5000 });
    // If "Re-seed Data" is shown, clear button should also be visible
    const hasData = await page.getByText(/re-seed data/i).isVisible();
    if (hasData) {
      await expect(page.getByText(/clear data/i)).toBeVisible();
    }
  });
});
```

- [ ] **Step 4: Create feature pages E2E test**

Create `frontend/e2e/feature-pages.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/courses', heading: /learn anything, your way/i },
  { path: '/study-plan', heading: /your personal learning roadmap/i },
  { path: '/flashcards', heading: /master anything with spaced repetition/i },
  { path: '/instructor', heading: /build and manage courses with ease/i },
];

for (const { path, heading } of PAGES) {
  test(`${path} loads with hero heading`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  });

  test(`${path} has working navbar`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByText(/dclaw learn/i)).toBeVisible();
  });
}

test('navigating from landing page to /courses works', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /browse courses/i }).first().click();
  await expect(page).toHaveURL('/courses');
  await expect(page.getByRole('heading', { name: /learn anything, your way/i })).toBeVisible();
});
```

- [ ] **Step 5: Install Playwright browsers**

```bash
cd frontend && npx playwright install chromium
```

- [ ] **Step 6: Run unit tests to verify all pass**

```bash
cd frontend && npx vitest run
```

Expected: all PASS

- [ ] **Step 7: Commit**

```bash
git add frontend/e2e/
git commit -m "test: add E2E tests for landing pages, theme, seed widget, and feature pages"
```

---

## Task 9b: Backend-frontend integration tests

**Context:** The frontend calls backend APIs via Next.js rewrite proxy (`next.config.js`). A misconfigured proxy (conditional guard, missing `.env`, wrong `API_BASE`) causes all API calls to 404 inside Next.js rather than reaching FastAPI. This task adds a stringent integration test suite that catches this class of bug and verifies the full seed → UI data → clear cycle.

**Root cause fixed:**
- `next.config.js` had `if (!API_BASE) return []` — rewrites were silently disabled when `NEXT_PUBLIC_API_URL` was unset
- `lib/api.ts` and `lib/seed.ts` prefixed relative paths with `API_BASE`, bypassing the rewrite proxy and causing CORS issues
- Fix: always activate rewrites with `http://localhost:8093` as fallback; all fetch calls use relative paths only

**Files:**
- Create: `frontend/e2e/integration.spec.ts`
- Modify: `frontend/next.config.js`
- Modify: `frontend/lib/api.ts`
- Modify: `frontend/lib/seed.ts`
- Modify: `frontend/app/instructor/page.tsx`

- [ ] **Step 1: Fix next.config.js proxy rewrite**

Replace the conditional `if (!API_BASE) return []` guard with an unconditional rewrite that always proxies `/api/v1/learn/:path*` to the backend:

```js
// frontend/next.config.js
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8093";

const nextConfig = {
  output: "standalone",
  images: { unoptimized: true },
  async rewrites() {
    return [
      { source: "/api/v1/learn/:path*", destination: `${API_BASE}/api/v1/learn/:path*` },
      { source: "/health", destination: `${API_BASE}/health` },
    ];
  },
};
```

- [ ] **Step 2: Fix lib/api.ts — use relative paths**

Remove `API_BASE` from `fetchJson`. All paths are relative (e.g. `/api/v1/learn/courses`) and get proxied by Next.js:

```ts
// Remove: const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
// Change: const res = await fetch(`${API_BASE}${path}`, ...)
// To:     const res = await fetch(path, ...)
```

- [ ] **Step 3: Fix lib/seed.ts — use relative paths**

Same fix: remove `API_BASE` variable, use bare `/api/v1/...` paths in all `fetch()` calls.

- [ ] **Step 4: Fix instructor/page.tsx — use relative paths**

The instructor page had two inline `fetch()` calls with `${process.env.NEXT_PUBLIC_API_URL || ''}` prefix. Change both to relative paths:

```ts
// loadDashboard
const data = await fetch('/api/v1/learn/instructor/dashboard', { ... });
// createCourse
await fetch('/api/v1/learn/instructor/courses', { ... });
```

- [ ] **Step 5: Create integration.spec.ts**

Create `frontend/e2e/integration.spec.ts` with four test groups:

**Group 1 — Proxy health (2 tests):**
- `GET /health` proxies to backend → status 200
- `POST /api/v1/learn/courses` returns non-404 (200 or 422, never 404)

**Group 2 — Seed/clear cycle (6 tests):**
- `POST /api/v1/learn/demo/seed` → 200
- After seed: courses list returns ≥ 4 courses
- After seed: flashcards endpoint returns non-404
- `DELETE /api/v1/learn/demo/clear` → 200
- After clear: demo course titles absent from courses list
- Re-seed after clear: courses restore to ≥ 4

**Group 3 — UI reflects seeded data (4 tests):**
- `/courses` shows "Intro to Python" after seeding
- `/courses` shows all 4 demo course titles
- SeedWidget shows "Re-seed Data" when data exists
- Clicking "Clear Data" removes courses from `/courses`

**Group 4 — API 404 regression (4 tests):**
- `GET /api/v1/learn/dashboard` → not 404
- `GET /api/v1/learn/analytics/me` → not 404
- `GET /api/v1/learn/instructor/dashboard` → not 404
- `GET /api/v1/learn/flashcards/due` → not 404

- [ ] **Step 6: Run unit tests to confirm no regressions**

```bash
cd frontend && npx vitest run
```

Expected: 28/28 PASS

- [ ] **Step 7: Commit**

```bash
git add frontend/e2e/integration.spec.ts frontend/next.config.js frontend/lib/api.ts frontend/lib/seed.ts frontend/app/instructor/page.tsx
git commit -m "fix: integrate frontend→backend proxy; add integration E2E tests"
```

---

## Local Development Database (Docker)

Port 5432 on this machine is occupied by other Postgres instances (k3s cluster DB, bundled service). The cleanest way to run a local dev DB without conflicts is Docker on a different host port.

### Setup (one-time)

```bash
docker run -d \
  --name dclaw-pg \
  -e POSTGRES_USER=learn \
  -e POSTGRES_PASSWORD=learn \
  -e POSTGRES_DB=dclaw_learn \
  -p 5433:5432 \
  postgres:16
```

Then set `backend/.env` to use port 5433:

```
DATABASE_URL=postgresql+asyncpg://learn:learn@localhost:5433/dclaw_learn
```

Run migrations once:

```bash
cd backend
source venv/bin/activate
alembic upgrade head
```

### Daily workflow

```bash
docker start dclaw-pg                              # start DB (data persists)
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8093          # start API
cd frontend && npm run dev                         # start Next.js (separate terminal)
```

```bash
docker stop dclaw-pg                               # stop DB when done
```

### Why not port 5432?

| Process | Port | Notes |
|---|---|---|
| k3s cluster Postgres (Bitnami) | 5432 | Do NOT touch — shared cluster DB |
| `dnsmasq`-owned Postgres | 5432 | Bundled service, no `psql` binary available |
| `dclaw-pg` Docker container | 5433 → 5432 | Safe, project-local, disposable |

### Troubleshooting

**`password authentication failed for user "learn"`** — DB container not running or wrong port in `.env`. Run `docker start dclaw-pg` and confirm `DATABASE_URL` uses port 5433.

**`ECONNREFUSED 127.0.0.1:8093`** in Next.js terminal — Backend is not running. Start it with `uvicorn app.main:app --reload --port 8093`.

**404s on all `/api/v1/learn/...` routes** in Next.js terminal — Next.js rewrite proxy misconfigured. Check `next.config.js`: the `rewrites()` function must always return rules (no `if (!API_BASE) return []` guard). All `fetch()` calls in frontend code must use relative paths (`/api/v1/...`), not `${NEXT_PUBLIC_API_URL}/api/v1/...`.

**`email-validator is not installed`** on backend startup — Install it: `pip install 'pydantic[email]'`. The `pydantic[email]` extra is required when any schema field uses `EmailStr` but is not listed as a direct dep in `pyproject.toml`. It is included in `requirements.txt`.

---

## Task 10: Smoke test — run the full app and verify

- [ ] **Step 1: Start the database**

```bash
docker start dclaw-pg
```

Expected: container starts (or was already running)

- [ ] **Step 2: Start the backend**

```bash
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8093
```

Expected: starts without error, logs `Application startup complete`

- [ ] **Step 3: Start the frontend**

```bash
cd frontend && npm run dev
```

Expected: starts on http://localhost:3008

- [ ] **Step 4: Manual smoke check (open browser)**

Visit http://localhost:3008 and verify:
- [ ] Hero section visible with "Adaptive learning that works."
- [ ] Dark theme is default (dark background)
- [ ] Theme toggle (moon → sun icon) switches theme, light bg appears
- [ ] Reload preserves light theme
- [ ] "Seed Demo Data" button visible in bottom-right corner
- [ ] Clicking "Seed Demo Data" spins, then shows "Re-seed Data" + "Clear Data"
- [ ] Navigate to /courses — hero heading "Learn anything, your way." visible, course list populated
- [ ] Navigate to /study-plan — hero visible
- [ ] Navigate to /flashcards — hero visible, review section shows cards or "No cards due"
- [ ] Navigate to /instructor — hero visible, dashboard below
- [ ] Click "Clear Data" — data cleared, button returns to "Seed Demo Data"

- [ ] **Step 5: Run all unit tests**

```bash
cd frontend && npx vitest run
```

Expected: 28/28 PASS

- [ ] **Step 6: Run E2E tests (with dev server + backend running)**

```bash
cd frontend && npx playwright test
```

Expected: all PASS. Integration tests in `e2e/integration.spec.ts` require the backend on port 8093.

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: complete landing pages, theme system, seed widget, and test suite"
```
