   /** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // ¡MUY IMPORTANTE! Asegúrate de que esta línea exista y sea correcta.
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
      // ... cualquier otra extensión de tema que hayas añadido ...
    },
  },
  plugins: [],
}
  