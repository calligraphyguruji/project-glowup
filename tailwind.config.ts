import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: {
          primary: "#090D16",
          secondary: "#0F172A",
          tertiary: "#1E293B",
          elevated: "#334155",
        },
        accent: {
          cyan: "#06B6D4",
          blue: "#3B82F6",
        },
        severity: {
          critical: "#EF4444",
          warning: "#F59E0B",
          optimization: "#3B82F6",
          pass: "#10B981",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
