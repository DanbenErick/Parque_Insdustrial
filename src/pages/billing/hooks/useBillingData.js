import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../../../api/axiosConfig';
import { buildFilterParams } from '../billingUtils';

/**
 * useBillingData — Fetches recibos, periodos and global stats using React Query.
 * Replaces the manual useEffect + useState pattern in BillingPage.
 */
export const useBillingData = ({ filterMes, filterEstado, debouncedSearchTerm, activeYear }) => {
  const queryClient = useQueryClient();

  const filterParams = useMemo(
    () => buildFilterParams({ filterMes, filterEstado, debouncedSearchTerm, activeYear }),
    [filterMes, filterEstado, debouncedSearchTerm, activeYear],
  );

  // ── Recibos ──────────────────────────────────────────────────────────────
  const {
    data: recibos = [],
    isLoading: isLoadingRecibos,
  } = useQuery({
    queryKey: ['recibos', filterParams],
    queryFn: async () => {
      const res = await api.get('/recibos', { params: filterParams });
      return res.data;
    },
    staleTime: 2 * 60 * 1000, // 2 min
    onError: () => toast.error('Error al cargar los recibos'),
  });

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
    periodos,
    globalStats,
    isLoading: isLoadingRecibos,
    filterParams,
    refetchAll,
  };
};
