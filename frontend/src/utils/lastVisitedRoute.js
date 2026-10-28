// utils/lastVisitedRoute.js
// Rastro mínimo de navegación — RouteHistoryTracker (montado una vez en
// App.jsx) guarda en sessionStorage la ruta en la que estabas justo ANTES
// de la ruta actual, cada vez que cambia. Lo usan las pantallas de error
// tipo 404 (.user-extern-error) para mandar al botón "volver" a la última
// página real que visitaste, en vez de siempre a /explorer.
const CURRENT_KEY = 'tf_currentRoute';
const LAST_KEY = 'tf_lastRoute';

// /404 es la pantalla única de "no encontrado" (NotFoundPage.jsx): se llega
// con un redirect desde la URL rota, así que ni la URL rota ni el propio
// /404 deben quedar como "última página" — si no, el botón de volver del
// 404 llevaría de nuevo a la URL rota (y otra vez al 404).
const NOT_FOUND_PATH = '/404';

export function recordRouteChange(pathname) {
  if (typeof sessionStorage === 'undefined') return;
  const prev = sessionStorage.getItem(CURRENT_KEY);
  if (pathname === NOT_FOUND_PATH) {
    sessionStorage.setItem(CURRENT_KEY, pathname);
    return;
  }
  if (prev && prev !== pathname && prev !== NOT_FOUND_PATH) {
    sessionStorage.setItem(LAST_KEY, prev);
  }
  sessionStorage.setItem(CURRENT_KEY, pathname);
}

// Destino del botón en una pantalla de error/404: usuarios sin sesión van
// siempre a la home (no tienen "última página" que tenga sentido mostrarles
// de vuelta); usuarios con sesión vuelven a la última ruta real que
// visitaron, o a /explorer si no hay ninguna registrada todavía.
export function getErrorBackDestination(isLoggedIn) {
  if (!isLoggedIn) return '/';
  if (typeof sessionStorage === 'undefined') return '/explorer';
  return sessionStorage.getItem(LAST_KEY) || '/explorer';
}
