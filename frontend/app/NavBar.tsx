"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, getUser, type AuthUser } from "@/lib/auth";

export default function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  function handleLogout() {
    clearAuth();
    setUser(null);
    router.push("/");
  }

  return (
    <nav className="border-b bg-white px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="/" className="text-lg font-bold text-learn-600">
            📚 DClaw Learn
          </a>
          <div className="flex gap-4 text-sm text-gray-600">
            <a href="/dashboard" className="hover:text-learn-600">Dashboard</a>
            <a href="/courses" className="hover:text-learn-600">Courses</a>
            <a href="/quiz" className="hover:text-learn-600">Quiz</a>
            <a href="/study-plan" className="hover:text-learn-600">Study Plan</a>
            <a href="/settings" className="hover:text-learn-600">Settings</a>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="text-gray-600">{user.name || user.email}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="text-gray-600 hover:text-learn-600">Sign In</a>
              <a
                href="/register"
                className="rounded-lg bg-learn-600 px-3 py-1.5 text-white hover:bg-learn-700"
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
