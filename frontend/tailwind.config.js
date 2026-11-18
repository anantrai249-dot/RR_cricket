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
        royals: {
          dark: '#060D2E',
          navy: '#0B1B5E',
          blue: '#254AA5',
          purple: '#3A1C71',
          magenta: '#D81B84',
          pink: '#FF2E93',
          softPink: '#FF8CC6',
          muted: '#C9D1F5',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'royals-gradient': 'linear-gradient(135deg, #060D2E 0%, #0B1B5E 35%, #3A1C71 65%, #FF2E93 100%)',
        'pink-radial': 'radial-gradient(circle at 50% 0%, rgba(255, 46, 147, 0.25) 0%, transparent 70%)',
        'card-glow': 'radial-gradient(circle at top right, rgba(255, 46, 147, 0.15), transparent 60%)',
      },
      boxShadow: {
        'pink-glow': '0 0 25px -5px rgba(255, 46, 147, 0.35)',
        'blue-glow': '0 0 25px -5px rgba(37, 74, 165, 0.45)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        'glass': '16px',
      },
    },
  },
  plugins: [],
}
