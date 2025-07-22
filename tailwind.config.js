/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './assets/**/*.{js,jsx,ts,tsx}',
    './*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins_400Regular'],
        'poppins-bold': ['Poppins_700Bold'],
        rubik: ['Rubik_400Regular'],
        'rubik-bold': ['Rubik_700Bold'],
      },
    },
  },
  plugins: [],
};
