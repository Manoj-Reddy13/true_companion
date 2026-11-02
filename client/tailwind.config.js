/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        companion: {
          lavender: {
            50: '#F5F3FF',
            100: '#EDE9FE',
            200: '#DDD6FE',
            300: '#C4B5FD',
            400: '#A78BFA', // Primary soft lavender
            500: '#8B5CF6',
            600: '#7C3AED',
          },
          blue: {
            50: '#EFF6FF',
            100: '#DBEAFE',
            200: '#BFDBFE',
            300: '#93C5FD', // Secondary muted blue
            400: '#60A5FA',
          },
          bg: '#FAFAF9',       // Warm Off-White
          surface: '#FFFFFF',  // Crisp White
          charcoal: '#27272A', // Deep Charcoal
          muted: '#71717A',
          border: '#E4E4E7',
          success: '#86EFAC',
          warning: '#FCD34D',
          danger: '#FCA5A5',
          dark: {
            bg: '#121214',
            surface: '#1A1A1E',
            card: '#222228',
            border: '#2E2E38',
            text: '#F4F4F5',
            muted: '#A1A1AA'
          }
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        'soft-hover': '0 10px 25px -5px rgba(167, 139, 250, 0.15), 0 8px 10px -6px rgba(167, 139, 250, 0.1)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.02)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
