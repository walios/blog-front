/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          "50": "#eff6ff",
          "100": "#dbeafe",
          // other color shades
        }
      },
      fontFamily: {
        'body': [
          'Inter', 
          'ui-sans-serif', 
          // other font families
        ],
        'sans': [
          'Inter', 
          'ui-sans-serif', 
          // other font families
        ]
      }
    },
  },
  tailwindcss: {
    darkMode: 'class',
  },
  plugins: [
    require('flowbite/plugin'),
    require('flowbite-typography')
    // other plugins
  ],
};
