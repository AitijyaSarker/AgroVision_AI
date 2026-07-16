/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
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