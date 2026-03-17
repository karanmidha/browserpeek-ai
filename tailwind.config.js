/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdfcfa',
          100: '#faf8f3',
          200: '#f5f0e8', // Main cream color
          300: '#ede3d3',
          400: '#e0d0b8',
          500: '#d4bc9d',
          600: '#c8a882',
          700: '#b8956b',
          800: '#9e7f5a',
          900: '#7a6244',
        },
        secondary: {
          50: '#f0f4f0',
          100: '#dce8dd',
          200: '#b9d1bb',
          300: '#8fb894',
          400: '#6a9f6f',
          500: '#4d7f53',
          600: '#3d5a40', // Main forest green
          700: '#344a37',
          800: '#2b3a2d',
          900: '#232f24',
        },
        accent: {
          50: '#faf6f3',
          100: '#f4ebe4',
          200: '#e8d5c4',
          300: '#d9b89f',
          400: '#c8957a',
          500: '#a67c52', // Main terracotta
          600: '#936b47',
          700: '#7a5a3c',
          800: '#664b32',
          900: '#543e29',
        }
      },
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};