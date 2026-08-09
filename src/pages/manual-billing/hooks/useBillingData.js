import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../../api/axiosConfig';
import { toast } from 'sonner';

export const useBillingData = (activeYear) => {
  const [medidores, setMedidores] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [lecturas, setLecturas] = useState([]); 
  const [activePeriodo, setActivePeriodo] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ total_medidores: 0, total_registrados: 0 });

  const fetchPeriodos = useCallback(async () => {
    try {
      const res = await api.get('/periodos');
      setPeriodos(res.data);
    } catch (error) {
      toast.error('Error al cargar periodos');
    }
  }, []);

  const fetchMedidores = useCallback(async () => {
    try {
      const res = await api.get('/medidores');
      setMedidores(res.data);
    } catch (error) {
      console.error('Error al cargar medidores', error);
    }
  }, []);

  useEffect(() => {
    fetchPeriodos();
    fetchMedidores();
  }, [fetchPeriodos, fetchMedidores]);

  // Sync data for active period
  useEffect(() => {
    const fetchPeriodData = async () => {
      if (!activePeriodo) return;
      setIsLoading(true);
      try {
        const [statsRes, lecturasRes] = await Promise.all([
          api.get(`/periodos/${activePeriodo.mes_anio}/stats`),
          api.get(`/lecturas?periodo=${activePeriodo.mes_anio}`)
        ]);
        setStats(statsRes.data);
        setLecturas(lecturasRes.data);
      } catch (error) {
        toast.error('Error al sincronizar datos del periodo');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPeriodData();
  }, [activePeriodo]);

  const periodosFiltrados = useMemo(() => {
    if (!activeYear) return [];
    const yearStr = activeYear.toString();
    return periodos
      .filter(p => p.mes_anio?.includes(yearStr))
      .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
  }, [periodos, activeYear]);

  useEffect(() => {
    if (periodosFiltrados.length > 0) {
      setActivePeriodo(periodosFiltrados[periodosFiltrados.length - 1]);
    } else {
      setActivePeriodo(null);
    }
  }, [periodosFiltrados]);

  const lecturasPeriodoActivo = useMemo(() => 
    activePeriodo ? lecturas.filter(l => l.periodo === activePeriodo.mes_anio) : [],
  [lecturas, activePeriodo]);

  const totalRegistrados = stats.total_registrados || lecturasPeriodoActivo.length;
  const totalMedidores = stats.total_medidores || 0;
  const porcentajeAvance = totalMedidores > 0 ? Math.min(100, Math.round((totalRegistrados / totalMedidores) * 100)) : 0;
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

  return {
    medidores, setMedidores,
    periodos, setPeriodos, fetchPeriodos,
    lecturas, setLecturas,
    activePeriodo, setActivePeriodo,
    periodosFiltrados,
    lecturasPeriodoActivo,
    lecturasPeriodoActivoMap,
    medidorMap,
    totalRegistrados,
    totalMedidores,
    porcentajeAvance,
    dashOffset,
    fetchData: fetchPeriodos,
    isLoading,
    setStats
  };
};
