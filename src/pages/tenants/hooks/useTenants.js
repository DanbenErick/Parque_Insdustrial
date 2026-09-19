import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axiosConfig';

export const useTenants = () => {
  const queryClient = useQueryClient();

  // Fetchear todos los socios para búsqueda y filtrado local instantáneo en el frontend
  const {
    data: tenants = [],
    isLoading: isLoadingTenants,
    isError: isErrorTenants
  } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const url = `/usuarios?rol_id=3&limit=100000`;
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

  // Fetchear estadísticas del padrón general de socios
  const { data: globalStats = { total: 0, activos: 0, inactivos: 0, total_medidores: 0, total_conexiones: 0, medidores_normal: 0, medidores_tiempo_real: 0, sin_medidor: 0, socios_sin_medidor: 0 } } = useQuery({
    queryKey: ['tenants_stats'],
    queryFn: async () => {
      const response = await api.get('/usuarios/stats?rol_id=3');
      const d = response.data || {};
      return {
        total: parseInt(d.total) || 0,
        activos: parseInt(d.activos) || 0,
        inactivos: parseInt(d.inactivos) || 0,
        total_medidores: parseInt(d.total_medidores) || 0,
        total_conexiones: parseInt(d.total_conexiones) || 0,
        medidores_normal: parseInt(d.medidores_normal) || 0,
        medidores_tiempo_real: parseInt(d.medidores_tiempo_real) || 0,
        sin_medidor: parseInt(d.sin_medidor) || 0,
        socios_sin_medidor: parseInt(d.socios_sin_medidor) || 0
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
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
