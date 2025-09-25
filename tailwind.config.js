/** @type {import('tailwindcss').Config} */
import animate from 'tailwindcss-animate';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [animate], // Agregamos el plugin correctamente
};


/** @type {import('tailwindcss').Config} */
//export default {
  //content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  //theme: {
   // extend: {},
 // },
 // plugins: [],
//};
