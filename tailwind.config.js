/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#050505', // Deep Space Black
        surface: '#111818', // Dark Monitor Gray
        cyan: { // Aliasing Cyan to Sky Blue for global replacement
          DEFAULT: '#38bdf8', // Sky Blue 400
          dim: '#0284c7', // Sky Blue 600
        },
        gn: { // Keeping variable name but mapping to Sky Blue as requested
          DEFAULT: '#38bdf8', // Sky Blue 400
          dim: '#0284c7', // Sky Blue 600
        },
        solar: {
          DEFAULT: '#FFD700', // Warning/Highlight Gold
          dim: '#B8860B',
        },
        muted: '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Optional: sleek font
      }
    },
  },
  plugins: [],
}
