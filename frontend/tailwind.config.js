/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#FF5F1F',
        'accent-orange': '#FF5F1F',
        'accent-pink': '#fbc4d1',
        'accent-green': '#2d4a34',
        'accent-cream': '#f0ede4',
        'off-white': '#F0EDE4',
        'brutal-black': '#000000',
        'match-high': '#22c55e',
        'match-med': '#3b82f6',
        'match-low': '#ef4444',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Space Mono', 'monospace'],
        'display': ['Inter', 'sans-serif'],
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
    },
  },
  plugins: [],
};
