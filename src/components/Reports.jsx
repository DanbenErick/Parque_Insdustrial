import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useYear } from '../context/YearContext';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Bar, Doughnut } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import MemberReport from './MemberReport';
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

const Reports = () => {
  const { activeYear } = useYear();
  const [activeTab, setActiveTab] = useState('general'); // 'general' or 'member'
  const [periodos, setPeriodos] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [recibos, setRecibos] = useState([]);
  const [lecturas, setLecturas] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 5;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [periodosRes, recibosRes, lecturasRes, chartRes] = await Promise.all([
        api.get('/periodos'),
        api.get('/recibos'),
        api.get('/lecturas'),
        api.get('/dashboard/chart')
      ]);

      setPeriodos(periodosRes.data || []);
      setRecibos(recibosRes.data || []);
      setLecturas(lecturasRes.data || []);
      setChartData(chartRes.data || []);

      if (periodosRes.data && periodosRes.data.length > 0) {
        const yearPeriods = periodosRes.data.filter(p => p.mes_anio && p.mes_anio.includes(activeYear.toString()));
        if (yearPeriods.length > 0) {
          setSelectedPeriod(yearPeriods[0].mes_anio);
        } else {
          setSelectedPeriod(periodosRes.data[0].mes_anio);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del reporte:', error);
      toast.error('Error al cargar la información del reporte');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (periodos.length > 0) {
      const yearPeriods = periodos.filter(p => p.mes_anio && p.mes_anio.includes(activeYear.toString()));
      if (yearPeriods.length > 0) {
        setSelectedPeriod(yearPeriods[0].mes_anio);
      }
    }
  }, [activeYear, periodos]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    await fetchData();
    setIsUpdating(false);
    toast.success('Datos actualizados correctamente');
  };

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

  const formatMonthOnly = (p) => {
    if (!p) return '-';
    if (p.includes('-')) {
      const parts = p.split('-');
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      if (parts[0].length === 4) {
        return meses[parseInt(parts[1]) - 1] || parts[1];
      } else {
        return meses[parseInt(parts[0]) - 1] || parts[0];
      }
    }
    return p;
  };

  // Filtered lists
  const filteredRecibos = recibos.filter(r => r.periodo === selectedPeriod || r.mes_anio === selectedPeriod);
  const filteredLecturas = lecturas.filter(l => l.periodo === selectedPeriod);

  // Stats Calculations
  const totalConsumo = filteredLecturas.reduce((sum, l) => sum + (parseFloat(l.consumo_calculado) || 0), 0);
  const totalFacturado = filteredRecibos.reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0);
  const totalRecaudado = filteredRecibos.filter(r => r.estado === 'Pagado').reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0);
  const totalPendiente = filteredRecibos.filter(r => r.estado === 'Pendiente' || r.estado === 'Pago Parcial').reduce((sum, r) => sum + parseFloat(r.saldo_pendiente !== undefined ? r.saldo_pendiente : r.total || 0), 0);
  const tasaRecaudacion = totalFacturado > 0 ? (totalRecaudado / totalFacturado) * 100 : 0;

  // Group by sector/manzana
  const distribution = {};
  filteredLecturas.forEach(l => {
    const sector = l.direccion || 'Sin Dirección';
    distribution[sector] = (distribution[sector] || 0) + (parseFloat(l.consumo_calculado) || 0);
  });

  const sortedDistribution = Object.entries(distribution).map(([sector, value]) => ({
    sector,
    value,
    percent: totalConsumo > 0 ? (value / totalConsumo) * 100 : 0
  })).sort((a, b) => b.value - a.value);

  // Financial history calculation
  const financialHistory = {};
  recibos.forEach(r => {
    const period = r.periodo; // YYYY-MM
    if (period) {
      if (!financialHistory[period]) {
        financialHistory[period] = { facturado: 0, recaudado: 0 };
      }
      const total = parseFloat(r.total) || 0;
      financialHistory[period].facturado += total;
      if (r.estado === 'Pagado') {
        financialHistory[period].recaudado += total;
      }
    }
  });

  const sortedFinancialPeriods = Object.keys(financialHistory)
    .sort((a, b) => a.localeCompare(b))
    .slice(-6);

  const financialChartData = {
    labels: sortedFinancialPeriods.map(p => {
      if (p.includes('-')) {
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
        label: 'Total Facturado (S/)',
        data: sortedFinancialPeriods.map(p => financialHistory[p].facturado),
        backgroundColor: '#00647c',
        hoverBackgroundColor: '#004d60',
        borderRadius: { topLeft: 2, topRight: 6, bottomLeft: 2, bottomRight: 6 },
        barPercentage: 0.55,
        categoryPercentage: 0.7,
      },
      {
        label: 'Total Recaudado (S/)',
        data: sortedFinancialPeriods.map(p => financialHistory[p].recaudado),
        backgroundColor: '#059669',
        hoverBackgroundColor: '#047857',
        borderRadius: { topLeft: 2, topRight: 6, bottomLeft: 2, bottomRight: 6 },
        barPercentage: 0.55,
        categoryPercentage: 0.7,
      }
    ]
  };

  const financialChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          borderRadius: 3,
          useBorderRadius: true,
          padding: 16,
          font: {
            family: 'Hanken Grotesk',
            size: 11,
            weight: '600'
          },
          color: '#475569'
        }
      },
      tooltip: {
        backgroundColor: '#1a1c1e',
        titleColor: '#a0aec0',
        bodyColor: '#ffffff',
        titleFont: { family: 'Hanken Grotesk', size: 10, weight: '600' },
        bodyFont: { family: 'JetBrains Mono', size: 13, weight: 'bold' },
        padding: { top: 10, bottom: 10, left: 14, right: 14 },
        cornerRadius: 10,
        displayColors: true,
        boxWidth: 4,
        boxHeight: 14,
        boxPadding: 6,
        callbacks: {
          label: function (context) {
            return ` ${context.dataset.label}: S/ ${parseFloat(context.raw).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.12)', drawTicks: false, lineWidth: 1 },
        ticks: {
          color: '#94a3b8',
          font: { family: 'JetBrains Mono', size: 10, weight: '500' },
          padding: 8,
          callback: function (value) {
            return `S/ ${value.toLocaleString('es-PE')}`;
          }
        },
        border: { display: false }
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#475569',
          font: { family: 'Hanken Grotesk', size: 11, weight: '600' },
          padding: 8,
        },
        border: { display: false }
      }
    }
  };

  // Doughnut Chart for Current Period Payment Status
  const paidCount = filteredRecibos.filter(r => r.estado === 'Pagado').length;
  const pendingCount = filteredRecibos.filter(r => r.estado === 'Pendiente').length;
  const hasReceipts = paidCount + pendingCount > 0;

  const doughnutData = {
    labels: ['Pagados', 'Pendientes'],
    datasets: [
      {
        data: [paidCount, pendingCount],
        backgroundColor: ['#059669', '#f59e0b'],
        hoverBackgroundColor: ['#047857', '#d97706'],
        borderWidth: 3,
        borderColor: '#ffffff',
        spacing: 2,
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { animateRotate: true, duration: 1000, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          borderRadius: 3,
          useBorderRadius: true,
          padding: 16,
          font: {
            family: 'Hanken Grotesk',
            size: 11,
            weight: '600'
          },
          color: '#475569'
        }
      },
      tooltip: {
        backgroundColor: '#1a1c1e',
        titleColor: '#a0aec0',
        bodyColor: '#ffffff',
        titleFont: { family: 'Hanken Grotesk', size: 10, weight: '600' },
        bodyFont: { family: 'JetBrains Mono', size: 13, weight: 'bold' },
        padding: { top: 10, bottom: 10, left: 14, right: 14 },
        cornerRadius: 10,
        displayColors: true,
        boxWidth: 4,
        boxHeight: 14,
        boxPadding: 6,
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const val = context.raw || 0;
            const total = paidCount + pendingCount;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            return ` ${label}: ${val} recibo(s) (${pct}%)`;
          }
        }
      }
    },
    cutout: '68%'
  };

  // Group detailed table rows
  const memberData = filteredLecturas.map(l => {
    const matchingRecibo = filteredRecibos.find(r => r.miembro === l.propietario);
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
  });

  const topBilledMembers = [...memberData]
    .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
    .slice(0, 5);

  // Filtered members list based on search term
  const filteredMemberData = memberData.filter(m =>
    m.propietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.direccion && m.direccion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPeriod, searchTerm]);

  const totalPages = Math.max(Math.ceil(filteredMemberData.length / itemsPerPage), 1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMemberData.slice(indexOfFirstItem, indexOfLastItem);

  const getSugerencia = () => {
    if (memberData.length === 0) return 'No hay lecturas registradas en este período.';
    const sortedMembers = [...memberData].sort((a, b) => b.consumo - a.consumo);
    const topMember = sortedMembers[0];
    const pendingCount = filteredRecibos.filter(r => r.estado === 'Pendiente').length;

    if (pendingCount > 0) {
      return `La empresa ${topMember.propietario} registra el mayor consumo (${parseFloat(topMember.consumo).toLocaleString('es-PE', { minimumFractionDigits: 2 })} kWh). Quedan ${pendingCount} recibos pendientes por cobrar.`;
    }
    return `La empresa ${topMember.propietario} registra el mayor consumo (${parseFloat(topMember.consumo).toLocaleString('es-PE', { minimumFractionDigits: 2 })} kWh). La cobranza de este mes está al 100%.`;
  };

  const handleExportPDF = () => {
    if (memberData.length === 0) {
      return toast.warning('No hay datos para exportar en este período');
    }

    try {
      const doc = new jsPDF({ orientation: 'portrait' });

      // Top colored bar
      doc.setFillColor(0, 100, 124); // #00647c
      doc.rect(0, 0, 210, 8, 'F');

      // Title & Header details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(0, 100, 124); // #00647c
      doc.text('Parque Industrial Jicamarca S.A.', 14, 22);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('RUC: 20456789123 | Av. Industrial 450, Lima', 14, 28);
      doc.text(`Fecha de emisión: ${new Date().toLocaleString('es-PE')}`, 14, 33);

      // Horizontal separator line
      doc.setDrawColor(220, 224, 230);
      doc.setLineWidth(0.5);
      doc.line(14, 37, 196, 37);

      // Section title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      doc.text(`REPORTE DE CONSUMO Y FACTURACIÓN - PERÍODO: ${formatPeriodo(selectedPeriod).toUpperCase()}`, 14, 45);

      // Summary Card
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, 50, 182, 26, 'FD');

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('RESUMEN GENERAL DEL PERÍODO', 18, 56);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(`Consumo Total: ${totalConsumo.toLocaleString('es-PE', { minimumFractionDigits: 1 })} kWh`, 18, 63);
      doc.text(`Monto Total Facturado: S/ ${totalFacturado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, 18, 70);

      doc.text(`Monto Total Recaudado: S/ ${totalRecaudado.toLocaleString('es-PE', { minimumFractionDigits: 2 })} (${tasaRecaudacion.toFixed(1)}%)`, 100, 63);
      doc.text(`Monto Total Pendiente: S/ ${totalPendiente.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, 100, 70);

      autoTable(doc, {
        startY: 82,
        head: [['Empresa / Propietario', 'Dirección', 'L. Anterior', 'L. Actual', 'Consumo (kWh)', 'Importe (S/)', 'Estado']],
        body: memberData.map(m => [
          m.propietario,
          m.direccion || 'N/A',
          parseFloat(m.lectura_anterior).toFixed(1),
          parseFloat(m.lectura_actual).toFixed(1),
          parseFloat(m.consumo).toFixed(1),
          `S/ ${parseFloat(m.total).toFixed(2)}`,
          m.estado.toUpperCase()
        ]),
        headStyles: {
          fillColor: [0, 100, 124], // #00647c
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [51, 65, 85]
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        theme: 'striped'
      });

      doc.save(`Reporte_Consumo_Facturacion_${selectedPeriod}.pdf`);
      toast.success('Reporte PDF descargado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al exportar reporte a PDF');
    }
  };

  const handleExportExcel = () => {
    if (memberData.length === 0) {
      return toast.warning('No hay datos para exportar en este período');
    }

    try {
      const exportData = memberData.map(m => ({
        'Empresa / Propietario': m.propietario,
        'Dirección': m.direccion || 'N/A',
        'Lectura Anterior': parseFloat(m.lectura_anterior),
        'Lectura Actual': parseFloat(m.lectura_actual),
        'Consumo (kWh)': parseFloat(m.consumo),
        'Importe (S/)': parseFloat(m.total),
        'Estado': m.estado
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Facturación');
      XLSX.writeFile(workbook, `Reporte_Facturacion_${selectedPeriod}.xlsx`);
      toast.success('Reporte Excel descargado exitosamente');
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      toast.error('Error al exportar reporte a Excel');
    }
  };

  const rptConsumoValues = chartData ? chartData.map(d => d.consumo) : [];
  const rptConsumoMax = Math.max(...rptConsumoValues, 0);
  const getRptConsumoColor = (value) => {
    if (value === rptConsumoMax && rptConsumoMax > 0) return '#00647c';
    const ratio = rptConsumoMax > 0 ? value / rptConsumoMax : 0;
    if (ratio > 0.7) return '#0e7490';
    if (ratio > 0.4) return '#22a0b8';
    return '#67cfe0';
  };

  const chartDataConfig = {
    labels: chartData ? chartData.map(d => d.periodo) : [],
    datasets: [
      {
        label: 'Consumo Histórico (kWh)',
        data: rptConsumoValues,
        backgroundColor: rptConsumoValues.map(v => getRptConsumoColor(v)),
        hoverBackgroundColor: '#004d60',
        borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 2, bottomRight: 2 },
        barPercentage: 0.65,
        categoryPercentage: 0.7,
      }
    ]
  };

  const chartOptionsConfig = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1a1c1e',
        titleColor: '#a0aec0',
        bodyColor: '#ffffff',
        titleFont: { family: 'Hanken Grotesk', size: 10, weight: '600' },
        bodyFont: { family: 'JetBrains Mono', size: 14, weight: 'bold' },
        padding: { top: 10, bottom: 10, left: 14, right: 14 },
        cornerRadius: 10,
        displayColors: true,
        boxWidth: 4,
        boxHeight: 14,
        boxPadding: 6,
        callbacks: {
          label: function (context) {
            return ` Consumo: ${parseFloat(context.raw).toLocaleString('es-PE')} kWh`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#64748b',
          font: { family: 'Hanken Grotesk', size: 11, weight: '600' },
          padding: 8,
        },
        border: { display: false }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.12)', drawTicks: false, lineWidth: 1 },
        ticks: {
          color: '#94a3b8',
          font: { family: 'JetBrains Mono', size: 10, weight: '500' },
          padding: 12,
          callback: function (value) {
            return `${value.toLocaleString('es-PE')}`;
          }
        },
        border: { display: false }
      }
    }
  };

  const rptRecaudValues = sortedFinancialPeriods.map(p => financialHistory[p].recaudado);
  const rptRecaudMax = Math.max(...rptRecaudValues, 0);
  const getRptRecaudColor = (value) => {
    if (value === rptRecaudMax && rptRecaudMax > 0) return '#059669';
    const ratio = rptRecaudMax > 0 ? value / rptRecaudMax : 0;
    if (ratio > 0.7) return '#10b981';
    if (ratio > 0.4) return '#34d399';
    return '#6ee7b7';
  };

  const recaudacionChartData = {
    labels: sortedFinancialPeriods.map(p => {
      if (p.includes('-')) {
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
        label: 'Recaudación Mensual (S/)',
        data: rptRecaudValues,
        backgroundColor: rptRecaudValues.map(v => getRptRecaudColor(v)),
        hoverBackgroundColor: '#047857',
        borderRadius: { topLeft: 2, topRight: 6, bottomLeft: 2, bottomRight: 6 },
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      }
    ]
  };

  const recaudacionChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1a1c1e',
        titleColor: '#a0aec0',
        bodyColor: '#ffffff',
        titleFont: { family: 'Hanken Grotesk', size: 10, weight: '600' },
        bodyFont: { family: 'JetBrains Mono', size: 14, weight: 'bold' },
        padding: { top: 10, bottom: 10, left: 14, right: 14 },
        cornerRadius: 10,
        displayColors: true,
        boxWidth: 4,
        boxHeight: 14,
        boxPadding: 6,
        callbacks: {
          label: function (context) {
            return ` Recaudado: S/ ${parseFloat(context.raw).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.12)', drawTicks: false, lineWidth: 1 },
        ticks: {
          color: '#94a3b8',
          font: { family: 'JetBrains Mono', size: 10, weight: '500' },
          padding: 8,
          callback: function (value) {
            return `S/ ${value.toLocaleString('es-PE')}`;
          }
        },
        border: { display: false }
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#475569',
          font: { family: 'Hanken Grotesk', size: 11, weight: '600' },
          padding: 8,
        },
        border: { display: false }
      }
    }
  };

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

  return (
    <main className="p-xl space-y-lg max-w-[1600px] w-full mx-auto flex-grow bg-background">
      <div className="mb-lg">
        <h2 className="font-headline-md text-headline-md font-extrabold text-on-surface">Reportes de Consumo y Facturación Eléctrica</h2>
      </div>

      {/* Filter & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between mb-xl gap-md">
        <div className="flex items-center gap-sm">
          <div className="flex items-center bg-white border border-outline-variant rounded-lg px-sm py-1.5 gap-xs cursor-pointer hover:bg-surface-container-low transition-colors relative">
            <span className="material-symbols-outlined text-body-md text-on-surface-variant">calendar_today</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-body-sm font-bold outline-none border-none pr-8 cursor-pointer appearance-none text-on-surface py-0.5"
            >
              {periodos.filter(p => p.mes_anio && p.mes_anio.includes(activeYear.toString())).map(p => (
                <option key={p.mes_anio} value={p.mes_anio}>
                  {formatMonthOnly(p.mes_anio)}
                </option>
              ))}
              {periodos.filter(p => p.mes_anio && p.mes_anio.includes(activeYear.toString())).length === 0 && (
                <option value="" disabled>Sin periodos en {activeYear}</option>
              )}
            </select>
            <span className="material-symbols-outlined text-body-sm absolute right-2 pointer-events-none text-on-surface-variant">expand_more</span>
          </div>
        </div>
        <div className="flex gap-md">
          <button
            className="flex items-center gap-sm bg-primary text-white px-md py-1.5 rounded-lg hover:opacity-90 transition-opacity font-body-sm font-bold"
            onClick={handleUpdate}
          >
            <span className={`material-symbols-outlined text-body-md ${isUpdating ? 'animate-spin' : ''}`}>refresh</span>
            Actualizar Datos
          </button>
        </div>
      </div>

      {/* High Level Metrics Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
        {/* Metric 1 */}
        <div className="bg-white border border-outline-variant p-md rounded-lg hover:shadow-[0_4px_12px_rgba(15,23,42,0.05)] transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase text-xs font-bold">Consumo Total</span>
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-primary text-body-md" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-data-mono text-[28px] tracking-tight text-on-surface font-bold">
              {totalConsumo.toLocaleString('es-PE', { minimumFractionDigits: 1 })}
            </span>
            <span className="font-body-sm text-on-surface-variant">kWh</span>
          </div>
          <div className="text-on-surface-variant text-[11px] mt-2">
            Consumo total en lecturas del mes
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-outline-variant p-md rounded-lg hover:shadow-[0_4px_12px_rgba(15,23,42,0.05)] transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase text-xs font-bold">Total Facturado</span>
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-primary text-body-md" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
            </div>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-data-mono text-[28px] tracking-tight text-on-surface font-bold">
              S/ {totalFacturado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-on-surface-variant text-[11px] mt-2">
            Monto total de recibos generados
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-outline-variant p-md rounded-lg hover:shadow-[0_4px_12px_rgba(15,23,42,0.05)] transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase text-xs font-bold">Total Recaudado</span>
            <div className="bg-green-100/50 p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-green-700 text-body-md" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            </div>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-data-mono text-[28px] tracking-tight text-green-700 font-bold">
              S/ {totalRecaudado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-green-700 text-[11px] font-bold mt-2">
            Cobrado: {tasaRecaudacion.toFixed(1)}% del total
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-outline-variant p-md rounded-lg hover:shadow-[0_4px_12px_rgba(15,23,42,0.05)] transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase text-xs font-bold">Monto Pendiente</span>
            <div className="bg-amber-100/50 p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-amber-700 text-body-md" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            </div>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-data-mono text-[28px] tracking-tight text-amber-700 font-bold">
              S/ {totalPendiente.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-amber-700 text-[11px] mt-2">
            Por cobrar en este mes
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant mb-lg gap-md">
        <button
          onClick={() => {
            setActiveTab('general');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-xs pb-sm px-xs font-body-md text-body-md font-bold border-b-2 transition-all ${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          <span className="material-symbols-outlined text-[20px]">analytics</span>
          Reporte General
        </button>
        <button
          onClick={() => setActiveTab('member')}
          className={`flex items-center gap-xs pb-sm px-xs font-body-md text-body-md font-bold border-b-2 transition-all ${activeTab === 'member' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          <span className="material-symbols-outlined text-[20px]">pie_chart</span>
          Reporte por Empresa
        </button>
      </div>

      {activeTab === 'general' ? (
        <>
          {/* Visualizations Row 1: Consumption & Collections Trends */}
          <div className="grid grid-cols-12 gap-lg mb-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Consumption Trend Chart */}
            <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant p-lg rounded-lg shadow-sm hover:shadow-[0_4px_12px_rgba(15,23,42,0.03)] transition-shadow">
              <div className="mb-md">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Tendencia de Consumo Histórico</h3>
                <p className="font-body-sm text-on-surface-variant">Consumo global acumulado del parque industrial en los últimos 6 meses</p>
              </div>
              <div className="h-64 w-full relative">
                {chartData && chartData.length > 0 ? (
                  <Bar data={chartDataConfig} options={chartOptionsConfig} />
                ) : (
                  <div className="h-full flex items-center justify-center text-on-surface-variant text-body-sm">
                    No hay datos históricos disponibles.
                  </div>
                )}
              </div>
            </div>

            {/* Recaudación por Mes Chart */}
            <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant p-lg rounded-lg shadow-sm hover:shadow-[0_4px_12px_rgba(15,23,42,0.03)] transition-shadow">
              <div className="mb-md">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Recaudación por Mes</h3>
                <p className="font-body-sm text-on-surface-variant">Monto cobrado en los últimos 6 meses (S/)</p>
              </div>
              <div className="h-64 w-full relative">
                {sortedFinancialPeriods.length > 0 ? (
                  <Bar data={recaudacionChartData} options={recaudacionChartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center text-on-surface-variant text-body-sm">
                    No hay datos históricos disponibles.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Visualizations Row 2: Sector Distribution, Billing vs Collection Comparison & Current Month Status */}
          <div className="grid grid-cols-12 gap-lg mb-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Top Paying Members */}
            <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant p-lg rounded-lg shadow-sm hover:shadow-[0_4px_12px_rgba(15,23,42,0.03)] transition-shadow flex flex-col justify-between h-[340px]">
              <div className="flex flex-col h-full overflow-hidden">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-md">Empresas con Mayor Facturación</h3>
                <div className="space-y-md overflow-y-auto pr-xs flex-grow custom-scrollbar">
                  {topBilledMembers.map(m => {
                    const percent = totalFacturado > 0 ? (parseFloat(m.total) / totalFacturado) * 100 : 0;
                    return (
                      <div key={m.id} className="group/item">
                        <div className="flex justify-between items-center mb-xs">
                          <span className="font-body-sm font-bold text-on-surface flex items-center gap-xs truncate max-w-[60%]">
                            <span className="material-symbols-outlined text-[16px] text-primary/70">corporate_fare</span>
                            <span className="truncate" title={m.propietario}>{m.propietario}</span>
                          </span>
                          <div className="text-right flex items-center gap-xs">
                            <span className="font-data-mono text-body-sm font-bold text-primary">S/ {parseFloat(m.total).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <span className={`inline-block w-2 h-2 rounded-full ${m.estado === 'Pagado' ? 'bg-green-500' : 'bg-yellow-500'}`} title={m.estado}></span>
                          </div>
                        </div>
                        <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${m.estado === 'Pagado' ? 'bg-green-600' : 'bg-primary'}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                  {topBilledMembers.length === 0 && (
                    <div className="text-center text-on-surface-variant text-body-sm py-lg flex flex-col items-center justify-center h-full">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-xs">payments</span>
                      No hay datos de facturación para el periodo seleccionado.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Financial History Chart (Billed vs Collected) */}
            <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant p-lg rounded-lg shadow-sm hover:shadow-[0_4px_12px_rgba(15,23,42,0.03)] transition-shadow h-[340px] flex flex-col justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Comparativa de Cobranza</h3>
                <p className="font-body-sm text-on-surface-variant mb-xs">Facturado vs Recaudado en los últimos 6 meses (S/)</p>
              </div>
              <div className="h-[220px] w-full relative flex-grow animate-in fade-in duration-300">
                {sortedFinancialPeriods.length > 0 ? (
                  <Bar data={financialChartData} options={financialChartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center text-on-surface-variant text-body-sm">
                    No hay datos financieros históricos disponibles.
                  </div>
                )}
              </div>
            </div>

            {/* Current Period Payment Status Doughnut & Sugerencia */}
            <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant p-lg rounded-lg shadow-sm hover:shadow-[0_4px_12px_rgba(15,23,42,0.03)] transition-shadow h-[340px] flex flex-col justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Estado del Período</h3>
                <p className="font-body-sm text-on-surface-variant mb-xs">Recibos pagados vs pendientes del mes actual</p>
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
                  <div className="h-full flex items-center justify-center text-on-surface-variant text-body-sm">
                    No hay recibos en este período.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* High-Density Data Table */}
          <div className="bg-white border border-outline-variant rounded-lg overflow-hidden">
            <div className="px-lg py-md border-b border-outline-variant flex flex-col xl:flex-row justify-between items-start xl:items-center gap-md bg-surface-container-lowest">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Detalle de Lecturas y Facturación</h3>
              <div className="flex flex-wrap items-center gap-md w-full xl:w-auto justify-between xl:justify-end">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Buscar miembro o dirección..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-full pl-9 pr-4 py-1.5 text-body-sm text-on-surface focus:border-primary outline-none transition-all"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                </div>
                <div className="flex items-center gap-sm">
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 px-md py-2 bg-[#107C41]/10 text-[#107C41] hover:bg-[#107C41]/20 font-bold text-xs rounded-lg transition-colors border border-[#107C41]/20 h-[36px]"
                  >
                    <span className="material-symbols-outlined text-[18px]">table_view</span>
                    Excel
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-md py-2 bg-error/10 text-error hover:bg-error/20 font-bold text-xs rounded-lg transition-colors border border-error/20 h-[36px]"
                  >
                    <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                    PDF
                  </button>
                </div>
                <span className="text-body-sm text-on-surface-variant whitespace-nowrap">
                  Mostrando {filteredMemberData.length} registros
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-lg py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider text-xs font-bold">Miembro / Propietario</th>
                    <th className="px-lg py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider text-xs font-bold">Dirección</th>
                    <th className="px-lg py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider text-xs font-bold text-right">L. Anterior</th>
                    <th className="px-lg py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider text-xs font-bold text-right">L. Actual</th>
                    <th className="px-lg py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider text-xs font-bold text-right">Consumo (kWh)</th>
                    <th className="px-lg py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider text-xs font-bold text-right">Monto Total</th>
                    <th className="px-lg py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider text-xs font-bold text-center">Estado de Pago</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm divide-y divide-outline-variant">
                  {currentItems.map((m) => (
                    <tr key={m.id} className="hover:bg-surface-container-low/30 transition-colors h-[48px]">
                      <td className="px-lg py-3 font-bold text-on-surface">{m.propietario}</td>
                      <td className="px-lg py-3 text-on-surface-variant">{m.direccion || 'N/A'}</td>
                      <td className="px-lg py-3 font-data-mono text-right">{parseFloat(m.lectura_anterior).toLocaleString('es-PE', { minimumFractionDigits: 1 })}</td>
                      <td className="px-lg py-3 font-data-mono text-right">{parseFloat(m.lectura_actual).toLocaleString('es-PE', { minimumFractionDigits: 1 })}</td>
                      <td className="px-lg py-3 font-data-mono text-right font-bold text-primary">{parseFloat(m.consumo).toLocaleString('es-PE', { minimumFractionDigits: 1 })}</td>
                      <td className="px-lg py-3 font-data-mono text-right font-bold text-on-surface">S/ {parseFloat(m.total).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                      <td className="px-lg py-3 text-center">
                        <span className={`inline-flex items-center gap-xs px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${m.estado === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {m.estado === 'Pagado' ? 'check_circle' : 'schedule'}
                          </span>
                          {m.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredMemberData.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-lg py-lg text-center text-on-surface-variant text-body-sm">
                        No se encontraron lecturas registradas en este período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredMemberData.length > 0 && (
              <div className="px-lg py-md border-t border-outline-variant bg-surface-container-low flex justify-between items-center">
                <span className="font-body-sm text-on-surface-variant">
                  Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredMemberData.length)} de {filteredMemberData.length} registros
                </span>
                <div className="flex items-center gap-md">
                  <span className="font-body-sm text-on-surface-variant">Página {currentPage} de {totalPages}</span>
                  <div className="flex gap-xs">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center bg-white hover:bg-surface-container-high disabled:opacity-50"
                      disabled={currentPage === 1}
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center bg-white hover:bg-surface-container-high disabled:opacity-50"
                      disabled={currentPage === totalPages}
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
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
