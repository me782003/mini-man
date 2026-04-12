/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      fontFamily: {
        beatrice: ["Beatrice", "ui-sans-serif", "system-ui", "sans-serif"],
        headline: ["Beatrice Headline", "Beatrice", "ui-sans-serif", "system-ui", "sans-serif"],
        cairo: ["Cairo", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
    fontFamily: {
      sans: ["Cairo", "Beatrice", "ui-sans-serif", "system-ui", "sans-serif"],
    },
  },
  plugins: [],
}

