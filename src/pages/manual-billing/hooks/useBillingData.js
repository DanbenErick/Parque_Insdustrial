import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axiosConfig';
import {
  lecturasQueryOptions,
  medidoresQueryOptions,
  periodosQueryOptions,
  queryKeys,
} from '../../../api/queryOptions';
import { toast } from 'sonner';

export const useBillingData = (activeYear) => {
  const queryClient = useQueryClient();
  const [activePeriodo, setActivePeriodo] = useState(null);

  const lecturasParams = useMemo(() => ({
    periodo: activePeriodo?.mes_anio,
  }), [activePeriodo?.mes_anio]);

  const { data: periodos = [], isLoading: isLoadingPeriodos, isError: isPeriodosError } = useQuery(periodosQueryOptions);
  const { data: medidores = [], isLoading: isLoadingMedidores, isError: isMedidoresError } = useQuery(medidoresQueryOptions({ operativo: true }));
  const {
    data: lecturas = [],
    isLoading: isLoadingLecturas,
    isError: isLecturasError,
  } = useQuery(lecturasQueryOptions(lecturasParams, { enabled: Boolean(activePeriodo) }));
  const {
    data: stats = { total_medidores: 0, total_registrados: 0 },
    isLoading: isLoadingStats,
    isError: isStatsError,
  } = useQuery({
    queryKey: queryKeys.periodoStats(activePeriodo?.mes_anio),
    queryFn: () => api.get(`/periodos/${activePeriodo.mes_anio}/stats`).then((response) => response.data),
    enabled: Boolean(activePeriodo),
    staleTime: 30 * 1000,
  });
  const {
    data: omisiones = [],
    isLoading: isLoadingOmisiones,
    isError: isOmisionesError,
  } = useQuery({
    queryKey: queryKeys.omisiones(activePeriodo?.id),
    queryFn: () => api.get('/lecturas/omisiones', { params: { periodo_id: activePeriodo.id } }).then((response) => response.data || []),
    enabled: Boolean(activePeriodo),
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    if (isPeriodosError) toast.error('Error al cargar periodos');
  }, [isPeriodosError]);

  useEffect(() => {
    if (isMedidoresError || isLecturasError || isStatsError || isOmisionesError) {
      toast.error('Error al sincronizar datos del periodo');
    }
  }, [isLecturasError, isMedidoresError, isOmisionesError, isStatsError]);

  const updateQueryData = useCallback((key, valueOrUpdater, fallback) => {
    queryClient.setQueryData(key, (current = fallback) => (
      typeof valueOrUpdater === 'function' ? valueOrUpdater(current) : valueOrUpdater
    ));
  }, [queryClient]);

  const setMedidores = useCallback((value) => {
    updateQueryData(queryKeys.medidores({ operativo: true }), value, []);
  }, [updateQueryData]);
  const setPeriodos = useCallback((value) => {
    updateQueryData(queryKeys.periodos, value, []);
  }, [updateQueryData]);
  const setLecturas = useCallback((value) => {
    updateQueryData(queryKeys.lecturas(lecturasParams), value, []);
  }, [lecturasParams, updateQueryData]);
  const setOmisiones = useCallback((value) => {
    updateQueryData(queryKeys.omisiones(activePeriodo?.id), value, []);
  }, [activePeriodo?.id, updateQueryData]);
  const setStats = useCallback((value) => {
    updateQueryData(queryKeys.periodoStats(activePeriodo?.mes_anio), value, { total_medidores: 0, total_registrados: 0 });
  }, [activePeriodo?.mes_anio, updateQueryData]);

  const fetchPeriodos = useCallback(() => queryClient.invalidateQueries({ queryKey: queryKeys.periodos }), [queryClient]);

  const periodosFiltrados = useMemo(() => {
    if (!activeYear) return [];
    const yearStr = activeYear.toString();
    return periodos
      .filter(p => p.mes_anio?.includes(yearStr))
      .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
  }, [periodos, activeYear]);

  useEffect(() => {
    setActivePeriodo((current) => {
      if (periodosFiltrados.length === 0) return null;
      const matchingPeriod = current && periodosFiltrados.find((periodo) => periodo.id === current.id);
      return matchingPeriod || periodosFiltrados[periodosFiltrados.length - 1];
    });
  }, [periodosFiltrados]);

  const lecturasPeriodoActivo = useMemo(
    () => activePeriodo ? lecturas : [],
    [activePeriodo, lecturas],
  );

  const totalRegistrados = stats.total_registrados !== undefined ? Number(stats.total_registrados) : 0;
  const totalMedidores = stats.total_medidores !== undefined ? Number(stats.total_medidores) : 0;
  const porcentajeAvance = stats.porcentaje_avance !== undefined
    ? Number(stats.porcentaje_avance)
    : (totalMedidores > 0 ? Math.min(100, Math.round((totalRegistrados / totalMedidores) * 100)) : 0);
  const pendientes = stats.pendientes !== undefined
    ? Number(stats.pendientes)
    : Math.max(0, totalMedidores - totalRegistrados);
  const dashOffset = 100.5 - (100.5 * porcentajeAvance) / 100;

  const lecturasPeriodoActivoMap = useMemo(() => {
    const map = new Map();
    for (const l of lecturasPeriodoActivo) {
      map.set(l.num_serie, l);
    }
    return map;
  }, [lecturasPeriodoActivo]);

  const medidorMap = useMemo(() => {
    const map = new Map();
    for (const m of medidores) {
      map.set(m.num_serie, m);
    }
    return map;
  }, [medidores]);

  const omisionesMap = useMemo(() => {
    const map = new Map();
    for (const omission of omisiones) map.set(Number(omission.medidor_id), omission);
    return map;
  }, [omisiones]);

  return {
    medidores, setMedidores,
    periodos, setPeriodos, fetchPeriodos,
    lecturas, setLecturas,
    omisiones, setOmisiones, omisionesMap,
    activePeriodo, setActivePeriodo,
    periodosFiltrados,
    lecturasPeriodoActivo,
    lecturasPeriodoActivoMap,
    medidorMap,
    totalRegistrados,
    totalMedidores,
    pendientes,
    porcentajeAvance,
    dashOffset,
    fetchData: fetchPeriodos,
    isLoading: isLoadingPeriodos || isLoadingMedidores || (Boolean(activePeriodo) && (isLoadingLecturas || isLoadingStats || isLoadingOmisiones)),
    setStats
  };
};
