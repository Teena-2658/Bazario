/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',          // ←←← YEH LINE ADD KARO (sabse important)
  theme: {
    extend: {},
  },
  plugins: [],
}