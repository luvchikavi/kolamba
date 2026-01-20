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
        // Primary - Teal/Cyan (brand identity)
        primary: {
          50: "#e8f7fa",
          100: "#d1eff5",
          200: "#a3dfeb",
          300: "#75cfe1",
          400: "#53b9cc", // Main brand teal
          500: "#53b9cc",
          600: "#4294a3",
          700: "#326f7a",
          800: "#214a52",
          900: "#112529",
        },
        // Secondary - Rose/Pink (warm accent)
        secondary: {
          50: "#fdf2f4",
          100: "#fbe5e9",
          200: "#f7ccd3",
          300: "#e9a5b0",
          400: "#ca7283", // Main brand rose
          500: "#ca7283",
          600: "#a25b69",
          700: "#79444f",
          800: "#512d34",
          900: "#28171a",
        },
        // Neutral - Light Gray (backgrounds)
        neutral: {
          50: "#f8f9f9",
          100: "#e8e9ea", // Main brand light gray
          200: "#d1d3d5",
          300: "#babdc0",
          400: "#a3a7ab",
          500: "#8c9196",
          600: "#6e7378",
          700: "#53575a",
          800: "#373a3c",
          900: "#1c1d1e",
        },
        // Keep black for text
        brand: {
          teal: "#53b9cc",
          rose: "#ca7283",
          gray: "#e8e9ea",
          black: "#000000",
        },
      },
      fontFamily: {
        sans: ["Inter", "Open Sans", "sans-serif"],
        hebrew: ["Open Sans Hebrew", "Rubik", "sans-serif"],
        display: ["Georgia", "Times New Roman", "serif"], // For logo-style headings
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(to right, #ca7283, #53b9cc)",
        "brand-gradient-vertical": "linear-gradient(to bottom, #ca7283, #53b9cc)",
      },
    },
  },
  plugins: [],
};
export default config;
