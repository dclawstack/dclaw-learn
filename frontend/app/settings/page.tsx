"use client";

import { APP_NAME, APP_TAGLINE } from "@/lib/tokens";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Settings</h1>

      <div className="space-y-6">
        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            API Configuration
          </h2>
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              API Base URL
            </label>
            <input
              type="text"
              defaultValue="http://localhost:8093"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-learn-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              API Key
            </label>
            <input
              type="password"
              placeholder="Enter your API key"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-learn-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">About</h2>
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>{APP_NAME}</strong>
            </p>
            <p className="mb-2">{APP_TAGLINE}</p>
            <p>
              Version <span className="font-medium">0.1.0</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
