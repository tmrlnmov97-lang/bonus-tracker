/** @type {import('tailwindcss').Config} */
// Tokens mirror the Figma DS collection (color/*, radius/*, font/sans).
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#08090b',
        header: '#0d0e12',
        surface: '#17181e',
        'surface-2': '#101116',
        elevated: '#1c1d24',
        line: 'rgba(255,255,255,0.09)',
        lime: { DEFAULT: '#cdfa50', 600: '#a6e22e', 300: '#d7fb63' },
        danger: { DEFAULT: '#ff5a6a', 300: '#ff7a86' },
        gold: '#f3c969',
        ink: '#f5f6f7',
        bright: '#c7ccd2',
        muted: '#868b93',
        subtle: '#9aa0a8',
        faint: '#565b62',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
}
