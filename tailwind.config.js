/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#4ade80',
          dark: '#0a0f1e',
        },
      },
    },
  },
  plugins: [],
}
