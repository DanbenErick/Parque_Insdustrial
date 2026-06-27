import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../api/axiosConfig';
import { useYear } from '../../context/YearContext';
import { toast } from 'sonner';
import { Bar, Doughnut } from 'react-chartjs-2';
import MemberReport from '../member-report/MemberReportPage';
import ReportKPICard from './ReportKPICard';
import ReportTableRow from './ReportTableRow';
import { handleExportPDF, handleExportExcel } from './reportExportService';
import {
  FINANCIAL_CHART_OPTIONS,
  CONSUMO_CHART_OPTIONS,
  buildDoughnutOptions,
  buildRecaudacionOptions,
} from './chartConfig';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// ── Helpers (static, outside component) ──────────────────────────────────────

const MESES_FULL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MESES_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const ITEMS_PER_PAGE = 5;

const parsePeriodParts = (p) => {
  if (!p || !p.includes('-')) return null;
  const parts = p.split('-');
  const isYearFirst = parts[0].length === 4;
  return {
    monthIndex: parseInt(isYearFirst ? parts[1] : parts[0], 10) - 1,
    yearPart: isYearFirst ? parts[0] : parts[1],
  };
};

const formatPeriodo = (p) => {
  const parsed = parsePeriodParts(p);
  if (!parsed) return p || '-';
  return `${MESES_FULL[parsed.monthIndex] || p} ${parsed.yearPart}`;
};

const formatMonthOnly = (p) => {
  const parsed = parsePeriodParts(p);
  if (!parsed) return p || '-';
  return MESES_FULL[parsed.monthIndex] || p;
};

const formatShortPeriod = (p) => {
  const parsed = parsePeriodParts(p);
  if (!parsed) return p;
  return `${MESES_SHORT[parsed.monthIndex] || p} ${parsed.yearPart.slice(2)}`;
};

const getGradientColor = (value, max, colors) => {
  if (value === max && max > 0) return colors[0];
  const ratio = max > 0 ? value / max : 0;
  if (ratio > 0.7) return colors[1];
  if (ratio > 0.4) return colors[2];
  return colors[3];
};

const RECAUDACION_OPTIONS = buildRecaudacionOptions();

// ── Component ────────────────────────────────────────────────────────────────

const Reports = () => {
  const { activeYear } = useYear();
  const [activeTab, setActiveTab] = useState('general');
  const [periodos, setPeriodos] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [recibos, setRecibos] = useState([]);
  const [lecturas, setLecturas] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // ── Data Fetching ──────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [periodosRes, recibosRes, lecturasRes, chartRes] = await Promise.all([
        api.get('/periodos'),
        api.get('/recibos'),
        api.get('/lecturas'),
        api.get('/dashboard/chart')
      ]);

      const newPeriodos = periodosRes.data || [];
      setPeriodos(newPeriodos);
      setRecibos(recibosRes.data || []);
      setLecturas(lecturasRes.data || []);
      setChartData(chartRes.data || []);

      if (newPeriodos.length > 0) {
        const yearPeriods = newPeriodos.filter(p => p.mes_anio?.includes(activeYear.toString()));
        setSelectedPeriod(yearPeriods.length > 0 ? yearPeriods[0].mes_anio : newPeriodos[0].mes_anio);
      }
    } catch (error) {
      console.error('Error al cargar datos del reporte:', error);
      toast.error('Error al cargar la información del reporte');
    } finally {
      setIsLoading(false);
    }
  }, [activeYear]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (periodos.length > 0) {
      const yearPeriods = periodos.filter(p => p.mes_anio?.includes(activeYear.toString()));
      if (yearPeriods.length > 0) setSelectedPeriod(yearPeriods[0].mes_anio);
    }
  }, [activeYear, periodos]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleUpdate = useCallback(async () => {
    setIsUpdating(true);
    await fetchData();
    setIsUpdating(false);
    toast.success('Datos actualizados correctamente');
  }, [fetchData]);

  const onExportPDF = useCallback(() => handleExportPDF(selectedPeriod), [selectedPeriod]);
  const onExportExcel = useCallback(() => handleExportExcel(selectedPeriod), [selectedPeriod]);

  const handleTabGeneral = useCallback(() => {
    setActiveTab('general');
    setCurrentPage(1);
  }, []);

  const handleTabMember = useCallback(() => setActiveTab('member'), []);
  const handleSearchChange = useCallback((e) => setSearchTerm(e.target.value), []);
  const handlePeriodChange = useCallback((e) => setSelectedPeriod(e.target.value), []);
  const handlePrevPage = useCallback(() => setCurrentPage(prev => Math.max(prev - 1, 1)), []);
  const handleNextPage = useCallback(() => setCurrentPage(prev => prev + 1), []);

  // ── Filtered Data (Memoized) ───────────────────────────────────────────────

  const filteredRecibos = useMemo(() => recibos.filter(r => r.periodo === selectedPeriod || r.mes_anio === selectedPeriod), [recibos, selectedPeriod]);
  const filteredLecturas = useMemo(() => lecturas.filter(l => l.periodo === selectedPeriod), [lecturas, selectedPeriod]);

  const yearPeriodos = useMemo(() => periodos.filter(p => p.mes_anio?.includes(activeYear.toString())), [periodos, activeYear]);

  // ── Stats (Memoized) ──────────────────────────────────────────────────────

  const { totalConsumo, totalFacturado, totalRecaudado, totalPendiente, tasaRecaudacion, sortedDistribution } = useMemo(() => {
    const tConsumo = filteredLecturas.reduce((sum, l) => sum + (parseFloat(l.consumo_calculado) || 0), 0);
    const tFacturado = filteredRecibos.reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0);

    let tRecaudado = 0;
    let tPendiente = 0;

    filteredRecibos.forEach(r => {
      const total = parseFloat(r.total || 0);
      const saldo = r.saldo_pendiente !== undefined ? parseFloat(r.saldo_pendiente) : (r.estado === 'Pagado' ? 0 : total);
      const pagado = total - saldo;
      tRecaudado += pagado > 0 ? pagado : 0;
      if (r.estado === 'Pendiente' || r.estado === 'Pago Parcial') {
        tPendiente += parseFloat(r.saldo_pendiente !== undefined ? r.saldo_pendiente : r.total || 0);
      }
    });

    const distribution = {};
    filteredLecturas.forEach(l => {
      const sector = l.direccion || 'Sin Dirección';
      distribution[sector] = (distribution[sector] || 0) + (parseFloat(l.consumo_calculado) || 0);
    });

    const sDistribution = Object.entries(distribution)
      .map(([sector, value]) => ({ sector, value, percent: tConsumo > 0 ? (value / tConsumo) * 100 : 0 }))
      .sort((a, b) => b.value - a.value);

    return {
      totalConsumo: tConsumo,
      totalFacturado: tFacturado,
      totalRecaudado: tRecaudado,
      totalPendiente: tPendiente,
      tasaRecaudacion: tFacturado > 0 ? (tRecaudado / tFacturado) * 100 : 0,
      sortedDistribution: sDistribution,
    };
  }, [filteredLecturas, filteredRecibos]);

  // ── Financial History ─────────────────────────────────────────────────────

  const { financialHistory, sortedFinancialPeriods } = useMemo(() => {
    const history = {};
    recibos.forEach(r => {
      const period = r.periodo;
      if (period) {
        if (!history[period]) history[period] = { facturado: 0, recaudado: 0 };
        const total = parseFloat(r.total) || 0;
        history[period].facturado += total;
        if (r.estado === 'Pagado') history[period].recaudado += total;
      }
    });
    const sorted = Object.keys(history).sort((a, b) => a.localeCompare(b)).slice(-6);
    return { financialHistory: history, sortedFinancialPeriods: sorted };
  }, [recibos]);

  // ── Chart Data (Memoized) ─────────────────────────────────────────────────

  const financialChartData = useMemo(() => ({
    labels: sortedFinancialPeriods.map(formatShortPeriod),
    datasets: [
      {
        label: 'Total Facturado (S/)',
        data: sortedFinancialPeriods.map(p => financialHistory[p].facturado),
        backgroundColor: '#515B3A', // primary
        hoverBackgroundColor: '#3b432a',
        borderRadius: { topLeft: 2, topRight: 6, bottomLeft: 2, bottomRight: 6 },
        barPercentage: 0.55,
        categoryPercentage: 0.7,
      },
      {
        label: 'Total Recaudado (S/)',
        data: sortedFinancialPeriods.map(p => financialHistory[p].recaudado),
        backgroundColor: '#565e74', // secondary
        hoverBackgroundColor: '#3f4555',
        borderRadius: { topLeft: 2, topRight: 6, bottomLeft: 2, bottomRight: 6 },
        barPercentage: 0.55,
        categoryPercentage: 0.7,
      }
    ]
  }), [financialHistory, sortedFinancialPeriods]);

  const { paidCount, pendingCount, doughnutData } = useMemo(() => {
    const paid = filteredRecibos.filter(r => r.estado === 'Pagado').length;
    const pending = filteredRecibos.filter(r => r.estado === 'Pendiente').length;
    return {
      paidCount: paid,
      pendingCount: pending,
      doughnutData: {
        labels: ['Pagados', 'Pendientes'],
        datasets: [{
          data: [paid, pending],
          backgroundColor: ['#565e74', '#825100'], // secondary and tertiary
          hoverBackgroundColor: ['#3f4555', '#5f3a00'],
          borderWidth: 3,
          borderColor: '#ffffff',
          spacing: 2,
        }]
      }
    };
  }, [filteredRecibos]);

  const doughnutOptions = useMemo(() => buildDoughnutOptions(paidCount, pendingCount), [paidCount, pendingCount]);
  const hasReceipts = paidCount + pendingCount > 0;

  const chartDataConfig = useMemo(() => {
    const values = chartData ? chartData.map(d => d.consumo) : [];
    const max = Math.max(...values, 0);
    return {
      labels: chartData ? chartData.map(d => d.periodo) : [],
      datasets: [{
        label: 'Consumo Histórico (kWh)',
        data: values,
        backgroundColor: values.map(v => getGradientColor(v, max, ['#515B3A', '#6b7654', '#8e9877', '#c1c9aa'])), // primary palette
        hoverBackgroundColor: '#3b432a',
        borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 2, bottomRight: 2 },
        barPercentage: 0.65,
        categoryPercentage: 0.7,
      }]
    };
  }, [chartData]);

  const recaudacionChartData = useMemo(() => {
    const values = sortedFinancialPeriods.map(p => financialHistory[p].recaudado);
    const max = Math.max(...values, 0);
    return {
      labels: sortedFinancialPeriods.map(formatShortPeriod),
      datasets: [{
        label: 'Recaudación Mensual (S/)',
        data: values,
        backgroundColor: values.map(v => getGradientColor(v, max, ['#565e74', '#6d768f', '#9199ae', '#b6bccd'])), // secondary palette
        hoverBackgroundColor: '#3f4555',
        borderRadius: { topLeft: 2, topRight: 6, bottomLeft: 2, bottomRight: 6 },
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      }]
    };
  }, [sortedFinancialPeriods, financialHistory]);

  // ── Member Data & Pagination ──────────────────────────────────────────────

  const memberData = useMemo(() => filteredLecturas.map(l => {
    const matchingRecibo = filteredRecibos.find(r => r.socio === l.propietario);
    return {
      id: l.id,
      propietario: l.propietario,
      direccion: l.direccion,
      lectura_anterior: l.lectura_anterior,
      lectura_actual: l.lectura_actual,
      consumo: l.consumo_calculado,
      total: matchingRecibo ? matchingRecibo.total : 0,
      estado: matchingRecibo ? matchingRecibo.estado : 'Pendiente'
    };
  }), [filteredLecturas, filteredRecibos]);

  const topBilledMembers = useMemo(() =>
    [...memberData].sort((a, b) => parseFloat(b.total) - parseFloat(a.total)).slice(0, 5),
    [memberData]
  );

  const filteredMemberData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return memberData.filter(m =>
      m.propietario.toLowerCase().includes(term) ||
      (m.direccion && m.direccion.toLowerCase().includes(term))
    );
  }, [memberData, searchTerm]);

  useEffect(() => { setCurrentPage(1); }, [selectedPeriod, searchTerm]);

  const totalPages = Math.max(Math.ceil(filteredMemberData.length / ITEMS_PER_PAGE), 1);
  const indexOfFirstItem = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredMemberData.slice(indexOfFirstItem, indexOfFirstItem + ITEMS_PER_PAGE);

  // ── Loading State ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <main className="flex-grow flex items-center justify-center bg-background min-h-screen">
        <div className="flex flex-col items-center gap-md">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
          <p className="text-body-md text-on-surface-variant font-medium">Cargando reportes...</p>
        </div>
      </main>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="p-4 md:p-lg space-y-4 md:space-y-lg max-w-[1600px] mx-auto w-full flex-grow">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <h2 className="text-2xl text-on-surface font-bold leading-tight">Modulo de Reportes</h2>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-white border border-outline-variant rounded-md px-3 h-8 cursor-pointer hover:border-primary/50 transition-colors relative flex-1 md:flex-none">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant mr-2">calendar_today</span>
            <select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              className="bg-transparent text-xs font-bold outline-none border-none pr-6 cursor-pointer appearance-none text-on-surface w-full md:w-auto"
            >
              {yearPeriodos.map(p => (
                <option key={p.mes_anio} value={p.mes_anio}>{formatMonthOnly(p.mes_anio)}</option>
              ))}
              {yearPeriodos.length === 0 && (
                <option value="" disabled>Sin periodos en {activeYear}</option>
              )}
            </select>
            <span className="material-symbols-outlined text-[16px] absolute right-2 pointer-events-none text-on-surface-variant">expand_more</span>
          </div>

          <button
            className="flex items-center justify-center gap-1.5 bg-primary text-white px-3 h-8 rounded-md hover:bg-primary/90 transition-colors text-xs font-bold shadow-sm"
            onClick={handleUpdate}
          >
            <span className={`material-symbols-outlined text-[16px] ${isUpdating ? 'animate-spin' : ''}`}>refresh</span>
            <span className="hidden sm:inline">Actualizar Datos</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 mb-4">
        <ReportKPICard
          icon="bolt"
          label="Consumo Total"
          value={totalConsumo.toLocaleString('es-PE', { minimumFractionDigits: 1 })}
          badge="kWh"
          subtitle="Total en lecturas del mes"
          variant="primary"
        />
        <ReportKPICard
          icon="receipt_long"
          label="Total Facturado"
          value={`S/ ${totalFacturado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
          subtitle="Monto de recibos generados"
          variant="neutral"
        />
        <ReportKPICard
          icon="payments"
          label="Total Recaudado"
          value={`S/ ${totalRecaudado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
          subtitle={`Cobrado: ${tasaRecaudacion.toFixed(1)}% del total`}
          variant="success"
        />
        <ReportKPICard
          icon="warning"
          label="Monto Pendiente"
          value={`S/ ${totalPendiente.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
          subtitle="Por cobrar en este mes"
          variant="error"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant mb-lg gap-md">
        <button
          onClick={handleTabGeneral}
          className={`flex items-center gap-xs pb-sm px-xs font-body-md text-body-md font-bold border-b-2 transition-all ${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          <span className="material-symbols-outlined text-[20px]">analytics</span>
          Reporte General
        </button>
        <button
          onClick={handleTabMember}
          className={`flex items-center gap-xs pb-sm px-xs font-body-md text-body-md font-bold border-b-2 transition-all ${activeTab === 'member' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          <span className="material-symbols-outlined text-[20px]">pie_chart</span>
          Reporte por Empresa
        </button>
      </div>

      {activeTab === 'general' ? (
        <>
          {/* Visualizations Row 1 */}
          <div className="grid grid-cols-12 gap-lg mb-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant p-4 rounded-xl shadow-sm transition-shadow">
              <div className="mb-3">
                <h3 className="text-base text-on-surface font-bold">Tendencia de Consumo Histórico</h3>
                <p className="text-[11px] text-on-surface-variant">Consumo global acumulado del parque industrial en los últimos 6 meses</p>
              </div>
              <div className="h-64 w-full relative">
                {chartData?.length > 0 ? (
                  <Bar data={chartDataConfig} options={CONSUMO_CHART_OPTIONS} />
                ) : (
                  <div className="h-full flex items-center justify-center text-on-surface-variant text-xs">No hay datos históricos disponibles.</div>
                )}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant p-4 rounded-xl shadow-sm transition-shadow">
              <div className="mb-3">
                <h3 className="text-base text-on-surface font-bold">Recaudación por Mes</h3>
                <p className="text-[11px] text-on-surface-variant">Monto cobrado en los últimos 6 meses (S/)</p>
              </div>
              <div className="h-64 w-full relative">
                {sortedFinancialPeriods.length > 0 ? (
                  <Bar data={recaudacionChartData} options={RECAUDACION_OPTIONS} />
                ) : (
                  <div className="h-full flex items-center justify-center text-on-surface-variant text-xs">No hay datos históricos disponibles.</div>
                )}
              </div>
            </div>
          </div>

          {/* Visualizations Row 2 */}
          <div className="grid grid-cols-12 gap-lg mb-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Top Paying Members */}
            <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant p-4 rounded-xl shadow-sm flex flex-col justify-between h-[340px]">
              <div className="flex flex-col h-full overflow-hidden">
                <h3 className="text-base text-on-surface font-bold mb-3">Empresas con Mayor Facturación</h3>
                <div className="space-y-3 overflow-y-auto pr-1 flex-grow custom-scrollbar">
                  {topBilledMembers.map(m => {
                    const percent = totalFacturado > 0 ? (parseFloat(m.total) / totalFacturado) * 100 : 0;
                    return (
                      <div key={m.id} className="group/item">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[11px] font-bold text-on-surface flex items-center gap-1.5 truncate max-w-[60%]">
                            <span className="material-symbols-outlined text-[14px] text-primary/70">corporate_fare</span>
                            <span className="truncate" title={m.propietario}>{m.propietario}</span>
                          </span>
                          <div className="text-right flex items-center gap-1.5">
                            <span className="font-data-mono text-[11px] font-bold text-primary">S/ {parseFloat(m.total).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${m.estado === 'Pagado' ? 'bg-green-500' : 'bg-yellow-500'}`} title={m.estado}></span>
                          </div>
                        </div>
                        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${m.estado === 'Pagado' ? 'bg-green-600' : 'bg-primary'}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                  {topBilledMembers.length === 0 && (
                    <div className="text-center text-on-surface-variant text-[11px] py-4 flex flex-col items-center justify-center h-full">
                      <span className="material-symbols-outlined text-3xl text-on-surface-variant/40 mb-2">payments</span>
                      No hay datos de facturación para el periodo seleccionado.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Financial History Chart */}
            <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant p-4 rounded-xl shadow-sm h-[340px] flex flex-col justify-between">
              <div>
                <h3 className="text-base text-on-surface font-bold">Comparativa de Cobranza</h3>
                <p className="text-[11px] text-on-surface-variant mb-2">Facturado vs Recaudado en los últimos 6 meses (S/)</p>
              </div>
              <div className="h-[220px] w-full relative flex-grow animate-in fade-in duration-300">
                {sortedFinancialPeriods.length > 0 ? (
                  <Bar data={financialChartData} options={FINANCIAL_CHART_OPTIONS} />
                ) : (
                  <div className="h-full flex items-center justify-center text-on-surface-variant text-xs">No hay datos financieros históricos disponibles.</div>
                )}
              </div>
            </div>

            {/* Doughnut */}
            <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant p-4 rounded-xl shadow-sm h-[340px] flex flex-col justify-between">
              <div>
                <h3 className="text-base text-on-surface font-bold">Estado del Período</h3>
                <p className="text-[11px] text-on-surface-variant mb-2">Recibos pagados vs pendientes del mes actual</p>
              </div>
              <div className="h-[220px] w-full relative flex-grow animate-in fade-in duration-300 flex items-center justify-center">
                {hasReceipts ? (
                  <div className="w-full h-full relative">
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -translate-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Cobrado</span>
                      <span className="text-2xl font-bold text-green-700">{tasaRecaudacion.toFixed(1)}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-on-surface-variant text-xs">No hay recibos en este período.</div>
                )}
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-md">
            <div className="px-4 py-3 border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-surface-container-lowest">
              <h3 className="text-base text-on-surface font-bold">Detalle de Lecturas y Facturación</h3>
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <div className="relative flex-grow md:flex-grow-0">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
                  <input
                    type="text"
                    placeholder="Buscar socio o dirección..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-8 pr-3 py-1.5 h-8 border border-outline-variant rounded-md text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full md:w-56 bg-white transition-all"
                  />
                </div>
                <button
                  onClick={onExportExcel}
                  className="flex items-center gap-1.5 px-3 py-1.5 h-8 bg-[#107C41]/10 text-[#107C41] hover:bg-[#107C41]/20 font-bold text-xs rounded-md transition-colors border border-[#107C41]/20"
                >
                  <span className="material-symbols-outlined text-[16px]">table_view</span>
                  Excel
                </button>
                <button
                  onClick={onExportPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 h-8 bg-error/10 text-error hover:bg-error/20 font-bold text-xs rounded-md transition-colors border border-error/20"
                >
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                  PDF
                </button>
              </div>
            </div>

            <div className="overflow-x-auto relative custom-scrollbar max-h-[500px]">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
                <thead className="sticky top-0 z-10 shadow-sm bg-surface-container-lowest text-on-surface-variant text-[11px] uppercase tracking-wider">
                  <tr className="border-b border-outline-variant">
                    <th className="px-4 py-2 font-semibold bg-surface-container-lowest w-[30%]">Socio</th>
                    <th className="px-4 py-2 font-semibold bg-surface-container-lowest w-[40%]">Lecturas y Consumo</th>
                    <th className="px-4 py-2 font-semibold bg-surface-container-lowest w-[15%]">Estado</th>
                    <th className="px-4 py-2 font-semibold bg-surface-container-lowest text-right w-[15%]">Monto Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50 bg-surface text-body-sm">
                  {currentItems.map((m) => (
                    <ReportTableRow key={m.id} member={m} />
                  ))}
                  {filteredMemberData.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-5 py-12 text-center text-on-surface-variant">
                        No se encontraron lecturas registradas en este período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredMemberData.length > 0 && (
              <div className="px-4 py-2 border-t border-outline-variant bg-surface-container-lowest flex justify-between items-center">
                <span className="text-[11px] font-medium text-on-surface-variant">
                  Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfFirstItem + ITEMS_PER_PAGE, filteredMemberData.length)} de {filteredMemberData.length} registros
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-on-surface-variant">Página {currentPage} de {totalPages}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={handlePrevPage}
                      className="px-2.5 py-1 rounded-md border border-outline-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[11px] font-bold flex items-center gap-0.5 text-on-surface"
                      disabled={currentPage === 1}
                    >
                      <span className="material-symbols-outlined text-[14px]">chevron_left</span> Anterior
                    </button>
                    <button
                      onClick={handleNextPage}
                      className="px-2.5 py-1 rounded-md border border-outline-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[11px] font-bold flex items-center gap-0.5 text-on-surface"
                      disabled={currentPage === totalPages}
                    >
                      Siguiente <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <MemberReport
          lecturas={lecturas}
          recibos={recibos}
          periodos={periodos}
          selectedPeriod={selectedPeriod}
        />
      )}
    </main>
  );
};

export default Reports;
