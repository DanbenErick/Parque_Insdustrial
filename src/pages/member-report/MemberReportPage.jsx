import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar, Doughnut } from 'react-chartjs-2';
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

// ── Constants ────────────────────────────────────────────────────────
const MESES_FULL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MESES_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const CURRENCY_OPTS = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
const KWH_OPTS = { minimumFractionDigits: 1 };
const FILL_1 = { fontVariationSettings: "'FILL' 1" };

const SECTOR_COLORS = ['#00647c', '#059669', '#f59e0b', '#dc2626', '#7c3aed', '#db2777'];

const ESTADO_CONFIG = {
  Pagado:  { badge: 'bg-green-100 text-green-700', icon: 'check_circle', dot: 'bg-green-500', text: 'text-green-600', iconBg: 'bg-green-600/5 text-green-600 border-green-600/10' },
  Vencido: { badge: 'bg-error/10 text-error', icon: 'warning', dot: 'bg-red-500', text: 'text-red-600', iconBg: 'bg-red-600/5 text-red-600 border-red-600/10' },
};
const ESTADO_DEFAULT = { badge: 'bg-yellow-100 text-yellow-700', icon: 'schedule', dot: 'bg-yellow-500', text: 'text-yellow-600', iconBg: 'bg-yellow-600/5 text-yellow-600 border-yellow-600/10' };

const getEstadoConfig = (estado) => ESTADO_CONFIG[estado] || ESTADO_DEFAULT;

const DROPDOWN_BACKDROP = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } };
const DROPDOWN_CONTENT = { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.15 } };

// ── Helpers ──────────────────────────────────────────────────────────
const fmtCurrency = (v) => parseFloat(v || 0).toLocaleString('es-PE', CURRENCY_OPTS);
const fmtKwh = (v) => parseFloat(v || 0).toLocaleString('es-PE', KWH_OPTS);

const parsePeriodParts = (p) => {
  if (!p || !p.includes('-')) return null;
  const parts = p.split('-');
  const isYearFirst = parts[0].length === 4;
  return { year: isYearFirst ? parts[0] : parts[1], monthIdx: parseInt(isYearFirst ? parts[1] : parts[0], 10) - 1 };
};

const formatPeriodo = (p) => {
  const parsed = parsePeriodParts(p);
  if (!parsed) return p || '-';
  const { year, monthIdx } = parsed;
  return monthIdx >= 0 && monthIdx < 12 ? `${MESES_FULL[monthIdx]} ${year}` : p;
};

const formatPeriodoShort = (p) => {
  const parsed = parsePeriodParts(p);
  if (!parsed) return p;
  const { year, monthIdx } = parsed;
  return monthIdx >= 0 && monthIdx < 12 ? `${MESES_SHORT[monthIdx]} ${year.slice(2)}` : p;
};

// Chart gradient factory
const makeGradient = (r, g, b, direction = 'horizontal') => (context) => {
  const { ctx, chartArea } = context.chart;
  if (!chartArea) return null;
  const gradient = direction === 'horizontal'
    ? ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0)
    : ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.15)`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.85)`);
  return gradient;
};

const consumoTooltipCallback = {
  label: (context) => `Consumo: ${parseFloat(context.raw).toLocaleString('es-PE')} kWh`
};

// ── Sub-components ───────────────────────────────────────────────────
const EstadoBadge = React.memo(({ estado }) => {
  const cfg = getEstadoConfig(estado);
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight leading-none ${cfg.badge}`}>
      <span className="material-symbols-outlined text-[12px]" style={FILL_1}>{cfg.icon}</span>
      {estado}
    </span>
  );
});

const KpiCard = React.memo(({ icon, label, children, subtitle, iconClassName = 'bg-primary/5 text-primary border-primary/10' }) => (
  <div className="bg-surface border border-outline-variant hover:border-primary/30 rounded-xl p-3 flex items-center gap-3 transition-colors shadow-sm">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${iconClassName}`}>
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </div>
    <div className="flex flex-col justify-center overflow-hidden flex-1">
      <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider leading-tight truncate">{label}</span>
      {children}
      <span className="text-[9px] text-on-surface-variant/70 mt-1 truncate">{subtitle}</span>
    </div>
  </div>
));

const ChartCard = React.memo(({ title, subtitle, children, className = '', colSpan = '' }) => (
  <div className={`${colSpan} bg-white border border-outline-variant rounded-lg p-md flex flex-col h-[360px] shadow-sm ${className}`}>
    <div className="mb-md">
      <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">{title}</h4>
      <p className="text-body-sm text-on-surface-variant">{subtitle}</p>
    </div>
    <div className="flex-grow relative">{children}</div>
  </div>
));

const EmptyState = React.memo(({ message }) => (
  <div className="h-full flex items-center justify-center text-on-surface-variant text-body-sm">
    {message}
  </div>
));

const AllMembersTableRow = React.memo(({ row }) => (
  <tr className="hover:bg-surface-container-low transition-colors group">
    <td className="px-5 py-3">
      <div className="flex items-center gap-1.5 text-on-surface font-bold text-xs">
        <span className="material-symbols-outlined text-[14px] text-on-surface-variant">person</span>
        <span className="truncate max-w-[200px]" title={row.propietario}>{row.propietario}</span>
      </div>
    </td>
    <td className="px-5 py-3">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary">
        <span className="material-symbols-outlined text-[14px]" style={FILL_1}>bolt</span>
        {fmtKwh(row.consumo)} kWh
      </div>
    </td>
    <td className="px-5 py-3">
      <div className="flex flex-col gap-0.5 text-[10px]">
        <div className="flex items-center gap-1.5 text-on-surface-variant">
          <span className="w-8">Neto:</span>
          <span className="font-data-mono">S/ {fmtCurrency(row.neto)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-on-surface-variant">
          <span className="w-8">IGV:</span>
          <span className="font-data-mono">S/ {fmtCurrency(row.igv)}</span>
        </div>
      </div>
    </td>
    <td className="px-5 py-3 text-right">
      <div className="flex flex-col items-end gap-1">
        <span className="font-data-mono text-sm font-bold text-on-surface leading-none">S/ {fmtCurrency(row.total)}</span>
        <EstadoBadge estado={row.estado} />
      </div>
    </td>
  </tr>
));

// ── Main Component ───────────────────────────────────────────────────
const MemberReport = ({ lecturas = [], recibos = [], periodos = [], selectedPeriod = '' }) => {
  const [selectedMember, setSelectedMember] = useState('Todos');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Memoised derived data ──────────────────────────────────────────
  const allMembers = useMemo(() =>
    Array.from(new Set(lecturas.map(l => l.propietario).filter(p => p && p !== 'N/A'))).sort(),
    [lecturas],
  );

  const filteredMembersList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return q ? allMembers.filter(m => m.toLowerCase().includes(q)) : allMembers;
  }, [allMembers, searchQuery]);

  const filteredLecturas = useMemo(
    () => lecturas.filter(l => l.periodo === selectedPeriod),
    [lecturas, selectedPeriod],
  );

  const filteredRecibos = useMemo(
    () => recibos.filter(r => r.periodo === selectedPeriod || r.mes_anio === selectedPeriod),
    [recibos, selectedPeriod],
  );

  // Build a lookup map: socio -> recibo (for O(1) lookups instead of O(n) .find())
  const recibosBySocio = useMemo(() => {
    const map = new Map();
    filteredRecibos.forEach(r => { if (!map.has(r.socio)) map.set(r.socio, r); });
    return map;
  }, [filteredRecibos]);

  // Table data for "Todos" view
  const tableData = useMemo(() =>
    filteredLecturas.map(l => {
      const matchingRecibo = recibosBySocio.get(l.propietario);
      const total = matchingRecibo ? parseFloat(matchingRecibo.total) || 0 : 0;
      const neto = total / 1.18;
      return {
        id: l.id,
        propietario: l.propietario,
        medidor: l.id_medidor || 'N/A',
        consumo: parseFloat(l.consumo_calculado) || 0,
        neto,
        igv: total - neto,
        total,
        estado: matchingRecibo?.estado || 'Pendiente',
      };
    }),
    [filteredLecturas, recibosBySocio],
  );

  // Top consumers chart data
  const topConsumers = useMemo(
    () => [...tableData].sort((a, b) => b.consumo - a.consumo).slice(0, 5),
    [tableData],
  );

  const consumersChartData = useMemo(() => ({
    labels: topConsumers.map(c => c.propietario),
    datasets: [{
      label: 'Consumo (kWh)',
      data: topConsumers.map(c => c.consumo),
      backgroundColor: makeGradient(0, 100, 124, 'horizontal'),
      borderRadius: 4,
    }],
  }), [topConsumers]);

  const consumersChartOptions = useMemo(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: consumoTooltipCallback } },
    scales: { x: { beginAtZero: true }, y: { grid: { display: false } } },
  }), []);

  // Sector distribution
  const sectorData = useMemo(() => {
    const data = {};
    // Build a lookup: propietario -> direccion
    const direccionMap = new Map();
    filteredLecturas.forEach(l => { if (!direccionMap.has(l.propietario)) direccionMap.set(l.propietario, l.direccion || 'No registrada'); });

    tableData.forEach(c => {
      const sector = direccionMap.get(c.propietario) || 'Otros';
      data[sector] = (data[sector] || 0) + c.consumo;
    });
    return data;
  }, [tableData, filteredLecturas]);

  const sectorChartData = useMemo(() => ({
    labels: Object.keys(sectorData),
    datasets: [{
      data: Object.values(sectorData),
      backgroundColor: SECTOR_COLORS,
      borderWidth: 1,
      borderColor: '#ffffff',
    }],
  }), [sectorData]);

  const sectorTotal = useMemo(
    () => Object.values(sectorData).reduce((s, v) => s + v, 0),
    [sectorData],
  );

  const sectorChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 10, font: { family: 'Hanken Grotesk', size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            const pct = sectorTotal > 0 ? ((val / sectorTotal) * 100).toFixed(1) : 0;
            return `${context.label}: ${parseFloat(val).toLocaleString('es-PE')} kWh (${pct}%)`;
          },
        },
      },
    },
    cutout: '60%',
  }), [sectorTotal]);

  // ── Specific member data ───────────────────────────────────────────
  const currentLectura = useMemo(
    () => filteredLecturas.find(l => l.propietario === selectedMember),
    [filteredLecturas, selectedMember],
  );

  const currentRecibo = useMemo(
    () => recibosBySocio.get(selectedMember),
    [recibosBySocio, selectedMember],
  );

  const memberConsumo = currentLectura ? parseFloat(currentLectura.consumo_calculado) || 0 : 0;
  const memberTotal = currentRecibo ? parseFloat(currentRecibo.total) || 0 : 0;
  const memberEstado = currentRecibo?.estado || 'Pendiente';
  const memberSector = currentLectura ? (currentLectura.direccion || 'No registrada') : 'N/A';
  const memberEstadoConfig = getEstadoConfig(memberEstado);

  const memberAllLecturas = useMemo(
    () => lecturas.filter(l => l.propietario === selectedMember),
    [lecturas, selectedMember],
  );

  const avgConsumo = useMemo(
    () => memberAllLecturas.length > 0
      ? memberAllLecturas.reduce((sum, l) => sum + (parseFloat(l.consumo_calculado) || 0), 0) / memberAllLecturas.length
      : 0,
    [memberAllLecturas],
  );

  const memberLecturas = useMemo(
    () => [...memberAllLecturas].sort((a, b) => a.periodo.localeCompare(b.periodo)).slice(-6),
    [memberAllLecturas],
  );

  // Build recibo lookup for member invoices: periodo -> recibo
  const memberRecibosByPeriodo = useMemo(() => {
    const map = new Map();
    recibos.filter(r => r.socio === selectedMember).forEach(r => {
      const key = r.periodo || r.mes_anio;
      if (!map.has(key)) map.set(key, r);
    });
    return map;
  }, [recibos, selectedMember]);

  const historyChartData = useMemo(() => ({
    labels: memberLecturas.map(l => formatPeriodoShort(l.periodo)),
    datasets: [{
      label: 'Consumo (kWh)',
      data: memberLecturas.map(l => parseFloat(l.consumo_calculado) || 0),
      backgroundColor: makeGradient(5, 150, 105, 'vertical'),
      borderRadius: 4,
    }],
  }), [memberLecturas]);

  const historyChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: consumoTooltipCallback } },
    scales: { y: { beginAtZero: true } },
  }), []);

  // ── Callbacks ──────────────────────────────────────────────────────
  const handleSelectMember = useCallback((member) => {
    setSelectedMember(member);
    setIsOpen(false);
    setSearchQuery('');
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
  }, []);

  const handleInputFocus = useCallback(() => {
    setIsOpen(true);
    setSearchQuery('');
  }, []);

  const toggleDropdown = useCallback(() => setIsOpen(prev => !prev), []);
  const closeDropdown = useCallback(() => setIsOpen(false), []);

  const isAllView = selectedMember === 'Todos';

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-lg animate-in fade-in duration-300">

      {/* Member Selector */}
      <div className="bg-white border border-outline-variant rounded-lg p-md flex flex-col md:flex-row md:items-center justify-between gap-md shadow-sm relative z-50">
        <div className="flex-grow max-w-md space-y-xs relative">
          <label className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Seleccionar Socio / Propietario</label>
          <div className="relative">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">corporate_fare</span>
              <input
                type="text"
                placeholder="Buscar socio..."
                value={isOpen ? searchQuery : (isAllView ? 'Ver Todos los Socios' : selectedMember)}
                onChange={handleSearchChange}
                onFocus={handleInputFocus}
                className="w-full bg-surface border border-outline-variant rounded-md pl-10 pr-10 py-2 text-sm focus:border-primary outline-none font-bold text-on-surface cursor-pointer"
              />
              <button
                type="button"
                onClick={toggleDropdown}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface focus:outline-none"
              >
                <span className="material-symbols-outlined">{isOpen ? 'expand_less' : 'expand_more'}</span>
              </button>
            </div>

            <AnimatePresence>
              {isOpen && (
                <>
                  <motion.div {...DROPDOWN_BACKDROP} className="fixed inset-0 z-40" onClick={closeDropdown} />
                  <motion.div {...DROPDOWN_CONTENT} className="absolute top-full left-0 right-0 mt-1 max-h-60 bg-white border border-outline-variant rounded-lg shadow-xl overflow-y-auto z-50 custom-scrollbar">
                    <div
                      onClick={() => handleSelectMember('Todos')}
                      className={`px-md py-2.5 hover:bg-primary/5 cursor-pointer text-sm font-semibold transition-colors flex items-center gap-xs ${isAllView ? 'bg-primary/10 text-primary' : 'text-on-surface'}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">group</span>
                      Ver Todos los Socios
                    </div>
                    {filteredMembersList.map(m => (
                      <div
                        key={m}
                        onClick={() => handleSelectMember(m)}
                        className={`px-md py-2.5 hover:bg-primary/5 cursor-pointer text-sm font-semibold transition-colors flex items-center justify-between ${selectedMember === m ? 'bg-primary/10 text-primary' : 'text-on-surface'}`}
                      >
                        <span className="truncate">{m}</span>
                        {selectedMember === m && <span className="material-symbols-outlined text-primary text-[16px]">check</span>}
                      </div>
                    ))}
                    {filteredMembersList.length === 0 && (
                      <div className="px-md py-3 text-center text-xs text-on-surface-variant italic">
                        No se encontraron socios
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-on-surface-variant">Periodo Reportado</p>
          <p className="font-bold text-primary text-body-md uppercase">
            {selectedPeriod ? formatPeriodo(selectedPeriod) : 'N/A'}
          </p>
        </div>
      </div>

      {isAllView ? (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            <ChartCard colSpan="lg:col-span-2" title="Comparativa de Consumo por Socio" subtitle="Top Consumidores del mes (kWh)">
              {topConsumers.length > 0
                ? <Bar data={consumersChartData} options={consumersChartOptions} />
                : <EmptyState message="No hay datos de consumo disponibles." />
              }
            </ChartCard>

            <ChartCard title="Consumo por Manzana" subtitle="Distribución del consumo por sector">
              <div className="flex items-center justify-center h-full">
                {Object.keys(sectorData).length > 0
                  ? <div className="w-full h-[220px]"><Doughnut data={sectorChartData} options={sectorChartOptions} /></div>
                  : <EmptyState message="No hay datos de distribución." />
                }
              </div>
            </ChartCard>
          </div>

          {/* Detailed Table */}
          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-md">
            <div className="p-4 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
              <h4 className="text-base text-on-surface font-bold">Desglose de Facturación por Socio</h4>
              <span className="text-xs text-on-surface-variant font-medium">Mostrando {tableData.length} socios</span>
            </div>
            <div className="overflow-x-auto relative custom-scrollbar max-h-[400px]">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
                <thead className="sticky top-0 z-10 shadow-sm bg-surface-container-lowest text-on-surface-variant text-[11px] uppercase tracking-wider">
                  <tr className="border-b border-outline-variant">
                    <th className="px-5 py-4 font-semibold bg-surface-container-lowest w-[30%]">Socio / Propietario</th>
                    <th className="px-5 py-4 font-semibold bg-surface-container-lowest w-[25%]">Consumo</th>
                    <th className="px-5 py-4 font-semibold bg-surface-container-lowest w-[25%]">Desglose (Neto / IGV)</th>
                    <th className="px-5 py-4 font-semibold bg-surface-container-lowest text-right w-[20%]">Total y Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50 bg-surface text-body-sm">
                  {tableData.map(row => <AllMembersTableRow key={row.id} row={row} />)}
                  {tableData.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center px-5 py-12 text-on-surface-variant text-sm">
                        No hay registros en este período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Specific Member KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 mb-4">
            <KpiCard icon="bolt" label="Consumo del Período" subtitle={`Sector: ${memberSector}`}>
              <div className="flex items-end justify-between mt-0.5">
                <span className="font-data-mono text-lg text-primary font-bold leading-none truncate">
                  {fmtKwh(memberConsumo)}
                </span>
                <span className="text-[10px] text-primary font-bold mb-px ml-1 bg-primary/10 px-1 rounded-sm border border-primary/20">kWh</span>
              </div>
            </KpiCard>

            <KpiCard icon="receipt_long" label="Monto Facturado" subtitle="Total con cargos e IGV">
              <div className="flex items-end justify-between mt-0.5">
                <span className="font-data-mono text-lg text-on-surface font-bold leading-none truncate">
                  S/ {fmtCurrency(memberTotal)}
                </span>
              </div>
            </KpiCard>

            <KpiCard icon={memberEstadoConfig.icon} label="Estado de Pago" subtitle="Para el período actual" iconClassName={memberEstadoConfig.iconBg}>
              <div className="flex items-end justify-between mt-0.5">
                <span className={`font-bold leading-none truncate text-sm mt-1 uppercase ${memberEstadoConfig.text}`}>
                  {memberEstado}
                </span>
              </div>
            </KpiCard>

            <KpiCard icon="history" label="Promedio Histórico" subtitle="Promedio de los últimos 6 meses" iconClassName="bg-secondary-container/50 text-on-secondary-container border-secondary-container">
              <div className="flex items-end justify-between mt-0.5">
                <span className="font-data-mono text-lg text-on-surface font-bold leading-none truncate">
                  {fmtKwh(avgConsumo)}
                </span>
                <span className="text-[10px] text-on-surface-variant font-bold mb-px ml-1 bg-surface-container px-1 rounded-sm border border-outline-variant/50">kWh</span>
              </div>
            </KpiCard>
          </div>

          {/* Charts Row: Historical + Invoices */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            <ChartCard colSpan="lg:col-span-2" title="Historial de Consumo Personal" subtitle="Consumo mensual registrado en los últimos 6 meses (kWh)">
              {memberLecturas.length > 0
                ? <Bar data={historyChartData} options={historyChartOptions} />
                : <EmptyState message="No hay suficientes lecturas registradas." />
              }
            </ChartCard>

            {/* Invoices List Summary */}
            <div className="bg-white border border-outline-variant rounded-lg p-md flex flex-col h-[360px] shadow-sm">
              <div className="mb-md">
                <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">Resumen de Recibos</h4>
                <p className="text-body-sm text-on-surface-variant">Consolidado de recibos de los últimos meses</p>
              </div>
              <div className="space-y-sm flex-grow overflow-y-auto pr-xs custom-scrollbar">
                {memberLecturas.map(l => {
                  const matchingRec = memberRecibosByPeriodo.get(l.periodo);
                  const total = matchingRec ? parseFloat(matchingRec.total) || 0 : 0;
                  const estado = matchingRec?.estado || 'Pendiente';
                  const estadoCfg = getEstadoConfig(estado);
                  return (
                    <div key={l.id} className="flex items-center justify-between p-sm border border-outline-variant rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
                      <div>
                        <p className="font-bold text-xs text-on-surface">{formatPeriodo(l.periodo)}</p>
                        <p className="text-[10px] text-on-surface-variant">{fmtKwh(l.consumo_calculado)} kWh consumidos</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-primary">S/ {fmtCurrency(total)}</p>
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${estadoCfg.dot}`} title={estado} />
                      </div>
                    </div>
                  );
                })}
                {memberLecturas.length === 0 && <EmptyState message="No hay cobros registrados." />}
              </div>
            </div>
          </div>

          {/* Readings History Table */}
          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-md">
            <div className="p-4 border-b border-outline-variant bg-surface-container-lowest">
              <h4 className="text-base text-on-surface font-bold">Historial de Lecturas Registradas</h4>
            </div>
            <div className="overflow-x-auto relative custom-scrollbar max-h-[400px]">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
                <thead className="sticky top-0 z-10 shadow-sm bg-surface-container-lowest text-on-surface-variant text-[11px] uppercase tracking-wider">
                  <tr className="border-b border-outline-variant">
                    <th className="px-5 py-4 font-semibold bg-surface-container-lowest w-[25%]">Periodo / Mes</th>
                    <th className="px-5 py-4 font-semibold bg-surface-container-lowest w-[45%]">Lecturas y Consumo</th>
                    <th className="px-5 py-4 font-semibold bg-surface-container-lowest text-right w-[30%]">Total y Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50 bg-surface text-body-sm">
                  {memberLecturas.map(l => {
                    const matchingRec = memberRecibosByPeriodo.get(l.periodo);
                    const total = matchingRec ? parseFloat(matchingRec.total) || 0 : 0;
                    const estado = matchingRec?.estado || 'Pendiente';
                    return (
                      <tr key={l.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="px-5 py-3 font-bold text-on-surface truncate">{formatPeriodo(l.periodo)}</td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="material-symbols-outlined text-[14px] text-on-surface-variant">electric_meter</span>
                              <span className="text-on-surface-variant">Ant: <span className="font-data-mono">{fmtKwh(l.lectura_anterior)}</span></span>
                              <span className="text-on-surface-variant px-1">•</span>
                              <span className="text-on-surface-variant">Act: <span className="font-data-mono">{fmtKwh(l.lectura_actual)}</span></span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary mt-1">
                              <span className="material-symbols-outlined text-[14px]" style={FILL_1}>bolt</span>
                              Consumo: {fmtKwh(l.consumo_calculado)} kWh
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-data-mono text-sm font-bold text-on-surface leading-none">S/ {fmtCurrency(total)}</span>
                            <EstadoBadge estado={estado} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {memberLecturas.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center px-5 py-12 text-on-surface-variant text-sm">
                        No hay lecturas registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MemberReport;
