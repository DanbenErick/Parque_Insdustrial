import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { createPortal } from 'react-dom';
import { toast } from 'sonner';
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
import { DeudaPersonalizadaModal } from '../manual-billing/components/DeudaPersonalizadaModal';

// Custom hooks
import { useBillingData } from './hooks/useBillingData';
import { usePdfViewer } from './hooks/usePdfViewer';
import { useRefacturar } from './hooks/useRefacturar';
import { useExports } from './hooks/useExports';
import LoadingCurtain from '../../components/ui/LoadingCurtain';

const Billing = () => {
  const { activeYear } = useYear();
  const navigate = useNavigate();


  // --- UI State ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [periodoToGenerate, setPeriodoToGenerate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeudasModal, setShowDeudasModal] = useState(false);
  const [historialReceiptId, setHistorialReceiptId] = useState(null);

  const [deudaModalOpen, setDeudaModalOpen] = useState(false);
  const [deudaReciboData, setDeudaReciboData] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);

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

  const { recibos, totalRecibos, totalPages, page, setPage, periodos, globalStats, isLoading, filterParams, refetchAll } = useBillingData({
    filterMes,
    filterEstado,
    debouncedSearchTerm,
    activeYear,
  });

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

  const handleExportAllFromDropdown = useCallback(() => {
    setIsDropdownOpen(false);
    // Re-build exports with updated uniqueMonths
    exports.handleExportAllPdfV2();
  }, [exports]);

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
    e.stopPropagation();
    if (actionMenu?.recibo?.id === recibo.id) {
      setActionMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuHeight = 260;
    const openUp = spaceBelow < menuHeight && rect.top > menuHeight;

    setActionMenu({
      recibo,
      top: openUp ? undefined : rect.bottom + 4,
      bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
      right: Math.max(12, window.innerWidth - rect.right),
    });
  }, [actionMenu]);

  // Cerrar menú de acciones al presionar Escape, hacer scroll o redimensionar
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
    <main className="p-4 md:p-xl space-y-4 md:space-y-lg max-w-[1600px] mx-auto w-full flex-grow relative">
      {/* Cortina de Carga de Pantalla Completa con Logo Institucional */}
      <LoadingCurtain
        isOpen={isLoading}
        title="Cargando datos..."
        subtitle="Obteniendo información del periodo seleccionado"
      />

      {/* Cortina de Generación de PDF */}
      <LoadingCurtain
        isOpen={pdf.isGenerating}
        title="Generando PDF..."
        subtitle="Por favor espere, procesando el documento."
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl text-on-surface font-bold leading-tight">Módulo de Facturación</h2>
          <p className="text-sm text-on-surface-variant">
            Ciclo activo: <span className="font-bold text-on-surface">{activeHeaderTitle}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider pl-1">Periodo a Filtrar</label>
            <div className="relative">
              <select
                value={filterMes}
                onChange={(e) => setFilterMes(e.target.value)}
                className="appearance-none border border-outline-variant rounded-md pl-3 pr-8 py-1.5 h-8 bg-surface-container-lowest text-on-surface text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-w-[180px] transition-all font-medium cursor-pointer shadow-sm hover:border-primary/50"
              >
                <option value="Todos">Todos los meses ({activeYear})</option>
                <option value="TodosHistorico">Histórico (Todos los años)</option>
                {uniqueMonths.map((m) => (
                  <option key={m} value={m}>{formatPeriod(m)}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[16px]" translate="no">expand_more</span>
            </div>
          </div>

          {/* Generar Facturas Button */}
          <button
            onClick={handleGenerateFromDropdown}
            disabled={filterMes === 'Todos' || filterMes === 'TodosHistorico'}
            className={`flex items-center px-3 py-1.5 h-8 font-bold rounded-md transition-opacity shadow-sm text-xs ${
              filterMes === 'Todos' || filterMes === 'TodosHistorico'
                ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-70'
                : 'bg-primary text-on-primary hover:opacity-90 active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined mr-1 text-[16px]" translate="no">receipt_long</span>
            Generar Facturas
          </button>
        </div>
      </div>

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
        {/* Table Header */}
        <div className="px-4 py-3 border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-surface-container-low">
          <h4 className="text-base font-bold text-on-surface">Detalle de Facturación por Empresa</h4>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-grow md:flex-grow-0">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]" translate="no">search</span>
              <input
                type="text"
                placeholder="Buscar socio o doc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 h-8 border border-outline-variant rounded-md text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full md:w-48 bg-white transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 h-8 font-bold text-xs rounded-md transition-colors border ${
                showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]" translate="no">filter_list</span>
              Filtros {filterEstado !== 'Todos' && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-0.5"></span>}
            </button>

            <button
              onClick={exports.handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 h-8 bg-[#107C41]/10 text-[#107C41] hover:bg-[#107C41]/20 font-bold text-xs rounded-md transition-colors border border-[#107C41]/20"
            >
              <span className="material-symbols-outlined text-[16px]" translate="no">table_view</span>
              Excel
            </button>
            <button
              onClick={() => setShowDeudasModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 h-8 bg-[#ea580c]/10 text-[#ea580c] hover:bg-[#ea580c]/20 font-bold text-xs rounded-md transition-colors border border-[#ea580c]/20"
            >
              <span className="material-symbols-outlined text-[16px]" translate="no">request_quote</span>
              Reporte Deudas
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 h-8 bg-error/10 text-error hover:bg-error/20 font-bold text-xs rounded-md transition-colors border border-error/20 tooltip-trigger"
              title="Reporte Tabla"
            >
              <span className="material-symbols-outlined text-[16px]" translate="no">list_alt</span>
              Reporte
            </button>
            <button
              onClick={exports.handleExportAllPdfV2}
              className="flex items-center gap-1.5 px-3 py-1.5 h-8 bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs rounded-md transition-colors border border-primary/20 tooltip-trigger"
              title="Descargar todos los recibos para imprimir"
            >
              <span className="material-symbols-outlined text-[16px]" translate="no">print</span>
              Imprimir Recibos
            </button>
          </div>
        </div>

        {/* Collapsible Filters Panel */}
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
                {uniqueMonths.map((m) => (
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

            {filterEstado !== 'Todos' && (
              <button
                onClick={() => setFilterEstado('Todos')}
                className="text-xs font-bold text-error hover:underline ml-auto flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]" translate="no">close</span>
                Limpiar Filtro
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto overflow-y-auto custom-scrollbar max-h-[500px]">
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
                    onOpenMenu={handleOpenMenu}
                    isMenuOpen={actionMenu?.recibo?.id === recibo.id}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Foot of table: count + pagination */}
        <div className="px-lg py-sm border-t border-outline-variant bg-surface-container-lowest flex flex-wrap justify-between items-center gap-2">
          <span className="text-xs text-on-surface-variant font-medium">
            {totalRecibos} recibos en total · Página {page} de {totalPages || 1}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2 py-1 text-xs rounded border border-outline-variant disabled:opacity-40 hover:bg-surface-container transition-colors"
                title="Primera página"
              >«</button>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1 text-xs rounded border border-outline-variant disabled:opacity-40 hover:bg-surface-container transition-colors"
              >‹ Anterior</button>
              <span className="px-3 py-1 text-xs font-bold bg-primary text-white rounded">{page}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2 py-1 text-xs rounded border border-outline-variant disabled:opacity-40 hover:bg-surface-container transition-colors"
              >Siguiente ›</button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="px-2 py-1 text-xs rounded border border-outline-variant disabled:opacity-40 hover:bg-surface-container transition-colors"
                title="Última página"
              >»</button>
            </div>
          )}
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
          propietario: deudaReciboData?.socio
        }}
        activePeriodo={{ id: deudaReciboData?.periodo_id }}
      />

      <HistorialModal
        isOpen={!!historialReceiptId}
        reciboId={historialReceiptId}
        onClose={() => setHistorialReceiptId(null)}
      />

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
            className="fixed z-[85] w-64 bg-white rounded-xl shadow-2xl border border-outline-variant/80 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del dropdown */}
            <div className="px-3.5 py-2 mb-1 border-b border-outline-variant/50 bg-surface-container-lowest">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Acciones</span>
                <span className="font-data-mono text-[10px] font-bold text-primary truncate max-w-[130px]">
                  {actionMenu.recibo.numero_comprobante || 'Recibo'}
                </span>
              </div>
              <p className="text-[11px] font-medium text-on-surface-variant truncate mt-0.5">
                {actionMenu.recibo.socio || 'Socio'}
              </p>
            </div>

            {/* Ver Detalle */}
            <button
              type="button"
              onClick={() => {
                const r = actionMenu.recibo;
                setActionMenu(null);
                setDrawerReceiptId(r.id);
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-primary" translate="no">visibility</span>
              <span>Ver Detalle</span>
            </button>

            {/* Ver Recibo PDF */}
            <button
              type="button"
              onClick={() => {
                const r = actionMenu.recibo;
                setActionMenu(null);
                pdf.openPdf(r.id);
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-error" translate="no">picture_as_pdf</span>
              <span>Ver Recibo (PDF)</span>
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={() => {
                const r = actionMenu.recibo;
                setActionMenu(null);
                exports.handleWhatsApp(r);
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="text-[#25D366] shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.062-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              <span>Enviar por WhatsApp</span>
            </button>

            {/* Historial de Cambios */}
            <button
              type="button"
              onClick={() => {
                const r = actionMenu.recibo;
                setActionMenu(null);
                setHistorialReceiptId(r.id);
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center justify-between gap-2 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className={`material-symbols-outlined text-[18px] ${Number(actionMenu.recibo.cantidad_anulados || 0) > 0 ? 'text-amber-600' : 'text-on-surface-variant'}`} translate="no">history</span>
                <span>Historial de Cambios</span>
              </div>
              {Number(actionMenu.recibo.cantidad_anulados || 0) > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-800 text-[9px] font-black rounded-full border border-amber-500/30">
                  {actionMenu.recibo.cantidad_anulados}
                </span>
              )}
            </button>

            {/* Ver Pagos del Socio */}
            <button
              type="button"
              onClick={() => {
                const r = actionMenu.recibo;
                setActionMenu(null);
                navigate('/payments', { state: { initialSearch: r.socio || r.nombre_razonsocial || '' } });
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-indigo-500" translate="no">payments</span>
              <span>Ver Pagos del Socio</span>
            </button>

            {/* Opciones cuando no está pagado ni anulado */}
            {actionMenu.recibo.estado !== 'Pagado' && actionMenu.recibo.estado !== 'Anulado' && (
              <>
                <div className="my-1 border-t border-outline-variant/50" />
                <button
                  type="button"
                  onClick={() => {
                    const r = actionMenu.recibo;
                    setActionMenu(null);
                    setDeudaReciboData(r);
                    setDeudaModalOpen(true);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-teal-700 hover:bg-teal-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-teal-600" translate="no">payments</span>
                  <span>Añadir Deuda</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const r = actionMenu.recibo;
                    setActionMenu(null);
                    refacturar.open(r.id);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-orange-700 hover:bg-orange-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-orange-600" translate="no">autorenew</span>
                  <span>Refacturar</span>
                </button>
              </>
            )}
          </div>
        </div>,
        document.body,
      )}
    </main>
  );
};

export default Billing;
