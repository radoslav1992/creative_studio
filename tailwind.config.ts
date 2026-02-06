import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0e7ff',
          100: '#d4bfff',
          200: '#b794ff',
          300: '#9b6aff',
          400: '#8347ff',
          500: '#6b24ff',
          600: '#5a1ee0',
          700: '#4917b8',
          800: '#391191',
          900: '#2a0c6b',
        },
        surface: {
          50: '#f8f9fa',
          100: '#2a2d35',
          200: '#23262e',
          300: '#1e2028',
          400: '#191b22',
          500: '#14161d',
          600: '#101218',
          700: '#0c0e14',
          800: '#080a0f',
          900: '#04060a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
