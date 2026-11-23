import { queryOptions } from '@tanstack/react-query';
import api from './axiosConfig';
import { fetchAllPages } from './fetchAllPages';
import { CACHE_TIME } from './queryClient';

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
  staleTime: CACHE_TIME.catalog,
});

export const medidoresQueryOptions = (params = {}) => queryOptions({
  queryKey: queryKeys.medidores(params),
  queryFn: () => api.get('/medidores', { params }).then((response) => response.data || []),
  staleTime: 2 * CACHE_TIME.short,
});

export const lecturasQueryOptions = (params = {}, options = {}) => queryOptions({
  queryKey: queryKeys.lecturas(params),
  queryFn: ({ signal }) => fetchAllPages('/lecturas', params, { signal }),
  staleTime: CACHE_TIME.short,
  ...options,
});
