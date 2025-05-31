// postcss.config.js

/**
 * Tell PostCSS to load Tailwind v4’s plugin from @tailwindcss/postcss
 * (instead of from “tailwindcss” directly). Also include autoprefixer.
 */
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};