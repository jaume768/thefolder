// Imágenes del panel derecho en /register, /login y /complete-registration
// (ob-wizard). Se elige una al azar por carga de página — ver uso con
// useState(() => getRandomAuthShowcaseImage()) para que no cambie entre
// re-renders (p.ej. al pasar de paso en el wizard).
export const AUTH_SHOWCASE_IMAGES = [
  {
    src: '/multimedia/landing/login-thefolder-by-MaríaGonzalez.jpg',
    creditName: 'mariagonzalez',
    creditUrl: 'https://thefolder.es/mariagonzalez',
  },
  {
    src: '/multimedia/landing/login-thefolderby-MaríaGonzalez-2.jpg',
    creditName: 'mariagonzalez',
    creditUrl: 'https://thefolder.es/mariagonzalez',
  },
  {
    src: '/multimedia/landing/login-thefolderby-MaríaGonzalez-3.jpg',
    creditName: 'mariagonzalez',
    creditUrl: 'https://thefolder.es/mariagonzalez',
  },
  {
    src: '/multimedia/landing/register-thefolder-by-ccmm.jpg',
    creditName: 'Carolina Montenegro',
    creditUrl: 'https://thefolder.es/ccmm',
  },
  {
    src: '/multimedia/landing/register-thefolder-by-ccmm-2.jpg',
    creditName: 'Carolina Montenegro',
    creditUrl: 'https://thefolder.es/ccmm',
  },
  {
    src: '/multimedia/landing/register-thefolder-by-giulia.jpg',
    creditName: 'Giulia Franzese',
    creditUrl: 'https://thefolder.es/giuliafranzese',
  },
  {
    src: '/multimedia/landing/login-thefolderby-bernat.jpg',
    creditName: 'Bernat Pérez Martínez',
    creditUrl: 'https://thefolder.es/soybernatperez',
  },
];

export const getRandomAuthShowcaseImage = () =>
  AUTH_SHOWCASE_IMAGES[Math.floor(Math.random() * AUTH_SHOWCASE_IMAGES.length)];
