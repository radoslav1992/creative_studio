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
        // Warm cream backgrounds
        cream: {
          50: '#fffdf9',
          100: '#fef9f0',
          200: '#fdf3e4',
          300: '#faebd4',
          400: '#f5dfc0',
        },
        // Dark ink for borders/text
        ink: {
          DEFAULT: '#1a1a2e',
          light: '#2d2d44',
          muted: '#6b6b80',
          faint: '#9d9daa',
        },
        // Soft purple accent (primary)
        brand: {
          50: '#f3f0ff',
          100: '#e9e3ff',
          200: '#d4c8ff',
          300: '#b5a0ff',
          400: '#9678ff',
          500: '#7c5cfc',
          600: '#6a45e8',
          700: '#5835c4',
          800: '#4829a0',
          900: '#391f7c',
        },
        // Soft accents
        mint: {
          100: '#e0fff5',
          200: '#b3ffe6',
          300: '#80f5cf',
          400: '#4ce6b4',
          500: '#2dd4a0',
        },
        peach: {
          100: '#fff1ee',
          200: '#ffe0d9',
          300: '#ffc5b8',
          400: '#ffa594',
          500: '#ff8f8f',
        },
        sunny: {
          100: '#fff9e6',
          200: '#fff0c2',
          300: '#ffe08a',
          400: '#ffd166',
          500: '#ffc233',
        },
        sky: {
          100: '#eaf6ff',
          200: '#c8e8ff',
          300: '#9ed6ff',
          400: '#6ec6ff',
          500: '#3eb5ff',
        },
        rose: {
          100: '#fff0f6',
          200: '#ffdcea',
          300: '#ffc2db',
          400: '#ff9ecd',
          500: '#ff7ab8',
        },
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #1a1a2e',
        'brutal-sm': '2px 2px 0px 0px #1a1a2e',
        'brutal-md': '3px 3px 0px 0px #1a1a2e',
        'brutal-lg': '6px 6px 0px 0px #1a1a2e',
        'brutal-brand': '4px 4px 0px 0px #7c5cfc',
        'brutal-brand-sm': '2px 2px 0px 0px #7c5cfc',
        'brutal-mint': '4px 4px 0px 0px #2dd4a0',
        'brutal-peach': '4px 4px 0px 0px #ff8f8f',
        'brutal-sunny': '4px 4px 0px 0px #ffd166',
        'brutal-sky': '4px 4px 0px 0px #3eb5ff',
        'brutal-rose': '4px 4px 0px 0px #ff7ab8',
      },
      borderWidth: {
        '3': '3px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
