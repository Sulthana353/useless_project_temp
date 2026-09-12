/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#06070a',
          900: '#0a0d14',
          850: '#0f1420',
          800: '#141a29',
          700: '#1e263d',
          600: '#2b3654',
        },
        lunar: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
        },
        glow: {
          cyan: '#38bdf8',
          purple: '#a855f7',
          blue: '#6366f1',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 30s linear infinite',
      },
      boxShadow: {
        'moon-glow': '0 0 30px -5px rgba(255, 255, 255, 0.25), 0 0 15px -3px rgba(99, 102, 241, 0.3)',
        'target-glow': '0 0 15px 2px rgba(56, 189, 248, 0.4)',
      }
    },
  },
  plugins: [],
}
