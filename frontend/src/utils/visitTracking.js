import { matchPath } from "react-router-dom";
import api from "../services/api";

const SESSION_ANON_ID_KEY = "thefolder:anonId";
const SESSION_PINGED_KEY = "thefolder:visitPinged";
const HEARTBEAT_INTERVAL_MS = 60 * 1000;

// Id efímero de la pestaña/sesión de navegador — sessionStorage, no una
// cookie: desaparece al cerrar la pestaña, así que nunca identifica a la
// misma persona en dos visitas distintas (ver backend/models/Visit.js).
function getAnonId() {
  let id = sessionStorage.getItem(SESSION_ANON_ID_KEY);
  if (!id) {
    id = crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_ANON_ID_KEY, id);
  }
  return id;
}

function getUtmSource() {
  try {
    return new URLSearchParams(window.location.search).get("utm_source") || "";
  } catch {
    return "";
  }
}

// Tipo de pantalla por ancho de ventana, con los mismos cortes que la web
// (mobile ≤768, tablet ≤1024). Sin user agent: no hace falta más detalle.
function getDevice() {
  const w = window.innerWidth || 0;
  if (w <= 768) return "mobile";
  if (w <= 1024) return "tablet";
  return "desktop";
}

// Patrones de ruta de App.jsx, de más a menos concretos. Se guarda el
// patrón (/post/:id), nunca la URL real: las estadísticas de navegación no
// saben qué perfil o proyecto concreto se vio. Mantener en sintonía con
// App.jsx si se añaden páginas; lo que no encaje cuenta como "/:username"
// (portfolio público) o "/otros".
const ROUTE_PATTERNS = [
  "/",
  "/explorer", "/tags/:tag", "/post/:id",
  "/offers", "/offers/:offerId", "/JobOfferDetail/:offerId", "/EducationalOfferDetail/:offerId",
  "/creatives", "/industry", "/fashion", "/blog", "/magazine", "/article/:id", "/templates",
  "/legal", "/privacy", "/cookies", "/terminos", "/contact", "/about",
  "/login", "/register", "/complete-registration", "/token-handler",
  "/createPost", "/createOffer", "/createEducationalOffer",
  "/myprofile/edit/:tab", "/myprofile/settings", "/myprofile/saved", "/myprofile/saved/folder/:folderId",
  "/myprofile/community", "/myprofile/offers", "/myprofile/projects", "/myprofile/projects/page/:pageId",
  "/myprofile/projects/:id/edit", "/myprofile/projects/:opTab", "/myprofile",
  "/profile/:username",
  "/:username/project/:projectSlug", "/:username/about", "/:username/contact",
  "/:username/:pageSlug", "/:username",
];

// /myprofile/edit/:tab y /myprofile/projects/:opTab: la pestaña sí se
// guarda (son nombres fijos de la web, no datos de nadie).
const KEEP_PARAM = { "/myprofile/edit/:tab": "tab", "/myprofile/projects/:opTab": "opTab" };

export function toRoutePattern(pathname) {
  for (const pattern of ROUTE_PATTERNS) {
    const m = matchPath({ path: pattern, end: true }, pathname);
    if (m) {
      const keep = KEEP_PARAM[pattern];
      return keep ? pattern.replace(`:${keep}`, m.params[keep]) : pattern;
    }
  }
  return "/otros";
}

// Un solo ping por sesión de pestaña — no en cada cambio de ruta de la SPA,
// eso contaría navegación interna como si fueran visitas nuevas. Lleva el
// tipo de pantalla, la página de entrada y de dónde viene (document.referrer).
function pingVisit() {
  if (sessionStorage.getItem(SESSION_PINGED_KEY)) return;
  sessionStorage.setItem(SESSION_PINGED_KEY, "1");
  api
    .post("/api/analytics/visit", {
      anonId: getAnonId(),
      utmSource: getUtmSource(),
      referrer: document.referrer || "",
      device: getDevice(),
      landingPath: toRoutePattern(window.location.pathname),
    })
    .catch(() => {});
}

// Página vista: una por cambio de ruta (la llama VisitTracker.jsx). Se
// salta si el patrón no cambia (p. ej. cambiar solo la query).
let lastPattern = null;
export function trackPageView(pathname) {
  const path = toRoutePattern(pathname);
  if (path === lastPattern) return;
  const from = lastPattern;
  lastPattern = path;
  api
    .post("/api/analytics/pageview", { session: getAnonId(), path, from, device: getDevice() })
    .catch(() => {});
}

// Ping periódico mientras la pestaña está visible — cada uno suma ~1 minuto
// al contador agregado del día (DailyStat, backend). Se salta el tick si la
// pestaña está en segundo plano; no hace falta parar/reanudar el interval.
function startHeartbeat() {
  setInterval(() => {
    if (document.visibilityState !== "visible") return;
    api.post("/api/analytics/heartbeat").catch(() => {});
  }, HEARTBEAT_INTERVAL_MS);
}

let started = false;

// Llamar una sola vez, al montar la app (ver components/VisitTracker.jsx) —
// funciona igual con o sin sesión iniciada; el backend identifica al
// usuario logueado por el JWT si lo hay (interceptor de api.js), no hace
// falta pasarlo aquí.
export function initVisitTracking() {
  if (started) return;
  started = true;
  pingVisit();
  startHeartbeat();
}
