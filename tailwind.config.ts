import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        pine: {
          900: "#16291D",
          800: "#1E3A2B",
          700: "#27483A",
          600: "#33523F",
          300: "#9DB4A4",
          100: "#E8EFE8"
        },
        cream: {
          50: "#FAFAF5",
          100: "#F4F4EC",
          200: "#E9E9DF"
        },
        prime: {
          ink: "#0b0b0b",
          paper: "#fafaf7",
          accent: "#c9a86a"
        },
        status: {
          open: "#f5b342",
          assigned: "#3b82f6",
          confirmed: "#22c55e",
          alert: "#ef4444",
          muted: "#9ca3af"
        }
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
