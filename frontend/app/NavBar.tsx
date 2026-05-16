"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, getUser, type AuthUser } from "@/lib/auth";

export default function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  function handleLogout() {
    clearAuth();
    setUser(null);
    router.push("/");
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
            <a href="/flashcards" className="hover:text-learn-600">Flashcards</a>
            <a href="/analytics" className="hover:text-learn-600">Analytics</a>
            <a href="/settings" className="hover:text-learn-600">Settings</a>
          </div>
        </div>
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 mx-4 flex-1 max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="w-full rounded-lg border px-3 py-1.5 text-sm focus:border-learn-500 focus:outline-none"
          />
        </form>
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
