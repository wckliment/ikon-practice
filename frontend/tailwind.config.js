module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
      },
      colors: {
        loginBtn: "rgb(90, 86, 86)", // Custom Login button color
        dashboardBg: "#EBEAE6", // ✅ Custom dashboard background color
      },
      animation: {
        'bounce-smooth': 'bounce-smooth 0.4s ease',
      },
      keyframes: {
        'bounce-smooth': {
          '0%': { transform: 'scale(0.9)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
