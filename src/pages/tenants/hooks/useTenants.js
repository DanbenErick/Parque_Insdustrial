import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axiosConfig';

export const useTenants = (searchQuery, filterEstado, filterRubro) => {
  const queryClient = useQueryClient();

  // Fetchear los usuarios (socios)
  const { 
    data: tenants = [], 
    isLoading: isLoadingTenants, 
    isError: isErrorTenants, 
    refetch: refetchTenants 
  } = useQuery({
    queryKey: ['tenants', searchQuery, filterEstado, filterRubro],
    queryFn: async () => {
      let url = `/usuarios?rol_id=3&limit=100000`;
      if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      if (filterEstado !== 'Todos') url += `&estado=${filterEstado === 'Activos' ? 'activos' : 'suspendidos'}`;
      if (filterRubro !== 'Todos') url += `&rubro=${encodeURIComponent(filterRubro)}`;

      const response = await api.get(url);
      const rawData = Array.isArray(response.data) ? response.data : (response.data?.data || []);

      return rawData.map(tenant => {
        let parsedMedidores = [];
        try {
          if (tenant.medidores) {
            const parsed = typeof tenant.medidores === 'string' ? JSON.parse(tenant.medidores) : tenant.medidores;
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].num_serie) {
              parsedMedidores = parsed;
            }
          }
        } catch { /* skip */ }
        return { ...tenant, parsedMedidores };
      });
    },
    staleTime: 60 * 1000, // 1 minuto
  });

  // Fetchear estadísticas (solo si no hay filtros aplicados)
  const isDefaultFilters = !searchQuery.trim() && filterEstado === 'Todos' && filterRubro === 'Todos';
  
  const { data: globalStats = { total: 0, activos: 0, inactivos: 0, medidores_normal: 0, medidores_tiempo_real: 0, socios_sin_medidor: 0 } } = useQuery({
    queryKey: ['tenants_stats'],
    queryFn: async () => {
      const response = await api.get('/usuarios/stats?rol_id=3');
      return {
        total: parseInt(response.data.total) || 0,
        activos: parseInt(response.data.activos) || 0,
        inactivos: parseInt(response.data.inactivos) || 0,
        medidores_normal: parseInt(response.data.medidores_normal) || 0,
        medidores_tiempo_real: parseInt(response.data.medidores_tiempo_real) || 0,
        socios_sin_medidor: parseInt(response.data.socios_sin_medidor) || 0
      };
    },
    enabled: isDefaultFilters, // Solo ejecuta si los filtros son los por defecto
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const refetchAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ['tenants'] });
    await queryClient.invalidateQueries({ queryKey: ['tenants_stats'] });
  };

  return {
    tenants,
    isLoadingTenants,
    isErrorTenants,
    globalStats,
    refetchAll
  };
};
