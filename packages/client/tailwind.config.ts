import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f0fe',
          100: '#d2e3fc',
          200: '#aecbfa',
          300: '#8ab4f8',
          400: '#669df6',
          500: '#4285f4',
          600: '#1a73e8',
          700: '#1967d2',
          800: '#185abc',
          900: '#174ea6',
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f1f3f4',
          tertiary: '#e8eaed',
        },
        text: {
          primary: '#202124',
          secondary: '#5f6368',
          disabled: '#9aa0a6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Google Sans', 'Roboto', 'Arial', 'sans-serif'],
      },
      maxWidth: {
        document: '816px',
      },
    },
  },
  plugins: [],
};

export default config;
