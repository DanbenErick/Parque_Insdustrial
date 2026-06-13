import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  formatPeriod,
} from './index';

// Custom hooks
import { useBillingData } from './hooks/useBillingData';
import { usePdfViewer } from './hooks/usePdfViewer';
import { useRefacturar } from './hooks/useRefacturar';
import { useExports } from './hooks/useExports';

const Billing = () => {
  const { activeYear } = useYear();

  // --- UI State ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [periodoToGenerate, setPeriodoToGenerate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeudasModal, setShowDeudasModal] = useState(false);

  // --- Filter State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterMes, setFilterMes] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // --- Receipt Detail Drawer ---
  const [drawerReceiptId, setDrawerReceiptId] = useState(null);

  // --- Dropdown ref for click-outside detection ---
  const dropdownRef = useRef(null);

  // =========================================================================
  // Data & Derived State (via custom hooks)
  // =========================================================================

  const { recibos, periodos, globalStats, isLoading, filterParams, refetchAll } = useBillingData({
    filterMes,
    filterEstado,
    debouncedSearchTerm,
    activeYear,
  });

  const pdf = usePdfViewer();
  const refacturar = useRefacturar(refetchAll);
  const exports = useExports({ filterParams, filterMes, activeYear, uniqueMonths: [], recibos });

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

  const totalRecaudado = useMemo(() => parseFloat(globalStats?.totalRecaudado || 0), [globalStats]);
  const pendienteCobro = useMemo(() => parseFloat(globalStats?.pendienteCobro || 0), [globalStats]);
  const usuariosPendientes = useMemo(() => parseInt(globalStats?.usuariosPendientes || 0, 10), [globalStats]);
  const deudaVencida = useMemo(() => parseFloat(globalStats?.deudaVencida || 0), [globalStats]);
  const usuariosVencidos = useMemo(() => parseInt(globalStats?.usuariosVencidos || 0, 10), [globalStats]);

  // --- Pagination ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = useMemo(
    () => recibos.slice(indexOfFirstItem, indexOfLastItem),
    [recibos, indexOfFirstItem, indexOfLastItem],
  );
  const totalPages = Math.ceil(recibos.length / itemsPerPage);

  // =========================================================================
  // Effects
  // =========================================================================

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterEstado, filterMes]);

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
    await pdf.openReportePdf(filterParams, filterMes, uniqueMonths);
  }, [recibos, pdf, filterParams, filterMes, uniqueMonths]);

  const handleExportExcelDeudas = useCallback(
    async (tipo) => {
      setShowDeudasModal(false);
      await exports.handleExportExcelDeudas(tipo);
    },
    [exports],
  );

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
    <main className="p-4 md:p-xl space-y-4 md:space-y-lg max-w-[1600px] mx-auto w-full flex-grow">
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
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[16px]">expand_more</span>
            </div>
          </div>

          {/* Generar Facturas dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={filterMes === 'Todos' || filterMes === 'TodosHistorico'}
              className={`flex items-center px-3 py-1.5 h-8 font-bold rounded-md transition-opacity shadow-sm text-xs ${
                filterMes === 'Todos' || filterMes === 'TodosHistorico'
                  ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-70'
                  : 'bg-primary text-on-primary hover:opacity-90 active:scale-95'
              }`}
            >
              <span className="material-symbols-outlined mr-1 text-[16px]">add</span>
              Generar Facturas
              <span className="material-symbols-outlined ml-1 text-[16px]">{isDropdownOpen ? 'expand_less' : 'expand_more'}</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface border border-outline-variant rounded-lg shadow-lg z-50 py-2">
                <button
                  className="w-full text-left px-3 py-2 hover:bg-surface-container-low flex items-center gap-2 text-sm text-on-surface transition-colors"
                  onClick={handleGenerateFromDropdown}
                >
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  Generar del mes seleccionado
                </button>
                <div className="h-px bg-outline-variant/50 my-1"></div>
                <button
                  className="w-full text-left px-3 py-2 hover:bg-surface-container-low flex items-center gap-2 text-sm text-on-surface transition-colors"
                  onClick={handleExportAllFromDropdown}
                >
                  <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                  Descargar todas en PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards + Progress Bar */}
      <BillingKPICards
        totalRecaudado={totalRecaudado}
        pendienteCobro={pendienteCobro}
        deudaVencida={deudaVencida}
        usuariosPendientes={usuariosPendientes}
        usuariosVencidos={usuariosVencidos}
      />

      {/* Table Area */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="px-4 py-3 border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-surface-container-low">
          <h4 className="text-base font-bold text-on-surface">Detalle de Facturación por Empresa</h4>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-grow md:flex-grow-0">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
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
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              Filtros {filterEstado !== 'Todos' && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-0.5"></span>}
            </button>

            <button
              onClick={exports.handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 h-8 bg-[#107C41]/10 text-[#107C41] hover:bg-[#107C41]/20 font-bold text-xs rounded-md transition-colors border border-[#107C41]/20"
            >
              <span className="material-symbols-outlined text-[16px]">table_view</span>
              Excel
            </button>
            <button
              onClick={() => setShowDeudasModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 h-8 bg-[#ea580c]/10 text-[#ea580c] hover:bg-[#ea580c]/20 font-bold text-xs rounded-md transition-colors border border-[#ea580c]/20"
            >
              <span className="material-symbols-outlined text-[16px]">request_quote</span>
              Reporte Deudas
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
                <span className="material-symbols-outlined text-[14px]">close</span>
                Limpiar Filtro
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto whitespace-nowrap">
            <thead className="bg-surface-container-lowest border-b border-outline-variant text-on-surface-variant text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2 font-semibold">Empresa / Socio</th>
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
                    <span className="material-symbols-outlined animate-spin text-[24px]">sync</span>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[32px] opacity-20 mb-2 block">search_off</span>
                    <p className="font-bold">No se encontraron recibos</p>
                  </td>
                </tr>
              ) : (
                currentItems.map((recibo) => (
                  <BillingTableRow
                    key={recibo.id}
                    recibo={recibo}
                    onViewPdf={pdf.openPdf}
                    onWhatsApp={exports.handleWhatsApp}
                    onRefacturar={refacturar.open}
                    onViewDetail={setDrawerReceiptId}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-lg py-md border-t border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xs text-on-surface-variant font-medium">
            Mostrando {recibos.length > 0 ? indexOfFirstItem + 1 : 0} a {Math.min(indexOfLastItem, recibos.length)} de {recibos.length} recibos
          </span>
          {totalPages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-md border border-outline-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1 text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span> Anterior
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                  .map((page, i, arr) => (
                    <React.Fragment key={page}>
                      {i > 0 && arr[i - 1] !== page - 1 && (
                        <span className="px-1 py-1 text-on-surface-variant text-xs">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-md text-xs font-bold transition-colors ${
                          currentPage === page ? 'bg-primary text-white' : 'hover:bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-md border border-outline-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1 text-on-surface"
              >
                Siguiente <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
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
        <ReceiptDetail receiptId={drawerReceiptId} onClose={() => setDrawerReceiptId(null)} />
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
    </main>
  );
};

export default Billing;
