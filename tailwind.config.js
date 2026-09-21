/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          500: '#4f78ff',
          600: '#4f78ff',
          700: '#3f66e8',
        },
        ink: {
          950: '#05070B',
          900: '#080B10',
          800: '#0B0F16',
          700: '#0D1118',
          600: '#111722',
          500: '#151B25',
        },
      },
    },
  },
  plugins: [],
};