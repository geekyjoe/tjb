/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      keyframes: {
        animloader: {
          "0%": {
            borderColor:
              "#bda0de rgba(255, 255, 255, 0) rgba(255, 255, 255, 0) rgba(255, 255, 255, 0)",
          },
          "33%": {
            borderColor:
              "#867fea #bda0de rgba(255, 255, 255, 0) rgba(255, 255, 255, 0)",
          },
          "66%": {
            borderColor: "#867fea #bda0de #867fea rgba(255, 255, 255, 0)",
          },
          "100%": {
            borderColor: "#867fea #bda0de #867fea #bda0de",
          },
        },
        sit: {
          "0%": {
            transform: "scale(0)",
            transformOrigin: "10% 10%",
            opacity: "1",
          },
          "100%": {
            transform: "scale(1)",
            transformOrigin: "10% 10%",
            opacity: "1",
          },
        },
      },
      animation: {
        loader: "animloader 1s linear infinite alternate",
        scaleIT: "sit 200ms  cubic-bezier(0.250, 0.460, 0.450, 0.940) both",
      },
      fontFamily: {
        host: ["Host Grotesk", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        jost: ["Jost", "sans-serif"],
        karla: ["Karla", "sans-serif"],
        libreFranklin: ["Libre Franklin", "sans-serif"],
        openSans: ["Open Sans", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        cornsilk: {
          DEFAULT: "#fefae0",
          dark: "#0e7490",
        },
      },
    },
  },
  plugins: ["tailwind-scrollbar", "tailwindcss-animate"],
};
