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
        // Stitch Semantic Tokens
        surface: {
          DEFAULT: "#0E131E",
          dim: "#0E131E",
          bright: "#343945",
          variant: "#303541",
          container: {
            lowest: "#090E19",
            low: "#171B27",
            DEFAULT: "#1B1F2B",
            high: "#252A36",
            highest: "#303541",
          },
        },
        primary: {
          DEFAULT: "#E0FDFF",
          container: "#00F2FE",
          fixed: "#6FF6FF",
        },
        secondary: {
          DEFAULT: "#7BD0FF",
          container: "#00A6E0",
          fixed: "#C4E7FF",
        },
        tertiary: {
          DEFAULT: "#E1FFEA",
          container: "#37F8AA",
          fixed: "#4DFFB2",
        },
        error: {
          DEFAULT: "#FFB4AB",
          container: "#93000A",
        },
        severity: {
          critical: "#FF3B30",
          warning: "#F59E0B",
          optimization: "#00A6E0",
          pass: "#37F8AA",
        },
      },
      fontFamily: {
        sans: ["Geist", "Plus Jakarta Sans", "var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
