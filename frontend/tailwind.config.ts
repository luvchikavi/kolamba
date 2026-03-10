import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kolamba Brand Colors
        primary: {
          50: "#eef9fb",
          100: "#d4eff4",
          200: "#a9dfea",
          300: "#7ecfdf",
          400: "#53B9CC",
          500: "#53B9CC",
          600: "#429bb0",
          700: "#327d94",
          800: "#215f78",
          900: "#11415c",
          950: "#082a3d",
        },
        // Antique pink accent
        accent: {
          50: "#fdf2f4",
          100: "#fbe5e9",
          200: "#f7ccd4",
          300: "#e8a3b0",
          400: "#CA7283",
          500: "#CA7283",
          600: "#b55a6c",
          700: "#9a4456",
          800: "#7f3041",
          900: "#641d2d",
          950: "#450f1c",
        },
        // Kolamba gray
        neutral: {
          50: "#f8f9fa",
          100: "#f0f1f2",
          200: "#E8E9EA",
          300: "#d0d1d3",
          400: "#b0b2b5",
          500: "#8e9196",
          600: "#6e7177",
          700: "#505358",
          800: "#34373b",
          900: "#1a1c1f",
          950: "#0d0e10",
        },
        // Keep slate for backward compatibility
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-frank-ruhl)", "Frank Ruhl Libre", "Georgia", "serif"],
        heading: ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
        category: ["var(--font-bungee)", "Bungee", "system-ui", "sans-serif"],
        almoni: ["Almoni", "var(--font-inter)", "system-ui", "sans-serif"],
        primaries: ["Primaries", "var(--font-frank-ruhl)", "Georgia", "serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        "card-gradient": "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        "accent-gradient": "linear-gradient(135deg, #14b8a6 0%, #f43f5e 100%)",
      },
      boxShadow: {
        "soft": "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        "soft-lg": "0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 2px 10px -2px rgba(0, 0, 0, 0.04)",
        "glow": "0 0 20px rgba(20, 184, 166, 0.3)",
        "glow-accent": "0 0 20px rgba(244, 63, 94, 0.3)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "fade-in-down": "fadeInDown 0.6s ease-out forwards",
        "scale-in": "scaleIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
