import TenantTableRow from '../TenantTableRow';
import { ExcelIcon } from '../../../components/ui/ExcelIcon';
import TenantMobileCard from './TenantMobileCard';

const TenantDirectory = ({
  tenants, searchQuery, onSearchChange, showFilters, onToggleFilters,
  filterEstado, onEstadoChange, filterRubro, onRubroChange, onClearFilters,
  onExportExcel, onExportPDF, isGeneratingPdf, onOpenDrawer, onOpenMenu, actionMenuKey,
  isFetching, totalRecords
}) => {
  const hasFilters = filterEstado !== 'Todos' || filterRubro !== 'Todos';
  return (
    <section className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-md" aria-busy={isFetching}>
      <div className="px-4 py-3 border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-surface-container-low">
        <h4 className="text-base text-on-surface font-bold">Socios Empadronados</h4>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="relative min-w-0 sm:flex-grow md:flex-grow-0">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]" translate="no">search</span>
            <input type="search" placeholder="Buscar socio..." value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} className="pl-8 pr-8 py-1.5 h-8 border border-outline-variant rounded-md text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full md:w-48 bg-white transition-all" />
            {searchQuery && <button type="button" onClick={() => onSearchChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors" title="Limpiar búsqueda"><span className="material-symbols-outlined text-[14px]" translate="no">close</span></button>}
          </div>
          <button type="button" onClick={onToggleFilters} className={`flex items-center gap-1.5 px-3 py-1.5 h-8 font-bold text-xs rounded-md transition-colors border ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container'}`}><span className="material-symbols-outlined text-[16px]" translate="no">filter_list</span>Filtros {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-0.5" />}</button>
          <button type="button" onClick={onExportExcel} className="flex items-center justify-center gap-1.5 px-3 py-1.5 h-8 bg-[#107C41]/10 text-[#107C41] hover:bg-[#107C41]/20 font-bold text-xs rounded-md transition-colors border border-[#107C41]/20"><ExcelIcon className="w-4 h-4" />Excel</button>
          <button type="button" onClick={onExportPDF} disabled={isGeneratingPdf} className="flex items-center justify-center gap-1.5 px-3 py-1.5 h-8 bg-error/10 text-error hover:bg-error/20 font-bold text-xs rounded-md transition-colors border border-error/20 disabled:opacity-50"><span translate="no" className={`material-symbols-outlined text-[16px] ${isGeneratingPdf ? 'animate-spin' : ''}`}>{isGeneratingPdf ? 'sync' : 'picture_as_pdf'}</span>PDF</button>
        </div>
      </div>

      {showFilters && <div className="px-lg py-sm border-b border-outline-variant bg-surface-container-lowest flex flex-wrap items-center gap-md animate-in slide-in-from-top-2 fade-in duration-200">
        <label className="flex items-center gap-2"><span className="text-sm font-semibold text-on-surface-variant">Estado:</span><select value={filterEstado} onChange={(event) => onEstadoChange(event.target.value)} className="border border-outline-variant rounded-lg font-body-sm text-body-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary px-3 py-1.5 cursor-pointer"><option value="Todos">Todos los Estados</option><option value="Activos">Solo Activos</option><option value="Suspendidos">Suspendidos</option></select></label>
        <label className="flex items-center gap-2"><span className="text-sm font-semibold text-on-surface-variant">Rubro:</span><select value={filterRubro} onChange={(event) => onRubroChange(event.target.value)} className="border border-outline-variant rounded-lg font-body-sm text-body-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary px-3 py-1.5 cursor-pointer"><option value="Todos">Todos los Rubros</option><option value="Metalmecánica">Metalmecánica</option><option value="Alimentos">Alimentos</option><option value="Logística">Logística</option><option value="Textil">Textil</option><option value="General">General</option></select></label>
        {hasFilters && <button type="button" onClick={onClearFilters} className="text-xs font-bold text-error hover:underline ml-auto flex items-center gap-1"><span className="material-symbols-outlined text-[14px]" translate="no">close</span>Limpiar Filtros</button>}
      </div>}

      <div className={`md:hidden divide-y divide-outline-variant/60 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
        {tenants.map((tenant) => {
          const rowKey = `${tenant.id}-${tenant.specificMedidor ? tenant.specificMedidor.id : 'none'}`;
          return <TenantMobileCard key={rowKey} tenant={tenant} onOpenDrawer={onOpenDrawer} onOpenMenu={onOpenMenu} isMenuOpen={actionMenuKey === rowKey} />;
        })}
        {tenants.length === 0 && <div className="px-5 py-12 text-center text-sm text-on-surface-variant">No se encontraron socios registrados.</div>}
      </div>

      <div className={`hidden md:block overflow-x-auto custom-scrollbar relative transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
        <table className="w-full min-w-[900px] text-left border-collapse whitespace-nowrap">
          <thead className="sticky top-0 z-10 shadow-sm bg-surface-container-lowest text-on-surface-variant text-[11px] uppercase tracking-wider"><tr className="border-b border-outline-variant"><th className="px-4 py-2 font-semibold bg-surface-container-lowest">Nombres / Documento</th><th className="px-4 py-2 font-semibold bg-surface-container-lowest">Dirección</th><th className="px-4 py-2 font-semibold bg-surface-container-lowest">Medidor</th><th className="px-4 py-2 font-semibold bg-surface-container-lowest">Estado</th><th className="px-4 py-2 font-semibold text-right bg-surface-container-lowest">Acciones</th></tr></thead>
          <tbody className="divide-y divide-outline-variant/50 bg-surface text-body-sm">
            {tenants.map((tenant) => { const rowKey = `${tenant.id}-${tenant.specificMedidor ? tenant.specificMedidor.id : 'none'}`; return <TenantTableRow key={rowKey} tenant={tenant} specificMedidor={tenant.specificMedidor} onOpenDrawer={onOpenDrawer} onOpenMenu={onOpenMenu} isMenuOpen={actionMenuKey === rowKey} />; })}
            {tenants.length === 0 && <tr><td colSpan="5" className="px-5 py-12 text-center text-on-surface-variant">No se encontraron socios registrados.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between gap-2">
        <span className="text-xs text-on-surface-variant font-medium">Mostrando todos los socios · {totalRecords} registrados</span>
      </div>
    </section>
  );
};

export default TenantDirectory;
