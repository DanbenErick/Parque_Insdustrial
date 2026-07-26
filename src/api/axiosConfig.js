import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para inyectar el token en cada petición automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('luz_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 1. Extraer el mensaje personalizado del backend si existe
    const customMessage = error.response?.data?.error || error.response?.data?.message;
    if (customMessage) {
      error.message = customMessage;
    } else if (error.message === 'Network Error') {
      error.message = 'Error de conexión con el servidor.';
      toast.error(error.message); // Mostrar tostada global si el server no responde
    } else if (error.response && error.response.status === 401) {
      // Mensaje fallback más amigable para 401 por si el backend no envía mensaje
      error.message = 'Credenciales incorrectas o no autorizadas.';
    }

    // 2. Si la sesión expiró o no está autorizada
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      // No cerrar sesión globalmente si es un error de contraseña incorrecta en login o change-password
      const url = error.config?.url || '';
      if (url.includes('/auth/login') || url.includes('/auth/change-password')) {
        return Promise.reject(error);
      }

      // Evitar redireccionar si ya estamos en la ruta de login
      if (window.location.pathname !== '/login') {
        toast.error('Tu sesión ha expirado o es inválida. Por favor, inicia sesión nuevamente.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
      
      // Limpiamos todo
      localStorage.removeItem('luz_token');
      localStorage.removeItem('luz_user');
    }

    return Promise.reject(error);
  }
);

export default api;
