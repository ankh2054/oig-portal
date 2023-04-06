const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  plugins: [require('@tailwindcss/forms')],
  theme: {
    extend: {
      colors: {
        primary: '#E34B31',
        secondary: '#5F2BA1',
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
}
