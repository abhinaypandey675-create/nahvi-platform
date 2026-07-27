/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "#05070d",
        "bg-soft": "#0a0e1a",
        ink: "#e8ebfa",
        "ink-dim": "#8890b5",
        "ink-faint": "#565f85",
        violet: "#7b5cff",
        cyan: "#00e5ff",
        signal: "#ff6b4a",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
