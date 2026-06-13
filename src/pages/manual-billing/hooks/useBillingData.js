import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../../api/axiosConfig';
import { toast } from 'sonner';

export const useBillingData = (activeYear) => {
  const [medidores, setMedidores] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [lecturas, setLecturas] = useState([]); 
  const [activePeriodo, setActivePeriodo] = useState(null);

  const fetchPeriodos = useCallback(async () => {
    try {
      const res = await api.get('/periodos');
      setPeriodos(res.data);
    } catch (error) {
      toast.error('Error al cargar periodos');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medidoresRes, periodosRes, lecturasRes] = await Promise.all([
          api.get('/medidores'),
          api.get('/periodos'),
          api.get('/lecturas')
        ]);
        setMedidores(medidoresRes.data);
        setPeriodos(periodosRes.data);
        setLecturas(lecturasRes.data);
      } catch (error) {
        toast.error('Error al cargar datos iniciales');
      }
    };
    fetchData();
  }, []);

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

  const totalRegistrados = lecturasPeriodoActivo.length;
  const totalMedidores = medidores.length;
  const porcentajeAvance = totalMedidores > 0 ? Math.min(100, Math.round((totalRegistrados / totalMedidores) * 100)) : 0;
  const dashOffset = 100.5 - (100.5 * porcentajeAvance) / 100;

  const lecturasPeriodoActivoMap = useMemo(() => {
    const map = new Map();
    for (const l of lecturasPeriodoActivo) {
      map.set(l.num_serie, l);
    }
    return map;
  }, [lecturasPeriodoActivo]);

  const medidorDocMap = useMemo(() => {
    const map = new Map();
    for (const m of medidores) {
      map.set(m.num_serie, m.documento_identidad || '');
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
    medidorDocMap,
    totalRegistrados,
    totalMedidores,
    porcentajeAvance,
    dashOffset
  };
};
