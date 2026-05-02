/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          900: '#141C24', // Surface
          950: '#0A0F14', // Deep Midnight Background
        },
        primary: {
          DEFAULT: '#00F5D4', // Accent
          hover: '#00D1B2',
        },
        secondary: {
          DEFAULT: '#141C24', // Surface
          hover: '#1B2631',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 40px -10px rgba(0, 245, 212, 0.3)',
        'glow-cyan': '0 0 50px -5px rgba(0, 245, 212, 0.5)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
};