import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useYear } from '../context/YearContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

// Configure default font family for Chart.js
ChartJS.defaults.font.family = 'Hanken Grotesk';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    kpis: { totalConsumo: 0, maxConsumo: 0, maxPeriodo: 'N/A', minConsumo: 0, minPeriodo: 'N/A' },
    chartData: [],
    readings: [],
    recibos: [],
    alerts: []
  });
  const { activeYear } = useYear();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [animate, setAnimate] = useState(false);
  const [chartViewMode, setChartViewMode] = useState('year'); // 'year' | 'global'

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const consumoYear = chartViewMode === 'global' ? 'all' : activeYear;
        const [kpisRes, chartRes, readingsRes, recibosRes, alertsRes] = await Promise.allSettled([
          api.get(`/dashboard/kpis?year=${consumoYear}`),
          api.get(`/dashboard/chart?year=${consumoYear}`),
          api.get(`/lecturas/ultimas?year=${activeYear}`),
          api.get(`/recibos?year=${consumoYear}${chartViewMode === 'global' ? '&periodo=TodosHistorico' : ''}`),
          api.get(`/dashboard/alerts`)
        ]);
        
        let newData = { ...data };
        let apiSuccess = false;

        if (kpisRes.status === 'fulfilled' && kpisRes.value.data) {
          newData.kpis = kpisRes.value.data;
          apiSuccess = true;
        }
        if (chartRes.status === 'fulfilled' && chartRes.value.data) {
          newData.chartData = chartRes.value.data;
          apiSuccess = true;
        }
        if (readingsRes.status === 'fulfilled' && readingsRes.value.data) {
          newData.readings = readingsRes.value.data;
          apiSuccess = true;
        }
        if (recibosRes.status === 'fulfilled' && recibosRes.value.data) {
          newData.recibos = recibosRes.value.data;
          apiSuccess = true;
        }
        if (alertsRes.status === 'fulfilled' && alertsRes.value.data) {
          newData.alerts = alertsRes.value.data;
          apiSuccess = true;
        }

        if (apiSuccess) {
          setData(newData);
        }
      } catch (err) {
        console.error("Error fetching dashboard", err);
      } finally {
        setIsLoading(false);
        // Delay animation slightly to ensure DOM is updated and transition triggers smoothly
        setTimeout(() => setAnimate(true), 100);
      }
    };
    
    fetchDashboardData();
  }, [activeYear, chartViewMode]);

  const maxVal = data.chartData && data.chartData.length > 0
    ? Math.max(...data.chartData.map(d => d.consumo), 1000)
    : 1000;
  const roundedMax = Math.ceil(maxVal / 1000) * 1000;

  const total6Meses = data.chartData && data.chartData.length > 0
    ? data.chartData.reduce((acc, curr) => acc + curr.consumo, 0)
    : 0;

  const sortedChartData = data.chartData && data.chartData.length > 0
    ? [...data.chartData].sort((a, b) => b.consumo - a.consumo)
    : [];

  const maxConsumo = data.kpis.maxConsumo !== undefined ? data.kpis.maxConsumo : (sortedChartData[0]?.consumo || 0);
  const maxPeriodo = data.kpis.maxPeriodo !== undefined ? data.kpis.maxPeriodo : (sortedChartData[0]?.periodo || 'N/A');
  const minConsumo = data.kpis.minConsumo !== undefined ? data.kpis.minConsumo : (sortedChartData[sortedChartData.length - 1]?.consumo || 0);
  const minPeriodo = data.kpis.minPeriodo !== undefined ? data.kpis.minPeriodo : (sortedChartData[sortedChartData.length - 1]?.periodo || 'N/A');

  // ChartJS Data setup — Modern flat design with per-bar coloring
  const consumoValues = data.chartData ? data.chartData.map(d => d.consumo) : [];
  const consumoMax = Math.max(...consumoValues, 0);

  const getConsumoBarColor = (value) => {
    if (value === consumoMax && consumoMax > 0) return '#00647c'; // primary – max bar
    const ratio = consumoMax > 0 ? value / consumoMax : 0;
    if (ratio > 0.7) return '#0e7490'; // teal-700
    if (ratio > 0.4) return '#22a0b8'; // teal-500ish
    return '#67cfe0'; // teal-300ish – lowest bars
  };

  const chartDataConfig = {
    labels: data.chartData ? data.chartData.map(d => d.periodo) : [],
    datasets: [
      {
        label: 'Consumo',
        data: consumoValues,
        backgroundColor: consumoValues.map(v => getConsumoBarColor(v)),
        hoverBackgroundColor: '#004d60',
        borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 2, bottomRight: 2 },
        borderSkipped: false,
        barPercentage: 0.65,
        categoryPercentage: 0.7,
      }
    ]
  };

  const chartOptionsConfig = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1a1c1e',
        titleColor: '#a0aec0',
        bodyColor: '#ffffff',
        titleFont: {
          family: 'Hanken Grotesk',
          size: 10,
          weight: '600'
        },
        bodyFont: {
          family: 'JetBrains Mono',
          size: 14,
          weight: 'bold'
        },
        padding: { top: 10, bottom: 10, left: 14, right: 14 },
        cornerRadius: 10,
        displayColors: true,
        boxWidth: 4,
        boxHeight: 14,
        boxPadding: 6,
        usePointStyle: false,
        callbacks: {
          title: (context) => context[0].label,
          label: (context) => {
            const val = context.raw;
            return ` ${val.toLocaleString('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kWh`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            family: 'Hanken Grotesk',
            size: 11,
            weight: '600'
          },
          padding: 8,
        },
        border: {
          display: false,
        }
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.12)',
          drawTicks: false,
          lineWidth: 1,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            family: 'JetBrains Mono',
            size: 10,
            weight: '500'
          },
          padding: 12,
          callback: (value) => `${value.toLocaleString('es-PE')}`
        },
        border: {
          display: false,
        }
      }
    }
  };

  // Financial history calculation for dashboard
  const financialHistory = {};
  if (data.recibos && data.recibos.length > 0) {
    data.recibos.forEach(r => {
      let key = r.periodo; // YYYY-MM
      
      if (chartViewMode === 'global' && key && key.includes('-')) {
        const parts = key.split('-');
        key = parts[0].length === 4 ? parts[0] : parts[1];
      }
      
      if (key) {
        if (!financialHistory[key]) {
          financialHistory[key] = { recaudado: 0 };
        }
        const total = parseFloat(r.total) || 0;
        if (r.estado === 'Pagado') {
          financialHistory[key].recaudado += total;
        }
      }
    });
  }

  const mesesMap = {
    '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun',
    '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic'
  };

  const formatPeriodName = (raw) => {
    if (!raw) return '';
    if (raw.includes('-')) {
      const parts = raw.split('-');
      if (parts[0].length === 4) { // YYYY-MM
        return `${mesesMap[parts[1]] || parts[1]} ${parts[0].slice(2)}`;
      } else { // MM-YYYY
        return `${mesesMap[parts[0]] || parts[0]} ${parts[1].slice(2)}`;
      }
    }
    return raw;
  };

  const sortedFinancialPeriods = Object.keys(financialHistory)
    .sort((a, b) => a.localeCompare(b))
    .slice(-6);

  let finalRecaudacionData = [];

  // Filter periods if year view mode is active to ensure we only show the selected year's data
  // Even though the backend filters recibos, it's good to just process what's returned.
  let periodsToProcess = sortedFinancialPeriods;

  periodsToProcess.forEach(p => {
    const label = chartViewMode === 'global' ? p : formatPeriodName(p);
    const value = financialHistory[p].recaudado;
    finalRecaudacionData.push({ label, recaudado: value });
  });

  const totalRecaudado = finalRecaudacionData.reduce((acc, curr) => acc + curr.recaudado, 0);

  const recaudacionValues = finalRecaudacionData.map(d => d.recaudado);
  const recaudacionMax = Math.max(...recaudacionValues, 0);

  const getRecaudacionBarColor = (value) => {
    if (value === recaudacionMax && recaudacionMax > 0) return '#059669'; // emerald-600 – max
    const ratio = recaudacionMax > 0 ? value / recaudacionMax : 0;
    if (ratio > 0.7) return '#10b981'; // emerald-500
    if (ratio > 0.4) return '#34d399'; // emerald-400
    return '#6ee7b7'; // emerald-300 – lowest bars
  };

  const recaudacionChartConfig = {
    labels: finalRecaudacionData.map(d => d.label),
    datasets: [
      {
        label: 'Recaudado',
        data: recaudacionValues,
        backgroundColor: recaudacionValues.map(v => getRecaudacionBarColor(v)),
        hoverBackgroundColor: '#047857',
        borderRadius: { topLeft: 2, topRight: 6, bottomLeft: 2, bottomRight: 6 },
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      }
    ]
  };

  const recaudacionChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 900,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1a1c1e',
        titleColor: '#a0aec0',
        bodyColor: '#ffffff',
        titleFont: {
          family: 'Hanken Grotesk',
          size: 10,
          weight: '600'
        },
        bodyFont: {
          family: 'JetBrains Mono',
          size: 14,
          weight: 'bold'
        },
        padding: { top: 10, bottom: 10, left: 14, right: 14 },
        cornerRadius: 10,
        displayColors: true,
        boxWidth: 4,
        boxHeight: 14,
        boxPadding: 6,
        callbacks: {
          title: (context) => context[0].label,
          label: (context) => {
            const val = context.raw;
            return ` S/ ${val.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.12)',
          drawTicks: false,
          lineWidth: 1,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            family: 'JetBrains Mono',
            size: 10,
            weight: '500'
          },
          padding: 8,
          callback: (value) => `S/ ${value.toLocaleString('es-PE')}`
        },
        border: {
          display: false,
        }
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#475569',
          font: {
            family: 'Hanken Grotesk',
            size: 11,
            weight: 'bold'
          }
        },
        border: {
          display: false,
        }
      }
    }
  };

  // Export handlers
  const handleExportExcel = () => {
    if (!data.readings || data.readings.length === 0) {
      return alert('No hay datos para exportar');
    }
    
    try {
      const exportData = data.readings.map(r => ({
        'Empresa / Propietario': r.company,
        'ID': r.id,
        'Sector / Manzana': r.sector,
        'Lectura (kWh)': r.value,
        'Tendencia': r.trend
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Lecturas');
      XLSX.writeFile(workbook, `Lecturas_Parque_Industrial_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('Error al exportar a Excel', error);
      alert('Error al exportar a Excel');
    }
  };

  const handleExportPDF = () => {
    if (!data.readings || data.readings.length === 0) {
      return alert('No hay datos para exportar');
    }

    try {
      const doc = new jsPDF({ orientation: 'portrait' });
      
      doc.setFontSize(18);
      doc.setTextColor(0, 100, 124); // Primary color: #00647c
      doc.text('Parque Industrial Jicamarca', 14, 15);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Últimas Lecturas de Consumo por Propietario', 14, 22);
      
      doc.setFontSize(8);
      doc.text(`Fecha de generación: ${new Date().toLocaleString('es-PE')}`, 14, 27);
      
      autoTable(doc, {
        startY: 32,
        head: [['Empresa', 'ID', 'Sector / Manzana', 'Lectura (kWh)', 'Tendencia']],
        body: data.readings.map(r => [
          r.company,
          r.id,
          r.sector,
          r.value.toLocaleString('es-PE', { minimumFractionDigits: 2 }),
          r.trend
        ]),
        headStyles: {
          fillColor: [0, 100, 124], // #00647c
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [242, 244, 246]
        },
        theme: 'striped'
      });
      
      doc.save(`Lecturas_Parque_Industrial_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error al exportar a PDF', error);
      alert('Error al exportar a PDF');
    }
  };

  const handleExportCSV = () => {
    if (!data.readings || data.readings.length === 0) {
      return alert('No hay datos para exportar');
    }

    try {
      const headers = ['Empresa', 'ID', 'Sector', 'Lectura_kWh', 'Tendencia'];
      const rows = data.readings.map(r => [
        `"${r.company.replace(/"/g, '""')}"`,
        r.id,
        `"${r.sector}"`,
        r.value,
        r.trend
      ]);

      const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Lecturas_Parque_Industrial_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al exportar a CSV', error);
      alert('Error al exportar a CSV');
    }
  };

  return (
    <main className={`p-4 md:p-lg space-y-4 md:space-y-lg max-w-[1600px] mx-auto w-full flex-grow transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Sección de Consumo Header con Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg border border-outline-variant shadow-sm">
        <div className="flex flex-col">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Indicadores de Consumo Eléctrico</h2>
          <p className="text-body-sm text-on-surface-variant">KPIs y gráficas basadas en las lecturas de los medidores.</p>
        </div>
        
        <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant shadow-sm">
          <button 
            onClick={() => setChartViewMode('year')}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${chartViewMode === 'year' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
          >
            Año {activeYear}
          </button>
          <button 
            onClick={() => setChartViewMode('global')}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${chartViewMode === 'global' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
          >
            Histórico Global
          </button>
        </div>
      </div>

      {/* KPIs Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md mt-4">
        {/* KPI 1 */}
        <div className="bg-white border border-outline-variant rounded-lg p-md shadow-sm transition-transform hover:-translate-y-0.5 duration-200">
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">Consumo Total Parque</p>
          <div className="flex items-end justify-between">
            <h3 className="font-data-mono text-headline-md text-primary font-bold">
              {typeof data.kpis.totalConsumo === 'number' ? data.kpis.totalConsumo.toLocaleString('es-PE', { maximumFractionDigits: 1 }) : data.kpis.totalConsumo} <span className="text-body-md">kWh</span>
            </h3>
            <span className="text-[12px] text-primary flex items-center gap-xs font-bold mb-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> 2.4%
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-outline-variant rounded-lg p-md shadow-sm transition-transform hover:-translate-y-0.5 duration-200">
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">Mayor Consumo Mensual</p>
          <div className="flex items-end justify-between">
            <h3 className="font-data-mono text-headline-md text-on-surface font-bold">
              {maxConsumo.toLocaleString('es-PE', { maximumFractionDigits: 1 })} <span className="text-body-md text-on-surface-variant">kWh</span>
            </h3>
            <span className="text-[12px] text-tertiary flex items-center gap-xs font-bold mb-1">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> {maxPeriodo}
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-outline-variant rounded-lg p-md shadow-sm transition-transform hover:-translate-y-0.5 duration-200">
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">Menor Consumo Mensual</p>
          <div className="flex items-end justify-between">
            <h3 className="font-data-mono text-headline-md text-on-surface font-bold">
              {minConsumo.toLocaleString('es-PE', { maximumFractionDigits: 1 })} <span className="text-body-md text-on-surface-variant">kWh</span>
            </h3>
            <span className="text-[12px] text-[#4caf50] flex items-center gap-xs font-bold mb-1">
              <span className="material-symbols-outlined text-[14px]">arrow_downward</span> {minPeriodo}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Consumo Global Mensual */}
        <div className="bg-white border border-outline-variant rounded-lg p-md flex flex-col shadow-md h-[350px] lg:h-[400px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-md">
            <div className="flex flex-col">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Consumo Global Mensual</h2>
              <p className="text-body-sm text-on-surface-variant mt-xs">Histórico del consumo acumulado del parque industrial (kWh)</p>
            </div>
          </div>
          
          {/* Chart Area */}
          <div className="flex-grow min-h-0 relative">
            {data.chartData && data.chartData.length > 0 ? (
              <Bar data={chartDataConfig} options={chartOptionsConfig} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant gap-2 opacity-70">
                <span className="material-symbols-outlined text-[40px]">bar_chart_off</span>
                <span className="font-bold text-body-lg">No hay datos de consumo para {activeYear}</span>
              </div>
            )}
          </div>

          {/* Total below chart */}
          {total6Meses > 0 && (
            <div className="flex items-center justify-end gap-sm mt-sm pt-sm border-t border-outline-variant/50">
              <span className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">Total {chartViewMode === 'global' ? 'Histórico' : `${activeYear}`}</span>
              <span className="font-data-mono text-[13px] font-bold text-primary bg-primary/5 px-2.5 py-0.5 rounded-md">{total6Meses.toLocaleString('es-PE', { maximumFractionDigits: 1 })} kWh</span>
            </div>
          )}
        </div>

        {/* Recaudación por Mes */}
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
              <div className="bg-green-50/50 border border-green-200/55 rounded-xl px-md py-xs flex flex-col items-end">
                <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Recaudación Total</span>
                <span className="font-data-mono text-body-md font-bold text-green-700">S/ {totalRecaudado.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>
          
          {/* Chart Area */}
          <div className="flex-grow min-h-0 relative">
            {finalRecaudacionData && finalRecaudacionData.length > 0 ? (
              <Bar data={recaudacionChartConfig} options={recaudacionChartOptions} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant gap-2 opacity-70">
                <span className="material-symbols-outlined text-[40px]">query_stats</span>
                <span className="font-bold text-body-lg">No hay recaudaciones para {activeYear}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accesos Rápidos Section */}
      <div className="bg-white border border-outline-variant rounded-lg p-md shadow-md">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-md">Accesos Rápidos</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
          {[
            { view: 'manual_billing', name: 'Registrar Lectura', icon: 'edit_document', color: 'bg-primary/10 text-primary hover:bg-primary hover:text-on-primary' },
            { view: 'billing', name: 'Facturación', icon: 'receipt_long', color: 'bg-[#107C41]/10 text-[#107C41] hover:bg-[#107C41] hover:text-white' },
            { view: 'payments', name: 'Pagos Recibidos', icon: 'payments', color: 'bg-[#FFB300]/15 text-[#F57F17] hover:bg-[#F57F17] hover:text-white' },
            { view: 'tenants', name: 'Directorio Miembros', icon: 'factory', color: 'bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary' }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate(`/${item.view}`)}
              className={`flex flex-col items-center justify-center p-xl rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-md border border-outline-variant/30 ${item.color} group`}
            >
              <span className="material-symbols-outlined text-[36px] mb-2 group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
              <span className="font-bold text-sm text-center leading-tight">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
