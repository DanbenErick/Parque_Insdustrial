import { useEffect, useRef, useState } from 'react';
import { formatPeriod } from '../billingUtils';
import { ExcelIcon } from '../../../components/ui/ExcelIcon';

const BillingTableControls = ({ searchTerm, onSearchChange, showFilters, onToggleFilters, filterEstado, onStatusChange, filterMes, onPeriodChange, year, months, onExportExcel, onOpenDebts, onPrintReceipts }) => {
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef(null);

  useEffect(() => {
    if (!actionsOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!actionsRef.current?.contains(event.target)) setActionsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setActionsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [actionsOpen]);

  const runAction = (action) => {
    setActionsOpen(false);
    action();
  };

  return <>
    <div className="px-4 py-3 border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-surface-container-low">
      <h4 className="text-base font-bold text-on-surface">Detalle de Facturación por Empresa</h4>
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <div className="relative flex-grow md:flex-grow-0"><span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]" translate="no">search</span><input type="search" placeholder="Buscar socio o doc..." value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} className="pl-8 pr-3 py-1.5 h-8 border border-outline-variant rounded-md text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full md:w-48 bg-white transition-all" /></div>
        <button type="button" onClick={onToggleFilters} className={`flex items-center gap-1.5 px-3 py-1.5 h-8 font-bold text-xs rounded-md transition-colors border ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container'}`}><span className="material-symbols-outlined text-[16px]" translate="no">filter_list</span>Filtros {filterEstado !== 'Todos' && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}</button>
        <div className="relative" ref={actionsRef}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={actionsOpen}
            onClick={() => setActionsOpen((open) => !open)}
            className={`flex items-center gap-1.5 px-3 py-1.5 h-8 font-bold text-xs rounded-md transition-colors border ${actionsOpen ? 'bg-primary/10 text-primary border-primary/30' : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container'}`}
          >
            <span className="material-symbols-outlined text-[16px]" translate="no">more_vert</span>
            Acciones
            <span className="material-symbols-outlined text-[16px]" translate="no">expand_more</span>
          </button>
          {actionsOpen && <div role="menu" aria-label="Acciones de facturación" className="absolute right-0 top-full z-30 mt-1 min-w-52 rounded-lg border border-outline-variant bg-white p-1 shadow-lg">
            <button type="button" role="menuitem" onClick={() => runAction(onExportExcel)} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-semibold text-[#107C41] transition-colors hover:bg-[#107C41]/10">
              <ExcelIcon className="h-4 w-4" /> Reporte de Excel
            </button>
            <button type="button" role="menuitem" onClick={() => runAction(onOpenDebts)} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-semibold text-[#ea580c] transition-colors hover:bg-[#ea580c]/10">
              <span className="material-symbols-outlined text-[16px]" translate="no">request_quote</span> Reporte de Deudores
            </button>
            <button type="button" role="menuitem" onClick={() => runAction(onPrintReceipts)} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-semibold text-primary transition-colors hover:bg-primary/10">
              <span className="material-symbols-outlined text-[16px]" translate="no">print</span> Imprimir Recibos
            </button>
          </div>}
        </div>
      </div>
    </div>
    {showFilters && <div className="px-lg py-sm border-b border-outline-variant bg-surface-container-lowest flex flex-wrap items-center gap-md animate-in slide-in-from-top-2 fade-in duration-200"><label className="flex items-center gap-2"><span className="text-sm font-semibold text-on-surface-variant">Mes:</span><select value={filterMes} onChange={(event) => onPeriodChange(event.target.value)} className="border border-outline-variant rounded-lg text-sm bg-white px-3 py-1.5"><option value="Todos">Todos los meses ({year})</option><option value="TodosHistorico">Histórico</option>{months.map((month) => <option key={month} value={month}>{formatPeriod(month)}</option>)}</select></label><label className="flex items-center gap-2"><span className="text-sm font-semibold text-on-surface-variant">Estado del Recibo:</span><select value={filterEstado} onChange={(event) => onStatusChange(event.target.value)} className="border border-outline-variant rounded-lg text-sm bg-white px-3 py-1.5"><option value="Todos">Todos</option><option value="Pagado">Pagados</option><option value="Pendiente">Pendientes</option><option value="Vencido">Vencidos</option><option value="Anulado">Anulados</option></select></label>{filterEstado !== 'Todos' && <button type="button" onClick={() => onStatusChange('Todos')} className="text-xs font-bold text-error hover:underline ml-auto">Limpiar Filtro</button>}</div>}
  </>;
};

export default BillingTableControls;
