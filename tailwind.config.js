/** @type {import('tailwindcss').Config} */
export default {
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
          DEFAULT: "#38A169", // Vert Pokémon Go
          soft: "#C6F6D5",
        },
        accent: {
          DEFAULT: "#3182CE", // Bleu Pokémon Go
          soft: "#BEE3F8",
        }
      },
      borderRadius: {
        'pokemon': '2rem',
      },
    },
  },
  plugins: [],
};
