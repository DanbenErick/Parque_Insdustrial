import { formatPeriod } from '../billingUtils';

const ActionButton = ({ icon, label, onClick, className }) => <button type="button" onClick={onClick} className={`flex items-center gap-1.5 px-3 py-1.5 h-8 font-bold text-xs rounded-md transition-colors border ${className}`}><span className="material-symbols-outlined text-[16px]" translate="no">{icon}</span>{label}</button>;

const BillingTableControls = ({ searchTerm, onSearchChange, showFilters, onToggleFilters, filterEstado, onStatusChange, filterMes, onPeriodChange, year, months, onExportExcel, onOpenDebts, onExportPDF, onPrintReceipts }) => (
  <>
    <div className="px-4 py-3 border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-surface-container-low">
      <h4 className="text-base font-bold text-on-surface">Detalle de Facturación por Empresa</h4>
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <div className="relative flex-grow md:flex-grow-0"><span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]" translate="no">search</span><input type="search" placeholder="Buscar socio o doc..." value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} className="pl-8 pr-3 py-1.5 h-8 border border-outline-variant rounded-md text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full md:w-48 bg-white transition-all" /></div>
        <button type="button" onClick={onToggleFilters} className={`flex items-center gap-1.5 px-3 py-1.5 h-8 font-bold text-xs rounded-md transition-colors border ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container'}`}><span className="material-symbols-outlined text-[16px]" translate="no">filter_list</span>Filtros {filterEstado !== 'Todos' && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}</button>
        <ActionButton icon="table_view" label="Excel" onClick={onExportExcel} className="bg-[#107C41]/10 text-[#107C41] border-[#107C41]/20" />
        <ActionButton icon="request_quote" label="Reporte Deudas" onClick={onOpenDebts} className="bg-[#ea580c]/10 text-[#ea580c] border-[#ea580c]/20" />
        <ActionButton icon="list_alt" label="Reporte" onClick={onExportPDF} className="bg-error/10 text-error border-error/20" />
        <ActionButton icon="print" label="Imprimir Recibos" onClick={onPrintReceipts} className="bg-primary/10 text-primary border-primary/20" />
      </div>
    </div>
    {showFilters && <div className="px-lg py-sm border-b border-outline-variant bg-surface-container-lowest flex flex-wrap items-center gap-md animate-in slide-in-from-top-2 fade-in duration-200"><label className="flex items-center gap-2"><span className="text-sm font-semibold text-on-surface-variant">Mes:</span><select value={filterMes} onChange={(event) => onPeriodChange(event.target.value)} className="border border-outline-variant rounded-lg text-sm bg-white px-3 py-1.5"><option value="Todos">Todos los meses ({year})</option><option value="TodosHistorico">Histórico</option>{months.map((month) => <option key={month} value={month}>{formatPeriod(month)}</option>)}</select></label><label className="flex items-center gap-2"><span className="text-sm font-semibold text-on-surface-variant">Estado del Recibo:</span><select value={filterEstado} onChange={(event) => onStatusChange(event.target.value)} className="border border-outline-variant rounded-lg text-sm bg-white px-3 py-1.5"><option value="Todos">Todos</option><option value="Pagado">Pagados</option><option value="Pendiente">Pendientes</option><option value="Vencido">Vencidos</option><option value="Anulado">Anulados</option></select></label>{filterEstado !== 'Todos' && <button type="button" onClick={() => onStatusChange('Todos')} className="text-xs font-bold text-error hover:underline ml-auto">Limpiar Filtro</button>}</div>}
  </>
);

export default BillingTableControls;
