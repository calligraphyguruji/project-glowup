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
        // Redmonk PaaS Reference Design Tokens
        brand: {
          bg: "#08090B",
          surface: "#101114",
          surface2: "#17181D",
          elevated: "#202127",
          border: "#292A31",
          borderSubtle: "#1F2026",
          text: "#F5F5F6",
          textMuted: "#A3A4AD",
          textDim: "#747680",
          coral: "#FF666B",
          coralHover: "#FF8588",
          coralMuted: "rgba(255, 102, 107, 0.12)",
          success: "#45D6A0",
          warning: "#F5BD50",
          cyan: "#38BDF8",
          purple: "#A78BFA",
        },
        // Backward compatibility mappings
        canvas: {
          primary: "#08090B",
          secondary: "#101114",
          tertiary: "#17181D",
          elevated: "#202127",
        },
        surface: {
          DEFAULT: "#101114",
          dim: "#08090B",
          bright: "#202127",
          variant: "#17181D",
          container: {
            lowest: "#08090B",
            low: "#101114",
            DEFAULT: "#17181D",
            high: "#202127",
            highest: "#2A2B33",
          },
        },
        primary: {
          DEFAULT: "#F5F5F6",
          container: "#FF666B",
          fixed: "#FF8588",
        },
        secondary: {
          DEFAULT: "#A3A4AD",
          container: "#F5BD50",
          fixed: "#FDE68A",
        },
        tertiary: {
          DEFAULT: "#45D6A0",
          container: "#45D6A0",
          fixed: "#86EFAC",
        },
        error: {
          DEFAULT: "#FF666B",
          container: "#7F1D1D",
        },
        severity: {
          critical: "#FF666B",
          warning: "#F5BD50",
          optimization: "#38BDF8",
          pass: "#45D6A0",
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
