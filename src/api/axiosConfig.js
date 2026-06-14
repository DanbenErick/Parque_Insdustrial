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
    // Si la sesión expiró o no está autorizada
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Ignorar el interceptor si estamos intentando iniciar sesión
      if (error.config && error.config.url && error.config.url.includes('/auth/login')) {
        return Promise.reject(error);
      }

      localStorage.removeItem('luz_user');
      localStorage.removeItem('luz_token');
      
      // Evitar recargar la página si ya estamos en la ruta de login
      if (window.location.pathname !== '/login') {
        toast.error('Tu sesión ha expirado o es inválida. Por favor, inicia sesión nuevamente.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
      return Promise.reject(error);
    }

    // Si la API devuelve un mensaje de error personalizado, extraelo aquí
    const customMessage = error.response?.data?.error;
    if (customMessage) {
      error.message = customMessage;
    } else if (error.message === 'Network Error') {
      error.message = 'Error de conexión con el servidor.';
      toast.error(error.message); // Mostrar tostada global si el server no responde
    }
    return Promise.reject(error);
  }
);

export default api;
