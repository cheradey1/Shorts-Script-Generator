/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./{components,locales,services}/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-background': 'var(--brand-background)',
        'brand-text': 'var(--brand-text)',
        'brand-text-dim': 'var(--brand-text-dim)',
        'brand-surface': 'var(--brand-surface)',
        'brand-muted': 'var(--brand-muted)',
        'brand-primary': 'var(--brand-primary)',
        'brand-accent': 'var(--brand-accent)',
      },
    },
  },
  plugins: [],
}