import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../../../api/axiosConfig';
import { buildFilterParams } from '../billingUtils';

/**
 * useBillingData — Fetches recibos, periodos and global stats using React Query.
 * Uses server-side pagination (page + limit) — no more downloading 100k rows.
 */
export const useBillingData = ({ filterMes, filterEstado, debouncedSearchTerm, activeYear }) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const LIMIT = 100; // filas por página

  const filterParams = useMemo(
    () => buildFilterParams({ filterMes, filterEstado, debouncedSearchTerm, activeYear }),
    [filterMes, filterEstado, debouncedSearchTerm, activeYear],
  );

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [filterParams]);

  // ── Recibos ──────────────────────────────────────────────────────────────
  const {
    data: recibosResponse,
    isLoading: isLoadingRecibos,
  } = useQuery({
    queryKey: ['recibos', filterParams, page],
    queryFn: async () => {
      const res = await api.get('/recibos', { params: { ...filterParams, page, limit: LIMIT } });
      return res.data; // { data: [], total: N, page, limit }
    },
    staleTime: 2 * 60 * 1000, // 2 min
    onError: () => toast.error('Error al cargar los recibos'),
    keepPreviousData: true, // suave transición entre páginas
  });

  const recibos = recibosResponse?.data ?? [];
  const totalRecibos = recibosResponse?.total ?? 0;
  const totalPages = Math.ceil(totalRecibos / LIMIT);

  // ── Periodos ─────────────────────────────────────────────────────────────
  const { data: periodos = [] } = useQuery({
    queryKey: ['periodos'],
    queryFn: async () => {
      const res = await api.get('/periodos');
      return res.data;
    },
    staleTime: 10 * 60 * 1000, // 10 min — periodos don't change often
  });

  // ── Global Stats ─────────────────────────────────────────────────────────
  const { data: globalStats = {} } = useQuery({
    queryKey: ['recibos-stats', filterParams],
    queryFn: async () => {
      const res = await api.get('/recibos/stats/global', { params: filterParams });
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
    onError: () => toast.error('Error al cargar estadísticas'),
  });

  // ── Invalidate / Refresh ─────────────────────────────────────────────────
  const refetchAll = () => {
    queryClient.invalidateQueries({ queryKey: ['recibos'] });
    queryClient.invalidateQueries({ queryKey: ['recibos-stats'] });
  };

  return {
    recibos,
    totalRecibos,
    totalPages,
    page,
    setPage,
    periodos,
    globalStats,
    isLoading: isLoadingRecibos,
    filterParams,
    refetchAll,
  };
};
