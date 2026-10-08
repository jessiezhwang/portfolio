import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        accent: {
          50: "#f0f5f9",
          100: "#e1ebf4",
          200: "#c6d9ec",
          300: "#aac7e4",
          400: "#85add6",
          500: "#6094c7",
          600: "#3f75ab",
          700: "#34618d",
          900: "#213850",
          DEFAULT: "#3f75ab",
          dark: "#85add6",
        },
      },
    },
  },
  plugins: [],
};

export default config;
