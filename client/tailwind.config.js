export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './pages/**/*.{js,jsx}',
    './context/**/*.{js,jsx}',
    './hooks/**/*.{js,jsx}',
    './services/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#11131a',
        card: '#171925',
        accent: '#f43f5e',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.06), 0 8px 35px rgba(236,72,153,0.22)',
      },
      animation: {
        fadeInUp: 'fadeInUp 0.45s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
