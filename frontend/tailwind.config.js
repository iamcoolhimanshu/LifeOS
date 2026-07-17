/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#0B0F19',
        darkCard: 'rgba(21, 28, 44, 0.6)',
        darkBorder: 'rgba(255, 255, 255, 0.08)',
        cyberBlue: {
          DEFAULT: '#00E5FF',
          glow: 'rgba(0, 229, 255, 0.15)',
        },
        neonPurple: {
          DEFAULT: '#BD00FF',
          glow: 'rgba(189, 0, 255, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
