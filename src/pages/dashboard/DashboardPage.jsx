import React, { useState, useCallback, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useQueries } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import { useYear } from '../../context/YearContext';
import {
  DashboardKPIs,
  QuickAccessBar,
  buildConsumoChartData,
  buildRecaudacionChartData,
  CONSUMO_CHART_OPTIONS,
  RECAUDACION_CHART_OPTIONS,
  buildRecaudacionData,
  deriveKpiValues,
} from './';

// --- Register Chart.js once at module level ---
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, Filler);
ChartJS.defaults.font.family = 'Hanken Grotesk';

const Dashboard = () => {
  const { activeYear } = useYear();
  const [chartViewMode, setChartViewMode] = useState('year');

  const consumoYear = chartViewMode === 'global' ? 'all' : activeYear;
  const isGlobal = chartViewMode === 'global';

  // --- Parallel queries with React Query ---
  const results = useQueries({
    queries: [
      {
        queryKey: ['dashboard-kpis', consumoYear],
        queryFn: () => api.get(`/dashboard/kpis?year=${consumoYear}`).then((r) => r.data),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['dashboard-chart', consumoYear],
        queryFn: () => api.get(`/dashboard/chart?year=${consumoYear}`).then((r) => r.data),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['lecturas-ultimas', activeYear],
        queryFn: () => api.get(`/lecturas/ultimas?year=${activeYear}`).then((r) => r.data),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['recibos-dashboard', consumoYear, isGlobal],
        queryFn: () =>
          api
            .get(`/recibos?year=${consumoYear}${isGlobal ? '&periodo=TodosHistorico' : ''}`)
            .then((r) => r.data),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['dashboard-alerts'],
        queryFn: () => api.get('/dashboard/alerts').then((r) => r.data),
        staleTime: 10 * 60 * 1000,
      },
    ],
  });

  const [kpisQuery, chartQuery, readingsQuery, recibosQuery, alertsQuery] = results;

  const isLoading = results.some((r) => r.isLoading);

  const kpis = kpisQuery.data ?? { totalConsumo: 0, maxConsumo: 0, maxPeriodo: 'N/A', minConsumo: 0, minPeriodo: 'N/A' };
  const chartData = chartQuery.data ?? [];
  const recibos = recibosQuery.data ?? [];

  // --- All derived data is memoized ---
  const kpiValues = useMemo(() => deriveKpiValues(kpis, chartData), [kpis, chartData]);

  const consumoChart = useMemo(
    () => (chartData?.length ? buildConsumoChartData(chartData) : null),
    [chartData],
  );

  const { recaudacionData, totalRecaudado } = useMemo(
    () => buildRecaudacionData(recibos, chartViewMode),
    [recibos, chartViewMode],
  );

  const recaudacionChart = useMemo(
    () => (recaudacionData.length ? buildRecaudacionChartData(recaudacionData) : null),
    [recaudacionData],
  );

  // --- Stable view mode handlers ---
  const handleSetYear = useCallback(() => setChartViewMode('year'), []);
  const handleSetGlobal = useCallback(() => setChartViewMode('global'), []);

  return (
    <main
      className={`p-4 md:p-lg space-y-4 md:space-y-lg max-w-[1600px] mx-auto w-full flex-grow transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'
        }`}
    >
      {/* Header + View Mode Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex flex-col">
          <h2 className="text-2xl text-on-surface font-bold leading-tight">Modulo Central</h2>
          <p className="text-sm text-on-surface-variant">KPIs y gráficas basadas en las lecturas de los medidores.</p>
        </div>

        <div className="flex items-center bg-surface-container-lowest p-0.5 rounded-md border border-outline-variant shadow-sm h-8">
          <button
            onClick={handleSetYear}
            className={`px-4 h-full text-xs font-bold rounded transition-all ${chartViewMode === 'year' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
              }`}
          >
            Año {activeYear}
          </button>
          <button
            onClick={handleSetGlobal}
            className={`px-4 h-full text-xs font-bold rounded transition-all ${chartViewMode === 'global' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
              }`}
          >
            Histórico Global
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <DashboardKPIs kpis={kpiValues} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">

        {/* Consumo Chart */}
        <div className="bg-white border border-outline-variant rounded-lg p-md flex flex-col shadow-md h-[350px] lg:h-[400px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-lg">
            <div className="flex flex-col">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Consumo Global Mensual</h2>
              <p className="text-body-sm text-on-surface-variant mt-xs">Histórico del consumo acumulado del parque industrial (kWh)</p>
            </div>
            {consumoChart && consumoChart.total > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl px-md py-xs flex flex-col items-end">
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                  Total {chartViewMode === 'global' ? 'Histórico' : activeYear}
                </span>
                <span className="font-data-mono text-body-md font-bold text-primary">
                  {consumoChart.total.toLocaleString('es-PE', { maximumFractionDigits: 1 })} kWh
                </span>
              </div>
            )}
          </div>

          <div className="flex-grow min-h-0 relative">
            {consumoChart ? (
              <Bar data={consumoChart.data} options={CONSUMO_CHART_OPTIONS} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant gap-2 opacity-70">
                <span className="material-symbols-outlined text-[40px]">bar_chart_off</span>
                <span className="font-bold text-body-lg">No hay datos de consumo para {activeYear}</span>
              </div>
            )}
          </div>
        </div>

        {/* Recaudación Chart */}
        <div className="bg-white border border-outline-variant rounded-lg p-md flex flex-col shadow-md h-[350px] lg:h-[400px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-lg">
            <div className="flex flex-col">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {chartViewMode === 'global' ? 'Recaudación Histórica (Por Años)' : `Recaudación del Año ${activeYear}`}
              </h2>
              <p className="text-body-sm text-on-surface-variant mt-xs">
                {chartViewMode === 'global' ? 'Monto cobrado acumulado por años (S/)' : 'Monto cobrado de recibos pagados este año (S/)'}
              </p>
            </div>
            {totalRecaudado > 0 && (
              <div className="bg-secondary/10 border border-secondary/20 rounded-xl px-md py-xs flex flex-col items-end">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">Recaudación Total</span>
                <span className="font-data-mono text-body-md font-bold text-secondary">
                  S/ {totalRecaudado.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

          <div className="flex-grow min-h-0 relative">
            {recaudacionChart ? (
              <Bar data={recaudacionChart.data} options={RECAUDACION_CHART_OPTIONS} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant gap-2 opacity-70">
                <span className="material-symbols-outlined text-[40px]">query_stats</span>
                <span className="font-bold text-body-lg">No hay recaudaciones para {activeYear}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Quick Access */}
      <QuickAccessBar />
    </main>
  );
};

export default Dashboard;
