/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        danger: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        dark: {
          900: '#0a0a0f',
          800: '#0f0f1a',
          700: '#141424',
          600: '#1a1a30',
          500: '#22223d',
          400: '#2d2d50',
        },
      },
      backgroundImage: {
        'gate-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #141424 100%)',
        'card-gradient': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)',
        'success-gradient': 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        'danger-gradient': 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-green':   '0 0 20px rgba(16, 185, 129, 0.4)',
        'glow-red':     '0 0 20px rgba(239, 68, 68, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)', opacity: '1' },
          '50%': { transform: 'translateY(100%)', opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(99,102,241,0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(99,102,241,0.8)' },
        },
      },
    },
  },
  plugins: [],
}
