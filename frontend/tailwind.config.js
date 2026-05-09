/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#05070d',
        panel: 'rgba(15, 18, 30, 0.72)',
        line: 'rgba(255,255,255,0.12)',
        violet: '#7c5cff',
        cyan: '#00d1ff'
      },
      boxShadow: {
        glow: '0 24px 90px rgba(124, 92, 255, 0.35)',
        glass: '0 24px 80px rgba(0, 0, 0, 0.35)'
      }
    }
  },
  plugins: []
}
