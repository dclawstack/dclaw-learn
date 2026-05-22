async function request(path: string, method: string): Promise<void> {
  const res = await fetch(path, { method });
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
    const res = await fetch('/api/v1/learn/courses', {
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
