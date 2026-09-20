import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import { toast } from 'sonner';
import { useYear } from '../../context/YearContext';
import PdfPreviewModal from '../../components/ui/PdfPreviewModal';
import { PaymentDetailRow as DetailRow } from './components/PaymentPresentation';
import { PaymentHistoryTable, PaymentsDashboard } from './components/PaymentsDashboard';
import CancelPaymentModal from './components/CancelPaymentModal';
import EditPaymentModal from './components/EditPaymentModal';
import { buildFilterParams, fmtCurrency, formatPeriod, getPagoTipoInfo } from './paymentUtils';

// ── Constants ────────────────────────────────────────────────────────
const MODAL_BACKDROP = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } };
const MODAL_CONTENT = { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.95, opacity: 0 }, transition: { duration: 0.2, ease: 'easeOut' } };


const PARTIAL_THRESHOLD = 0.02;

// ── Main Component ───────────────────────────────────────────────────
const Payments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeYear } = useYear();
  const queryClient = useQueryClient();

  // ── State ──────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState(location.state?.initialSearch || '');
  const [pdfUrl, setPdfUrl] = useState('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedPaymentForDetails, setSelectedPaymentForDetails] = useState(null);
  const [filterMes, setFilterMes] = useState('ULTIMO');
  const [showAnulados, setShowAnulados] = useState(true);
  const [actionMenu, setActionMenu] = useState(null);

  // ── React Query — data fetching ────────────────────────────────────

  const filterParams = useMemo(() => {
    const params = buildFilterParams(filterMes, activeYear);
    params.includeAnulados = showAnulados;
    return params;
  }, [filterMes, activeYear, showAnulados]);

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['pagos-data', filterParams],
    queryFn: async () => {
      const [pagosRes, recibosRes, periodosRes, statsRes] = await Promise.all([
        api.get('/pagos', { params: filterParams }),
        api.get('/recibos', { params: filterParams }),
        api.get('/periodos'),
        api.get('/pagos/stats', { params: filterParams }),
      ]);
      return {
        pagos: pagosRes.data,
        recibos: recibosRes.data,
        periodos: periodosRes.data,
        stats: statsRes.data,
      };
    },
    staleTime: 2 * 60 * 1000,
    onError: () => toast.error('Error al cargar datos de pagos'),
  });

  const pagos = useMemo(
    () => Array.isArray(fetchedData?.pagos) ? fetchedData.pagos : (fetchedData?.pagos?.data ?? []),
    [fetchedData?.pagos],
  );
  const allRecibos = useMemo(
    () => Array.isArray(fetchedData?.recibos) ? fetchedData.recibos : (fetchedData?.recibos?.data ?? []),
    [fetchedData?.recibos],
  );
  const periodos = useMemo(
    () => Array.isArray(fetchedData?.periodos) ? fetchedData.periodos : (fetchedData?.periodos?.data ?? []),
    [fetchedData?.periodos],
  );

  const refetchAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['pagos-data'] });
  }, [queryClient]);

  // Form state
  const [selectedRecibo, setSelectedRecibo] = useState('');
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('Transferencia');
  const [numeroOperacion, setNumeroOperacion] = useState('');
  const [searchSocio, setSearchSocio] = useState('');
  const [permitirPagoExtra, setPermitirPagoExtra] = useState(false);
  const [fechaPago, setFechaPago] = useState(() => {
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzOffset).toISOString().slice(0, 10);
  });
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

  // Modal Anular Pago state
  const [isAnularModalOpen, setIsAnularModalOpen] = useState(false);
  const [pagoToAnular, setPagoToAnular] = useState(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [isSubmittingAnular, setIsSubmittingAnular] = useState(false);

  // Modal Modificar Pago state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pagoToEdit, setPagoToEdit] = useState(null);
  const [editMetodoPago, setEditMetodoPago] = useState('Transferencia');
  const [editNumeroOperacion, setEditNumeroOperacion] = useState('');
  const [editFechaPago, setEditFechaPago] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // ── Memoised derived data ──────────────────────────────────────────
  const recibosDisponibles = useMemo(() => {
    if (permitirPagoExtra) {
      return allRecibos.filter(r => r.estado !== 'Anulado');
    }
    return allRecibos.filter(r => r.estado === 'Pendiente' || r.estado === 'Pago Parcial' || r.estado === 'Vencido');
  }, [allRecibos, permitirPagoExtra]);

  const uniqueMonths = useMemo(() =>
    periodos
      .filter(p => p.mes_anio?.includes(activeYear.toString()))
      .map(p => p.mes_anio)
      .sort()
      .reverse(),
    [periodos, activeYear],
  );

  useEffect(() => {
    if (filterMes === 'ULTIMO' && uniqueMonths.length > 0) {
      setFilterMes(uniqueMonths[0]);
    }
  }, [uniqueMonths, filterMes]);

  // KPIs procesados directamente desde la API
  const stats = fetchedData?.stats || {};
  const totalFacturado = stats.totalFacturado ?? 0;
  const totalRecaudado = stats.totalRecaudado ?? 0;
  const pendienteRecaudar = stats.pendienteRecaudar ?? Math.max(0, totalFacturado - totalRecaudado);
  const porcentajeRecaudado = stats.porcentajeRecaudado ?? (totalFacturado > 0 ? (totalRecaudado / totalFacturado) * 100 : 0);
  const facturasPagadas = stats.facturasPagadas ?? 0;
  const totalFacturas = stats.totalFacturas ?? 0;

  const recaudadoEfectivo = stats.recaudadoEfectivo ?? 0;
  const recaudadoTransferencia = stats.recaudadoTransferencia ?? 0;

  const filteredPagos = useMemo(() => {
    const term = searchTerm.toLowerCase();
    let list = pagos;
    if (term) {
      list = pagos.filter(p =>
        p.socio?.toLowerCase().includes(term) ||
        p.numero_comprobante?.toLowerCase().includes(term),
      );
    }
    return [...list].sort((a, b) => {
      const cmp = (a.socio || '').localeCompare(b.socio || '', 'es', { sensitivity: 'base' });
      if (cmp !== 0) return cmp;
      return new Date(b.fecha_pago || 0) - new Date(a.fecha_pago || 0);
    });
  }, [pagos, searchTerm]);

  const selectedReciboObj = useMemo(
    () => allRecibos.find(r => r.id === parseInt(selectedRecibo)),
    [allRecibos, selectedRecibo],
  );

  const saldoPendiente = useMemo(
    () => selectedReciboObj ? Math.max(0, parseFloat(selectedReciboObj.saldo_pendiente ?? selectedReciboObj.total ?? 0)) : 0,
    [selectedReciboObj],
  );

  const isPagoParcial = monto && parseFloat(monto) < saldoPendiente - PARTIAL_THRESHOLD && saldoPendiente > 0;
  const isPagoExcedido = monto && parseFloat(monto) > saldoPendiente + PARTIAL_THRESHOLD;

  const filteredSocios = useMemo(() => {
    let list = recibosDisponibles;
    if (searchSocio !== '*') {
      const term = searchSocio.toLowerCase();
      list = recibosDisponibles.filter(r =>
        (r.socio || '').toLowerCase().includes(term) ||
        (r.numero_comprobante || '').toLowerCase().includes(term) ||
        (r.medidor_num_serie && r.medidor_num_serie.toLowerCase().includes(term)) ||
        (r.num_medidor && r.num_medidor.toLowerCase().includes(term)) ||
        (r.num_serie && r.num_serie.toLowerCase().includes(term))
      );
    }
    return [...list].sort((a, b) => (a.socio || '').localeCompare(b.socio || '', 'es', { sensitivity: 'base' }));
  }, [recibosDisponibles, searchSocio]);

  // Map recibo_id -> saldo_pendiente for fast lookups in table rows


  // Map pago_id -> previous accumulated payment for its receipt (fallback if not provided by backend)
  const fallbackPrevioMap = useMemo(() => {
    const map = new Map();
    const sorted = [...pagos]
      .filter(p => p.estado_validacion !== 'Anulado')
      .sort((a, b) => new Date(a.fecha_pago).getTime() - new Date(b.fecha_pago).getTime() || a.id - b.id);

    const reciboAcumulado = new Map();
    sorted.forEach(p => {
      const prev = reciboAcumulado.get(p.recibo_id) || 0;
      map.set(p.id, prev);
      reciboAcumulado.set(p.recibo_id, prev + parseFloat(p.monto_pagado || 0));
    });
    return map;
  }, [pagos]);

  // ── Callbacks ──────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setSelectedRecibo('');
    setSearchSocio('');
    setMonto('');
    setMetodoPago('Transferencia');
    setNumeroOperacion('');
    setPermitirPagoExtra(false);
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    setFechaPago(new Date(Date.now() - tzOffset).toISOString().slice(0, 10));
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
    const displayText = recibo.medidor_num_serie
      ? `${recibo.socio} (Medidor: ${recibo.medidor_num_serie})`
      : recibo.socio;
    setSearchSocio(displayText);
    const saldo = parseFloat(recibo.saldo_pendiente ?? recibo.total ?? 0);
    setMonto(saldo > 0 ? saldo.toFixed(2) : '');
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
      const isPagoExtra = permitirPagoExtra || selectedReciboObj?.estado === 'Pagado';
      await api.post('/pagos', {
        recibo_id: selectedRecibo,
        monto_pagado: parseFloat(monto),
        metodo_pago: metodoPago,
        numero_operacion: numeroOperacion,
        fecha_pago: fechaPago,
        permitir_pago_adicional: isPagoExtra,
      });
      toast.success(isPagoExtra ? 'Pago adicional registrado exitosamente (saldo a favor acumulado)' : 'Pago registrado exitosamente');
      setIsModalOpen(false);
      resetForm();
      refetchAll();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al registrar el pago');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedRecibo, monto, metodoPago, numeroOperacion, fechaPago, resetForm, refetchAll, permitirPagoExtra, selectedReciboObj]);

  const handleConfirmAnularPago = useCallback(async (e) => {
    e.preventDefault();
    if (!pagoToAnular) return;
    if (!motivoAnulacion.trim()) {
      return toast.error('Debe ingresar un motivo para anular el pago');
    }

    setIsSubmittingAnular(true);
    try {
      await api.post(`/pagos/${pagoToAnular.id}/anular`, { motivo: motivoAnulacion.trim() });
      toast.success('Pago anulado exitosamente');
      setIsAnularModalOpen(false);
      setPagoToAnular(null);
      setMotivoAnulacion('');
      refetchAll();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al anular el pago');
    } finally {
      setIsSubmittingAnular(false);
    }
  }, [pagoToAnular, motivoAnulacion, refetchAll]);

  const handleExportExcel = useCallback(async () => {
    const pagosActivos = filteredPagos.filter(p => p.estado_validacion !== 'Anulado');
    if (!pagosActivos.length) {
      return toast.error('No hay pagos activos para exportar');
    }
    try {
      const params = { ...buildFilterParams(filterMes, activeYear), includeAnulados: false };
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
  }, [filteredPagos, filterMes, activeYear, searchTerm]);

  const handleExportPDF = useCallback(async () => {
    const pagosActivos = filteredPagos.filter(p => p.estado_validacion !== 'Anulado');
    if (!pagosActivos.length) {
      return toast.error('No hay pagos activos para exportar');
    }
    try {
      toast.info('Generando PDF, por favor espere...');
      const params = { ...buildFilterParams(filterMes, activeYear), includeAnulados: false };
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
  }, [filteredPagos, filterMes, activeYear, searchTerm]);

  const handleExportAllPdf = useCallback(async () => {
    const pagosActivos = filteredPagos.filter(p => p.estado_validacion !== 'Anulado');
    if (!pagosActivos.length) {
      return toast.error('No hay pagos activos para exportar');
    }
    try {
      toast.loading('Generando PDF masivo...', { id: 'pdfMasivo' });
      const params = { ...buildFilterParams(filterMes, activeYear), includeAnulados: false };
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/pagos/export/all', { params, responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tickets_masivos_${params.periodo || params.year || 'historico'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF masivo descargado exitosamente', { id: 'pdfMasivo' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al generar PDF masivo', { id: 'pdfMasivo' });
    }
  }, [filteredPagos, filterMes, activeYear, searchTerm]);

  const handleWhatsApp = useCallback(async (pago) => {
    if (!pago.telefono) {
      return toast.error('El socio no tiene un número de teléfono registrado.');
    }

    let phone = pago.telefono.replace(/\s+/g, '');
    if (!phone.startsWith('+')) {
      if (phone.length === 9) phone = '51' + phone;
    } else {
      phone = phone.replace('+', '');
    }

    const monto = parseFloat(pago.monto_pagado).toLocaleString('en-US', { minimumFractionDigits: 2 });
    const fecha = new Date(pago.fecha_pago).toLocaleDateString('es-PE');
    const comprobante = pago.numero_comprobante || 'S/N';
    const msg = `Hola *${pago.socio}*, confirmamos la recepción de su pago por *S/ ${monto}* el día *${fecha}* correspondiente al comprobante *${comprobante}*. ¡Gracias por su puntualidad!`;

    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`, '_blank');
  }, []);

  const handleViewRecibo = useCallback(() => {
    if (!selectedPaymentForDetails) return;
    const reciboId = selectedPaymentForDetails.recibo_id;
    setSelectedPaymentForDetails(null);
    navigate(`/receipt_detail?id=${reciboId}`, { state: { from: '/payments' } });
  }, [selectedPaymentForDetails, navigate]);

  const handlePrintTicket = useCallback(async (pagoId) => {
    try {
      const response = await api.get(`/pagos/${pagoId}/ticket`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
      // No revoke right away since window.open needs time to load it
    } catch {
      toast.error('Error al generar el ticket');
    }
  }, []);

  const handleViewPdfRecibo = useCallback(async (reciboId) => {
    try {
      const response = await api.get(`/recibos/${reciboId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch {
      toast.error('Error al generar el recibo PDF');
    }
  }, []);



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

  const handleOpenMenu = useCallback((pago, e) => {
    e.stopPropagation();
    if (actionMenu?.pago?.id === pago.id) {
      setActionMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuHeight = 240;
    const openUp = spaceBelow < menuHeight && rect.top > menuHeight;

    setActionMenu({
      pago,
      top: openUp ? undefined : rect.bottom + 4,
      bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
      right: Math.max(12, window.innerWidth - rect.right),
    });
  }, [actionMenu]);

  // Close action dropdown on Escape, scroll or resize
  useEffect(() => {
    if (!actionMenu) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') setActionMenu(null); };
    const handleScrollOrResize = () => setActionMenu(null);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [actionMenu]);

  const handleOpenEditModal = useCallback((pago) => {
    setPagoToEdit(pago);
    setEditMetodoPago(pago.metodo_pago || 'Transferencia');
    setEditNumeroOperacion(pago.numero_operacion || '');

    if (pago.fecha_pago) {
      const d = new Date(pago.fecha_pago);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        setEditFechaPago(`${year}-${month}-${day}`);
      } else {
        setEditFechaPago('');
      }
    } else {
      setEditFechaPago('');
    }
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    if (isSubmittingEdit) return;
    setIsEditModalOpen(false);
    setPagoToEdit(null);
  }, [isSubmittingEdit]);

  const handleConfirmEditPago = useCallback(async (e) => {
    e.preventDefault();
    if (!pagoToEdit) return;

    if (!editFechaPago) {
      return toast.error('Debe seleccionar una fecha de pago');
    }
    if (!editMetodoPago) {
      return toast.error('Debe seleccionar un método de pago');
    }

    setIsSubmittingEdit(true);
    try {
      const fechaFull = `${editFechaPago} 12:00:00`;

      await api.put(`/pagos/${pagoToEdit.id}`, {
        fecha_pago: fechaFull,
        metodo_pago: editMetodoPago,
        numero_operacion: editNumeroOperacion.trim() || null,
      });

      toast.success('Pago modificado exitosamente');
      setIsEditModalOpen(false);
      setPagoToEdit(null);
      refetchAll();

      setSelectedPaymentForDetails(prev => {
        if (prev && prev.id === pagoToEdit.id) {
          return {
            ...prev,
            fecha_pago: fechaFull,
            metodo_pago: editMetodoPago,
            numero_operacion: editNumeroOperacion.trim() || null,
          };
        }
        return prev;
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al modificar el pago');
    } finally {
      setIsSubmittingEdit(false);
    }
  }, [pagoToEdit, editFechaPago, editMetodoPago, editNumeroOperacion, refetchAll]);

  // Close edit modal with Escape key
  useEffect(() => {
    if (!isEditModalOpen) return;
    const handler = (e) => { if (e.key === 'Escape' && !isSubmittingEdit) handleCloseEditModal(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isEditModalOpen, isSubmittingEdit, handleCloseEditModal]);

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-4 max-w-[1600px] w-full mx-auto relative">

      <PaymentsDashboard
        filterMes={filterMes}
        onFilterChange={setFilterMes}
        year={activeYear}
        months={uniqueMonths}
        formatPeriod={formatPeriod}
        showAnulados={showAnulados}
        onShowAnuladosChange={setShowAnulados}
        onRegister={openModal}
        canRegister={isFilterSpecific}
        metrics={{ totalFacturado, totalRecaudado, facturasPagadas, totalFacturas, pendienteRecaudar, porcentajeRecaudado, recaudadoEfectivo, recaudadoTransferencia }}
        formatCurrency={fmtCurrency}
      />

      <PaymentHistoryTable
        payments={filteredPagos}
        loading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showAnulados={showAnulados}
        onToggleAnulados={() => setShowAnulados((current) => !current)}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        onExportTickets={handleExportAllPdf}
        fallbackMap={fallbackPrevioMap}
        onSelect={setSelectedPaymentForDetails}
        onOpenMenu={handleOpenMenu}
        openMenuPaymentId={actionMenu?.pago?.id}
        getTipoInfo={getPagoTipoInfo}
        formatCurrency={fmtCurrency}
      />

      {/* Modal Registrar Pago */}

      {isModalOpen && (
        <div {...MODAL_BACKDROP} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div {...MODAL_CONTENT} className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">

            {/* Header */}
            <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
              <h3 className="text-base text-primary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]" translate="no">payments</span>
                Registrar Nuevo Pago
                {filterMes && filterMes !== 'Todos' && filterMes !== 'TodosHistorico' && filterMes !== 'ULTIMO' && (
                  <span className="ml-2 text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                    {filterMes}
                  </span>
                )}
              </h3>
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="w-7 h-7 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]" translate="no">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <form id="registrar-pago-form" onSubmit={handleRegistrarPago} className="space-y-4">

                {/* Recibo Pendiente (Autocomplete) */}
                <div className="bg-surface-container-lowest border border-outline-variant p-3 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                      Socio, Recibo o Medidor <span className="text-error">*</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px] text-on-surface-variant hover:text-primary transition-colors">
                      <input
                        type="checkbox"
                        checked={permitirPagoExtra}
                        onChange={(e) => {
                          setPermitirPagoExtra(e.target.checked);
                          if (!e.target.checked && selectedReciboObj?.estado === 'Pagado') {
                            setSelectedRecibo('');
                            setSearchSocio('');
                            setMonto('');
                          }
                        }}
                        className="rounded border-outline-variant text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="font-semibold">Incluir recibos ya pagados (Pago extra / Saldo a favor)</span>
                    </label>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]" translate="no">search</span>
                    <input
                      type="text"
                      className="w-full border border-outline-variant rounded-md text-xs bg-white focus:border-primary focus:ring-1 focus:ring-primary pl-8 pr-3 py-1.5 h-8 outline-none transition-colors hover:border-primary/50"
                      placeholder="Buscar por nombre, N° recibo o medidor..."
                      value={searchSocio}
                      onChange={handleSocioSearch}
                      onFocus={() => setIsAutocompleteOpen(true)}
                    />

                    {/* Dropdown de Autocomplete */}
                    {isAutocompleteOpen && !selectedRecibo && (
                      <div className="absolute z-10 w-full mt-1 bg-surface border border-outline-variant rounded-md shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredSocios.length === 0 ? (
                          <div className="p-2 text-xs text-on-surface-variant text-center">No se encontraron recibos disponibles</div>
                        ) : (
                          filteredSocios.map(r => {
                            const saldo = parseFloat(r.saldo_pendiente ?? r.total ?? 0);
                            const total = parseFloat(r.total ?? 0);
                            const isPagado = r.estado === 'Pagado' || saldo <= 0.02;
                            const isParcial = !isPagado && (r.estado === 'Pago Parcial' || (saldo > 0 && total > 0 && saldo < total - 0.05));

                            return (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => handleSelectSocio(r)}
                                className={`w-full text-left px-3 py-2 border-b border-outline-variant/50 last:border-0 transition-colors flex flex-col ${
                                  isParcial
                                    ? 'bg-amber-500/10 hover:bg-amber-500/20 border-l-4 border-l-amber-500'
                                    : isPagado
                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-l-4 border-l-emerald-500'
                                    : 'hover:bg-surface-container-low'
                                }`}
                              >
                                <div className="flex justify-between items-center gap-2">
                                  <span className={`font-bold text-xs ${
                                    isParcial ? 'text-amber-950 font-extrabold' : isPagado ? 'text-emerald-950 font-extrabold' : 'text-on-surface'
                                  }`}>
                                    {r.socio}
                                  </span>
                                  {isParcial && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-800 border border-amber-500/30 shrink-0">
                                      <span className="material-symbols-outlined text-[11px]" translate="no">timelapse</span>
                                      Pago Parcial
                                    </span>
                                  )}
                                  {isPagado && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-800 border border-emerald-500/30 shrink-0">
                                      <span className="material-symbols-outlined text-[11px]" translate="no">check_circle</span>
                                      Pagado
                                    </span>
                                  )}
                                </div>
                                <div className="flex justify-between items-center mt-0.5">
                                  <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]" translate="no">receipt_long</span>
                                    {r.numero_comprobante}
                                    {r.medidor_num_serie && (
                                      <>
                                        <span className="mx-1">•</span>
                                        <span className="material-symbols-outlined text-[12px]" translate="no">speed</span>
                                        {r.medidor_num_serie}
                                      </>
                                    )}
                                  </span>
                                  <span className={`text-[10px] font-bold font-data-mono ${
                                    isPagado ? 'text-emerald-700' : isParcial ? 'text-amber-700' : 'text-error'
                                  }`}>
                                    {isPagado ? 'Al día (S/ 0.00)' : isParcial ? 'Saldo: ' : 'Deuda: '}S/ {saldo.toFixed(2)}
                                  </span>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {/* Alerta informativa si se seleccionó un recibo ya pagado */}
                  {selectedReciboObj?.estado === 'Pagado' && (
                    <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-[11px] text-emerald-900 flex items-start gap-2 animate-in fade-in duration-200">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600 mt-0.5 shrink-0" translate="no">savings</span>
                      <div>
                        <span className="font-bold block">Recibo cancelado en su totalidad (S/ 0.00 pendiente)</span>
                        <span>El monto ingresado aquí se registrará como abono adicional y se acreditará automáticamente al <strong>Saldo a Favor</strong> del socio.</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Monto Pagado */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider pl-1">
                      Monto Pagado (S/) <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none" translate="no">attach_money</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        className={`w-full border rounded-md pl-8 pr-3 py-1.5 h-8 bg-white font-data-mono text-xs font-medium outline-none transition-colors ${
                          selectedReciboObj?.estado === 'Pagado'
                            ? 'border-[#059669] focus:border-[#059669] focus:ring-1 focus:ring-[#059669]'
                            : (isPagoExcedido || isPagoParcial)
                            ? 'border-amber-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                            : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'
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
                      {selectedReciboObj?.estado === 'Pagado' ? (
                        <span className="text-[10px] text-[#059669] font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]" translate="no">savings</span>
                          Abono adicional a saldo a favor: S/ {parseFloat(monto || 0).toFixed(2)}
                        </span>
                      ) : isPagoExcedido ? (
                        <span className="text-[10px] text-[#059669] font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]" translate="no">account_balance_wallet</span>
                          Saldo a favor: S/ {(parseFloat(monto) - saldoPendiente).toFixed(2)}
                        </span>
                      ) : isPagoParcial ? (
                        <span className="text-[10px] text-amber-700 font-medium">Quedará saldo de S/ {(saldoPendiente - parseFloat(monto)).toFixed(2)}</span>
                      ) : selectedRecibo && monto ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-[#047857]">
                          <span className="material-symbols-outlined text-[12px]" translate="no">check_circle</span>
                          Pago Completo
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Método de Pago */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider pl-1">Método de Pago <span className="text-error">*</span></label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]" translate="no">account_balance</span>
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
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[16px]" translate="no">expand_more</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Nº Operación */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider pl-1">Nº Operación / Referencia</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]" translate="no">tag</span>
                      <input
                        type="text"
                        className="w-full border border-outline-variant rounded-md pl-8 pr-3 py-1.5 h-8 bg-white font-data-mono text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                        value={numeroOperacion}
                        onChange={(e) => setNumeroOperacion(e.target.value)}
                        placeholder="Opcional"
                      />
                    </div>
                  </div>

                  {/* Fecha de Pago */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider pl-1">Fecha de Pago <span className="text-error">*</span></label>
                    <div className="relative">
                      <input
                        type="date"
                        className="w-full border border-outline-variant rounded-md px-3 py-1.5 h-8 bg-white font-data-mono text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                        value={fechaPago}
                        onChange={(e) => setFechaPago(e.target.value)}
                        required
                      />
                    </div>
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
                  <><span className="material-symbols-outlined animate-spin text-[16px]" translate="no">sync</span> Procesando...</>
                ) : (
                  <><span className="material-symbols-outlined text-[16px]" translate="no">save</span> Confirmar Pago</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}


      {isPdfModalOpen && <PdfPreviewModal pdfBlobUrl={pdfUrl} title="Historial de Pagos" downloadFileName={`Pagos_Parque_Industrial_${new Date().toISOString().slice(0, 10)}.pdf`} onClose={closePdfModal} />}

      {/* Dropdown flotante de Acciones */}
      {actionMenu && createPortal(
        <div className="dropdown-portal">
          <div
            className="fixed inset-0 z-[80]"
            onClick={() => setActionMenu(null)}
            onContextMenu={(e) => { e.preventDefault(); setActionMenu(null); }}
          />
          <div
            style={{
              top: actionMenu.top !== undefined ? `${actionMenu.top}px` : 'auto',
              bottom: actionMenu.bottom !== undefined ? `${actionMenu.bottom}px` : 'auto',
              right: `${actionMenu.right}px`,
            }}
            className="fixed z-[85] w-56 bg-white rounded-xl shadow-2xl border border-outline-variant/80 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del dropdown */}
            <div className="px-3.5 py-2 mb-1 border-b border-outline-variant/50 flex items-center justify-between bg-surface-container-lowest">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Acciones</span>
              <span className="font-data-mono text-[10px] font-bold text-primary">{actionMenu.pago.numero_comprobante || 'S/N'}</span>
            </div>

            {actionMenu.pago.estado_validacion === 'Anulado' ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const p = actionMenu.pago;
                    setActionMenu(null);
                    setSelectedPaymentForDetails(p);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-error hover:bg-error/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]" translate="no">info</span>
                  <span>Ver Detalle y Motivo</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const p = actionMenu.pago;
                    setActionMenu(null);
                    handleViewPdfRecibo(p.recibo_id);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary" translate="no">picture_as_pdf</span>
                  <span>Ver Recibo Original</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const p = actionMenu.pago;
                    setActionMenu(null);
                    handlePrintTicket(p.id);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary" translate="no">receipt_long</span>
                  <span>Imprimir Ticket</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const p = actionMenu.pago;
                    setActionMenu(null);
                    handleWhatsApp(p);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#25D366]" translate="no">chat</span>
                  <span>Enviar por WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const p = actionMenu.pago;
                    setActionMenu(null);
                    handleViewPdfRecibo(p.recibo_id);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary" translate="no">picture_as_pdf</span>
                  <span>Ver Recibo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const p = actionMenu.pago;
                    setActionMenu(null);
                    handleOpenEditModal(p);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-amber-600" translate="no">edit</span>
                  <span>Modificar Pago</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const p = actionMenu.pago;
                    setActionMenu(null);
                    setSelectedPaymentForDetails(p);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant" translate="no">visibility</span>
                  <span>Ver Detalle</span>
                </button>

                <div className="my-1 border-t border-outline-variant/60" />

                <button
                  type="button"
                  onClick={() => {
                    const p = actionMenu.pago;
                    setActionMenu(null);
                    setPagoToAnular(p);
                    setMotivoAnulacion('');
                    setIsAnularModalOpen(true);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-error hover:bg-error/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]" translate="no">delete</span>
                  <span>Anular Pago</span>
                </button>
              </>
            )}
          </div>
        </div>,
        document.body
      )}

      {isAnularModalOpen && pagoToAnular && (
        <CancelPaymentModal
          payment={pagoToAnular}
          reason={motivoAnulacion}
          onReasonChange={setMotivoAnulacion}
          onSubmit={handleConfirmAnularPago}
          onClose={() => { if (!isSubmittingAnular) { setIsAnularModalOpen(false); setPagoToAnular(null); setMotivoAnulacion(''); } }}
          isSubmitting={isSubmittingAnular}
          formatCurrency={fmtCurrency}
          backdropProps={MODAL_BACKDROP}
          contentProps={MODAL_CONTENT}
        />
      )}

      {isEditModalOpen && pagoToEdit && <EditPaymentModal payment={pagoToEdit} method={editMetodoPago} onMethodChange={setEditMetodoPago} operation={editNumeroOperacion} onOperationChange={setEditNumeroOperacion} date={editFechaPago} onDateChange={setEditFechaPago} onSubmit={handleConfirmEditPago} onClose={handleCloseEditModal} isSubmitting={isSubmittingEdit} formatCurrency={fmtCurrency} backdropProps={MODAL_BACKDROP} contentProps={MODAL_CONTENT} />}

      {/* Drawer de Detalles del Pago (Portal) */}

      {selectedPaymentForDetails && createPortal(
        <div
          {...MODAL_BACKDROP}
          className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeDetailsDrawer(); }}
        >
          <div
            className="w-full max-w-sm bg-surface h-full shadow-2xl flex flex-col"
          >
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <h3 className="text-base text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary" translate="no">receipt_long</span>
                Detalle del Pago
              </h3>
              <button
                onClick={closeDetailsDrawer}
                className="w-7 h-7 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]" translate="no">close</span>
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">

              {/* Header/Amount */}
              <div className="bg-surface-container-low rounded-xl p-4 flex flex-col items-center justify-center border border-outline-variant/50">
                <span className="text-[10px] text-on-surface-variant font-bold tracking-wider mb-1.5 uppercase">MONTO PAGADO</span>
                <span className="font-data-mono text-3xl font-bold text-primary">
                  S/ {fmtCurrency(selectedPaymentForDetails.monto_pagado)}
                </span>
                <div className="mt-3 flex flex-col items-center gap-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    selectedPaymentForDetails.estado_validacion === 'Anulado'
                      ? 'bg-error/10 text-error border border-error/20'
                      : 'bg-[#059669]/10 text-[#059669] border border-[#059669]/20'
                  }`}>
                    {selectedPaymentForDetails.estado_validacion || 'Confirmado'}
                  </span>
                  {selectedPaymentForDetails.motivo_anulacion && (
                    <span className="text-[10px] text-error/90 italic bg-error/5 border border-error/10 rounded px-2.5 py-1 text-center mt-1 max-w-xs">
                      Motivo: {selectedPaymentForDetails.motivo_anulacion}
                    </span>
                  )}
                </div>
              </div>

              {/* Socio Info */}
              <div>
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Información del Cliente</h4>
                <div className="bg-white border border-outline-variant rounded-lg p-3">
                  <div className="font-bold text-xs text-on-surface">{selectedPaymentForDetails.socio}</div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]" translate="no">folder</span>
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
                const fallbackPrev = fallbackPrevioMap.get(selectedPaymentForDetails.id) || 0;
                const tipoInfo = getPagoTipoInfo(selectedPaymentForDetails, fallbackPrev);

                return (
                  <div>
                    <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Detalle del Pago</h4>
                    <div className={`border rounded-lg p-3 ${tipoInfo.boxClass}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-on-surface">Tipo de Abono</span>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${tipoInfo.badgeClass}`}>
                          {tipoInfo.drawerLabel}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] text-on-surface-variant">Total del Recibo</span>
                        <span className="font-data-mono text-xs font-bold">
                          S/ {fmtCurrency(selectedPaymentForDetails.recibo_total)}
                        </span>
                      </div>

                      {tipoInfo.previo > 0 && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[11px] text-on-surface-variant">Pagos Anteriores al Recibo</span>
                          <span className="font-data-mono text-xs font-medium text-on-surface-variant">
                            S/ {fmtCurrency(tipoInfo.previo)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] text-on-surface-variant">Monto de este Pago</span>
                        <span className="font-data-mono text-xs font-bold text-on-surface">
                          S/ {fmtCurrency(selectedPaymentForDetails.monto_pagado)}
                        </span>
                      </div>

                      {tipoInfo.tipo === 'Parcial' && (
                        <div className="flex justify-between items-center pt-2 border-t border-amber-200/50">
                          <span className="text-[11px] text-amber-900 font-bold">Deuda Restante tras este Pago</span>
                          <span className="font-data-mono text-xs font-bold text-amber-700">
                            S/ {fmtCurrency(tipoInfo.restante)}
                          </span>
                        </div>
                      )}

                      {tipoInfo.subtextType === 'a_favor' && (
                        <div className="flex justify-between items-center pt-2 border-t border-emerald-200/50">
                          <span className="text-[11px] text-emerald-900 font-bold">Saldo a Favor Generado</span>
                          <span className="font-data-mono text-xs font-bold text-emerald-700">
                            S/ {fmtCurrency(tipoInfo.aFavor)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="pt-6 mt-auto space-y-2">
                {selectedPaymentForDetails.estado_validacion !== 'Anulado' && (
                  <button
                    onClick={() => {
                      handleOpenEditModal(selectedPaymentForDetails);
                    }}
                    className="w-full py-1.5 h-8 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-900 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]" translate="no">edit</span>
                    Modificar Datos del Pago
                  </button>
                )}
                <button
                  onClick={handleViewRecibo}
                  className="w-full py-1.5 h-8 bg-surface-container-low hover:bg-surface-variant border border-outline-variant text-on-surface text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]" translate="no">receipt_long</span>
                  Ver Recibo Completo
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}


    </main>
  );
};

export default Payments;
