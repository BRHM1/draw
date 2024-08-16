/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        nova: ["Nova Square", "sans-serif"],
      },
      backgroundImage: {
        'cross-hatch': 'linear-gradient(45deg, transparent 50%, black 50%), linear-gradient(-45deg, transparent 50%, black 50%)',
        'hachure': 'linear-gradient(45deg, transparent 50%, black 50%)',
      },
      backgroundSize: {
        'cross-hatch': '10px 10px',
        'hachure': '10px 10px',
      },
      backgroundPosition: {
        'cross-hatch': '0 0, 0 0',
        'hachure': '0 0',
      },
    },
  },
  plugins: [],
}

