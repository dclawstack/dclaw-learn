import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h1 className="mb-4 text-4xl font-bold text-learn-600">
        Adaptive learning that works
      </h1>
      <p className="mb-8 text-lg text-gray-600">
        Personalized courses, AI-generated quizzes, and smart study plans to
        help you learn faster.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="/courses"
          className="rounded-lg bg-learn-600 px-6 py-3 text-white hover:bg-learn-700"
        >
          Browse Courses
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-100"
        >
          My Dashboard
        </Link>
      </div>
    </div>
  );
}
