import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
        },
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        input: 'var(--color-input)',
        accent: 'var(--color-accent)',
        ring: 'var(--color-ring)',
      },
    },
  },
  plugins: [],
};

export default config;
