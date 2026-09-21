import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../../../api/axiosConfig';
import { fetchAllPages } from '../../../api/fetchAllPages';
import { periodosQueryOptions } from '../../../api/queryOptions';
import { buildFilterParams } from '../billingUtils';

/**
 * useBillingData — Fetches recibos, periodos and global stats using React Query.
 * Loads the complete receipt list for the selected operational filter.
 */
export const useBillingData = ({ filterMes, filterEstado, debouncedSearchTerm, activeYear }) => {
  const queryClient = useQueryClient();
  const filterParams = useMemo(
    () => buildFilterParams({ filterMes, filterEstado, debouncedSearchTerm, activeYear }),
    [filterMes, filterEstado, debouncedSearchTerm, activeYear],
  );

  // ── Recibos ──────────────────────────────────────────────────────────────
  const {
    data: recibosResponse,
    isLoading: isLoadingRecibos,
  } = useQuery({
    queryKey: ['recibos', filterParams],
    queryFn: async () => {
      return fetchAllPages('/recibos', filterParams);
    },
    staleTime: 2 * 60 * 1000, // 2 min
    onError: () => toast.error('Error al cargar los recibos'),
  });

  const recibos = Array.isArray(recibosResponse) ? recibosResponse : (recibosResponse?.data ?? []);
  const totalRecibos = recibos.length;

  // ── Periodos ─────────────────────────────────────────────────────────────
  const { data: periodos = [] } = useQuery({
    ...periodosQueryOptions,
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
    periodos,
    globalStats,
    isLoading: isLoadingRecibos,
    filterParams,
    refetchAll,
  };
};
