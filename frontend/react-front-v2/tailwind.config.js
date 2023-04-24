const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  plugins: [require('@tailwindcss/forms')],
  theme: {
    extend: {
      colors: {
        black: '#202020',
        cultured: '#F5F5F5',
        error: '#EB5757',
        gray: '#676767',
        lightGray: '#EBEBEB',
        primary: '#E34B31',
        redSalsa: '#F43145',
        secondary: '#5F2BA1',
        success: '#04CC84',
        sunsetOrange: '#FA604D',
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
}
