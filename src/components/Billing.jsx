import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ReceiptDetail from './ReceiptDetail';
import { useYear } from '../context/YearContext';
import GenerateInvoicesModal from './GenerateInvoicesModal';

const Billing = () => {
  const { activeYear } = useYear();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [periodoToGenerate, setPeriodoToGenerate] = useState(null);
  const [recibos, setRecibos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Nuevos Estados Premium
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterMes, setFilterMes] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfId, setPdfId] = useState(null);
  const [drawerReceiptId, setDrawerReceiptId] = useState(null);

  const [isRefacturarModalOpen, setIsRefacturarModalOpen] = useState(false);
  const [refacturarReceiptId, setRefacturarReceiptId] = useState(null);
  const [refacturarMotivo, setRefacturarMotivo] = useState('');
  const [isRefacturando, setIsRefacturando] = useState(false);

  const [showDeudasModal, setShowDeudasModal] = useState(false);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [globalStats, setGlobalStats] = useState({
    totalRecaudado: 0,
    pendienteCobro: 0,
    usuariosPendientes: 0,
    deudaVencida: 0,
    usuariosVencidos: 0
  });

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const params = {};

      if (filterMes && filterMes !== 'Todos' && filterMes !== 'TodosHistorico') {
        params.periodo = filterMes;
      } else if (filterMes === 'Todos') {
        params.year = activeYear;
      }

      if (filterEstado !== 'Todos') {
        params.estado = filterEstado;
      }

      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      const [resRecibos, resPeriodos, resStats] = await Promise.all([
        api.get('/recibos', { params }),
        api.get('/periodos'),
        api.get('/recibos/stats/global', { params })
      ]);
      setRecibos(resRecibos.data);
      setPeriodos(resPeriodos.data);
      setGlobalStats(resStats.data);
    } catch (err) {
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterMes, filterEstado, debouncedSearchTerm, activeYear]);

  const handleViewPdf = async (id) => {
    try {
      const response = await api.get(`/recibos/${id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfId(id);
      setIsPdfModalOpen(true);
    } catch (error) {
      toast.error('Error al cargar el PDF');
    }
  };

  const handleViewPdfV2 = async (id) => {
    try {
      const response = await api.get(`/recibos/${id}/pdf-v2`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfId(id);
      setIsPdfModalOpen(true);
    } catch (error) {
      toast.error('Error al cargar el PDF V2');
    }
  };

  const handleViewPdfV3 = async (id) => {
    try {
      const response = await api.get(`/recibos/${id}/pdf-v3`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfId(id);
      setIsPdfModalOpen(true);
    } catch (error) {
      toast.error('Error al cargar el PDF V3');
    }
  };

  const handleWhatsApp = async (recibo) => {
    if (!recibo.telefono) {
      return toast.error('El socio no tiene un número de teléfono registrado.');
    }
    
    // Formatear el número (quitar espacios, agregar prefijo +51 si no lo tiene)
    let phone = recibo.telefono.replace(/\s+/g, '');
    if (!phone.startsWith('+')) {
      if (phone.length === 9) phone = '51' + phone; // Asumimos Perú
    } else {
      phone = phone.replace('+', '');
    }

    // Preparar el mensaje
    const total = parseFloat(recibo.total).toLocaleString('en-US', { minimumFractionDigits: 2 });
    const fechaVen = recibo.fecha_vencimiento ? new Date(recibo.fecha_vencimiento).toLocaleDateString('es-PE') : '-';
    const text = `Hola *${recibo.socio}*, se ha generado tu recibo de luz del periodo *${recibo.periodo}*.\n\n*Total a pagar:* S/ ${total}\n*Vencimiento:* ${fechaVen}\n\nAdjunto tu recibo detallado en PDF. Gracias por tu pago puntual.`;
    const encodedText = encodeURIComponent(text);
    
    // Descargar el PDF (V3 Premium) automáticamente para que el usuario pueda enviarlo
    try {
      toast.success('Descargando PDF para enviar por WhatsApp...', { duration: 2000 });
      const response = await api.get(`/recibos/${recibo.id}/pdf-v3`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Recibo_${recibo.periodo}_${recibo.socio.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Error al descargar el PDF.');
    }

    // Abrir WhatsApp
    window.open(`https://wa.me/${phone}?text=${encodedText}`, '_blank');
  };

  const handleExportExcel = async () => {
    try {
      const params = {};
      if (filterMes && filterMes !== 'Todos' && filterMes !== 'TodosHistorico') {
        params.periodo = filterMes;
      } else if (filterMes === 'Todos') {
        params.year = activeYear;
      }
      if (filterEstado !== 'Todos') {
        params.estado = filterEstado;
      }
      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      const response = await api.get('/recibos/reporte/excel', { params, responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Reporte_Facturacion.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar el Excel');
    }
  };

  const handleExportExcelDeudas = async (tipo) => {
    try {
      setShowDeudasModal(false);
      let queryParams = '';
      if (tipo === 'mensual' && filterMes && filterMes !== 'Todos' && filterMes !== 'TodosHistorico') {
        queryParams = `?periodo=${filterMes}`;
      }
      const response = await api.get(`/recibos/reportes/deudas/excel${queryParams}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_Deudas_${tipo === 'mensual' ? (filterMes !== 'Todos' ? filterMes : 'Global') : 'Historico_General'}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel de Deudas descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar el Excel de Deudas');
    }
  };

  const handleExportExcelSinMedidor = async () => {
    try {
      const params = {};
      if (filterMes && filterMes !== 'Todos' && filterMes !== 'TodosHistorico') {
        params.periodo = filterMes;
      } else if (filterMes === 'Todos') {
        params.year = activeYear;
      }

      const response = await api.get('/recibos/reporte/excel-sin-medidor', { params, responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_SinMedidor_${filterMes || activeYear}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar el Excel de Sin Medidor');
    }
  };
  const handleExportAllPdfV2 = async () => {
    try {
      const params = {};
      const selectedMes = filterMes !== 'Todos' && filterMes !== 'TodosHistorico' ? filterMes : (uniqueMonths.length > 0 ? uniqueMonths[0] : null);
      
      if (selectedMes) {
        params.periodo = selectedMes;
      } else if (filterMes === 'Todos') {
        params.year = activeYear;
      }

      if (filterEstado !== 'Todos') {
        params.estado = filterEstado;
      }
      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      toast.loading('Generando PDF masivo...', { id: 'pdfMasivo' });
      const response = await api.get('/recibos/export/all-v2', { params, responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recibos_masivos_${params.periodo || 'todos'}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('PDF masivo generado con éxito', { id: 'pdfMasivo' });
    } catch (error) {
      toast.error('Error al generar el PDF masivo', { id: 'pdfMasivo' });
    }
  };

  const handleOpenRefacturar = (id) => {
    setRefacturarReceiptId(id);
    setRefacturarMotivo('');
    setIsRefacturarModalOpen(true);
  };

  const handleRefacturarSubmit = async (e) => {
    e.preventDefault();
    if (!refacturarMotivo.trim()) return toast.error('El motivo es obligatorio.');
    if (refacturarMotivo.trim().length < 5) return toast.error('Ingrese un motivo más detallado.');

    setIsRefacturando(true);
    try {
      const res = await api.post(`/recibos/${refacturarReceiptId}/refacturar`, { motivo: refacturarMotivo });
      toast.success(res.data.message || 'Recibo refacturado exitosamente');
      setIsRefacturarModalOpen(false);
      setRefacturarMotivo('');
      fetchData(); // Recargar datos
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al refacturar recibo');
    } finally {
      setIsRefacturando(false);
    }
  };

  const handleExportPDF = async () => {
    if (!filteredRecibos || filteredRecibos.length === 0) {
      return toast.error('No hay recibos para exportar');
    }

    try {
      const doc = new jsPDF({ orientation: 'landscape' });

      // Intentar cargar logo
      let logoBase64 = null;
      try {
        const response = await fetch('/logo.png');
        const blob = await response.blob();
        logoBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn('No se pudo cargar el logo', e);
      }

      // ==========================================
      // DISEÑO PREMIUM DEL REPORTE PDF (Ecológico/Impresión)
      // ==========================================

      // 1. Header Principal (Fondo Blanco, Acentos Azules)
      // Línea decorativa superior sutil
      doc.setFillColor(31, 73, 125); // #1F497D
      doc.rect(0, 0, 297, 4, 'F');

      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 14, 10, 24, 24);
      } else {
        doc.setDrawColor(31, 73, 125);
        doc.circle(26, 22, 10, 'S');
        doc.setTextColor(31, 73, 125);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('P', 23, 27);
      }

      doc.setTextColor(31, 73, 125);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text('Parque Industrial Jicamarca', 45, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text('Anexo 8 - Huarochirí', 45, 28);

      // Título Reporte a la derecha
      doc.setFontSize(12);
      doc.setTextColor(31, 73, 125);
      doc.setFont("helvetica", "bold");
      doc.text('REPORTE GENERAL DE FACTURACIÓN', 280, 18, { align: 'right' });

      let headerTitle = filterMes !== 'Todos' && filterMes !== 'TodosHistorico'
        ? formatPeriod(filterMes)
        : filterMes === 'Todos' ? `Todos los mese (${activeYear})` : `Histórico General`;

      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");
      doc.text(`Periodo: ${headerTitle}`, 280, 25, { align: 'right' });

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generado: ${new Date().toLocaleDateString('es-PE')} ${new Date().toLocaleTimeString('es-PE')}`, 280, 31, { align: 'right' });

      // Línea divisoria
      doc.setDrawColor(230, 230, 230);
      doc.line(14, 38, 283, 38);

      // 2. Sección de KPIs (Tarjetas Resumen)
      const tEmitido = filteredRecibos.reduce((acc, r) => acc + parseFloat(r.total || 0), 0);
      const tPagado = filteredRecibos.filter(r => r.estado === 'Pagado').reduce((acc, r) => acc + parseFloat(r.total || 0), 0);
      const tPendiente = filteredRecibos.filter(r => r.estado === 'Pendiente').reduce((acc, r) => acc + parseFloat(r.total || 0), 0);
      const tVencido = filteredRecibos.filter(r => r.estado === 'Vencido').reduce((acc, r) => acc + parseFloat(r.total || 0), 0);

      const drawKpiCard = (x, y, title, amount, colorCode, bgColor) => {
        doc.setDrawColor(220, 220, 220);
        doc.setFillColor(...bgColor);
        doc.roundedRect(x, y, 62, 22, 3, 3, 'FD'); // Filled and Stroked
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "bold");
        doc.text(title, x + 5, y + 8);
        doc.setFontSize(14);
        doc.setTextColor(...colorCode);
        doc.text(`S/ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, x + 5, y + 17);
      };

      let startY = 52;
      drawKpiCard(14, startY, 'TOTAL EMITIDO', tEmitido, [31, 73, 125], [240, 244, 248]);
      drawKpiCard(81, startY, 'RECAUDADO (Pagado)', tPagado, [21, 128, 61], [240, 253, 244]);
      drawKpiCard(148, startY, 'PENDIENTE', tPendiente, [180, 83, 9], [255, 251, 235]);
      drawKpiCard(215, startY, 'VENCIDO', tVencido, [225, 29, 72], [255, 241, 242]);

      // 3. Tabla Principal con AutoTable
      autoTable(doc, {
        startY: 82,
        head: [['N° Comprobante', 'Socio', 'Documento', 'Periodo', 'Total', 'Vencimiento', 'Estado']],
        body: filteredRecibos.map(r => [
          r.numero_comprobante || '-',
          r.socio || 'Desconocido',
          r.documento_identidad || '-',
          formatPeriod(r.periodo) || 'N/A',
          `S/ ${parseFloat(r.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          r.fecha_vencimiento ? new Date(r.fecha_vencimiento).toLocaleDateString('es-PE') : '-',
          r.estado || 'Desconocido'
        ]),
        headStyles: {
          fillColor: [31, 73, 125],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 9
        },
        bodyStyles: {
          textColor: [60, 60, 60],
          halign: 'center',
          fontSize: 8,
          cellPadding: 4
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252] // Slate 50
        },
        columnStyles: {
          1: { halign: 'left', fontStyle: 'bold', textColor: [31, 73, 125] }, // Socio a la izquierda y destacado
          4: { fontStyle: 'bold' } // Total en negrita
        },
        didParseCell: function (data) {
          // Colorear el texto de la columna de Estado
          if (data.section === 'body' && data.column.index === 6) {
            const estado = data.cell.raw;
            if (estado === 'Pagado') {
              data.cell.styles.textColor = [21, 128, 61]; // Verde
              data.cell.styles.fontStyle = 'bold';
            } else if (estado === 'Pendiente') {
              data.cell.styles.textColor = [180, 83, 9]; // Naranja
              data.cell.styles.fontStyle = 'bold';
            } else if (estado === 'Vencido') {
              data.cell.styles.textColor = [225, 29, 72]; // Rojo
              data.cell.styles.fontStyle = 'bold';
            }
          }
        },
        didDrawPage: (data) => {
          // Footer Elegante
          const pageCount = doc.internal.getNumberOfPages();
          doc.setDrawColor(200, 200, 200);
          doc.line(14, doc.internal.pageSize.height - 15, 283, doc.internal.pageSize.height - 15);

          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.setFont("helvetica", "normal");
          doc.text('Sistema de Gestión Eléctrica - Parque Industrial Jicamarca', 14, doc.internal.pageSize.height - 8);
          doc.text(`Página ${pageCount}`, 280, doc.internal.pageSize.height - 8, { align: 'right' });
        }
      });

      const pdfOutput = doc.output('blob');
      const url = window.URL.createObjectURL(pdfOutput);
      setPdfUrl(url);
      setPdfId('Reporte_Facturacion');
      setIsPdfModalOpen(true);
      toast.success('Reporte PDF generado exitosamente');
    } catch (error) {
      toast.error('Error al generar el PDF');
    }
  };

  const downloadPdfFromModal = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = pdfId === 'Reporte_Facturacion' ? 'Reporte_Facturacion.pdf' : `recibo_${pdfId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('PDF descargado exitosamente');
  };

  const closePdfModal = () => {
    setIsPdfModalOpen(false);
    setTimeout(() => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    }, 300);
  };

  const formatPeriod = (periodoStr) => {
    if (!periodoStr) return '';
    const parts = periodoStr.split('-');
    if (parts.length !== 2) return periodoStr;
    const year = parts[0].length === 4 ? parts[0] : parts[1];
    const month = parts[0].length === 4 ? parts[1] : parts[0];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthIndex = parseInt(month, 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) return `${monthNames[monthIndex]} ${year}`;
    return periodoStr;
  };

  const uniqueMonths = periodos
    .filter(p => p.mes_anio && p.mes_anio.includes(activeYear.toString()))
    .map(p => p.mes_anio)
    .sort()
    .reverse();

  // Al usar Server-Side Filtering, recibos ya viene con los filtros aplicados
  const filteredRecibos = recibos;
  const totalRecaudado = parseFloat(globalStats?.totalRecaudado || 0);
  const pendienteCobro = parseFloat(globalStats?.pendienteCobro || 0);
  const usuariosPendientes = parseInt(globalStats?.usuariosPendientes || 0, 10);
  const deudaVencida = parseFloat(globalStats?.deudaVencida || 0);
  const usuariosVencidos = parseInt(globalStats?.usuariosVencidos || 0, 10);

  // Lógica de Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecibos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecibos.length / itemsPerPage);

  // Reiniciar página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterEstado, filterMes]);

  return (
    <main className="p-4 md:p-xl space-y-4 md:space-y-lg max-w-[1600px] mx-auto w-full flex-grow">
      {/* Resumen de Facturación */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-md mb-lg">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Módulo de Facturación</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Ciclo activo: <span className="font-bold text-on-surface">{filterMes === 'TodosHistorico' ? 'Histórico General' : (filterMes !== 'Todos' ? formatPeriod(filterMes) : (uniqueMonths.length > 0 ? formatPeriod(uniqueMonths[0]) : 'Actual'))}</span>
          </p>
        </div>
        <div className="flex items-end gap-md">
          <div className="flex flex-col hidden lg:flex">
            <label className="font-label-caps text-[10px] text-on-surface-variant mb-1.5 uppercase tracking-wider">Periodo a Filtrar</label>
            <div className="relative h-[42px] min-w-[160px]">
              <select
                value={filterMes}
                onChange={(e) => setFilterMes(e.target.value)}
                className="bg-white border border-outline-variant rounded-lg font-body-sm text-body-sm pl-md pr-xl h-full w-full focus:border-primary focus:ring-1 focus:ring-primary appearance-none transition-all cursor-pointer hover:bg-surface-container-low"
              >
                <option value="Todos">Todos los meses ({activeYear})</option>
                <option value="TodosHistorico">Histórico (Todos los años)</option>
                {uniqueMonths.map(m => (
                  <option key={m} value={m}>{formatPeriod(m)}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-body-md">expand_more</span>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={filterMes === 'Todos' || filterMes === 'TodosHistorico'}
              className={`px-lg h-[42px] flex items-center gap-xs rounded-lg transition-opacity shadow-md font-bold font-body-sm uppercase tracking-wide ${
                (filterMes === 'Todos' || filterMes === 'TodosHistorico')
                  ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-70'
                  : 'bg-primary text-on-primary hover:opacity-90'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Generar Facturas</span>
              <span className="material-symbols-outlined text-[16px] ml-1">{isDropdownOpen ? 'expand_less' : 'expand_more'}</span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface border border-outline-variant rounded-lg shadow-lg z-50 py-sm">
                <button
                  className="w-full text-left px-md py-sm hover:bg-surface-container-low flex items-center gap-sm text-body-sm text-on-surface"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    const selected = filterMes !== 'Todos' ? filterMes : uniqueMonths[0];
                    if (!selected) return toast.error('No hay periodos disponibles para generar.');
                    const periodoObj = periodos.find(p => p.mes_anio === selected);
                    if (periodoObj) {
                      setPeriodoToGenerate(periodoObj.id);
                      setIsGenerateModalOpen(true);
                    } else {
                      toast.error('Periodo no encontrado.');
                    }
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  Generar del mes seleccionado
                </button>
                <div className="h-px bg-outline-variant/50 my-1"></div>
                <button
                  className="w-full text-left px-md py-sm hover:bg-surface-container-low flex items-center gap-sm text-body-sm text-on-surface"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleExportAllPdfV2();
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                  Descargar todas en PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary KPIs - Ultra Compact Banner Design */}
      <div className="bg-white border border-outline-variant/60 rounded-xl shadow-sm mb-lg flex flex-col relative overflow-hidden">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-outline-variant/40">
          
          {/* Metric 1: Total Recaudado */}
          <div className="flex-1 p-4 lg:px-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-[18px]">account_balance_wallet</span>
                <p className="text-on-surface-variant text-[11px] font-label-caps uppercase tracking-wider">Total Recaudado</p>
                <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">META 95%</span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-display text-[28px] font-bold text-on-surface tracking-tight">S/ {totalRecaudado.toFixed(2)}</h3>
                <span className="text-xs text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded hidden xl:inline-block">
                  {(totalRecaudado + pendienteCobro) > 0 ? Math.round((totalRecaudado / (totalRecaudado + pendienteCobro)) * 100) : 0}% emitido
                </span>
              </div>
            </div>
          </div>

          {/* Metric 2: Pendiente de Cobro */}
          <div className="flex-1 p-4 lg:px-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-tertiary text-[18px]">pending_actions</span>
                <p className="text-on-surface-variant text-[11px] font-label-caps uppercase tracking-wider">Pendiente de Cobro</p>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-display text-[28px] font-bold text-on-surface tracking-tight">S/ {pendienteCobro.toFixed(2)}</h3>
                <span className="text-xs text-on-surface-variant font-medium">
                  • {usuariosPendientes} Empresa(s)
                </span>
              </div>
            </div>
          </div>

          {/* Metric 3: Deuda Vencida */}
          <div className="flex-1 p-4 lg:px-6 flex items-center justify-between bg-error/5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-error text-[18px]">warning</span>
                <p className="text-error/80 text-[11px] font-label-caps uppercase tracking-wider">Deuda Vencida (&gt;30 días)</p>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-display text-[28px] font-bold text-error tracking-tight">S/ {deudaVencida.toFixed(2)}</h3>
                <span className="text-xs text-error font-medium">
                  • {usuariosVencidos} en riesgo
                </span>
              </div>
            </div>
          </div>

        </div>
        
        {/* Global Progress Bar embedded at the bottom of the banner - 100% Stacked Bar */}
        <div className="h-4 w-full bg-surface-variant flex relative group">
          {(() => {
            const total = totalRecaudado + pendienteCobro + deudaVencida;
            if (total === 0) return <div className="h-full w-full bg-surface-variant"></div>;
            
            const wRecaudado = (totalRecaudado / total) * 100;
            const wPendiente = (pendienteCobro / total) * 100;
            const wVencida = (deudaVencida / total) * 100;
            
            return (
              <>
                {wRecaudado > 0 && (
                  <div 
                    className="h-full bg-primary transition-all duration-1000 flex items-center justify-center relative overflow-hidden" 
                    style={{ width: `${wRecaudado}%` }}
                    title={`Recaudado: ${wRecaudado.toFixed(1)}%`}
                  >
                    {wRecaudado > 5 && <span className="text-[10px] text-white font-bold">{wRecaudado.toFixed(1)}%</span>}
                  </div>
                )}
                {wPendiente > 0 && (
                  <div 
                    className="h-full bg-tertiary transition-all duration-1000 flex items-center justify-center relative overflow-hidden" 
                    style={{ width: `${wPendiente}%` }}
                    title={`Pendiente: ${wPendiente.toFixed(1)}%`}
                  >
                    {wPendiente > 5 && <span className="text-[10px] text-white font-bold">{wPendiente.toFixed(1)}%</span>}
                  </div>
                )}
                {wVencida > 0 && (
                  <div 
                    className="h-full bg-error transition-all duration-1000 flex items-center justify-center relative overflow-hidden" 
                    style={{ width: `${wVencida}%` }}
                    title={`Deuda Vencida: ${wVencida.toFixed(1)}%`}
                  >
                    {wVencida > 5 && <span className="text-[10px] text-white font-bold">{wVencida.toFixed(1)}%</span>}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Socios Table Area */}
      <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-md">
        {/* Cabecera Principal */}
        <div className="px-md lg:px-lg py-md border-b border-outline-variant flex flex-col xl:flex-row justify-between items-start xl:items-center gap-md bg-surface-container-low">
          <div className="flex items-center">
            <h4 className="text-title-md font-bold text-on-surface">Detalle de Facturación por Empresa</h4>
          </div>
          <div className="flex flex-wrap items-center gap-sm w-full md:w-auto">
            {/* Buscador */}
            <div className="relative flex-grow md:flex-grow-0">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                type="text"
                placeholder="Buscar socio o doc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white w-full md:w-64 transition-all h-[38px]"
              />
            </div>

            {/* Botón Filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-md py-2 font-bold text-sm rounded-lg transition-colors border h-[38px] ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container'}`}
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filtros {(filterEstado !== 'Todos') && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-md py-2 bg-[#107C41]/10 text-[#107C41] hover:bg-[#107C41]/20 font-bold text-sm rounded-lg transition-colors border border-[#107C41]/20 h-[38px]"
            >
              <span className="material-symbols-outlined text-[18px]">table_view</span>
              Excel
            </button>
            <button
              onClick={() => setShowDeudasModal(true)}
              className="flex items-center gap-2 px-md py-2 bg-[#ea580c]/10 text-[#ea580c] hover:bg-[#ea580c]/20 font-bold text-sm rounded-lg transition-colors border border-[#ea580c]/20 h-[38px]"
            >
              <span className="material-symbols-outlined text-[18px]">request_quote</span>
              Reporte Deudas
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-md py-2 bg-error/10 text-error hover:bg-error/20 font-bold text-sm rounded-lg transition-colors border border-error/20 h-[38px]"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              PDF
            </button>
          </div>
        </div>

        {/* Panel de Filtros Desplegable */}
        {showFilters && (
          <div className="px-lg py-sm border-b border-outline-variant bg-surface-container-lowest flex flex-wrap items-center gap-md animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-on-surface-variant">Mes:</span>
              <select
                value={filterMes}
                onChange={(e) => setFilterMes(e.target.value)}
                className="border border-outline-variant rounded-lg font-body-sm text-body-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary px-3 py-1.5 cursor-pointer"
              >
                <option value="Todos">Todos los meses ({activeYear})</option>
                <option value="TodosHistorico">Histórico (Todos los años)</option>
                {uniqueMonths.map(m => (
                  <option key={m} value={m}>{formatPeriod(m)}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-on-surface-variant">Estado del Recibo:</span>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="border border-outline-variant rounded-lg font-body-sm text-body-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary px-3 py-1.5 cursor-pointer"
              >
                <option value="Todos">Todos</option>
                <option value="Pagado">Pagados</option>
                <option value="Pendiente">Pendientes</option>
                <option value="Vencido">Vencidos</option>
                <option value="Anulado">Anulados</option>
              </select>
            </div>

            {(filterEstado !== 'Todos') && (
              <button
                onClick={() => setFilterEstado('Todos')}
                className="text-xs font-bold text-error hover:underline ml-auto flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
                Limpiar Filtro
              </button>
            )}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse zebra-table">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-[11px] uppercase tracking-wider">
                <th className="px-3 py-2.5 md:px-4 md:py-3 border-b border-outline-variant">EMPRESA</th>
                <th className="px-3 py-2.5 md:px-4 md:py-3 border-b border-outline-variant">PERIODO</th>
                <th className="px-3 py-2.5 md:px-4 md:py-3 border-b border-outline-variant">MONTO</th>
                <th className="px-3 py-2.5 md:px-4 md:py-3 border-b border-outline-variant">VENCIMIENTO</th>
                <th className="px-3 py-2.5 md:px-4 md:py-3 border-b border-outline-variant text-center">ESTADO</th>
                <th className="px-3 py-2.5 md:px-4 md:py-3 border-b border-outline-variant text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-body-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center p-4">Cargando recibos...</td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-on-surface-variant font-medium">No se encontraron recibos con estos filtros.</td>
                </tr>
              ) : (
                currentItems.map((recibo) => (
                  <tr key={recibo.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-3 py-2.5 md:px-4 md:py-3 group/name relative">
                      <button 
                        onClick={() => setDrawerReceiptId(recibo.id)}
                        className="font-body-sm text-body-sm font-bold text-primary hover:text-primary-container hover:underline transition-colors flex items-center gap-1 text-left relative group/tooltip"
                      >
                        {recibo.socio || 'Desconocido'}
                        <span className="material-symbols-outlined text-[16px] opacity-0 group-hover/name:opacity-100 transition-opacity">open_in_new</span>
                        
                        {/* Custom Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold tracking-wider rounded opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                          Ver detalles
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-inverse-surface"></div>
                        </div>
                      </button>
                      <p className="font-data-mono text-[11px] text-on-surface-variant mt-0.5">DNI/RUC: {recibo.documento_identidad}</p>
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3">
                      <span className="bg-surface-variant text-on-surface-variant px-sm py-[2px] rounded text-[10px] font-bold uppercase tracking-wide">
                        {formatPeriod(recibo.periodo) || 'N/A'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 font-data-mono text-body-sm text-on-surface">
                      S/ {parseFloat(recibo.total).toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 font-body-sm text-body-sm text-on-surface-variant">
                      {recibo.fecha_vencimiento ? new Date(recibo.fecha_vencimiento).toLocaleDateString('es-PE') : '-'}
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 text-center">
                      <span className={`inline-flex items-center gap-xs px-xs py-[2px] rounded text-[10px] font-bold uppercase tracking-tight ${recibo.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' : recibo.estado === 'Pagado' ? 'bg-green-100 text-green-700' : recibo.estado === 'Anulado' ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-700'}`}>
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {recibo.estado === 'Pagado' ? 'check_circle' : recibo.estado === 'Pendiente' ? 'schedule' : recibo.estado === 'Anulado' ? 'cancel' : 'error'}
                        </span>
                        {recibo.estado}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3">
                      <div className="flex justify-end gap-sm">
                        <button
                          onClick={() => handleViewPdfV3(recibo.id)}
                          className="group/tooltip relative text-error hover:bg-error/10 p-1.5 rounded-full transition-colors flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold tracking-wider rounded opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                            Ver Recibo
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-inverse-surface"></div>
                          </div>
                        </button>
                        <button
                          onClick={() => handleWhatsApp(recibo)}
                          className="group/tooltip relative text-[#25D366] hover:bg-[#25D366]/10 p-1.5 rounded-full transition-colors flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[20px]">chat</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold tracking-wider rounded opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                            Enviar por WhatsApp
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-inverse-surface"></div>
                          </div>
                        </button>
                        {recibo.estado !== 'Pagado' && recibo.estado !== 'Anulado' && (
                          <button
                            onClick={() => handleOpenRefacturar(recibo.id)}
                            className="group/tooltip relative text-orange-600 hover:bg-orange-100 p-1.5 rounded-full transition-colors flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-[20px]">autorenew</span>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold tracking-wider rounded opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                              Refacturar Recibo
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-inverse-surface"></div>
                            </div>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Controles de Paginación */}
        <div className="px-lg py-md border-t border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xs text-on-surface-variant font-medium">
            Mostrando {filteredRecibos.length > 0 ? indexOfFirstItem + 1 : 0} a {Math.min(indexOfLastItem, filteredRecibos.length)} de {filteredRecibos.length} recibos
          </span>
          {totalPages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-md border border-outline-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1 text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span> Anterior
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  // Optional: Limitar números si hay muchas páginas (aquí simplificamos y mostramos máximo 5 cerca del actual o algo simple)
                  .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                  .map((page, i, arr) => (
                    <React.Fragment key={page}>
                      {i > 0 && arr[i - 1] !== page - 1 && <span className="px-1 py-1 text-on-surface-variant text-xs">...</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-md text-xs font-bold transition-colors ${currentPage === page ? 'bg-primary text-white' : 'hover:bg-surface-container text-on-surface-variant'}`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-md border border-outline-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1 text-on-surface"
              >
                Siguiente <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Visor PDF */}
      <AnimatePresence>
      {isPdfModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-surface rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-outline-variant bg-surface-dim">
              <h3 className="font-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-error">picture_as_pdf</span>
                Visor de Boleta
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadPdfFromModal}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity font-bold text-sm shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Descargar PDF
                </button>
                <button
                  onClick={closePdfModal}
                  className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="flex-1 bg-surface-container-lowest p-0">
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-none"
                  title="PDF Viewer"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Drawer Detalle de Recibo */}
      {drawerReceiptId && (
        <ReceiptDetail receiptId={drawerReceiptId} onClose={() => setDrawerReceiptId(null)} />
      )}
      <GenerateInvoicesModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onSuccess={fetchData} // Refresca recibos y periodos
        selectedPeriodoId={periodoToGenerate}
        periodos={periodos}
      />

      {/* Modal de Reporte de Deudas */}
      <AnimatePresence>
      {showDeudasModal && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ea580c]">request_quote</span>
                Generar Reporte de Deudas
              </h3>
              <button 
                onClick={() => setShowDeudasModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-6">
                Seleccione el alcance del reporte de deudas en Excel. Puede descargar solo las deudas del periodo actualmente filtrado o el historial completo.
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleExportExcelDeudas('mensual')}
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-[#ea580c] hover:bg-[#ea580c]/5 transition-all text-left group"
                >
                  <div>
                    <div className="font-semibold text-slate-800 group-hover:text-[#ea580c] transition-colors">
                      Deudas del Periodo Actual
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {filterMes === 'Todos' || filterMes === 'TodosHistorico' ? 'Actualmente viendo todos los periodos' : `Periodo: ${filterMes}`}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-[#ea580c]">chevron_right</span>
                </button>
                
                <button
                  onClick={() => handleExportExcelDeudas('historico')}
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-[#107C41] hover:bg-[#107C41]/5 transition-all text-left group"
                >
                  <div>
                    <div className="font-semibold text-slate-800 group-hover:text-[#107C41] transition-colors">
                      Historial de Todos los Años
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Descarga todas las deudas vigentes e históricas
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-[#107C41]">history</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Modal de Refacturación Premium */}
      <AnimatePresence>
      {isRefacturarModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-scrim/60 backdrop-blur-md p-4 transition-all duration-300"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-surface-container-lowest rounded-[32px] w-full max-w-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col border border-outline-variant/30"
          >
            {/* Header with gradient */}
            <div className="relative px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/30">
                    <span className="material-symbols-outlined text-[24px]">autorenew</span>
                  </div>
                  <div>
                    <h3 className="text-[20px] font-display font-bold leading-tight drop-shadow-sm">Refacturar Recibo</h3>
                    <p className="text-orange-50 text-xs font-medium opacity-90 mt-0.5">Corrige valores y genera un nuevo documento</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsRefacturarModalOpen(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleRefacturarSubmit} className="p-6 flex flex-col gap-4 bg-white">
              
              {/* Elegant Warning Banner */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-orange-100 shadow-sm">
                <div className="mt-0.5">
                  <span className="material-symbols-outlined text-orange-500 text-[20px]">info</span>
                </div>
                <div className="text-xs text-on-surface-variant leading-relaxed">
                  El recibo actual pasará a estado <span className="font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded mx-0.5">ANULADO</span>. Se emitirá uno nuevo con las tarifas y lecturas más recientes.
                </div>
              </div>

              {/* Input Area */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-on-surface uppercase tracking-wider pl-1">Motivo de Refacturación <span className="text-error">*</span></label>
                <div className="relative group">
                  <textarea
                    required
                    rows="2"
                    className="w-full bg-surface-container-lowest border-2 border-outline-variant/60 rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 resize-none transition-all duration-300 shadow-inner group-hover:border-outline-variant"
                    placeholder="Ej. Se corrigió la lectura de Hora Punta que estaba en 0..."
                    value={refacturarMotivo}
                    onChange={(e) => setRefacturarMotivo(e.target.value)}
                  />
                  <div className="absolute right-3 bottom-3 text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-widest pointer-events-none">
                    Auditoría
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/30 mt-1">
                <button
                  type="button"
                  onClick={() => setIsRefacturarModalOpen(false)}
                  className="px-5 py-2 rounded-full font-bold text-xs text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                  disabled={isRefacturando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isRefacturando || !refacturarMotivo.trim()}
                  className="px-6 py-2 rounded-full font-bold text-xs bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all duration-300 shadow-[0_4px_10px_-4px_rgba(234,88,12,0.4)] hover:shadow-[0_8px_16px_-4px_rgba(234,88,12,0.5)] hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isRefacturando ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">autorenew</span>
                      Confirmar
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </main>
  );
};

export default Billing;
