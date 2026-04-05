/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
        },
        accent: {
          DEFAULT: "var(--accent)",
        }
      },
      boxShadow: {
        'spatial': 'var(--shadow-spatial)',
      },
      borderRadius: {
        'explorer': '2.5rem',
      },
    },
  },
  plugins: [],
};
