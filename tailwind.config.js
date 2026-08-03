/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        terracotta: {
          DEFAULT: '#C97B5A',
          hover: '#B66949',
          light: '#FFF4E8',
          dark: '#A35B3B',
        },
        sage: {
          DEFAULT: '#7C947C',
          hover: '#6C846C',
          light: '#EAF4EC',
          dark: '#5B725B',
        },
        forest: {
          DEFAULT: '#1E3B2F',
          dark: '#13231E',
          card: '#1B2E28',
          hover: '#2A4D3E',
        },
        cream: {
          DEFAULT: '#F6F3E7',
          light: '#FAFAF8',
        },
        neutral: {
          border: '#E5E3DB',
          divider: '#D8D5CC',
          muted: '#6B6B6B',
          body: '#36433E',
          secondary: '#4E5A55',
        },
        // Alias brand to terracotta/sage for existing utility compatibility
        brand: {
          50: '#F6F3E7',
          100: '#EAF4EC',
          500: '#C97B5A',
          600: '#B66949',
          700: '#1E3B2F',
          800: '#13231E',
        },
      },
      boxShadow: {
        'soft': '0px 6px 18px rgba(0, 0, 0, 0.08)',
        'apple-sm': '0 1px 2px 0 rgba(30, 59, 47, 0.04)',
        'apple-card': '0 1px 3px 0 rgba(30, 59, 47, 0.05), 0 1px 2px -1px rgba(30, 59, 47, 0.03)',
        'apple-popover': '0 10px 25px -5px rgba(30, 59, 47, 0.1), 0 8px 10px -6px rgba(30, 59, 47, 0.05)',
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
        'spin-slow': 'spin 1.5s linear infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
