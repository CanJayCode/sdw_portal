/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          500: '#3b5bdb',
          600: '#2f4bc4',
          700: '#263ca0',
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