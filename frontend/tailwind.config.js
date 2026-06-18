/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tradelater Markenfarben
        brand: {
          DEFAULT: '#0F766E', // Teal
          dark: '#115E59',
          light: '#5EEAD4',
        },
        accent: '#F59E0B', // Amber für CTAs / "Offerte"
      },
    },
  },
  plugins: [],
};
