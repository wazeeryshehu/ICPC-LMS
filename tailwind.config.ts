import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4fc",
          100: "#dbe7fa",
          200: "#bfd5f5",
          300: "#93b8ec",
          400: "#5f93dd",
          500: "#3a72cc",
          600: "#2b59ae",
          700: "#244894",
          800: "#1d3a78",
          900: "#142d5f",
          950: "#081a3a",
        },
        // Secondary accent: institutional azure (kept under the historical `gold` key)
        gold: {
          50: "#eff8ff",
          100: "#dff0fe",
          200: "#b8e1fd",
          300: "#7ecbfa",
          400: "#3aaef0",
          500: "#1192d8",
          600: "#0474b3",
          700: "#045c91",
          800: "#084c77",
          900: "#0c3f60",
          950: "#07283e",
        },
        cream: "#f4f7fc",
      },
      fontFamily: {
        sans: [
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(8, 26, 58, 0.07), 0 8px 24px -12px rgba(8, 26, 58, 0.22)",
        lift: "0 18px 40px -16px rgba(8, 26, 58, 0.4)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
