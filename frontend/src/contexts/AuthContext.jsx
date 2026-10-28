import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import api, { clearSession, ensureFreshSession, SESSION_EXPIRED_EVENT } from '../services/api';

export const AuthContext = createContext(null);

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const isAuthenticatedRef = useRef(false);
  isAuthenticatedRef.current = isAuthenticated;

  // Rehidrata la sesión desde localStorage al montar, y comprueba si el
  // access token ya caducó (en cuyo caso intenta renovarlo en silencio
  // antes de decidir si la sesión sigue viva).
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    let hadSession = false;

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
        hadSession = true;
      } catch {
        clearSession();
      }
    }

    setLoading(false);

    if (hadSession) {
      ensureFreshSession().then(({ expired }) => {
        if (expired) {
          setUser(null);
          setIsAuthenticated(false);
          setSessionExpired(true);
        }
      });
    }
  }, []);

  // El interceptor de api.js vive fuera de React: cuando un refresh falla
  // de verdad (sesión caducada por inactividad), avisa por este evento.
  useEffect(() => {
    const onSessionExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
      setSessionExpired(true);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
  }, []);

  // Al volver a la pestaña (tras suspender el portátil, horas en segundo
  // plano...) el access token suele estar caducado: se renueva antes de que
  // la página choque con un 401, y si la sesión ya no existe se manda a
  // /login en vez de dejar al usuario en una página vacía.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      ensureFreshSession().then(({ expired }) => {
        if (expired) {
          setUser(null);
          setIsAuthenticated(false);
          setSessionExpired(true);
        }
      });
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  // Sincroniza pestañas: si la sesión se cierra o caduca en otra pestaña
  // (comparten localStorage), esta se enteraba solo al fallar su siguiente
  // petición. El evento `storage` solo llega a las OTRAS pestañas.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== 'authToken' && e.key !== null) return;
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      if (!token) {
        if (isAuthenticatedRef.current) setSessionExpired(true);
        setUser(null);
        setIsAuthenticated(false);
      } else if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } catch { /* user corrupto: lo ignoramos */ }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = (token, userData, refreshToken) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    setUser(userData);
    setIsAuthenticated(true);
    setSessionExpired(false);
  };

  const logout = useCallback(() => {
    const token = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');

    clearSession();
    setUser(null);
    setIsAuthenticated(false);

    if (token && refreshToken) {
      // Revoca la sesión en el servidor. Best-effort: si falla (ya sin red,
      // token muerto, etc.) el logout local ya ha ocurrido igualmente.
      api
        .post('/api/auth/logout', { refreshToken }, { headers: { Authorization: `Bearer ${token}` } })
        .catch(() => {});
    }
  }, []);

  const dismissSessionExpired = useCallback(() => setSessionExpired(false), []);

  // Actualiza campos parciales del usuario en estado y localStorage
  const updateUser = (partialUser) => {
    setUser(prev => {
      const updated = { ...prev, ...partialUser };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout, updateUser, sessionExpired, dismissSessionExpired }}
    >
      {children}
    </AuthContext.Provider>
  );
}
