/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'dot-grid': 'radial-gradient(circle, #ccc 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-grid': '20px 20px', // size between the dots
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
