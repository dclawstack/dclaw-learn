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
          <div className="rounded-2xl border border-[var(--border)] bg-[#3b82f6] p-8 text-center shadow-xl">
            <div className="text-xs font-medium uppercase tracking-wide text-blue-200">Front</div>
            <div className="mt-3 text-lg font-semibold text-white">What is gradient descent?</div>
            <div className="mt-4 text-xs text-blue-200">Tap to reveal answer →</div>
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
