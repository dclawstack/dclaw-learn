import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        learn: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        "brand-blue": "#3b82f6",
        "brand-indigo": "#6366f1",
        background: "var(--bg)",
        foreground: "var(--text)",
        muted: "var(--surface)",
        "muted-foreground": "var(--text-muted)",
        border: "var(--border)",
        card: "var(--surface)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
