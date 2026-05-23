'use client';

import { useEffect, useState } from 'react';
import { Database, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { hasDemoData, seedDemoData, clearDemoData } from '@/lib/seed';

type WidgetState = 'checking' | 'empty' | 'seeded' | 'seeding' | 'clearing' | 'error';

export function SeedWidget() {
  const [state, setState] = useState<WidgetState>('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    hasDemoData()
      .then((has) => setState(has ? 'seeded' : 'empty'))
      .catch(() => setState('empty'));
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

  const currentState = state;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {error && (
        <div className="rounded-lg bg-red-500 px-3 py-2 text-xs text-white shadow">{error}</div>
      )}
      <div className="flex gap-2">
        {state === 'seeded' && (
          <button
            onClick={handleClear}
            disabled={currentState === 'seeding'}
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
