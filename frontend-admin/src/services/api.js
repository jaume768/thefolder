import axios from 'axios';
import { toast } from 'react-toastify';

const baseURL = import.meta.env.VITE_BACKEND_URL || 'https://backend-studen-station-production.up.railway.app';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminAuthToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Evitar redirección automática para la verificación del token
    const isVerifyingToken = response?.config?.url?.includes('/verify-admin-token');

    if (response && response.status === 401 && !isVerifyingToken) {
      // Si hay un error de autenticación (excepto durante la verificación del token),
      // mostrar mensaje y redirigir al login
      localStorage.removeItem('adminAuthToken');
      toast.error('Sesión expirada. Por favor, inicia sesión de nuevo.');
      
      // Usar history para navegar en lugar de window.location para evitar recargas completas
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (response && response.data.message) {
      // Mostrar mensaje de error del servidor
      toast.error(response.data.message);
    } else {
      // Error general
      toast.error('Error de conexión con el servidor');
    }

    return Promise.reject(error);
  }
);

export default api;
