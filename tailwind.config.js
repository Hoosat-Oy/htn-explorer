/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hoosat-teal': '#14B8A6',
        'hoosat-dark': '#0F172A',
        'hoosat-slate': '#1E293B',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disable Tailwind's base styles to avoid conflicts with Bootstrap
  },
}
