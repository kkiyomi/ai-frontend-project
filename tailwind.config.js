import forms from '@tailwindcss/forms';
import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'reading': ['Georgia', 'Times New Roman', 'serif'],
      }
    },
  },
  plugins: [
    forms,
    daisyui({
      themes: true,
    }),
  ],
}