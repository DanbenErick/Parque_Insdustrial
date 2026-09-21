import { queryOptions } from '@tanstack/react-query';
import api from './axiosConfig';
import { fetchAllPages } from './fetchAllPages';

export const queryKeys = {
  periodos: ['periodos'],
  medidores: (params = {}) => ['medidores', params],
  lecturas: (params = {}) => ['lecturas', params],
  omisiones: (periodoId) => ['lecturas-omisiones', periodoId],
  periodoStats: (mesAnio) => ['periodo-stats', mesAnio],
  catalogoCargos: ['catalogo-cargos'],
};

export const periodosQueryOptions = queryOptions({
  queryKey: queryKeys.periodos,
  queryFn: () => api.get('/periodos').then((response) => response.data || []),
  staleTime: 10 * 60 * 1000,
});

export const medidoresQueryOptions = (params = {}) => queryOptions({
  queryKey: queryKeys.medidores(params),
  queryFn: () => api.get('/medidores', { params }).then((response) => response.data || []),
  staleTime: 2 * 60 * 1000,
});

export const lecturasQueryOptions = (params = {}, options = {}) => queryOptions({
  queryKey: queryKeys.lecturas(params),
  queryFn: ({ signal }) => fetchAllPages('/lecturas', params, { signal }),
  staleTime: 60 * 1000,
  ...options,
});
