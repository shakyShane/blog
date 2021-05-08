const colors = require("tailwindcss/colors");
module.exports = {
  // prettier-ignore
  purge: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./browser-components/**/*.{js,ts,jsx,tsx}",
        "./ui/**/*.{js,ts,jsx,tsx}",
    ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      gray: colors.trueGray,
      atom: {
        DEFAULT: "#282c34",
      },
      code: {
        DEFAULT: "#abb2bf",
      },
    },
    extend: {},
  },
  variants: {},
  plugins: [],
};
