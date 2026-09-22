import  { useState, useCallback, useMemo } from 'react';
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
  deriveKpiValues,
} from './';
import LoadingCurtain from '../../components/ui/LoadingCurtain';
import MonthlySummary from './MonthlySummary';
import PeriodInsights from './PeriodInsights';
import ReceiptStatusChart from './ReceiptStatusChart';
import ReadingProgress from './ReadingProgress';
import DashboardStatus from './DashboardStatus';
import RecentActivity from './RecentActivity';

// --- Register Chart.js once at module level ---
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, Filler);
ChartJS.defaults.font.family = 'Hanken Grotesk';

const Dashboard = () => {
  const { activeYear } = useYear();
  const [chartViewMode, setChartViewMode] = useState('year');

  const consumoYear = chartViewMode === 'global' ? 'all' : activeYear;


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
        // ✅ Endpoint dedicado: devuelve solo los totales agrupados por periodo (máx ~12 filas)
        // Antes: /recibos?year=X retornaba TODOS los recibos (cientos de filas)
        queryKey: ['dashboard-recaudacion', consumoYear],
        queryFn: () =>
          api.get(`/dashboard/recaudacion?year=${consumoYear}`).then((r) => r.data),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['dashboard-alerts'],
        queryFn: () => api.get('/dashboard/alerts').then((r) => r.data),
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: ['dashboard-resumen-mensual', consumoYear],
        queryFn: () => api.get(`/dashboard/resumen-mensual?year=${consumoYear}`).then((r) => r.data),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['dashboard-detalle-periodo', consumoYear],
        queryFn: () => api.get(`/dashboard/detalle-periodo?year=${consumoYear}`).then((r) => r.data),
        staleTime: 60 * 1000,
      },
      {
        queryKey: ['dashboard-actividad-reciente', consumoYear],
        queryFn: () => api.get(`/dashboard/actividad-reciente?year=${consumoYear}`).then((r) => r.data),
        staleTime: 60 * 1000,
      },
    ],
  });

  const [kpisQuery, chartQuery, , recaudacionQuery, , monthlyQuery, detailQuery, activityQuery] = results;

  const isLoading = results.some((r) => r.isLoading);

  const kpis = useMemo(
    () => kpisQuery.data ?? { totalConsumo: 0, maxConsumo: 0, maxPeriodo: 'N/A', minConsumo: 0, minPeriodo: 'N/A' },
    [kpisQuery.data],
  );
  const chartData = useMemo(() => chartQuery.data ?? [], [chartQuery.data]);
  // recaudacionRaw ya viene agregado del server: [{ label, recaudado }]
  const recaudacionRaw = useMemo(() => recaudacionQuery.data ?? [], [recaudacionQuery.data]);

  // --- All derived data is memoized ---
  const kpiValues = useMemo(() => deriveKpiValues(kpis, chartData), [kpis, chartData]);

  const consumoChart = useMemo(
    () => (chartData?.length ? buildConsumoChartData(chartData) : null),
    [chartData],
  );

  const totalRecaudado = useMemo(
    () => recaudacionRaw.reduce((sum, r) => sum + (r.recaudado || 0), 0),
    [recaudacionRaw],
  );

  const recaudacionChart = useMemo(
    () => (recaudacionRaw.length ? buildRecaudacionChartData(recaudacionRaw) : null),
    [recaudacionRaw],
  );

  // --- Stable view mode handlers ---
  const handleSetYear = useCallback(() => setChartViewMode('year'), []);
  const handleSetGlobal = useCallback(() => setChartViewMode('global'), []);

  return (
    <>
      <LoadingCurtain
        isOpen={isLoading}
        title="Actualizando el panel"
        subtitle="Calculando indicadores y tendencias del periodo seleccionado."
      />
      <main className="p-4 md:p-lg space-y-6 max-w-[1600px] mx-auto w-full flex-grow">
      {/* Header + View Mode Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex flex-col">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Panel de administración</p>
          <h1 className="text-2xl md:text-3xl text-on-surface font-bold leading-tight">Resumen del parque</h1>
          <p className="text-sm text-on-surface-variant mt-1">Facturación, consumo y actividad en un solo lugar.</p>
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

      <QuickAccessBar />

      <section className="space-y-3" aria-label="Resumen de operación">
        <div>
          <h2 className="text-lg font-bold text-on-surface">Resumen de operación</h2>
          <p className="text-sm text-on-surface-variant">Indicadores clave y estado del último período.</p>
        </div>
        <DashboardKPIs kpis={kpiValues} />
        {monthlyQuery.isError ? (
          <p className="text-error text-sm">No se pudo cargar el estado de facturación mensual.</p>
        ) : !monthlyQuery.isLoading && (
          <MonthlySummary summary={monthlyQuery.data} year={consumoYear} />
        )}
        <DashboardStatus detail={detailQuery.data} detailError={detailQuery.isError} queries={results} />
      </section>

      {/* Charts Section */}
      <section className="space-y-3" aria-label="Tendencias de consumo y recaudación">
        <div>
          <h2 className="text-lg font-bold text-on-surface">Tendencias</h2>
          <p className="text-sm text-on-surface-variant">Evolución del consumo y los pagos registrados.</p>
        </div>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-stretch">
      <div className="min-w-0 xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* Consumo Chart */}
        <div className="bg-white border border-outline-variant rounded-xl p-md flex flex-col shadow-sm h-[320px] xl:h-[370px] min-w-0">
          <div className="flex flex-col gap-2 mb-4">
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
                <span className="material-symbols-outlined text-[40px]" translate="no">bar_chart_off</span>
                <span className="font-bold text-body-lg">No hay datos de consumo para {activeYear}</span>
              </div>
            )}
          </div>
        </div>

        {/* Recaudación Chart */}
        <div className="bg-white border border-outline-variant rounded-xl p-md flex flex-col shadow-sm h-[320px] xl:h-[370px] min-w-0">
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex flex-col">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {chartViewMode === 'global' ? 'Recaudación Histórica (Por Años)' : `Recaudación del Año ${activeYear}`}
              </h2>
              <p className="text-body-sm text-on-surface-variant mt-xs">
                {chartViewMode === 'global' ? 'Pagos registrados acumulados por años (S/)' : 'Pagos registrados para recibos de este año (S/)'}
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
                <span className="material-symbols-outlined text-[40px]" translate="no">query_stats</span>
                <span className="font-bold text-body-lg">No hay recaudaciones para {activeYear}</span>
              </div>
            )}
          </div>
        </div>

      </div>
      <div className="min-w-0 xl:col-span-4 flex flex-col gap-3">
        {detailQuery.isError ? (
          <p className="text-error text-sm">No se pudo cargar el estado de recibos y lecturas.</p>
        ) : !detailQuery.isLoading && detailQuery.data && (
          <>
            <ReceiptStatusChart recibos={detailQuery.data.recibos} />
            <ReadingProgress lecturasPeriodo={detailQuery.data.lecturasPeriodo} />
          </>
        )}
      </div>
      </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <div className="min-w-0 xl:col-span-8">
          {detailQuery.isError ? (
            <p className="text-error text-sm">No se pudieron cargar los indicadores del período.</p>
          ) : !detailQuery.isLoading && <PeriodInsights data={detailQuery.data} />}
        </div>
        <div className="min-w-0 xl:col-span-4">
          {activityQuery.isError ? (
            <p className="text-error text-sm">No se pudo cargar la actividad reciente.</p>
          ) : !activityQuery.isLoading && (
            <RecentActivity events={activityQuery.data ?? []} year={consumoYear} />
          )}
        </div>
      </div>
      </main>
    </>
  );
};

export default Dashboard;
