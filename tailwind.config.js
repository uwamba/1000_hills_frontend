// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",        // All App Router pages & components
    "./src/components/**/*.{js,ts,jsx,tsx}", // Any other component folders
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
        mono: "var(--font-geist-mono), ui-monospace, monospace",
      },
    },
  },
  plugins: [],
};
