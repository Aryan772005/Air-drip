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
        background: "#080c14",
        surface: "#101726",
        surfaceLight: "#1a2438",
        borderDark: "#26354d",
        aqi: {
          good: "#00B050",
          satisfactory: "#92D050",
          moderate: "#FFC000",
          poor: "#FF7A00",
          veryPoor: "#FF0000",
          severe: "#780000",
        }
      },
    },
  },
  plugins: [],
};
export default config;

