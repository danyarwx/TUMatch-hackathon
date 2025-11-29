/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./Layout.jsx",
  ],
  theme: {
    extend: {
      colors: {
        'accent': '#FFC629',
        'accent-dark': '#e6b122',
        'neutral': {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e7e7ea',
          300: '#d1d1d6',
          400: '#9b9b9f',
          500: '#6b6b6f',
          600: '#4b4b4e',
          700: '#2f2f31',
          800: '#1f1f20',
          900: '#0f0f10'
        }
      },
    },
  },
  plugins: [],
}
