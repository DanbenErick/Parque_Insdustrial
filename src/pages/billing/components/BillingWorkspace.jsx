import { formatPeriod } from '../billingUtils';

export const BillingHeader = ({ activeTitle, filterMes, onFilterChange, year, months, onGenerate }) => {
  const canGenerate = filterMes !== 'Todos' && filterMes !== 'TodosHistorico';
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
      <div><h2 className="text-2xl text-on-surface font-bold leading-tight">Módulo de Facturación</h2><p className="text-sm text-on-surface-variant">Ciclo activo: <span className="font-bold text-on-surface">{activeTitle}</span></p></div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-0.5"><span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider pl-1">Periodo a Filtrar</span><span className="relative"><select value={filterMes} onChange={(event) => onFilterChange(event.target.value)} className="appearance-none border border-outline-variant rounded-md pl-3 pr-8 py-1.5 h-8 bg-surface-container-lowest text-on-surface text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-w-[180px] transition-all font-medium cursor-pointer shadow-sm hover:border-primary/50"><option value="Todos">Todos los meses ({year})</option><option value="TodosHistorico">Histórico (Todos los años)</option>{months.map((month) => <option key={month} value={month}>{formatPeriod(month)}</option>)}</select><span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[16px]" translate="no">expand_more</span></span></label>
        <button type="button" onClick={onGenerate} disabled={!canGenerate} className={`flex items-center px-3 py-1.5 h-8 font-bold rounded-md transition-opacity shadow-sm text-xs ${canGenerate ? 'bg-primary text-on-primary hover:opacity-90 active:scale-95' : 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-70'}`}><span className="material-symbols-outlined mr-1 text-[16px]" translate="no">receipt_long</span>Generar Facturas</button>
      </div>
    </div>
  );
};
