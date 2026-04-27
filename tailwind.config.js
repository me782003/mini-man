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
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        border: "var(--border)",
        ring: "var(--ring)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
    },
    fontFamily: {
      sans: ["Cairo", "Beatrice", "ui-sans-serif", "system-ui", "sans-serif"],
    },
  },
  plugins: [],
}

