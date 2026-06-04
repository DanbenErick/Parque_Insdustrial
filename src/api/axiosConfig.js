import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

let activeRequests = 0;

const startLoader = () => {
  activeRequests++;
  window.dispatchEvent(new CustomEvent('globalLoading', { detail: true }));
};

const stopLoader = () => {
  activeRequests--;
  if (activeRequests <= 0) {
    activeRequests = 0;
    window.dispatchEvent(new CustomEvent('globalLoading', { detail: false }));
  }
};

// Interceptor para inyectar el token en cada petición automáticamente y mostrar el loader
api.interceptors.request.use(
  (config) => {
    startLoader();
    const token = localStorage.getItem('luz_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    stopLoader();
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente de forma limpia y ocultar el loader
api.interceptors.response.use(
  (response) => {
    stopLoader();
    return response;
  },
  (error) => {
    stopLoader();
    // Si la sesión expiró o no está autorizada
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('luz_user');
      localStorage.removeItem('luz_token');
      toast.error('Tu sesión ha expirado o es inválida. Por favor, inicia sesión nuevamente.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
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
