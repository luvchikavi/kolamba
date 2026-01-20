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
        // Kolamba Brand Colors - from kolamba.org
        // Primary - Teal/Cyan (brand identity)
        primary: {
          50: "#e8f7fa",
          100: "#d1eff5",
          200: "#a3dfeb",
          300: "#75cfe1",
          400: "#53B9CC", // Main brand teal (kolamba.org)
          500: "#53B9CC",
          600: "#368A9D", // Deeper teal (kolamba.org)
          700: "#2d7385",
          800: "#214a52",
          900: "#112529",
        },
        // Secondary - Rose/Pink (warm accent)
        secondary: {
          50: "#fdf2f4",
          100: "#fbe5e9",
          200: "#f7ccd3",
          300: "#e9a5b0",
          400: "#CA7383", // Main brand rose (kolamba.org)
          500: "#CA7383",
          600: "#B35F6F", // Dusty rose (kolamba.org)
          700: "#8f4c59",
          800: "#512d34",
          900: "#28171a",
        },
        // Neutral - Light Gray (backgrounds)
        neutral: {
          50: "#f8f9f9",
          100: "#e1e1e1", // kolamba.org light gray
          200: "#d1d3d5",
          300: "#babdc0",
          400: "#a3a7ab",
          500: "#8c9196",
          600: "#6e7378",
          700: "#53575a",
          800: "#373a3c",
          900: "#1c1d1e",
        },
        // Brand colors for direct use
        brand: {
          teal: "#53B9CC",
          "teal-dark": "#368A9D",
          rose: "#CA7383",
          "rose-dark": "#B35F6F",
          gray: "#e1e1e1",
          black: "#000000",
        },
      },
      fontFamily: {
        sans: ["Inter", "Open Sans", "sans-serif"],
        hebrew: ["Open Sans Hebrew", "Rubik", "sans-serif"],
        display: ["Georgia", "Times New Roman", "serif"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #ca7283, #53b9cc)",
        "brand-gradient-vertical": "linear-gradient(to bottom, #ca7283, #53b9cc)",
        "brand-gradient-animated": "linear-gradient(90deg, #ca7283, #53b9cc, #ca7283)",
      },
      animation: {
        "gradient-shift": "gradient-shift 8s ease infinite",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
