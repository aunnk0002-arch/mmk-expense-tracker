/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};