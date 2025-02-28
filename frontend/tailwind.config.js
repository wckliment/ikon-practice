module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
      },
      colors: {
        loginBtn: "rgb(90, 86, 86)", // Custom color for Log in button
      },
    },
  },
  plugins: [],
};

