import  { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import api from '../../api/axiosConfig';
import ReceiptDetail from '../receipt-detail/ReceiptDetailPage';
import { useYear } from '../../context/YearContext';
import GenerateInvoicesModal from '../invoices/GenerateInvoicesModal';

// Extracted subcomponents & utilities
import {
  BillingKPICards,
  BillingTableRow,
  PdfViewerModal,
  RefacturarModal,
  DeudasModal,
  HistorialModal,
  formatPeriod,
} from './index';
import PagosReciboModal from './PagosReciboModal';
import { DeudaPersonalizadaModal } from '../manual-billing/components/DeudaPersonalizadaModal';

// Custom hooks
import { useBillingData } from './hooks/useBillingData';
import { usePdfViewer } from './hooks/usePdfViewer';
import { useRefacturar } from './hooks/useRefacturar';
import { useExports } from './hooks/useExports';
import LoadingCurtain from '../../components/ui/LoadingCurtain';
import { BillingHeader } from './components/BillingWorkspace';
import BillingTableControls from './components/BillingTableControls';
import { useFloatingActionMenu } from '../../hooks/useFloatingActionMenu';
import BillingActionMenu from './components/BillingActionMenu';
import BillingMobileCard from './components/BillingMobileCard';

const Billing = () => {
  const { activeYear } = useYear();


  // --- UI State ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [periodoToGenerate, setPeriodoToGenerate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeudasModal, setShowDeudasModal] = useState(false);
  const [historialReceiptId, setHistorialReceiptId] = useState(null);

  const [deudaModalOpen, setDeudaModalOpen] = useState(false);
  const [deudaReciboData, setDeudaReciboData] = useState(null);
  const { actionMenu, setActionMenu, openActionMenu } = useFloatingActionMenu({ menuHeight: 260 });
  const [pagosReciboModal, setPagosReciboModal] = useState(null); // recibo para Ver Pagos
  const [confirmarPendienteRecibo, setConfirmarPendienteRecibo] = useState(null);
  const [isProcessingPendiente, setIsProcessingPendiente] = useState(false);

  // --- Filter State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterMes, setFilterMes] = useState('ULTIMO');


  // --- Receipt Detail Drawer ---
  const [drawerReceiptId, setDrawerReceiptId] = useState(null);

  // --- Dropdown ref for click-outside detection ---
  const dropdownRef = useRef(null);

  // =========================================================================
  // Data & Derived State (via custom hooks)
  // =========================================================================

  const { recibos, totalRecibos, periodos, globalStats, isLoading, filterParams, refetchAll } = useBillingData({
    filterMes,
    filterEstado,
    debouncedSearchTerm,
    activeYear,
  });

  // --- Manejo para poner recibo en Pendiente ---
  const handleSolicitarPendiente = useCallback(async (r) => {
    try {
      const res = await api.get(`/pagos/recibo/${r.id}`);
      const pagos = Array.isArray(res.data) ? res.data : [];
      const pagosActivos = pagos.filter((p) => p.estado_validacion !== 'Anulado' && !p.deleted_at);

      if (pagosActivos.length > 0) {
        const total = pagosActivos.reduce((sum, p) => sum + parseFloat(p.monto_pagado || 0), 0);
        setPagosReciboModal({
          ...r,
          initialWarning: `Este recibo tiene ${pagosActivos.length} pago(s) activo(s) por un total de S/ ${total.toFixed(2)}. Debe anularlos para poder cambiar el estado a Pendiente.`
        });
      } else {
        setConfirmarPendienteRecibo(r);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al verificar pagos del recibo');
    }
  }, []);

  const handleConfirmarPonerPendiente = useCallback(async () => {
    if (!confirmarPendienteRecibo) return;
    setIsProcessingPendiente(true);
    try {
      await api.post(`/recibos/${confirmarPendienteRecibo.id}/marcar-pendiente`);
      toast.success(`Recibo ${confirmarPendienteRecibo.numero_comprobante || ''} cambiado a Pendiente exitosamente`);
      setConfirmarPendienteRecibo(null);
      refetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cambiar el recibo a Pendiente');
    } finally {
      setIsProcessingPendiente(false);
    }
  }, [confirmarPendienteRecibo, refetchAll]);

  // --- Ordenamiento alfabético por Empresa / Socio ---
  const [sortAsc, setSortAsc] = useState(true);

  const sortedRecibos = useMemo(() => {
    return [...recibos].sort((a, b) => {
      const nameA = (a.socio || a.nombre_razonsocial || '').trim();
      const nameB = (b.socio || b.nombre_razonsocial || '').trim();
      const cmp = nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
      if (cmp !== 0) return sortAsc ? cmp : -cmp;
      const serieA = a.medidor_num_serie || '';
      const serieB = b.medidor_num_serie || '';
      return sortAsc
        ? serieA.localeCompare(serieB, 'es', { numeric: true })
        : serieB.localeCompare(serieA, 'es', { numeric: true });
    });
  }, [recibos, sortAsc]);

  // --- Derived values ---
  const uniqueMonths = useMemo(
    () =>
      periodos
        .filter((p) => p.mes_anio && p.mes_anio.includes(activeYear.toString()))
        .map((p) => p.mes_anio)
        .sort()
        .reverse(),
    [periodos, activeYear],
  );

  const pdf = usePdfViewer();
  const refacturar = useRefacturar(refetchAll);
  const exports = useExports({ filterParams, filterMes, activeYear, uniqueMonths, recibos });

  const totalRecaudado = useMemo(() => parseFloat(globalStats?.totalRecaudado || 0), [globalStats]);
  const pendienteCobro = useMemo(() => parseFloat(globalStats?.pendienteCobro || 0), [globalStats]);
  const usuariosPendientes = useMemo(() => parseInt(globalStats?.usuariosPendientes || 0, 10), [globalStats]);
  const deudaVencida = useMemo(() => parseFloat(globalStats?.deudaVencida || 0), [globalStats]);
  const usuariosVencidos = useMemo(() => parseInt(globalStats?.usuariosVencidos || 0, 10), [globalStats]);

  const totalMedidores = useMemo(() => parseInt(globalStats?.totalMedidores || 0, 10), [globalStats]);
  const sociosSinMedidor = useMemo(() => parseInt(globalStats?.sociosSinMedidor || 0, 10), [globalStats]);
  const faltanLecturar = useMemo(() => parseInt(globalStats?.faltanLecturar || 0, 10), [globalStats]);
  const pendientesFacturar = useMemo(() => parseInt(globalStats?.pendientesFacturar || 0, 10), [globalStats]);



  // =========================================================================
  // Effects
  // =========================================================================

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Set latest period as default
  useEffect(() => {
    if (filterMes === 'ULTIMO' && uniqueMonths.length > 0) {
      setFilterMes(uniqueMonths[0]);
    }
  }, [uniqueMonths, filterMes]);



  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isDropdownOpen]);

  // =========================================================================
  // Handlers
  // =========================================================================

  const handleGenerateFromDropdown = useCallback(() => {
    setIsDropdownOpen(false);
    const selected = filterMes !== 'Todos' ? filterMes : uniqueMonths[0];
    if (!selected) return toast.error('No hay periodos disponibles para generar.');
    const periodoObj = periodos.find((p) => p.mes_anio === selected);
    if (periodoObj) {
      setPeriodoToGenerate(periodoObj.id);
      setIsGenerateModalOpen(true);
    } else {
      toast.error('Periodo no encontrado.');
    }
  }, [filterMes, uniqueMonths, periodos]);



  const handleExportPDF = useCallback(async () => {
    if (!recibos || recibos.length === 0) {
      return toast.error('No hay recibos para exportar');
    }
    await pdf.openReportePdf(filterParams);
  }, [recibos, pdf, filterParams]);

  const handleExportExcelDeudas = useCallback(
    async (tipo) => {
      setShowDeudasModal(false);
      await exports.handleExportExcelDeudas(tipo);
    },
    [exports],
  );

  const handleOpenMenu = useCallback((recibo, e) => {
    openActionMenu(e, { recibo }, recibo.id);
  }, [openActionMenu]);

  const activeHeaderTitle =
    filterMes === 'TodosHistorico'
      ? 'Histórico General'
      : filterMes !== 'Todos'
      ? formatPeriod(filterMes)
      : uniqueMonths.length > 0
      ? formatPeriod(uniqueMonths[0])
      : 'Actual';

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <>
      <LoadingCurtain
        isOpen={isLoading}
        title="Preparando la facturación"
        subtitle="Consultando recibos, estadísticas y periodos disponibles."
      />

      <LoadingCurtain
        isOpen={pdf.isGenerating}
        title="Creando tu documento"
        subtitle="Estamos organizando la información y generando el archivo PDF."
      />

      <main className="p-4 md:p-xl space-y-4 md:space-y-lg max-w-[1600px] mx-auto w-full flex-grow relative">
      <BillingHeader activeTitle={activeHeaderTitle} filterMes={filterMes} onFilterChange={setFilterMes} year={activeYear} months={uniqueMonths} onGenerate={handleGenerateFromDropdown} />

      {/* KPI Cards + Progress Bar */}
      <BillingKPICards
        totalRecaudado={totalRecaudado}
        pendienteCobro={pendienteCobro}
        deudaVencida={deudaVencida}
        usuariosPendientes={usuariosPendientes}
        usuariosVencidos={usuariosVencidos}
        totalMedidores={totalMedidores}
        sociosSinMedidor={sociosSinMedidor}
        faltanLecturar={faltanLecturar}
        pendientesFacturar={pendientesFacturar}
      />

      {/* Table Area */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
        <BillingTableControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((current) => !current)}
          filterEstado={filterEstado}
          onStatusChange={setFilterEstado}
          filterMes={filterMes}
          onPeriodChange={setFilterMes}
          year={activeYear}
          months={uniqueMonths}
          onExportExcel={exports.handleExportExcel}
          onOpenDebts={() => setShowDeudasModal(true)}
          onExportPDF={handleExportPDF}
          onPrintReceipts={exports.handleExportAllPdfV2}
        />

        {/* Mobile receipt cards */}
        <div className="md:hidden divide-y divide-outline-variant/60 bg-surface">
          {isLoading ? (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-[24px]" translate="no">sync</span>
            </div>
          ) : sortedRecibos.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[32px] opacity-20 mb-2 block" translate="no">search_off</span>
              <p className="font-bold">No se encontraron recibos</p>
            </div>
          ) : sortedRecibos.map((recibo) => (
            <BillingMobileCard
              key={recibo.id}
              receipt={recibo}
              onViewDetail={setDrawerReceiptId}
              onViewHistory={setHistorialReceiptId}
              onViewPayments={setPagosReciboModal}
              onOpenMenu={handleOpenMenu}
              isMenuOpen={actionMenu?.recibo?.id === recibo.id}
            />
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse table-auto whitespace-nowrap">
            <thead className="bg-surface-container-lowest border-b border-outline-variant text-on-surface-variant text-[11px] uppercase tracking-wider sticky top-0 z-10 shadow-sm">
              <tr>
                <th
                  onClick={() => setSortAsc((prev) => !prev)}
                  className="px-4 py-2 font-semibold cursor-pointer select-none hover:bg-surface-container-high transition-colors group/sort"
                  title="Clic para alternar orden alfabético"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Empresa / Socio</span>
                    <span className="material-symbols-outlined text-[15px] text-primary transition-transform" translate="no">
                      {sortAsc ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                    <span className="text-[10px] text-primary/80 font-bold lowercase">
                      ({sortAsc ? 'a-z' : 'z-a'})
                    </span>
                  </div>
                </th>
                <th className="px-4 py-2 font-semibold">Periodo</th>
                <th className="px-4 py-2 font-semibold">Monto / Venc.</th>
                <th className="px-4 py-2 font-semibold text-center">Estado</th>
                <th className="px-4 py-2 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50 bg-surface">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-[24px]" translate="no">sync</span>
                  </td>
                </tr>
              ) : sortedRecibos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[32px] opacity-20 mb-2 block" translate="no">search_off</span>
                    <p className="font-bold">No se encontraron recibos</p>
                  </td>
                </tr>
              ) : (
                sortedRecibos.map((recibo) => (
                  <BillingTableRow
                    key={recibo.id}
                    recibo={recibo}
                    onViewDetail={setDrawerReceiptId}
                    onViewHistorial={setHistorialReceiptId}
                    onViewPagos={setPagosReciboModal}
                    onOpenMenu={handleOpenMenu}
                    isMenuOpen={actionMenu?.recibo?.id === recibo.id}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-lg py-sm border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between gap-2">
          <span className="text-xs text-on-surface-variant font-medium">Mostrando todos los recibos del filtro seleccionado · {totalRecibos} registros</span>
        </div>
      </div>

      {/* ======================== MODALS ======================== */}

      <PdfViewerModal
        isOpen={pdf.isPdfModalOpen}
        pdfUrl={pdf.pdfUrl}
        pdfId={pdf.pdfId}
        onDownload={pdf.downloadFromModal}
        onClose={pdf.closePdfModal}
      />

      {drawerReceiptId && (
        <ReceiptDetail receiptId={drawerReceiptId} onClose={() => { setDrawerReceiptId(null); refetchAll(); }} />
      )}

      <GenerateInvoicesModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onSuccess={refetchAll}
        selectedPeriodoId={periodoToGenerate}
        periodos={periodos}
      />

      <DeudasModal
        isOpen={showDeudasModal}
        filterMes={filterMes}
        onExport={handleExportExcelDeudas}
        onClose={() => setShowDeudasModal(false)}
      />

      <RefacturarModal
        isOpen={refacturar.isModalOpen}
        motivo={refacturar.motivo}
        isProcessing={refacturar.isProcessing}
        onMotivoChange={refacturar.setMotivo}
        onSubmit={refacturar.submit}
        onClose={refacturar.close}
      />

      <DeudaPersonalizadaModal
        isOpen={deudaModalOpen}
        onClose={() => {
          setDeudaModalOpen(false);
          setDeudaReciboData(null);
          refetchAll();
        }}
        selectedMedidor={{
          recibo_id: deudaReciboData?.id,
          usuario_id: deudaReciboData?.usuario_id,
          propietario: deudaReciboData?.socio,
          numero_comprobante: deudaReciboData?.numero_comprobante,
          num_medidor: deudaReciboData?.medidor_num_serie || deudaReciboData?.num_medidor,
          socio_direccion: deudaReciboData?.direccion || deudaReciboData?.medidor_direccion,
          estado: deudaReciboData?.estado,
          total: deudaReciboData?.total
        }}
        activePeriodo={{ id: deudaReciboData?.periodo_id }}
      />

      <HistorialModal
        isOpen={!!historialReceiptId}
        reciboId={historialReceiptId}
        onClose={() => setHistorialReceiptId(null)}
      />

      {pagosReciboModal && (
        <PagosReciboModal
          recibo={pagosReciboModal}
          initialWarning={pagosReciboModal.initialWarning}
          onClose={() => setPagosReciboModal(null)}
          onSuccess={refetchAll}
        />
      )}

      {/* Modal de confirmación para cambiar a Pendiente */}
      {confirmarPendienteRecibo && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isProcessingPendiente && setConfirmarPendienteRecibo(null)}
          />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[26px] text-amber-600" translate="no">pending_actions</span>
            </div>
            <h3 className="text-sm font-bold text-center text-on-surface">
              ¿Poner recibo en Pendiente?
            </h3>
            <p className="text-xs text-on-surface-variant text-center mt-2 leading-relaxed">
              El recibo <span className="font-bold font-data-mono text-primary">{confirmarPendienteRecibo.numero_comprobante}</span> de <span className="font-medium text-on-surface">{confirmarPendienteRecibo.socio}</span> no tiene pagos activos registrados.
            </p>
            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-3 text-center font-medium">
              Su estado cambiará de <span className="font-bold">{confirmarPendienteRecibo.estado}</span> a <span className="font-bold text-amber-900">Pendiente</span>.
            </p>
            <div className="flex gap-2.5 mt-4">
              <button
                type="button"
                disabled={isProcessingPendiente}
                onClick={() => setConfirmarPendienteRecibo(null)}
                className="flex-1 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isProcessingPendiente}
                onClick={handleConfirmarPonerPendiente}
                className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isProcessingPendiente ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin" translate="no">progress_activity</span>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <span>Sí, cambiar</span>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <BillingActionMenu
        menu={actionMenu}
        onClose={() => setActionMenu(null)}
        onView={(receipt) => setDrawerReceiptId(receipt.id)}
        onPdf={(receipt) => pdf.openPdf(receipt.id)}
        onWhatsApp={exports.handleWhatsApp}
        onHistory={(receipt) => setHistorialReceiptId(receipt.id)}
        onPayments={setPagosReciboModal}
        onPending={handleSolicitarPendiente}
        onDebt={(receipt) => {
          setDeudaReciboData(receipt);
          setDeudaModalOpen(true);
        }}
        onRefacture={(receipt) => refacturar.open(receipt.id)}
      />
      </main>
    </>
  );
};

export default Billing;
