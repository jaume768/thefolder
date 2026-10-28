// pages/profile/editProfileTabs.js
// Mapa único entre las claves internas de pestaña (usadas en TODA la lógica
// existente de NewEditProfileContent.jsx: conditionals, claves de i18n
// editProfile.tabs.*, estado por pestaña) y los segmentos de URL bajo
// /myprofile/edit/:tab. Se mantienen separados a propósito — así la URL
// puede ser bonita en inglés (/templates, /social...) sin tocar ni un solo
// `topTab === "apariencia"` ni las claves de traducción existentes, que
// siguen en español tal cual estaban.
//
// "identidad" y "directorio" no están aquí: eran pestañas sin ningún botón
// que las abriera (código muerto) y se eliminaron junto con este cambio.
export const TAB_SLUGS = {
  home: "home",
  perfilHub: "profile",
  info: "profile-info",
  cv: "cv",
  redes: "social",
  proyectosHub: "projects",
  apariencia: "templates",
  herramientasHub: "tools",
  analiticas: "insights",
  // Sub-página de Estadísticas (clic en "Guardados"): imágenes guardadas.
  analiticasGuardados: "insights-saves",
  kit: "application-kit",
  pdf: "pdf",
};

export const SLUG_TO_TAB = Object.fromEntries(
  Object.entries(TAB_SLUGS).map(([tab, slug]) => [slug, tab])
);

export const DEFAULT_TAB = "home";
