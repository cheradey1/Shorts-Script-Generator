/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#10111A',
        'brand-surface': '#1C1D2A',
        'brand-muted': '#34364A',
        'brand-text': '#E0E1EC',
        'brand-text-dim': '#8B8EA3',
        'brand-primary': '#4F46E5',
        'brand-secondary': '#A855F7',
        'brand-accent': '#22D3EE',
      },
    },
  },
  plugins: [],
}
