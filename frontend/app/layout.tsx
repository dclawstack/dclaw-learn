import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DClaw Learn",
  description: "Adaptive learning that works",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <nav className="border-b bg-white px-6 py-3">
          <div className="flex items-center gap-6">
            <a href="/" className="text-lg font-bold text-learn-600">
              📚 DClaw Learn
            </a>
            <div className="flex gap-4 text-sm text-gray-600">
              <a href="/dashboard" className="hover:text-learn-600">
                Dashboard
              </a>
              <a href="/courses" className="hover:text-learn-600">
                Courses
              </a>
              <a href="/quiz" className="hover:text-learn-600">
                Quiz
              </a>
              <a href="/study-plan" className="hover:text-learn-600">
                Study Plan
              </a>
              <a href="/settings" className="hover:text-learn-600">
                Settings
              </a>
            </div>
          </div>
        </nav>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
