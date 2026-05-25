// ─── SEED CONTROLS ────────────────────────────────────────────────────────────
// Demo utility — remove this file and the <SeedControls /> block in
// app/page.tsx (and the demo router in the backend) when no longer needed.
// ──────────────────────────────────────────────────────────────────────────────
'use client';

import { useState } from 'react';
import { Database, Trash2, Loader2 } from 'lucide-react';
import { seedDemoData, clearDemoData } from '@/lib/seed';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function SeedControls() {
  const [fillStatus, setFillStatus] = useState<Status>('idle');
  const [clearStatus, setClearStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleFill() {
    setFillStatus('loading');
    setMessage(null);
    setIsError(false);
    try {
      await seedDemoData();
      setMessage('Seeded demo courses, lessons, flashcards, and a study plan. Explore them on the dashboard.');
      setFillStatus('success');
    } catch (e) {
      setIsError(true);
      setMessage(e instanceof Error ? e.message : 'Seed failed');
      setFillStatus('error');
    }
  }

  async function handleClear() {
    setClearStatus('loading');
    setMessage(null);
    setIsError(false);
    try {
      await clearDemoData();
      setMessage('All demo data cleared. The app is back to a fresh state.');
      setClearStatus('success');
      setFillStatus('idle');
    } catch (e) {
      setIsError(true);
      setMessage(e instanceof Error ? e.message : 'Clear failed');
      setClearStatus('error');
    }
  }

  const busy = fillStatus === 'loading' || clearStatus === 'loading';

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-[#3b82f6]/40 bg-[var(--surface)] p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-[#3b82f6]">Demo Controls</p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Populate DClaw Learn with realistic demo courses, lessons, flashcards, and a study plan — or wipe it all to start fresh.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={handleFill}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3b82f6] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {fillStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
            {fillStatus === 'loading' ? 'Seeding…' : fillStatus === 'success' ? 'Seeded ✓' : 'Fill Demo Data'}
          </button>
          <button
            onClick={handleClear}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-6 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {clearStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {clearStatus === 'loading' ? 'Clearing…' : clearStatus === 'success' ? 'Cleared ✓' : 'Clear Data'}
          </button>
        </div>

        {message && (
          <p className={`mt-4 text-xs ${isError ? 'text-red-500' : 'text-emerald-500'}`}>{message}</p>
        )}

        {fillStatus === 'success' && (
          <a
            href="/dashboard"
            className="mt-4 inline-block rounded-lg bg-[var(--text)] px-6 py-2.5 text-sm font-semibold text-[var(--bg)] transition hover:opacity-90"
          >
            Open the dashboard →
          </a>
        )}
      </div>
    </section>
  );
}
