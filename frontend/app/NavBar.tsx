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
