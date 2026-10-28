import axios from 'axios';

export const SESSION_EXPIRED_EVENT = 'thefolder:session-expired';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

export const clearSession = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// El interceptor vive fuera del árbol de React, así que avisa por evento:
// AuthContext escucha esto para poner isAuthenticated=false y
// SessionExpiredGate (App.jsx) manda a /login con el aviso.
const notifySessionExpired = () => {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
};

// Sesión muerta de verdad: limpia y avisa. Solo para fallos definitivos
// (refresh rechazado por el servidor, sesión sin refresh token), nunca por
// un corte de red o un 5xx/429 puntual.
const expireSession = () => {
  clearSession();
  notifySessionExpired();
};

function isTokenExpired(token, skewMs = 0) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    return Date.now() + skewMs >= payload.exp * 1000;
  } catch {
    return true;
  }
}

// El servidor dijo "no" al refresh (token rotado/revocado/caducado, usuario
// inactivo). Cualquier otra cosa (sin red, 5xx, 429 del rate limit) es
// transitoria: NO debe cerrar la sesión.
const isDefinitiveRefreshFailure = (err) => {
  const status = err?.response?.status;
  return status === 400 || status === 401 || status === 403;
};

async function doRefresh(staleToken) {
  const token = localStorage.getItem('authToken');
  const refreshToken = localStorage.getItem('refreshToken');
  if (!token || !refreshToken) {
    const err = new Error('No hay sesión que renovar.');
    err.response = { status: 401 };
    throw err;
  }

  // Otra pestaña ya renovó mientras esperábamos el lock: el token guardado
  // es nuevo y válido, no hace falta (ni se debe) rotar otra vez.
  if (token !== staleToken && !isTokenExpired(token, 30 * 1000)) {
    return token;
  }

  // axios "pelado" + _skipAuthRefresh: este POST nunca pasa por el
  // interceptor de 401 (evitaríamos una recursión infinita).
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const res = await axios.post(
    `${backendUrl}/api/auth/refresh`,
    { token, refreshToken },
    { _skipAuthRefresh: true }
  );

  const { token: newToken, refreshToken: newRefreshToken } = res.data;
  localStorage.setItem('authToken', newToken);
  localStorage.setItem('refreshToken', newRefreshToken);
  return newToken;
}

// Evita que varias peticiones en paralelo disparen varios refresh a la vez:
// todas comparten la misma promesa en curso. Además, el refresh token ROTA
// en cada uso: si dos pestañas renovaban a la vez, la segunda mandaba un
// refresh token ya gastado, el servidor lo rechazaba y se cerraba la sesión
// en todas (comparten localStorage). El Web Lock serializa el refresh entre
// pestañas, y doRefresh reutiliza el token si otra ya lo renovó.
let refreshPromise = null;

function performRefresh(staleToken) {
  if (!refreshPromise) {
    const run = () => doRefresh(staleToken);
    const result = navigator.locks?.request
      ? navigator.locks.request('thefolder-auth-refresh', run)
      : run();
    refreshPromise = Promise.resolve(result).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// Añade el token JWT y el idioma activo a cada petición automáticamente. Si
// el access token ya caducó (p. ej. el portátil estuvo suspendido), lo
// renueva ANTES de mandar la petición en vez de esperar al 401.
api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('authToken');
  if (token && localStorage.getItem('refreshToken') && isTokenExpired(token, 10 * 1000)) {
    try {
      token = await performRefresh(token);
    } catch (err) {
      if (isDefinitiveRefreshFailure(err)) {
        expireSession();
        token = null;
      }
      // Fallo transitorio: se manda con el token viejo; si llega un 401,
      // el interceptor de respuesta lo vuelve a intentar.
    }
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const lng = (localStorage.getItem('i18nextLng') || 'es').split('-')[0];
  config.headers['Accept-Language'] = lng === 'en' ? 'en' : 'es';
  return config;
});

// Maneja 401 globalmente: intenta renovar la sesión en silencio (refresh
// token) y reintenta la petición original una sola vez. Si el refresh
// también falla de forma definitiva, ahí sí es una sesión caducada.
const makeAuthErrorHandler = (client) => async (error) => {
  const status = error.response?.status;
  const config = error.config;

  if (status !== 401 || !config || config._retriedAfterRefresh || config._skipAuthRefresh) {
    return Promise.reject(error);
  }

  // Solo cuentan las peticiones que iban autenticadas: un 401 en una
  // petición anónima no es "sesión caducada".
  const sentAuth = config.headers?.Authorization || config.headers?.authorization;
  if (!sentAuth || !localStorage.getItem('authToken')) {
    return Promise.reject(error);
  }

  if (!localStorage.getItem('refreshToken')) {
    // Sesión antigua (anterior a los refresh tokens) o incompleta: no hay
    // forma de renovarla. Antes se quedaba "logueada" con un token muerto y
    // las páginas pintaban el 404 o se quedaban en blanco.
    expireSession();
    return Promise.reject(error);
  }

  config._retriedAfterRefresh = true;

  try {
    const sentToken = String(sentAuth).replace(/^Bearer\s+/i, '');
    const newToken = await performRefresh(sentToken);
    config.headers.Authorization = `Bearer ${newToken}`;
    return client(config);
  } catch (refreshError) {
    if (isDefinitiveRefreshFailure(refreshError)) {
      expireSession();
    }
    return Promise.reject(error);
  }
};

api.interceptors.response.use((response) => response, makeAuthErrorHandler(api));

// Muchas páginas usan `axios` directamente (no la instancia `api`) con el
// header Authorization puesto a mano. Sin esto, un 401 ahí no renovaba ni
// redirigía: la página caía en su estado de error (404) o se quedaba vacía.
axios.interceptors.response.use((response) => response, makeAuthErrorHandler(axios));

// Comprueba proactivamente (sin esperar a un 401) si el access token ya
// caducó y, si es así, intenta renovarlo en silencio. Se llama al montar la
// app y al volver a la pestaña. Devuelve:
//   { ok: true }                    sesión válida, renovada, o fallo transitorio
//   { ok: false, expired: true }    había sesión y ha muerto de verdad
//   { ok: false, expired: false }   no había sesión
export async function ensureFreshSession() {
  const token = localStorage.getItem('authToken');
  const refreshToken = localStorage.getItem('refreshToken');
  if (!token) {
    return { ok: false, expired: false };
  }

  if (!isTokenExpired(token, 60 * 1000)) {
    return { ok: true };
  }

  if (!refreshToken) {
    // Sesión antigua sin refresh token y con el access token caducado.
    clearSession();
    return { ok: false, expired: true };
  }

  try {
    await performRefresh(token);
    return { ok: true };
  } catch (err) {
    if (isDefinitiveRefreshFailure(err)) {
      clearSession();
      return { ok: false, expired: true };
    }
    // Sin red / servidor caído: no cerramos la sesión, se reintentará.
    return { ok: true };
  }
}

export default api;
