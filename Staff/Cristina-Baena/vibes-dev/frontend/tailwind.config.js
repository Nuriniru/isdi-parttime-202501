/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        glass: {
          dark: 'rgba(17, 25, 40, 0.75)',
          light: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.125)',
        }
      },
      backdropBlur: {
        'glass': '16px',
        'nav': '20px',
      },
      backdropSaturate: {
        '180': '180%',
      }
    }
  },
  plugins: []
}