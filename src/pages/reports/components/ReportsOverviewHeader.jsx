import ReportKPICard from '../ReportKPICard';

const ReportsOverviewHeader = ({ periods, selectedPeriod, onPeriodChange, year, isUpdating, onUpdate, metrics, activeTab, onTabChange, formatPeriod }) => (
  <>
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
      <h2 className="text-2xl text-on-surface font-bold leading-tight">Modulo de Reportes</h2>
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="flex items-center bg-white border border-outline-variant rounded-md px-3 h-8 cursor-pointer hover:border-primary/50 transition-colors relative flex-1 md:flex-none"><span className="material-symbols-outlined text-[16px] text-on-surface-variant mr-2" translate="no">calendar_today</span><select value={selectedPeriod} onChange={(event) => onPeriodChange(event.target.value)} className="bg-transparent text-xs font-bold outline-none border-none pr-6 cursor-pointer appearance-none text-on-surface w-full md:w-auto">{periods.map((period) => <option key={period.mes_anio} value={period.mes_anio}>{formatPeriod(period.mes_anio)}</option>)}{periods.length === 0 && <option value="" disabled>Sin periodos en {year}</option>}</select><span className="material-symbols-outlined text-[16px] absolute right-2 pointer-events-none text-on-surface-variant" translate="no">expand_more</span></div>
        <button type="button" className="flex items-center justify-center gap-1.5 bg-primary text-white px-3 h-8 rounded-md hover:bg-primary/90 transition-colors text-xs font-bold shadow-sm" onClick={onUpdate}><span translate="no" className={`material-symbols-outlined text-[16px] ${isUpdating ? 'animate-spin' : ''}`}>refresh</span><span className="hidden sm:inline">Actualizar Datos</span></button>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 mb-4">
      <ReportKPICard icon="bolt" label="Consumo Total" value={metrics.totalConsumo.toLocaleString('es-PE', { minimumFractionDigits: 1 })} badge="kWh" subtitle="Total en lecturas del mes" variant="primary" />
      <ReportKPICard icon="receipt_long" label="Total Facturado" value={`S/ ${metrics.totalFacturado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`} subtitle="Monto de recibos generados" variant="neutral" />
      <ReportKPICard icon="payments" label="Total Recaudado" value={`S/ ${metrics.totalRecaudado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`} subtitle={`Cobrado: ${metrics.tasaRecaudacion.toFixed(1)}% del total`} variant="success" />
      <ReportKPICard icon="warning" label="Monto Pendiente" value={`S/ ${metrics.totalPendiente.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`} subtitle="Por cobrar en este mes" variant="error" />
    </div>
    <div className="flex border-b border-outline-variant mb-lg gap-md" role="tablist" aria-label="Tipo de reporte">
      {[['general', 'analytics', 'Reporte General'], ['member', 'group', 'Reporte por Socio']].map(([id, icon, label]) => <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => onTabChange(id)} className={`flex items-center gap-xs pb-sm px-xs font-body-md text-body-md font-bold border-b-2 transition-all ${activeTab === id ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}><span className="material-symbols-outlined text-[20px]" translate="no">{icon}</span>{label}</button>)}
    </div>
  </>
);

export default ReportsOverviewHeader;
