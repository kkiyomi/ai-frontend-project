import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
        secondary: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          500: '#64748B',
          600: '#475569',
          900: '#0F172A',
        },
        accent: {
          500: '#10B981',
          600: '#059669',
        }
      },
      fontFamily: {
        'reading': ['Georgia', 'Times New Roman', 'serif'],
      }
    },
  },
  plugins: [
    forms,
  ],
}