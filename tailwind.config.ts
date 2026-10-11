import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './client/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#fffaf3',
        maroon: '#7b1e1e',
        saffron: '#e8722a',
        gold: '#c9a227',
        ink: '#3a2a1a',
        muted: '#8a7a64',
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
