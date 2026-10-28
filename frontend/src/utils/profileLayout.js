// Plantillas retiradas de la galería (/myprofile/edit/templates, oct 2026):
// quien las tenía guardadas en profile.profileLayout pasa a ver June Stamp
// ("index-gallery"). No se toca la base de datos: se traduce al leer, así
// funciona igual en local y en producción y se puede deshacer quitando la
// entrada de aquí. Al guardar el perfil desde el panel ya se guarda
// "index-gallery" (ProfileDraftContext usa esta función al cargar).
const RETIRED_LAYOUTS = {
  "studio-gallery": "index-gallery", // Rebeca's Gallery
  "daisy-film": "index-gallery",
};

export const resolveProfileLayout = (layout) => RETIRED_LAYOUTS[layout] || layout;
