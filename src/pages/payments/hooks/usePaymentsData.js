import { useCallback, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../../../api/axiosConfig';
import { fetchAllPages } from '../../../api/fetchAllPages';
import { periodosQueryOptions } from '../../../api/queryOptions';
import { buildFilterParams } from '../paymentUtils';

const QUERY_STALE_TIME = 2 * 60 * 1000;

export const usePaymentsData = ({ filterMes, activeYear, showAnulados }) => {
  const queryClient = useQueryClient();

  const filterParams = useMemo(() => ({
    ...buildFilterParams(filterMes, activeYear),
    includeAnulados: showAnulados,
  }), [filterMes, activeYear, showAnulados]);

  const paymentsQuery = useQuery({
    queryKey: ['pagos', filterParams],
    queryFn: () => fetchAllPages('/pagos', filterParams),
    staleTime: QUERY_STALE_TIME,
  });

  const receiptsQuery = useQuery({
    queryKey: ['pagos-recibos', filterParams],
    queryFn: () => fetchAllPages('/recibos', filterParams),
    staleTime: QUERY_STALE_TIME,
  });

  const periodsQuery = useQuery(periodosQueryOptions);

  const statsQuery = useQuery({
    queryKey: ['pagos-stats', filterParams],
    queryFn: () => api.get('/pagos/stats', { params: filterParams }).then((response) => response.data || {}),
    staleTime: QUERY_STALE_TIME,
  });

  useEffect(() => {
    if (paymentsQuery.isError || receiptsQuery.isError || statsQuery.isError) {
      toast.error('Error al cargar datos de pagos');
    }
  }, [paymentsQuery.isError, receiptsQuery.isError, statsQuery.isError]);

  const payments = useMemo(() => (
    Array.isArray(paymentsQuery.data) ? paymentsQuery.data : (paymentsQuery.data?.data ?? [])
  ), [paymentsQuery.data]);

  const receipts = useMemo(() => (
    Array.isArray(receiptsQuery.data) ? receiptsQuery.data : (receiptsQuery.data?.data ?? [])
  ), [receiptsQuery.data]);

  const refetchAll = useCallback(() => {
    [
      ['pagos'],
      ['pagos-recibos'],
      ['pagos-stats'],
      ['recibos'],
      ['recibos-stats'],
      ['reportes-recibos'],
    ].forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
  }, [queryClient]);

  return {
    payments,
    receipts,
    periods: periodsQuery.data ?? [],
    stats: statsQuery.data ?? {},
    filterParams,
    refetchAll,
    isLoading: paymentsQuery.isLoading
      || receiptsQuery.isLoading
      || periodsQuery.isLoading
      || statsQuery.isLoading,
  };
};
