// utils/previewSession.js
// Snapshot del preview en curso (?preview=1&layout=...&coverDesktop=...),
// a nivel de módulo — no de estado de React. El iframe de
// ProfileAppearanceTab.jsx (/myprofile/edit/templates) tiene su propio
// `window` (JS realm aislado de la pestaña padre, aunque comparta origen),
// así que esta variable vive y muere con ESE iframe: se resetea sola en
// cuanto ProfileAppearanceTab.jsx lo remonta (key={activeTemplateId}) al
// cambiar de plantilla, y nunca se filtra a una visita real fuera del
// iframe.
//
// Por qué hace falta: dentro del preview, TopBar/openProject/Link a
// páginas organizadas/etc. navegan sin arrastrar el query string a mano
// (frágil — cualquier navegación nueva, o alguna que ya exista y no se
// haya tocado, puede olvidarse `?preview=1&layout=...`). En cuanto eso
// pasa, sin este snapshot el preview se apagaría a mitad de camino:
// reaparecen .df-quick-actions y puede volver a mostrarse la plantilla
// realmente guardada en vez de la que se está probando.
//
// Compartido por los 2 sitios que montan DaisyFilmTemplate (y el resto de
// plantillas): UserProfilePage.jsx (perfil base, /:username) y
// PublicPortfolioPagePage.jsx (páginas organizadas, /:username/:pageSlug)
// — son componentes distintos pero viven en el MISMO bundle/`window`
// dentro del iframe, así que un solo snapshot a nivel de módulo cubre
// navegar entre ambos sin perder el preview.
let snapshot = null;

// Lee ?preview=1 y compañía de `searchParams`, actualiza el snapshot si
// está presente, y devuelve { isPreview, previewOverride } listos para
// usar. `username` acota el snapshot a ese usuario — el preview nunca
// cambia de usuario en su propia vida, pero así una pestaña normal que
// visitara a mano una URL ?preview=1 y luego navegara (SPA, sin recargar)
// al perfil real de OTRO usuario no heredaría por error este snapshot.
export function readPreviewParams(searchParams, username) {
  const queryIsPreview = searchParams.get("preview") === "1";
  if (queryIsPreview) {
    snapshot = {
      username,
      layout: searchParams.get("layout"),
      coverDesktop: searchParams.get("coverDesktop"),
      coverMobile: searchParams.get("coverMobile"),
      focusDesktop: searchParams.get("focusDesktop"),
      focusMobile: searchParams.get("focusMobile"),
      gallery: searchParams.get("gallery"),
      galleryMode: searchParams.get("galleryMode"),
    };
  }
  const hasSnapshotForUser = snapshot?.username === username;
  const isPreview = queryIsPreview || hasSnapshotForUser;
  const previewOverride = (param, fallback) => {
    if (!isPreview) return fallback;
    const v = searchParams.get(param) || (hasSnapshotForUser ? snapshot?.[param] : null);
    return v || fallback;
  };
  return { isPreview, previewOverride };
}
