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
        kasi: {
          green: "#2D6A4F",
          "green-light": "#40916C",
          "green-dark": "#1B4332",
          gold: "#D4A843",
          "gold-light": "#E8C96B",
          "gold-dark": "#B08A2E",
          charcoal: "#1A1A2E",
          slate: "#2D2D44",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
