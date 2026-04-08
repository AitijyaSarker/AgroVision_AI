/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./App-*.tsx",
    "./TestApp.tsx",
    "./index.tsx",
  ],
  safelist: [
    // Add any dynamic classes here if needed
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'hind': ['Hind Siliguri', 'sans-serif'],
      },
    },
  },
  plugins: [],
}