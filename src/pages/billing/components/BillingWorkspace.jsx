import { useEffect, useRef, useState } from 'react';
import { formatPeriod } from '../billingUtils';

export const BillingHeader = ({ activeTitle, filterMes, onFilterChange, year, months, onGenerate, onDownloadMonthlyReceipts, isDownloadingMonthlyZip = false, onEmailMonthlyReceipts, isEmailingMonthlyReceipts = false, canEmailMonthlyReceipts = false }) => {
  const canGenerate = filterMes !== 'Todos' && filterMes !== 'TodosHistorico';
  const canDownloadMonthlyReceipts = /^\d{4}-(0[1-9]|1[0-2])$/.test(filterMes || '');
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

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
      <div><h2 className="text-2xl text-on-surface font-bold leading-tight">Módulo de Facturación</h2><p className="text-sm text-on-surface-variant">Ciclo activo: <span className="font-bold text-on-surface">{activeTitle}</span></p></div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-0.5"><span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider pl-1">Periodo a Filtrar</span><span className="relative"><select value={filterMes} onChange={(event) => onFilterChange(event.target.value)} className="appearance-none border border-outline-variant rounded-md pl-3 pr-8 py-1.5 h-8 bg-surface-container-lowest text-on-surface text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-w-[180px] transition-all font-medium cursor-pointer shadow-sm hover:border-primary/50"><option value="Todos">Todos los meses ({year})</option><option value="TodosHistorico">Histórico (Todos los años)</option>{months.map((month) => <option key={month} value={month}>{formatPeriod(month)}</option>)}</select><span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[16px]" translate="no">expand_more</span></span></label>
        <div className="relative" ref={actionsRef}>
          <button type="button" aria-haspopup="menu" aria-expanded={actionsOpen} onClick={() => setActionsOpen((open) => !open)} className={`flex items-center gap-1.5 px-3 py-1.5 h-8 font-bold rounded-md transition-colors border text-xs ${actionsOpen ? 'bg-primary/10 text-primary border-primary/30' : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined text-[16px]" translate="no">more_vert</span>Acciones<span className="material-symbols-outlined text-[16px]" translate="no">expand_more</span>
          </button>
          {actionsOpen && <div role="menu" aria-label="Acciones de facturación" className="absolute right-0 top-full z-30 mt-1 min-w-60 rounded-lg border border-outline-variant bg-white p-1 shadow-lg">
            <button type="button" role="menuitem" onClick={() => runAction(onGenerate)} disabled={!canGenerate} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"><span className="material-symbols-outlined text-[16px]" translate="no">receipt_long</span>Generar Facturas</button>
            {canEmailMonthlyReceipts && <button type="button" role="menuitem" onClick={() => runAction(onEmailMonthlyReceipts)} disabled={!canDownloadMonthlyReceipts || isEmailingMonthlyReceipts} title={canDownloadMonthlyReceipts ? `Enviar recibos de ${activeTitle} a los socios con correo registrado` : 'Selecciona un solo mes para enviar los recibos'} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"><span className={`material-symbols-outlined text-[16px] ${isEmailingMonthlyReceipts ? 'animate-pulse' : ''}`} translate="no">{isEmailingMonthlyReceipts ? 'hourglass_top' : 'forward_to_inbox'}</span>{isEmailingMonthlyReceipts ? 'Enviando...' : 'Enviar recibos por correo'}</button>}
            <button type="button" role="menuitem" onClick={() => runAction(onDownloadMonthlyReceipts)} disabled={!canDownloadMonthlyReceipts || isDownloadingMonthlyZip} title={canDownloadMonthlyReceipts ? `Descargar todos los recibos de ${activeTitle} en un ZIP` : 'Selecciona un solo mes para descargar los recibos'} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"><span className={`material-symbols-outlined text-[16px] ${isDownloadingMonthlyZip ? 'animate-pulse' : ''}`} translate="no">{isDownloadingMonthlyZip ? 'hourglass_top' : 'folder_zip'}</span>{isDownloadingMonthlyZip ? 'Preparando ZIP...' : 'Descargar recibos del mes'}</button>
          </div>}
        </div>
      </div>
    </div>
  );
};
