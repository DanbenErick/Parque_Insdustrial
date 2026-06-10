import React, { useState } from 'react';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const MemberReport = ({ lecturas = [], recibos = [], periodos = [], selectedPeriod = '' }) => {
  const allMembers = Array.from(
    new Set(
      lecturas
        .map(l => l.propietario)
        .filter(p => p && p !== 'N/A')
    )
  ).sort();

  const [selectedMember, setSelectedMember] = useState('Todos');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembersList = allMembers.filter(m =>
    m.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered monthly data
  const filteredLecturas = lecturas.filter(l => l.periodo === selectedPeriod);
  const filteredRecibos = recibos.filter(r => r.periodo === selectedPeriod || r.mes_anio === selectedPeriod);

  const formatPeriodo = (p) => {
    if (!p) return '-';
    if (p.includes('-')) {
      const parts = p.split('-');
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      if (parts[0].length === 4) {
        return `${meses[parseInt(parts[1]) - 1] || parts[1]} ${parts[0]}`;
      } else {
        return `${meses[parseInt(parts[0]) - 1] || parts[0]} ${parts[1]}`;
      }
    }
    return p;
  };

  // 1. Data calculations for "Todos" (All members)
  const tableData = filteredLecturas.map(l => {
    const matchingRecibo = filteredRecibos.find(r => r.socio === l.propietario);
    const total = matchingRecibo ? parseFloat(matchingRecibo.total) || 0 : 0;
    const neto = total / 1.18;
    const igv = total - neto;
    return {
      id: l.id,
      propietario: l.propietario,
      medidor: l.id_medidor || 'N/A',
      consumo: parseFloat(l.consumo_calculado) || 0,
      neto,
      igv,
      total,
      estado: matchingRecibo ? matchingRecibo.estado : 'Pendiente'
    };
  });

  // Top Consumers Chart (All members)
  const topConsumers = [...tableData]
    .sort((a, b) => b.consumo - a.consumo)
    .slice(0, 5);

  const consumersChartData = {
    labels: topConsumers.map(c => c.propietario),
    datasets: [
      {
        label: 'Consumo (kWh)',
        data: topConsumers.map(c => c.consumo),
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
          gradient.addColorStop(0, 'rgba(0, 100, 124, 0.15)');
          gradient.addColorStop(1, 'rgba(0, 100, 124, 0.85)');
          return gradient;
        },
        borderRadius: 4,
      }
    ]
  };

  const consumersChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Consumo: ${parseFloat(context.raw).toLocaleString('es-PE')} kWh`;
          }
        }
      }
    },
    scales: {
      x: { beginAtZero: true },
      y: { grid: { display: false } }
    }
  };

  // Sector distribution (All members)
  const sectorData = {};
  tableData.forEach(c => {
    const matchingLectura = filteredLecturas.find(l => l.propietario === c.propietario);
    const sector = matchingLectura ? (matchingLectura.direccion || 'No registrada') : 'Otros';
    sectorData[sector] = (sectorData[sector] || 0) + c.consumo;
  });

  const sectorChartData = {
    labels: Object.keys(sectorData),
    datasets: [
      {
        data: Object.values(sectorData),
        backgroundColor: ['#00647c', '#059669', '#f59e0b', '#dc2626', '#7c3aed', '#db2777'],
        borderWidth: 1,
        borderColor: '#ffffff'
      }
    ]
  };

  const sectorChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          font: { family: 'Hanken Grotesk', size: 11 }
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const val = context.raw || 0;
            const total = Object.values(sectorData).reduce((s, v) => s + v, 0);
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${parseFloat(val).toLocaleString('es-PE')} kWh (${pct}%)`;
          }
        }
      }
    },
    cutout: '60%'
  };

  // 2. Data calculations for specific member
  const currentLectura = filteredLecturas.find(l => l.propietario === selectedMember);
  const currentRecibo = filteredRecibos.find(r => r.socio === selectedMember);
  const memberConsumo = currentLectura ? parseFloat(currentLectura.consumo_calculado) || 0 : 0;
  const memberTotal = currentRecibo ? parseFloat(currentRecibo.total) || 0 : 0;
  const memberEstado = currentRecibo ? currentRecibo.estado : 'Pendiente';
  const memberSector = currentLectura ? (currentLectura.direccion || 'No registrada') : 'N/A';

  const memberAllLecturas = lecturas.filter(l => l.propietario === selectedMember);
  const avgConsumo = memberAllLecturas.length > 0
    ? memberAllLecturas.reduce((sum, l) => sum + (parseFloat(l.consumo_calculado) || 0), 0) / memberAllLecturas.length
    : 0;

  const memberLecturas = lecturas
    .filter(l => l.propietario === selectedMember)
    .sort((a, b) => a.periodo.localeCompare(b.periodo))
    .slice(-6);

  const historyChartData = {
    labels: memberLecturas.map(l => {
      const p = l.periodo;
      if (p && p.includes('-')) {
        const parts = p.split('-');
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        if (parts[0].length === 4) {
          return `${meses[parseInt(parts[1]) - 1] || parts[1]} ${parts[0].slice(2)}`;
        } else {
          return `${meses[parseInt(parts[0]) - 1] || parts[0]} ${parts[1].slice(2)}`;
        }
      }
      return p;
    }),
    datasets: [
      {
        label: 'Consumo (kWh)',
        data: memberLecturas.map(l => parseFloat(l.consumo_calculado) || 0),
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(5, 150, 105, 0.15)');
          gradient.addColorStop(1, 'rgba(5, 150, 105, 0.85)');
          return gradient;
        },
        borderRadius: 4,
      }
    ]
  };

  const historyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Consumo: ${parseFloat(context.raw).toLocaleString('es-PE')} kWh`;
          }
        }
      }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div className="space-y-lg animate-in fade-in duration-300">
      
      {/* Selector de Socio Buscable */}
      <div className="bg-white border border-outline-variant rounded-lg p-md flex flex-col md:flex-row md:items-center justify-between gap-md shadow-sm relative z-50">
        <div className="flex-grow max-w-md space-y-xs relative">
          <label className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Seleccionar Socio / Propietario</label>
          <div className="relative">
            {/* Input Trigger */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">corporate_fare</span>
              <input
                type="text"
                placeholder="Buscar socio..."
                value={isOpen ? searchQuery : (selectedMember === 'Todos' ? 'Ver Todos los Socios' : selectedMember)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => {
                  setIsOpen(true);
                  setSearchQuery(''); // Limpia la búsqueda al enfocar para mostrar todos
                }}
                className="w-full bg-surface border border-outline-variant rounded-md pl-10 pr-10 py-2 text-sm focus:border-primary outline-none font-bold text-on-surface cursor-pointer"
              />
              <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface focus:outline-none"
              >
                <span className="material-symbols-outlined">{isOpen ? 'expand_less' : 'expand_more'}</span>
              </button>
            </div>

            {/* Dropdown Options List */}
            <AnimatePresence>
            {isOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></motion.div>
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }} className="absolute top-full left-0 right-0 mt-1 max-h-60 bg-white border border-outline-variant rounded-lg shadow-xl overflow-y-auto z-50 custom-scrollbar">
                  <div 
                    onClick={() => {
                      setSelectedMember('Todos');
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`px-md py-2.5 hover:bg-primary/5 cursor-pointer text-sm font-semibold transition-colors flex items-center gap-xs ${selectedMember === 'Todos' ? 'bg-primary/10 text-primary' : 'text-on-surface'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">group</span>
                    Ver Todos los Socios
                  </div>
                  {filteredMembersList.map(m => (
                    <div 
                      key={m}
                      onClick={() => {
                        setSelectedMember(m);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`px-md py-2.5 hover:bg-primary/5 cursor-pointer text-sm font-semibold transition-colors flex items-center justify-between ${selectedMember === m ? 'bg-primary/10 text-primary' : 'text-on-surface'}`}
                    >
                      <span className="truncate">{m}</span>
                      {selectedMember === m && (
                        <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                      )}
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

      {selectedMember === 'Todos' ? (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            {/* Bar Chart: Comparative Consumption */}
            <div className="lg:col-span-2 bg-white border border-outline-variant rounded-lg p-md flex flex-col h-[360px] shadow-sm">
              <div className="mb-md">
                <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">Comparativa de Consumo por Socio</h4>
                <p className="text-body-sm text-on-surface-variant">Top Consumidores del mes (kWh)</p>
              </div>
              <div className="flex-grow relative">
                {topConsumers.length > 0 ? (
                  <Bar data={consumersChartData} options={consumersChartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center text-on-surface-variant text-body-sm">
                    No hay datos de consumo disponibles.
                  </div>
                )}
              </div>
            </div>

            {/* Donut Chart: Distribution by Sector */}
            <div className="bg-white border border-outline-variant rounded-lg p-md flex flex-col h-[360px] shadow-sm">
              <div className="mb-md">
                <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">Consumo por Manzana</h4>
                <p className="text-body-sm text-on-surface-variant">Distribución del consumo por sector</p>
              </div>
              <div className="flex-grow relative flex items-center justify-center">
                {Object.keys(sectorData).length > 0 ? (
                  <div className="w-full h-[220px]">
                    <Doughnut data={sectorChartData} options={sectorChartOptions} />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-on-surface-variant text-body-sm">
                    No hay datos de distribución.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-white border border-outline-variant rounded-lg overflow-hidden shadow-sm">
            <div className="p-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">Desglose de Facturación por Socio</h4>
              <span className="text-body-sm text-on-surface-variant font-medium">Mostrando {tableData.length} socios</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left zebra-table border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-[11px] uppercase tracking-wider border-b border-outline-variant">
                    <th className="px-lg py-3 text-xs font-bold">Socio / Propietario</th>
                    <th className="px-lg py-3 text-xs font-bold text-right">Consumo (kWh)</th>
                    <th className="px-lg py-3 text-xs font-bold text-right">Monto Neto (S/)</th>
                    <th className="px-lg py-3 text-xs font-bold text-right">IGV (18%)</th>
                    <th className="px-lg py-3 text-xs font-bold text-right">Total Factura (S/)</th>
                    <th className="px-lg py-3 text-xs font-bold">Estado</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-outline-variant">
                  {tableData.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-container-low/30 transition-colors h-[48px]">
                      <td className="px-lg py-3 font-bold text-on-surface">{row.propietario}</td>
                      <td className="px-lg py-3 text-right font-data-mono text-primary font-bold">{row.consumo.toLocaleString('es-PE', { minimumFractionDigits: 1 })}</td>
                      <td className="px-lg py-3 text-right font-data-mono">S/ {row.neto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-lg py-3 text-right font-data-mono">S/ {row.igv.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-lg py-3 text-right font-data-mono font-bold">S/ {row.total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-lg py-3">
                        <span className={`inline-flex items-center gap-xs px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${
                          row.estado === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          <span className="material-symbols-outlined text-[14px]">
                            {row.estado === 'Pagado' ? 'check_circle' : 'schedule'}
                          </span>
                          {row.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {tableData.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-lg text-on-surface-variant text-body-sm">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
            <div className="bg-white border border-outline-variant rounded-lg p-md shadow-sm">
              <p className="font-label-caps text-[11px] tracking-wider text-on-surface-variant uppercase mb-xs font-bold">Consumo del Período</p>
              <h3 className="font-data-mono text-headline-md text-primary font-bold">
                {memberConsumo.toLocaleString('es-PE', { minimumFractionDigits: 1 })} <span className="text-body-md font-normal">kWh</span>
              </h3>
              <p className="text-[10px] text-on-surface-variant mt-sm">Sector: {memberSector}</p>
            </div>

            <div className="bg-white border border-outline-variant rounded-lg p-md shadow-sm">
              <p className="font-label-caps text-[11px] tracking-wider text-on-surface-variant uppercase mb-xs font-bold">Monto Facturado</p>
              <h3 className="font-data-mono text-headline-md text-on-surface font-bold">
                S/ {memberTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[10px] text-on-surface-variant mt-sm">Monto total con cargos e IGV</p>
            </div>

            <div className="bg-white border border-outline-variant rounded-lg p-md shadow-sm">
              <p className="font-label-caps text-[11px] tracking-wider text-on-surface-variant uppercase mb-xs font-bold">Estado de Pago</p>
              <div className="mt-xs">
                <span className={`inline-flex items-center gap-xs px-sm py-1 rounded text-xs font-bold uppercase tracking-tight ${
                  memberEstado === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  <span className="material-symbols-outlined text-[14px]">
                    {memberEstado === 'Pagado' ? 'check_circle' : 'schedule'}
                  </span>
                  {memberEstado}
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-sm">Para el período actual</p>
            </div>

            <div className="bg-white border border-outline-variant rounded-lg p-md shadow-sm">
              <p className="font-label-caps text-[11px] tracking-wider text-on-surface-variant uppercase mb-xs font-bold">Promedio Histórico</p>
              <h3 className="font-data-mono text-headline-md text-on-surface font-bold">
                {avgConsumo.toLocaleString('es-PE', { minimumFractionDigits: 1 })} <span className="text-body-md font-normal">kWh</span>
              </h3>
              <p className="text-[10px] text-on-surface-variant mt-sm">Promedio de los últimos 6 meses</p>
            </div>
          </div>

          {/* Charts Row: Historical Consumption for specific member */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            <div className="lg:col-span-2 bg-white border border-outline-variant rounded-lg p-md flex flex-col h-[360px] shadow-sm">
              <div className="mb-md">
                <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">Historial de Consumo Personal</h4>
                <p className="text-body-sm text-on-surface-variant">Consumo mensual registrado en los últimos 6 meses (kWh)</p>
              </div>
              <div className="flex-grow relative">
                {memberLecturas.length > 0 ? (
                  <Bar data={historyChartData} options={historyChartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center text-on-surface-variant text-body-sm">
                    No hay suficientes lecturas registradas.
                  </div>
                )}
              </div>
            </div>

            {/* Invoices List Summary */}
            <div className="bg-white border border-outline-variant rounded-lg p-md flex flex-col h-[360px] shadow-sm">
              <div className="mb-md">
                <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">Resumen de Recibos</h4>
                 <p className="text-body-sm text-on-surface-variant">Consolidado de recibos de los últimos meses</p>
              </div>
              <div className="space-y-sm flex-grow overflow-y-auto pr-xs custom-scrollbar">
                {memberLecturas.map(l => {
                  const matchingRec = recibos.find(r => r.socio === selectedMember && (r.periodo === l.periodo || r.mes_anio === l.periodo));
                  const total = matchingRec ? parseFloat(matchingRec.total) || 0 : 0;
                  const estado = matchingRec ? matchingRec.estado : 'Pendiente';
                  return (
                    <div key={l.id} className="flex items-center justify-between p-sm border border-outline-variant rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
                      <div>
                        <p className="font-bold text-xs text-on-surface">{formatPeriodo(l.periodo)}</p>
                        <p className="text-[10px] text-on-surface-variant">{parseFloat(l.consumo_calculado).toLocaleString('es-PE')} kWh consumidos</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-primary">S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${estado === 'Pagado' ? 'bg-green-500' : 'bg-yellow-500'}`} title={estado}></span>
                      </div>
                    </div>
                  );
                })}
                {memberLecturas.length === 0 && (
                  <div className="h-full flex items-center justify-center text-on-surface-variant text-body-sm">
                    No hay cobros registrados.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Readings History Table */}
          <div className="bg-white border border-outline-variant rounded-lg overflow-hidden shadow-sm">
            <div className="p-md border-b border-outline-variant bg-surface-container-low">
              <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">Historial de Lecturas Registradas</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left zebra-table border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-[11px] uppercase tracking-wider border-b border-outline-variant">
                    <th className="px-lg py-3 text-xs font-bold">Periodo / Mes</th>
                    <th className="px-lg py-3 text-xs font-bold text-right">Lectura Anterior</th>
                    <th className="px-lg py-3 text-xs font-bold text-right">Lectura Actual</th>
                    <th className="px-lg py-3 text-xs font-bold text-right">Consumo (kWh)</th>
                    <th className="px-lg py-3 text-xs font-bold text-right">Total Factura (S/)</th>
                    <th className="px-lg py-3 text-xs font-bold">Estado de Pago</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-outline-variant">
                  {memberLecturas.map(l => {
                    const matchingRec = recibos.find(r => r.socio === selectedMember && (r.periodo === l.periodo || r.mes_anio === l.periodo));
                    const total = matchingRec ? parseFloat(matchingRec.total) || 0 : 0;
                    const estado = matchingRec ? matchingRec.estado : 'Pendiente';
                    return (
                      <tr key={l.id} className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors h-[48px]">
                        <td className="px-lg py-3 font-bold text-on-surface">{formatPeriodo(l.periodo)}</td>
                        <td className="px-lg py-3 text-right font-data-mono">{parseFloat(l.lectura_anterior).toLocaleString('es-PE', { minimumFractionDigits: 1 })}</td>
                        <td className="px-lg py-3 text-right font-data-mono">{parseFloat(l.lectura_actual).toLocaleString('es-PE', { minimumFractionDigits: 1 })}</td>
                        <td className="px-lg py-3 text-right font-bold text-primary font-data-mono">{parseFloat(l.consumo_calculado).toLocaleString('es-PE', { minimumFractionDigits: 1 })}</td>
                        <td className="px-lg py-3 text-right font-bold font-data-mono">S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                        <td className="px-lg py-3">
                          <span className={`inline-flex items-center gap-xs px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${
                            estado === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            <span className="material-symbols-outlined text-[14px]">
                              {estado === 'Pagado' ? 'check_circle' : 'schedule'}
                            </span>
                            {estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {memberLecturas.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-lg text-on-surface-variant text-body-sm">
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
