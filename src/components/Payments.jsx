import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useYear } from '../context/YearContext';

const Payments = () => {
  const navigate = useNavigate();
  const [pagos, setPagos] = useState([]);
  const [recibosPendientes, setRecibosPendientes] = useState([]);
  const [allRecibos, setAllRecibos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedPaymentForDetails, setSelectedPaymentForDetails] = useState(null);
  
  const { activeYear } = useYear();
  const [filterMes, setFilterMes] = useState('Todos');
  const [periodos, setPeriodos] = useState([]);
  
  // Form state
  const [selectedRecibo, setSelectedRecibo] = useState('');
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('Transferencia');
  const [numeroOperacion, setNumeroOperacion] = useState('');
  
  // Autocomplete state
  const [searchSocio, setSearchSocio] = useState('');
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (filterMes && filterMes !== 'Todos' && filterMes !== 'TodosHistorico') {
        params.periodo = filterMes;
      } else if (filterMes === 'Todos') {
        params.year = activeYear;
      }

      const [pagosRes, recibosRes, periodosRes] = await Promise.all([
        api.get('/pagos', { params }),
        api.get('/recibos', { params }),
        api.get('/periodos')
      ]);
      setPagos(pagosRes.data);
      setAllRecibos(recibosRes.data);
      // Incluir también los pagos parciales
      setRecibosPendientes(recibosRes.data.filter(r => r.estado === 'Pendiente' || r.estado === 'Pago Parcial'));
      setPeriodos(periodosRes.data);
    } catch (error) {
      toast.error('Error al cargar datos de pagos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterMes, activeYear]);

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

  const totalRecaudado = pagos.reduce((acc, pago) => acc + parseFloat(pago.monto_pagado || 0), 0);
  const hoyInicio = new Date();
  hoyInicio.setHours(0, 0, 0, 0);
  const hoyFin = new Date();
  hoyFin.setHours(23, 59, 59, 999);
  
  const transaccionesHoy = pagos.filter(p => {
    const fechaPago = new Date(p.fecha_pago);
    return fechaPago >= hoyInicio && fechaPago <= hoyFin;
  }).length;

  const totalFacturado = allRecibos.reduce((sum, r) => sum + parseFloat(r.total || 0), 0);
  const facturasPagadas = allRecibos.filter(r => r.estado === 'Pagado').length;
  const totalFacturas = allRecibos.length;

  const filteredPagos = pagos.filter(pago => 
    pago.socio?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    pago.numero_comprobante?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMontoAuto = (reciboId) => {
    const recibo = recibosPendientes.find(r => r.id === parseInt(reciboId));
    if (recibo) {
      setMonto(parseFloat(recibo.saldo_pendiente || recibo.total).toFixed(2));
    } else {
      setMonto('');
    }
  };

  const handleMontoChange = (e) => {
    // Permitir vacío o números positivos
    if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) {
      setMonto(e.target.value);
    }
  };

  const handleSelectSocio = (recibo) => {
    setSelectedRecibo(recibo.id);
    setSearchSocio(recibo.socio);
    setMonto(parseFloat(recibo.saldo_pendiente || recibo.total).toFixed(2));
    setIsAutocompleteOpen(false);
  };

  const selectedReciboObj = recibosPendientes.find(r => r.id === parseInt(selectedRecibo));
  const saldoPendiente = selectedReciboObj ? parseFloat(selectedReciboObj.saldo_pendiente || selectedReciboObj.total) : 0;
  const isPagoParcial = monto && parseFloat(monto) < saldoPendiente - 0.02;
  const isPagoExcedido = monto && parseFloat(monto) > saldoPendiente + 0.02;

  const filteredSocios = searchSocio === '*' 
    ? recibosPendientes
    : recibosPendientes.filter(r => 
        r.socio.toLowerCase().includes(searchSocio.toLowerCase()) || 
        r.numero_comprobante.toLowerCase().includes(searchSocio.toLowerCase())
      );

  const handleRegistrarPago = async (e) => {
    e.preventDefault();
    if (!selectedRecibo || !monto || !metodoPago) {
      return toast.error('Complete los campos obligatorios');
    }

    setIsSubmitting(true);
    try {
      await api.post('/pagos', {
        recibo_id: selectedRecibo,
        monto_pagado: parseFloat(monto),
        metodo_pago: metodoPago,
        numero_operacion: numeroOperacion
      });
      toast.success('Pago registrado exitosamente');
      setIsModalOpen(false);
      // Reset form
      setSelectedRecibo('');
      setSearchSocio('');
      setMonto('');
      setMetodoPago('Transferencia');
      setNumeroOperacion('');
      // Recargar datos
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al registrar el pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const params = {};
      if (filterMes && filterMes !== 'Todos' && filterMes !== 'TodosHistorico') {
        params.periodo = filterMes;
      } else if (filterMes === 'Todos') {
        params.year = activeYear;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.get('/pagos/reporte/excel', { params, responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Reporte_Facturacion_Pagos.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar el Excel');
    }
  };

  const fetchFontBase64 = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          resolve(dataUrl.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("Could not load font", url, e);
      return null;
    }
  };

  const handleExportPDF = async () => {
    if (!filteredPagos || filteredPagos.length === 0) {
      return toast.error('No hay pagos para exportar');
    }

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Load fonts
      const lexendRegular = await fetchFontBase64('/fonts/Lexend-Regular.ttf');
      const lexendBold = await fetchFontBase64('/fonts/Lexend-Bold.ttf');
      
      if (lexendRegular && lexendBold) {
        doc.addFileToVFS('Lexend-Regular.ttf', lexendRegular);
        doc.addFont('Lexend-Regular.ttf', 'Lexend', 'normal');
        doc.addFileToVFS('Lexend-Bold.ttf', lexendBold);
        doc.addFont('Lexend-Bold.ttf', 'Lexend', 'bold');
      }
      
      // Load image
      const imgData = await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(null);
        img.src = '/logo.png';
      });

      if (imgData) {
        doc.addImage(imgData, 'PNG', 14, 12, 16, 16);
      }

      // Header
      doc.setFont(lexendRegular ? 'Lexend' : 'helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(14, 116, 144); // Teal oscuro corporativo
      doc.text('REPORTE DE PAGOS', pageWidth / 2, 12, { align: 'center' });
      
      doc.setFont(lexendRegular ? 'Lexend' : 'helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text('Asociación de Propietarios del Parque Industrial Jicamarca', pageWidth / 2, 16, { align: 'center' });
      
      // Metadata
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text(`Fecha de emisión: ${new Date().toLocaleString('es-PE')}`, 14, 22);
      
      // Resumen Totales
      const totalRecaudado = filteredPagos.reduce((acc, curr) => acc + parseFloat(curr.monto_pagado || 0), 0);
      doc.setFont(lexendRegular ? 'Lexend' : 'helvetica', 'bold');
      doc.setTextColor(51, 65, 85); // Slate-700
      doc.text(`Total Registros: ${filteredPagos.length}   |   `, 14, 26);
      const textWidth = doc.getTextWidth(`Total Registros: ${filteredPagos.length}   |   `);
      doc.setTextColor(5, 150, 105); // Emerald-600 para el dinero
      doc.text(`Monto Recaudado: S/ ${totalRecaudado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, 14 + textWidth, 26);

      // Línea separadora de acento
      doc.setDrawColor(14, 116, 144); // Teal corporativo
      doc.setLineWidth(0.3);
      doc.line(14, 28, pageWidth - 14, 28);

      // Configuración de la tabla super compacta
      autoTable(doc, {
        startY: 30,
        head: [['SOCIO', 'Nº RECIBO', 'FECHA PAGO', 'MÉTODO', 'MONTO (S/)']],
        body: filteredPagos.map(p => [
          p.socio || 'Desconocido',
          p.numero_comprobante || '-',
          new Date(p.fecha_pago).toLocaleDateString('es-PE'),
          p.metodo_pago + (p.numero_operacion ? ` (${p.numero_operacion})` : ''),
          { content: parseFloat(p.monto_pagado || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 }), styles: { halign: 'right' } }
        ]),
        theme: 'plain',
        styles: {
          font: lexendRegular ? 'Lexend' : 'helvetica',
          fontSize: 9,
          cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
          minCellHeight: 0,
          textColor: [51, 65, 85], // Slate-700
          lineColor: [226, 232, 240], // Slate-200
          lineWidth: { bottom: 0.1 } 
        },
        headStyles: {
          fillColor: [240, 249, 255], // Sky-50 super claro (apenas tinta)
          textColor: [14, 116, 144],  // Teal oscuro
          fontStyle: 'bold',
          lineColor: [186, 230, 253], // Borde Sky-200
          lineWidth: { top: 0.5, bottom: 0.5 } 
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 26 },
          2: { cellWidth: 22 },
          3: { cellWidth: 35 },
          4: { cellWidth: 26, halign: 'right', fontStyle: 'bold' }
        },
        didDrawPage: function (data) {
          // Footer
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(`Página ${doc.internal.getNumberOfPages()}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
        }
      });
      
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setIsPdfModalOpen(true);
      
    } catch (error) {
      console.error('Error al exportar a PDF:', error);
      toast.error(`Error al exportar a PDF: ${error.message || 'Desconocido'}`);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar p-lg space-y-lg max-w-[1600px] w-full mx-auto relative">
      {/* Page Title & Header */}
      <div className="mb-lg flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">Historial de Pagos Recibidos</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Seguimiento detallado de ingresos por servicios energéticos</p>
        </div>
        <div className="flex flex-wrap items-end gap-md">
          <div className="flex flex-col gap-1">
            <label className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider pl-1">Periodo a Filtrar</label>
            <div className="relative">
              <select
                className="appearance-none border border-outline-variant rounded-lg pl-4 pr-10 py-2.5 bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-w-[220px] transition-all font-medium cursor-pointer shadow-sm hover:border-primary/50"
                value={filterMes}
                onChange={(e) => setFilterMes(e.target.value)}
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
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={filterMes === 'Todos' || filterMes === 'TodosHistorico'}
            className={`flex items-center px-lg py-2 font-bold rounded-lg transition-opacity shadow-md text-sm ${
              (filterMes === 'Todos' || filterMes === 'TodosHistorico')
                ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-70'
                : 'bg-primary text-on-primary hover:opacity-90'
            }`}
          >
            <span className="material-symbols-outlined mr-2 text-[18px]">add_card</span>
            Registrar Pago
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-lg mb-xl">
        
        {/* Card 1: Total Facturado */}
        <div className="bg-surface-container-lowest p-md data-card rounded-lg flex flex-col justify-between min-h-[120px] shadow-sm border border-outline-variant relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10"></div>
          <div className="flex justify-between items-start">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Total Facturado</span>
            <div className="p-1.5 bg-primary/10 text-primary rounded">
              <span className="material-symbols-outlined text-[20px]">request_quote</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="font-data-mono text-headline-md text-on-surface font-bold">
              S/ {totalFacturado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1 text-on-surface-variant mt-1">
              <span className="text-body-sm font-medium">En el periodo seleccionado</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Recaudado */}
        <div className="bg-surface-container-lowest p-md data-card rounded-lg flex flex-col justify-between min-h-[120px] shadow-sm border border-outline-variant relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#059669]/5 rounded-bl-full -z-10"></div>
          <div className="flex justify-between items-start">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Total Recaudado</span>
            <div className="p-1.5 bg-[#059669]/10 text-[#059669] rounded">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="font-data-mono text-headline-md text-on-surface font-bold">
              S/ {totalRecaudado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1 text-[#059669] mt-1">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span className="text-body-sm font-medium">Ingresos reales</span>
            </div>
          </div>
        </div>

        {/* Card 3: Avance de Cobro */}
        <div className="bg-surface-container-lowest p-md data-card rounded-lg flex flex-col justify-between min-h-[120px] shadow-sm border border-outline-variant">
          <div className="flex justify-between items-start">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Avance de Cobro</span>
            <div className="p-1.5 bg-tertiary/10 text-tertiary rounded">
              <span className="material-symbols-outlined text-[20px]">checklist</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-end gap-2">
              <span className="font-data-mono text-headline-md text-on-surface font-bold">{facturasPagadas}</span>
              <span className="font-data-mono text-title-md text-on-surface-variant font-medium mb-1">/ {totalFacturas}</span>
            </div>
            <div className="flex items-center gap-1 text-on-surface-variant mt-1">
              <span className="text-body-sm font-medium">Facturas pagadas</span>
            </div>
          </div>
        </div>

        {/* Card 4: Transacciones Hoy */}
        <div className="bg-surface-container-lowest p-md data-card rounded-lg flex flex-col justify-between min-h-[120px] shadow-sm border border-outline-variant">
          <div className="flex justify-between items-start">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Transacciones Hoy</span>
            <div className="p-1.5 bg-secondary/10 text-secondary rounded">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="font-data-mono text-headline-md text-on-surface font-bold">{transaccionesHoy}</span>
            <div className="flex items-center gap-1 text-on-surface-variant mt-1">
              <span className="text-body-sm font-medium">En las últimas 24 hrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
        <div className="px-lg py-md border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-md bg-surface-container-low">
          <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">Historial de Pagos</h4>
          <div className="flex flex-wrap items-center gap-sm">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                type="text"
                placeholder="Buscar por socio o recibo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 bg-white transition-all"
              />
            </div>
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-md py-2 bg-[#107C41]/10 text-[#107C41] hover:bg-[#107C41]/20 font-bold text-sm rounded-lg transition-colors border border-[#107C41]/20"
            >
              <span className="material-symbols-outlined text-[18px]">table_view</span>
              Excel
            </button>
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-md py-2 bg-error/10 text-error hover:bg-error/20 font-bold text-sm rounded-lg transition-colors border border-error/20"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              PDF
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse zebra-table">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-md py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Socio</th>
                <th className="px-md py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Fecha Pago</th>
                <th className="px-md py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Método</th>
                <th className="px-md py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider text-right">Monto (PEN)</th>
                <th className="px-md py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center p-md">Cargando pagos...</td>
                </tr>
              ) : filteredPagos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-md text-on-surface-variant">No se encontraron pagos.</td>
                </tr>
              ) : (
                filteredPagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-md py-3">
                      <button 
                        onClick={() => setSelectedPaymentForDetails(pago)}
                        className="font-bold text-primary hover:text-primary-dark hover:underline focus:outline-none text-sm text-left transition-colors"
                        title="Ver Detalles del Pago"
                      >
                        {pago.socio}
                      </button>
                    </td>
                    <td className="px-md py-3 text-sm text-on-surface-variant">
                      {new Date(pago.fecha_pago).toLocaleString()}
                    </td>
                    <td className="px-md py-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">
                          {pago.metodo_pago === 'Transferencia' ? 'account_balance' : pago.metodo_pago === 'Efectivo' ? 'payments' : 'credit_card'}
                        </span>
                        <span className="text-sm">{pago.metodo_pago}</span>
                        {pago.numero_operacion && (
                           <span className="text-[10px] text-on-surface-variant font-data-mono ml-1">(Op: {pago.numero_operacion})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-md py-3 text-right">
                      <div className="font-data-mono text-sm font-bold text-primary">
                        {parseFloat(pago.monto_pagado).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      {pago.recibo_total && parseFloat(pago.monto_pagado) < parseFloat(pago.recibo_total) - 0.02 && (
                        <div className="mt-1 flex items-center justify-end">
                          <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded font-bold flex items-center gap-1 shadow-sm">
                            <span className="material-symbols-outlined text-[12px]">info</span>
                            Resta: S/ {(allRecibos.find(r => r.id === pago.recibo_id)?.saldo_pendiente || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-md py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#059669]/10 text-[#059669] border border-[#059669]/20 uppercase tracking-wider">
                          {pago.estado_validacion || 'Confirmado'}
                        </span>
                        {pago.recibo_total && parseFloat(pago.monto_pagado) < parseFloat(pago.recibo_total) - 0.02 ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wide">
                            Abono Parcial
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wide">
                            Pago Completo
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Pago */}
      <AnimatePresence>
      {isModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
          >
            
            {/* Header */}
            <div className="px-lg py-md border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
              <h3 className="font-headline-sm text-primary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">payments</span>
                Registrar Nuevo Pago
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-lg">
              <form id="registrar-pago-form" onSubmit={handleRegistrarPago} className="space-y-lg">
                
                {/* Recibo Pendiente (Autocomplete) */}
                <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Socio o Recibo <span className="text-error">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                    <input 
                      type="text"
                      className="w-full border border-outline-variant rounded-lg font-body-md bg-white focus:border-primary focus:ring-1 focus:ring-primary pl-9 pr-3 py-2.5 outline-none transition-colors hover:border-primary/50"
                      placeholder="Buscar por nombre o N° recibo..."
                      value={searchSocio}
                      onChange={(e) => {
                        setSearchSocio(e.target.value);
                        setSelectedRecibo(''); // Reseteamos si vuelve a escribir
                        setMonto('');
                        setIsAutocompleteOpen(true);
                      }}
                      onFocus={() => setIsAutocompleteOpen(true)}
                    />
                    
                    {/* Dropdown de Autocomplete */}
                    {isAutocompleteOpen && searchSocio && !selectedRecibo && (
                      <div className="absolute z-10 w-full mt-1 bg-surface border border-outline-variant rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredSocios.length === 0 ? (
                          <div className="p-3 text-sm text-on-surface-variant text-center">No se encontraron recibos pendientes</div>
                        ) : (
                          filteredSocios.map(r => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => handleSelectSocio(r)}
                              className="w-full text-left px-4 py-3 hover:bg-surface-container-low border-b border-outline-variant/50 last:border-0 transition-colors flex flex-col"
                            >
                              <span className="font-bold text-sm text-on-surface">{r.socio}</span>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-on-surface-variant flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                                  {r.numero_comprobante}
                                </span>
                                <span className="text-xs font-bold font-data-mono text-error">Deuda: S/ {parseFloat(r.saldo_pendiente || r.total).toFixed(2)}</span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  {/* Monto Pagado */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider pl-1">
                      Monto Pagado (S/) <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">attach_money</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0.01"
                        className={`w-full border rounded-lg pl-9 pr-3 py-2.5 bg-white font-data-mono font-medium outline-none transition-colors ${
                          (isPagoExcedido || isPagoParcial) ? 'border-error focus:ring-1 focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'
                        }`}
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        placeholder="0.00"
                        required
                        disabled={!selectedRecibo}
                      />
                    </div>
                    {/* Mensajes de validación / estado */}
                    <div className="min-h-[20px] pl-1 flex items-center">
                      {isPagoExcedido ? (
                        <span className="text-[11px] text-[#059669] font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span>
                          Se generará un saldo a favor de S/ {(parseFloat(monto) - saldoPendiente).toFixed(2)}
                        </span>
                      ) : isPagoParcial ? (
                        <span className="text-[11px] text-primary">El pago es parcial. Quedará un saldo de S/ {(saldoPendiente - parseFloat(monto)).toFixed(2)}</span>
                      ) : (
                        selectedRecibo && monto ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-[#047857]">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Pago Completo
                          </span>
                        ) : null
                      )}
                    </div>
                  </div>
                  
                  {/* Método de Pago */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider pl-1">Método de Pago <span className="text-error">*</span></label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">account_balance</span>
                      <select 
                        className="appearance-none w-full border border-outline-variant rounded-lg pl-9 pr-10 py-2.5 bg-white font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors cursor-pointer"
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value)}
                        required
                      >
                        <option value="Transferencia">Transferencia</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Depósito">Depósito en Cuenta</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* Nº Operación */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider pl-1">Nº Operación / Referencia</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">tag</span>
                    <input 
                      type="text" 
                      className="w-full border border-outline-variant rounded-lg pl-9 pr-3 py-2.5 bg-white font-data-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      value={numeroOperacion}
                      onChange={(e) => setNumeroOperacion(e.target.value)}
                      placeholder="Opcional"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-md bg-surface-container-lowest border-t border-outline-variant flex gap-sm mt-auto">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl font-bold border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                form="registrar-pago-form"
                disabled={isSubmitting || !selectedRecibo || !monto}
                className="flex-[2] py-2.5 rounded-xl font-bold bg-primary text-on-primary hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                    Procesando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Confirmar Pago
                  </>
                )}
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Modal PDF renderizado con Portal para cubrir toda la pantalla */}
      <AnimatePresence>
      {isPdfModalOpen && createPortal(
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-surface rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-[90vh]"
          >
            <div className="flex justify-between items-center p-6 border-b border-outline-variant">
              <div>
                <h3 className="font-headline-sm text-on-surface">Visor de PDF</h3>
                <p className="text-sm text-on-surface-variant">Historial de Pagos</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = pdfUrl;
                    link.download = `Pagos_Parque_Industrial_${new Date().toISOString().slice(0, 10)}.pdf`;
                    link.click();
                  }}
                  className="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar
                </button>
                <button 
                  onClick={() => setIsPdfModalOpen(false)}
                  className="p-2 hover:bg-surface-variant rounded-full transition-colors text-on-surface-variant"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 bg-surface-variant">
              <iframe 
                src={pdfUrl} 
                className="w-full h-full border-none"
                title="Visor PDF"
              />
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}
      </AnimatePresence>

      {/* Drawer de Detalles del Pago */}
      <AnimatePresence>
      {selectedPaymentForDetails && createPortal(
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setSelectedPaymentForDetails(null); }}
        >
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-md bg-surface h-full shadow-2xl flex flex-col"
          >
            <div className="p-xl border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-headline-sm text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">receipt_long</span>
                Detalle del Pago
              </h3>
              <button 
                onClick={() => setSelectedPaymentForDetails(null)} 
                className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-xl flex-1 overflow-y-auto space-y-lg custom-scrollbar">
              
              {/* Header/Amount */}
              <div className="bg-surface-container-low rounded-2xl p-lg flex flex-col items-center justify-center border border-outline-variant/50">
                <span className="text-label-caps text-on-surface-variant font-bold tracking-wider mb-2">MONTO PAGADO</span>
                <span className="font-data-mono text-display-sm font-bold text-primary">
                  S/ {parseFloat(selectedPaymentForDetails.monto_pagado).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#059669]/10 text-[#059669] border border-[#059669]/20 uppercase tracking-wider">
                    {selectedPaymentForDetails.estado_validacion || 'Confirmado'}
                  </span>
                </div>
              </div>

              {/* Socio Info */}
              <div>
                <h4 className="text-label-caps font-bold text-on-surface-variant uppercase tracking-wider mb-sm">Información del Cliente</h4>
                <div className="bg-white border border-outline-variant rounded-xl p-md">
                  <div className="font-bold text-on-surface">{selectedPaymentForDetails.socio}</div>
                  <div className="text-sm text-on-surface-variant mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">folder</span>
                    Recibo Asociado: <span className="font-data-mono font-bold">{selectedPaymentForDetails.numero_comprobante}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h4 className="text-label-caps font-bold text-on-surface-variant uppercase tracking-wider mb-sm">Detalles de la Transacción</h4>
                <div className="bg-white border border-outline-variant rounded-xl divide-y divide-outline-variant">
                  <div className="flex justify-between items-center p-md">
                    <span className="text-sm text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">calendar_today</span> Fecha y Hora
                    </span>
                    <span className="text-sm font-bold text-on-surface">
                      {new Date(selectedPaymentForDetails.fecha_pago).toLocaleString('es-PE')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-md">
                    <span className="text-sm text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">payments</span> Método de Pago
                    </span>
                    <span className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                      {selectedPaymentForDetails.metodo_pago}
                    </span>
                  </div>
                  {selectedPaymentForDetails.numero_operacion && (
                    <div className="flex justify-between items-center p-md">
                      <span className="text-sm text-on-surface-variant flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">tag</span> N° de Operación
                      </span>
                      <span className="font-data-mono text-sm font-bold text-on-surface">
                        {selectedPaymentForDetails.numero_operacion}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Info */}
              {(() => {
                const isPartial = selectedPaymentForDetails.recibo_total && parseFloat(selectedPaymentForDetails.monto_pagado) < parseFloat(selectedPaymentForDetails.recibo_total) - 0.02;
                const saldoPendiente = (allRecibos.find(r => r.id === selectedPaymentForDetails.recibo_id)?.saldo_pendiente || 0);
                
                return (
                  <div>
                    <h4 className="text-label-caps font-bold text-on-surface-variant uppercase tracking-wider mb-sm">Estado del Recibo</h4>
                    <div className={`border rounded-xl p-md ${isPartial ? 'bg-amber-50/50 border-amber-200' : 'bg-indigo-50/50 border-indigo-200'}`}>
                      <div className="flex justify-between items-center mb-sm">
                        <span className="text-sm font-bold text-on-surface">Tipo de Abono</span>
                        {isPartial ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wide">
                            Abono Parcial
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wide">
                            Pago Completo
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mb-sm">
                        <span className="text-sm text-on-surface-variant">Total del Recibo</span>
                        <span className="font-data-mono text-sm font-bold">
                          S/ {parseFloat(selectedPaymentForDetails.recibo_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      {isPartial && (
                        <div className="flex justify-between items-center pt-sm border-t border-amber-200/50">
                          <span className="text-sm text-amber-900 font-bold">Deuda Actual Restante</span>
                          <span className="font-data-mono text-sm font-bold text-amber-700">
                            S/ {parseFloat(saldoPendiente).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
              
              {/* Actions */}
              <div className="pt-xl mt-auto">
                <button 
                  onClick={() => {
                    setSelectedPaymentForDetails(null);
                    navigate(`/receipt_detail?id=${selectedPaymentForDetails.recibo_id}`, { state: { from: '/payments' } });
                  }}
                  className="w-full py-3 bg-surface-container-low hover:bg-surface-variant border border-outline-variant text-on-surface font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  Ver Recibo Completo
                </button>
              </div>

            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}
      </AnimatePresence>

    </main>
  );
};

export default Payments;
