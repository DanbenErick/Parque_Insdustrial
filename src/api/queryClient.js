import { QueryClient } from '@tanstack/react-query';

export const CACHE_TIME = Object.freeze({
  short: 60 * 1000,
  standard: 5 * 60 * 1000,
  catalog: 10 * 60 * 1000,
  inactive: 30 * 60 * 1000,
});

const shouldRetryQuery = (failureCount, error) => {
  const status = error?.response?.status;

  // Reintentar errores del cliente (permisos, validación, rutas inexistentes)
  // solo añade latencia y peticiones que no pueden recuperarse por sí solas.
  if (status >= 400 && status < 500) return false;

  return failureCount < 1;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_TIME.standard,
      gcTime: CACHE_TIME.inactive,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: shouldRetryQuery,
    },
    mutations: {
      retry: false,
    },
  },
});

export const clearQueryCache = () => queryClient.clear();
