import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B0F19",
        },
        blueBrand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
      },
      borderRadius: {
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(2, 6, 23, 0.08)",
        card: "0 12px 32px rgba(2, 6, 23, 0.10)",
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(1200px circle at 20% 0%, rgba(59,130,246,0.28), transparent 40%), radial-gradient(1000px circle at 90% 10%, rgba(37,99,235,0.20), transparent 45%), linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 55%, #FFFFFF 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;

