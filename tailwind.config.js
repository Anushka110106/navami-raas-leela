/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          light: '#fbbfef', // light magenta
          DEFAULT: '#c026d3', // magenta
          dark: '#7c3aed', // deep purple
        },
        accent: {
          light: '#f9a8d4', // light pink
          DEFAULT: '#ec4899', // pink
          dark: '#be185d', // deep pink
        },
        gold: {
          light: '#fde68a',
          DEFAULT: '#f59e42',
          dark: '#b45309',
        },
        orange: {
          light: '#fdba74',
          DEFAULT: '#fb923c',
          dark: '#ea580c',
        },
        purple: {
          light: '#e9d5ff',
          DEFAULT: '#a21caf',
          dark: '#581c87',
        },
      },
      gradientColorStops: theme => ({
        ...theme('colors'),
      }),
    },
  },
  plugins: [],
};
