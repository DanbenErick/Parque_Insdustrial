import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import { toast } from 'sonner';
import { useYear } from '../../context/YearContext';

// ── Constants ────────────────────────────────────────────────────────
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const CURRENCY_OPTS = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

const METODO_PAGO_ICONS = {
  Transferencia: 'account_balance',
  Efectivo: 'payments',
  default: 'credit_card',
};

const MODAL_BACKDROP = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } };
const MODAL_CONTENT = { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.95, opacity: 0 }, transition: { duration: 0.2, ease: 'easeOut' } };
const DRAWER_SPRING = { type: 'spring', stiffness: 300, damping: 30 };

const PARTIAL_THRESHOLD = 0.02;

// ── Helpers ──────────────────────────────────────────────────────────
const fmtCurrency = (value) =>
  parseFloat(value || 0).toLocaleString('en-US', CURRENCY_OPTS);

const formatPeriod = (periodoStr) => {
  if (!periodoStr) return '';
  const parts = periodoStr.split('-');
  if (parts.length !== 2) return periodoStr;
  const year = parts[0].length === 4 ? parts[0] : parts[1];
  const month = parts[0].length === 4 ? parts[1] : parts[0];
  const monthIndex = parseInt(month, 10) - 1;
  if (monthIndex >= 0 && monthIndex < 12) return `${MONTH_NAMES[monthIndex]} ${year}`;
  return periodoStr;
};

const getMetodoPagoIcon = (metodo) => METODO_PAGO_ICONS[metodo] || METODO_PAGO_ICONS.default;

const isPartialPayment = (montoPagado, reciboTotal) =>
  reciboTotal && parseFloat(montoPagado) < parseFloat(reciboTotal) - PARTIAL_THRESHOLD;

const buildFilterParams = (filterMes, activeYear) => {
  const params = {};
  if (filterMes && filterMes !== 'Todos' && filterMes !== 'TodosHistorico') {
    params.periodo = filterMes;
  } else if (filterMes === 'Todos') {
    params.year = activeYear;
  }
  return params;
};

// ── Sub-components ───────────────────────────────────────────────────
const KpiCard = React.memo(({ icon, label, value, subtitle, colorClass = 'primary', subtitleIcon }) => (
  <div className="bg-surface border border-outline-variant hover:border-primary/30 rounded-xl p-3 flex items-center gap-3 transition-colors shadow-sm">
    <div className={`w-10 h-10 rounded-full bg-${colorClass}/5 flex items-center justify-center text-${colorClass} shrink-0 border border-${colorClass}/10`}>
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </div>
    <div className="flex flex-col justify-center overflow-hidden">
      <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider leading-tight truncate">{label}</span>
      <span className={`font-data-mono text-lg text-${colorClass === 'primary' ? 'on-surface' : colorClass} font-bold leading-none mt-0.5 truncate`}>
        {value}
      </span>
      {subtitleIcon ? (
        <div className={`flex items-center gap-1 mt-1 text-${colorClass}/80`}>
          <span className="material-symbols-outlined text-[10px]">{subtitleIcon}</span>
          <span className="text-[9px] truncate">{subtitle}</span>
        </div>
      ) : (
        <span className="text-[9px] text-on-surface-variant/70 mt-1 truncate">{subtitle}</span>
      )}
    </div>
  </div>
));

const DetailRow = React.memo(({ icon, label, value, valueClassName = 'text-xs font-bold text-on-surface' }) => (
  <div className="flex justify-between items-center p-3">
    <span className="text-[11px] text-on-surface-variant flex items-center gap-1.5">
      <span className="material-symbols-outlined text-[14px]">{icon}</span> {label}
    </span>
    <span className={valueClassName}>{value}</span>
  </div>
));

const PaymentRow = React.memo(({ pago, saldoPendiente, onSelect }) => {
  const isPartial = isPartialPayment(pago.monto_pagado, pago.recibo_total);

  return (
    <tr className="hover:bg-surface-container-lowest transition-colors group">
      <td className="px-4 py-2">
        <button
          onClick={() => onSelect(pago)}
          className="font-bold text-on-surface text-[11px] hover:text-primary transition-colors text-left focus:outline-none"
          title="Ver Detalles del Pago"
        >
          {pago.socio}
        </button>
      </td>
      <td className="px-4 py-2">
        <div className="flex flex-col">
          <span className="text-[11px] text-on-surface font-medium">
            {pago.metodo_pago}
            {pago.numero_operacion && <span className="font-data-mono ml-1 text-[10px] text-on-surface-variant">(Op: {pago.numero_operacion})</span>}
          </span>
          <span className="text-[10px] text-on-surface-variant">
            {new Date(pago.fecha_pago).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </td>
      <td className="px-4 py-2 text-center">
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-on-surface-variant uppercase tracking-wider mb-0.5">
            {pago.estado_validacion || 'Confirmado'}
          </span>
          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${isPartial ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>
            {isPartial ? 'Parcial' : 'Completo'}
          </span>
        </div>
      </td>
      <td className="px-4 py-2 text-right">
        <div className="font-data-mono font-bold text-on-surface text-[12px]">
          S/ {fmtCurrency(pago.monto_pagado)}
        </div>
        {isPartial && (
          <div className="text-[9px] text-amber-700 font-bold">
            Restante: S/ {fmtCurrency(saldoPendiente)}
          </div>
        )}
      </td>
    </tr>
  );
});

// ── Main Component ───────────────────────────────────────────────────
const Payments = () => {
  const navigate = useNavigate();
  const { activeYear } = useYear();
  const queryClient = useQueryClient();

  // ── State ──────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedPaymentForDetails, setSelectedPaymentForDetails] = useState(null);
  const [filterMes, setFilterMes] = useState('Todos');

  // ── React Query — data fetching ────────────────────────────────────
  const filterParams = useMemo(() => buildFilterParams(filterMes, activeYear), [filterMes, activeYear]);

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['pagos-data', filterParams],
    queryFn: async () => {
      const [pagosRes, recibosRes, periodosRes] = await Promise.all([
        api.get('/pagos', { params: filterParams }),
        api.get('/recibos', { params: filterParams }),
        api.get('/periodos'),
      ]);
      return {
        pagos: pagosRes.data,
        recibos: recibosRes.data,
        periodos: periodosRes.data,
      };
    },
    staleTime: 2 * 60 * 1000,
    onError: () => toast.error('Error al cargar datos de pagos'),
  });

  const pagos = fetchedData?.pagos ?? [];
  const allRecibos = fetchedData?.recibos ?? [];
  const periodos = fetchedData?.periodos ?? [];

  const refetchAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['pagos-data'] });
  }, [queryClient]);

  // Form state
  const [selectedRecibo, setSelectedRecibo] = useState('');
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('Transferencia');
  const [numeroOperacion, setNumeroOperacion] = useState('');
  const [searchSocio, setSearchSocio] = useState('');
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

  // ── Memoised derived data ──────────────────────────────────────────
  const recibosPendientes = useMemo(
    () => allRecibos.filter(r => r.estado === 'Pendiente' || r.estado === 'Pago Parcial'),
    [allRecibos],
  );

  const uniqueMonths = useMemo(() =>
    periodos
      .filter(p => p.mes_anio?.includes(activeYear.toString()))
      .map(p => p.mes_anio)
      .sort()
      .reverse(),
    [periodos, activeYear],
  );

  const totalRecaudado = useMemo(
    () => pagos.reduce((acc, p) => acc + parseFloat(p.monto_pagado || 0), 0),
    [pagos],
  );

  const { totalFacturado, facturasPagadas, totalFacturas } = useMemo(() => ({
    totalFacturado: allRecibos.reduce((sum, r) => sum + parseFloat(r.total || 0), 0),
    facturasPagadas: allRecibos.filter(r => r.estado === 'Pagado').length,
    totalFacturas: allRecibos.length,
  }), [allRecibos]);

  const transaccionesHoy = useMemo(() => {
    const hoyInicio = new Date();
    hoyInicio.setHours(0, 0, 0, 0);
    const hoyFin = new Date();
    hoyFin.setHours(23, 59, 59, 999);
    return pagos.filter(p => {
      const f = new Date(p.fecha_pago);
      return f >= hoyInicio && f <= hoyFin;
    }).length;
  }, [pagos]);

  const porcentajeRecaudado = useMemo(
    () => totalFacturado > 0 ? (totalRecaudado / totalFacturado) * 100 : 0,
    [totalRecaudado, totalFacturado],
  );

  const filteredPagos = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return pagos;
    return pagos.filter(p =>
      p.socio?.toLowerCase().includes(term) ||
      p.numero_comprobante?.toLowerCase().includes(term),
    );
  }, [pagos, searchTerm]);

  const selectedReciboObj = useMemo(
    () => recibosPendientes.find(r => r.id === parseInt(selectedRecibo)),
    [recibosPendientes, selectedRecibo],
  );

  const saldoPendiente = useMemo(
    () => selectedReciboObj ? parseFloat(selectedReciboObj.saldo_pendiente || selectedReciboObj.total) : 0,
    [selectedReciboObj],
  );

  const isPagoParcial = monto && parseFloat(monto) < saldoPendiente - PARTIAL_THRESHOLD;
  const isPagoExcedido = monto && parseFloat(monto) > saldoPendiente + PARTIAL_THRESHOLD;

  const filteredSocios = useMemo(() => {
    if (searchSocio === '*') return recibosPendientes;
    const term = searchSocio.toLowerCase();
    return recibosPendientes.filter(r =>
      r.socio.toLowerCase().includes(term) ||
      r.numero_comprobante.toLowerCase().includes(term),
    );
  }, [recibosPendientes, searchSocio]);

  // Map recibo_id -> saldo_pendiente for fast lookups in table rows
  const reciboSaldoMap = useMemo(() => {
    const map = new Map();
    allRecibos.forEach(r => map.set(r.id, r.saldo_pendiente || 0));
    return map;
  }, [allRecibos]);

  // ── Callbacks ──────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setSelectedRecibo('');
    setSearchSocio('');
    setMonto('');
    setMetodoPago('Transferencia');
    setNumeroOperacion('');
  }, []);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);
  const closePdfModal = useCallback(() => {
    setIsPdfModalOpen(false);
    // Revoke the blob URL after the exit animation to prevent memory leaks
    setTimeout(() => {
      setPdfUrl(prev => {
        if (prev) window.URL.revokeObjectURL(prev);
        return '';
      });
    }, 300);
  }, []);
  const closeDetailsDrawer = useCallback(() => setSelectedPaymentForDetails(null), []);

  const handleSelectSocio = useCallback((recibo) => {
    setSelectedRecibo(recibo.id);
    setSearchSocio(recibo.socio);
    setMonto(parseFloat(recibo.saldo_pendiente || recibo.total).toFixed(2));
    setIsAutocompleteOpen(false);
  }, []);

  const handleSocioSearch = useCallback((e) => {
    setSearchSocio(e.target.value);
    setSelectedRecibo('');
    setMonto('');
    setIsAutocompleteOpen(true);
  }, []);

  const handleRegistrarPago = useCallback(async (e) => {
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
        numero_operacion: numeroOperacion,
      });
      toast.success('Pago registrado exitosamente');
      setIsModalOpen(false);
      resetForm();
      refetchAll();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al registrar el pago');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedRecibo, monto, metodoPago, numeroOperacion, resetForm, refetchAll]);

  const handleExportExcel = useCallback(async () => {
    try {
      const params = { ...buildFilterParams(filterMes, activeYear) };
      if (searchTerm) params.search = searchTerm;

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
    } catch {
      toast.error('Error al descargar el Excel');
    }
  }, [filterMes, activeYear, searchTerm]);

  const handleExportPDF = useCallback(async () => {
    if (!filteredPagos.length) {
      return toast.error('No hay pagos para exportar');
    }
    try {
      toast.info('Generando PDF, por favor espere...');
      const params = { ...buildFilterParams(filterMes, activeYear) };
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/pagos/reporte/pdf', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      // Revoke previous URL before storing new one
      setPdfUrl(prev => {
        if (prev) window.URL.revokeObjectURL(prev);
        return url;
      });
      setIsPdfModalOpen(true);
      toast.success('Reporte PDF generado exitosamente');
    } catch {
      toast.error('Error al exportar a PDF');
    }
  }, [filteredPagos.length, filterMes, activeYear, searchTerm]);

  const handleDownloadPdf = useCallback(() => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Pagos_Parque_Industrial_${new Date().toISOString().slice(0, 10)}.pdf`;
    link.click();
  }, [pdfUrl]);

  const handleViewRecibo = useCallback(() => {
    if (!selectedPaymentForDetails) return;
    const reciboId = selectedPaymentForDetails.recibo_id;
    setSelectedPaymentForDetails(null);
    navigate(`/receipt_detail?id=${reciboId}`, { state: { from: '/payments' } });
  }, [selectedPaymentForDetails, navigate]);

  const isFilterSpecific = filterMes !== 'Todos' && filterMes !== 'TodosHistorico';

  // Close payment modal with Escape key
  useEffect(() => {
    if (!isModalOpen) return;
    const handler = (e) => { if (e.key === 'Escape' && !isSubmitting) closeModal(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isModalOpen, isSubmitting, closeModal]);

  // Close PDF modal with Escape key
  useEffect(() => {
    if (!isPdfModalOpen) return;
    const handler = (e) => { if (e.key === 'Escape') closePdfModal(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isPdfModalOpen, closePdfModal]);

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-4 max-w-[1600px] w-full mx-auto relative">

      {/* Page Title & Header */}
      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl text-on-surface font-bold leading-tight">Historial de Pagos Recibidos</h2>
          <p className="text-sm text-on-surface-variant">Seguimiento detallado de ingresos por servicios energéticos</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider pl-1">Periodo a Filtrar</label>
            <div className="relative">
              <select
                className="appearance-none border border-outline-variant rounded-md pl-3 pr-8 py-1.5 h-8 bg-surface-container-lowest text-on-surface text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-w-[180px] transition-all font-medium cursor-pointer shadow-sm hover:border-primary/50"
                value={filterMes}
                onChange={(e) => setFilterMes(e.target.value)}
              >
                <option value="Todos">Todos los meses ({activeYear})</option>
                <option value="TodosHistorico">Histórico (Todos los años)</option>
                {uniqueMonths.map(m => (
                  <option key={m} value={m}>{formatPeriod(m)}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[16px]">expand_more</span>
            </div>
          </div>
          <button
            onClick={openModal}
            disabled={!isFilterSpecific}
            className={`flex items-center px-3 py-1.5 h-8 font-bold rounded-md transition-opacity shadow-sm text-xs ${
              !isFilterSpecific
                ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-70'
                : 'bg-primary text-on-primary hover:opacity-90 active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined mr-1 text-[16px]">add_card</span>
            Registrar Pago
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        <KpiCard icon="request_quote" label="Total Facturado" value={`S/ ${fmtCurrency(totalFacturado)}`} subtitle="En el periodo seleccionado" />
        <KpiCard icon="account_balance_wallet" label="Total Recaudado" value={`S/ ${fmtCurrency(totalRecaudado)}`} subtitle="Ingresos reales" colorClass="[#059669]" subtitleIcon="trending_up" />
        <KpiCard icon="checklist" label="Avance de Cobro" value={<>{facturasPagadas}<span className="font-data-mono text-[10px] text-on-surface-variant font-bold">/ {totalFacturas}</span></>} subtitle="Facturas pagadas" colorClass="tertiary" />
        <KpiCard icon="bolt" label="Transacciones Hoy" value={transaccionesHoy} subtitle="En las últimas 24 hrs" colorClass="secondary" />
      </div>

      {/* Progress Bar */}
      <div className="bg-surface border border-outline-variant rounded-xl p-4 mb-4 shadow-sm flex flex-col gap-2">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">monitoring</span>
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Avance de Recaudación</span>
          </div>
          <span className="font-data-mono font-bold text-primary text-sm">{porcentajeRecaudado.toFixed(1)}%</span>
        </div>

        <div className="relative w-full h-3 bg-surface-container-highest rounded-full overflow-hidden flex">
          <div
            className="h-full bg-primary transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(porcentajeRecaudado, 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-on-surface-variant font-medium mt-1">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#059669]" />
            <span>Recaudado (S/ {fmtCurrency(totalRecaudado)})</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Pendiente (S/ {fmtCurrency(totalFacturado - totalRecaudado)})</span>
            <div className="w-2 h-2 rounded-full bg-surface-container-highest" />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-surface-container-low">
          <h4 className="text-base font-bold text-on-surface">Historial de Pagos</h4>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
              <input
                type="text"
                placeholder="Buscar por socio o recibo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 h-8 border border-outline-variant rounded-md text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-48 bg-white transition-all"
              />
            </div>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 h-8 bg-[#107C41]/10 text-[#107C41] hover:bg-[#107C41]/20 font-bold text-xs rounded-md transition-colors border border-[#107C41]/20"
            >
              <span className="material-symbols-outlined text-[16px]">table_view</span>
              Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 h-8 bg-error/10 text-error hover:bg-error/20 font-bold text-xs rounded-md transition-colors border border-error/20"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto whitespace-nowrap">
            <thead className="bg-surface-container-lowest border-b border-outline-variant text-on-surface-variant text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2 font-semibold">Socio</th>
                <th className="px-4 py-2 font-semibold">Detalle / Fecha</th>
                <th className="px-4 py-2 font-semibold text-center">Estado</th>
                <th className="px-4 py-2 font-semibold text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50 bg-surface">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="text-center p-8 text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-[24px]">sync</span>
                  </td>
                </tr>
              ) : filteredPagos.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-8 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[32px] opacity-20 mb-2 block">search_off</span>
                    <p className="font-bold">No se encontraron pagos</p>
                  </td>
                </tr>
              ) : (
                filteredPagos.map((pago) => (
                  <PaymentRow
                    key={pago.id}
                    pago={pago}
                    saldoPendiente={reciboSaldoMap.get(pago.recibo_id) || 0}
                    onSelect={setSelectedPaymentForDetails}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Pago */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div {...MODAL_BACKDROP} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div {...MODAL_CONTENT} className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">

              {/* Header */}
              <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
                <h3 className="text-base text-primary font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                  Registrar Nuevo Pago
                </h3>
                <button
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="w-7 h-7 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <form id="registrar-pago-form" onSubmit={handleRegistrarPago} className="space-y-4">

                  {/* Recibo Pendiente (Autocomplete) */}
                  <div className="bg-surface-container-lowest border border-outline-variant p-3 rounded-lg">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                      Socio o Recibo <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
                      <input
                        type="text"
                        className="w-full border border-outline-variant rounded-md text-xs bg-white focus:border-primary focus:ring-1 focus:ring-primary pl-8 pr-3 py-1.5 h-8 outline-none transition-colors hover:border-primary/50"
                        placeholder="Buscar por nombre o N° recibo..."
                        value={searchSocio}
                        onChange={handleSocioSearch}
                        onFocus={() => setIsAutocompleteOpen(true)}
                      />

                      {/* Dropdown de Autocomplete */}
                      {isAutocompleteOpen && searchSocio && !selectedRecibo && (
                        <div className="absolute z-10 w-full mt-1 bg-surface border border-outline-variant rounded-md shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                          {filteredSocios.length === 0 ? (
                            <div className="p-2 text-xs text-on-surface-variant text-center">No se encontraron recibos pendientes</div>
                          ) : (
                            filteredSocios.map(r => (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => handleSelectSocio(r)}
                                className="w-full text-left px-3 py-2 hover:bg-surface-container-low border-b border-outline-variant/50 last:border-0 transition-colors flex flex-col"
                              >
                                <span className="font-bold text-xs text-on-surface">{r.socio}</span>
                                <div className="flex justify-between items-center mt-0.5">
                                  <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">receipt_long</span>
                                    {r.numero_comprobante}
                                  </span>
                                  <span className="text-[10px] font-bold font-data-mono text-error">
                                    Deuda: S/ {parseFloat(r.saldo_pendiente || r.total).toFixed(2)}
                                  </span>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Monto Pagado */}
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider pl-1">
                        Monto Pagado (S/) <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">attach_money</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          className={`w-full border rounded-md pl-8 pr-3 py-1.5 h-8 bg-white font-data-mono text-xs font-medium outline-none transition-colors ${
                            (isPagoExcedido || isPagoParcial) ? 'border-error focus:ring-1 focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'
                          }`}
                          value={monto}
                          onChange={(e) => setMonto(e.target.value)}
                          placeholder="0.00"
                          required
                          disabled={!selectedRecibo}
                        />
                      </div>
                      {/* Validation messages */}
                      <div className="min-h-[16px] pl-1 flex items-center">
                        {isPagoExcedido ? (
                          <span className="text-[10px] text-[#059669] font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">account_balance_wallet</span>
                            Saldo a favor: S/ {(parseFloat(monto) - saldoPendiente).toFixed(2)}
                          </span>
                        ) : isPagoParcial ? (
                          <span className="text-[10px] text-primary">Quedará saldo de S/ {(saldoPendiente - parseFloat(monto)).toFixed(2)}</span>
                        ) : selectedRecibo && monto ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-[#047857]">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                            Pago Completo
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Método de Pago */}
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider pl-1">Método de Pago <span className="text-error">*</span></label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">account_balance</span>
                        <select
                          className="appearance-none w-full border border-outline-variant rounded-md pl-8 pr-8 py-1.5 h-8 bg-white text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors cursor-pointer"
                          value={metodoPago}
                          onChange={(e) => setMetodoPago(e.target.value)}
                          required
                        >
                          <option value="Transferencia">Transferencia</option>
                          <option value="Efectivo">Efectivo</option>
                          <option value="Cheque">Cheque</option>
                          <option value="Depósito">Depósito en Cuenta</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[16px]">expand_more</span>
                      </div>
                    </div>
                  </div>

                  {/* Nº Operación */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider pl-1">Nº Operación / Referencia</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">tag</span>
                      <input
                        type="text"
                        className="w-full border border-outline-variant rounded-md pl-8 pr-3 py-1.5 h-8 bg-white font-data-mono text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                        value={numeroOperacion}
                        onChange={(e) => setNumeroOperacion(e.target.value)}
                        placeholder="Opcional"
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="p-3 bg-surface-container-lowest border-t border-outline-variant flex gap-2 mt-auto">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="flex-1 py-1.5 h-8 rounded-md text-xs font-bold border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="registrar-pago-form"
                  disabled={isSubmitting || !selectedRecibo || !monto}
                  className="flex-1 py-1.5 h-8 rounded-md text-xs font-bold bg-primary text-on-primary hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isSubmitting ? (
                    <><span className="material-symbols-outlined animate-spin text-[16px]">sync</span> Procesando...</>
                  ) : (
                    <><span className="material-symbols-outlined text-[16px]">save</span> Confirmar Pago</>
                  )}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal PDF (Portal) */}
      <AnimatePresence>
        {isPdfModalOpen && createPortal(
          <motion.div {...MODAL_BACKDROP} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div {...MODAL_CONTENT} className="bg-surface rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
              <div className="flex justify-between items-center p-6 border-b border-outline-variant">
                <div>
                  <h3 className="font-headline-sm text-on-surface">Visor de PDF</h3>
                  <p className="text-sm text-on-surface-variant">Historial de Pagos</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    className="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descargar
                  </button>
                  <button
                    onClick={closePdfModal}
                    className="p-2 hover:bg-surface-variant rounded-full transition-colors text-on-surface-variant"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-surface-variant">
                <iframe src={pdfUrl} className="w-full h-full border-none" title="Visor PDF" />
              </div>
            </motion.div>
          </motion.div>,
          document.body,
        )}
      </AnimatePresence>

      {/* Drawer de Detalles del Pago (Portal) */}
      <AnimatePresence>
        {selectedPaymentForDetails && createPortal(
          <motion.div
            {...MODAL_BACKDROP}
            className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) closeDetailsDrawer(); }}
          >
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={DRAWER_SPRING}
              className="w-full max-w-sm bg-surface h-full shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
                <h3 className="text-base text-on-surface font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">receipt_long</span>
                  Detalle del Pago
                </h3>
                <button
                  onClick={closeDetailsDrawer}
                  className="w-7 h-7 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">

                {/* Header/Amount */}
                <div className="bg-surface-container-low rounded-xl p-4 flex flex-col items-center justify-center border border-outline-variant/50">
                  <span className="text-[10px] text-on-surface-variant font-bold tracking-wider mb-1.5 uppercase">MONTO PAGADO</span>
                  <span className="font-data-mono text-3xl font-bold text-primary">
                    S/ {fmtCurrency(selectedPaymentForDetails.monto_pagado)}
                  </span>
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#059669]/10 text-[#059669] border border-[#059669]/20 uppercase tracking-wider">
                      {selectedPaymentForDetails.estado_validacion || 'Confirmado'}
                    </span>
                  </div>
                </div>

                {/* Socio Info */}
                <div>
                  <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Información del Cliente</h4>
                  <div className="bg-white border border-outline-variant rounded-lg p-3">
                    <div className="font-bold text-xs text-on-surface">{selectedPaymentForDetails.socio}</div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">folder</span>
                      Recibo Asociado: <span className="font-data-mono font-bold text-xs">{selectedPaymentForDetails.numero_comprobante}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Detalles de la Transacción</h4>
                  <div className="bg-white border border-outline-variant rounded-lg divide-y divide-outline-variant">
                    <DetailRow icon="calendar_today" label="Fecha y Hora" value={new Date(selectedPaymentForDetails.fecha_pago).toLocaleString('es-PE')} />
                    <DetailRow icon="payments" label="Método de Pago" value={selectedPaymentForDetails.metodo_pago} />
                    {selectedPaymentForDetails.numero_operacion && (
                      <DetailRow icon="tag" label="N° de Operación" value={selectedPaymentForDetails.numero_operacion} valueClassName="font-data-mono text-xs font-bold text-on-surface" />
                    )}
                  </div>
                </div>

                {/* Status Info */}
                {(() => {
                  const isPartial = isPartialPayment(selectedPaymentForDetails.monto_pagado, selectedPaymentForDetails.recibo_total);
                  const saldo = reciboSaldoMap.get(selectedPaymentForDetails.recibo_id) || 0;

                  return (
                    <div>
                      <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Estado del Recibo</h4>
                      <div className={`border rounded-lg p-3 ${isPartial ? 'bg-amber-50/50 border-amber-200' : 'bg-indigo-50/50 border-indigo-200'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-on-surface">Tipo de Abono</span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${isPartial ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {isPartial ? 'Abono Parcial' : 'Pago Completo'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[11px] text-on-surface-variant">Total del Recibo</span>
                          <span className="font-data-mono text-xs font-bold">
                            S/ {fmtCurrency(selectedPaymentForDetails.recibo_total)}
                          </span>
                        </div>

                        {isPartial && (
                          <div className="flex justify-between items-center pt-2 border-t border-amber-200/50">
                            <span className="text-[11px] text-amber-900 font-bold">Deuda Actual Restante</span>
                            <span className="font-data-mono text-xs font-bold text-amber-700">
                              S/ {fmtCurrency(saldo)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Actions */}
                <div className="pt-6 mt-auto">
                  <button
                    onClick={handleViewRecibo}
                    className="w-full py-1.5 h-8 bg-surface-container-low hover:bg-surface-variant border border-outline-variant text-on-surface text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                    Ver Recibo Completo
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>,
          document.body,
        )}
      </AnimatePresence>

    </main>
  );
};

export default Payments;
