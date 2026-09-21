import 'react';
import { formatPeriodo } from '../utils';
import { ExcelIcon } from '../../../components/ui/ExcelIcon';

export const BillingHeader = ({
  activePeriodo,
  setActivePeriodo,
  periodosFiltrados,
  activeYear,
  setIsPeriodModalOpen,
  resetForm,
  totalRegistrados,
  totalMedidores,
  porcentajeAvance,
  dashOffset,
  onExportExcel
}) => {
  return (
    <div className="mb-4 flex flex-col md:flex-row justify-between md:items-end gap-4 md:gap-md">
      <div className="min-w-0">
        <h2 className="text-[22px] sm:text-2xl text-on-surface font-bold leading-tight tracking-tight">Módulo Lectura de Medidor</h2>
        <p className="mt-0.5 text-sm leading-5 text-on-surface-variant">Busca el medidor e ingresa el consumo actual con facilidad.</p>
        {activePeriodo && periodosFiltrados.length > 0 ? (
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_40px] sm:flex sm:items-center gap-2 sm:gap-3">
            <span className="col-span-2 sm:col-auto text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Periodo a trabajar</span>
            <div className="relative flex min-w-0 items-center bg-white/70 backdrop-blur-md border border-outline-variant/60 rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-300">
              <select
                value={activePeriodo.id}
                onChange={(e) => {
                  const selected = periodosFiltrados.find(p => p.id === parseInt(e.target.value));
                  if (selected) setActivePeriodo(selected);
                  resetForm();
                }}
                className="w-full appearance-none bg-transparent border-none py-2.5 pl-3 pr-10 text-base font-bold text-primary cursor-pointer focus:outline-none focus:ring-0"
              >
                {periodosFiltrados.map(p => (
                  <option key={p.id} value={p.id}>{formatPeriodo(p.mes_anio)}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 text-primary pointer-events-none text-[18px]" translate="no">calendar_month</span>
            </div>
            <button
              type="button"
              onClick={() => setIsPeriodModalOpen(true)}
              className="h-10 w-10 sm:h-auto sm:w-auto sm:p-1.5 sm:ml-1 text-primary bg-primary/5 border border-primary/15 sm:bg-transparent sm:border-0 hover:bg-primary/10 rounded-xl sm:rounded-lg transition-colors flex items-center justify-center"
              title="Aperturar nuevo periodo"
              aria-label="Aperturar nuevo periodo"
            >
              <span className="material-symbols-outlined text-[24px]" translate="no">add_circle</span>
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-start gap-3">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-lg text-sm">
              <span className="material-symbols-outlined text-[18px]" translate="no">warning</span>
              No hay periodos creados para el año {activeYear}
            </div>
            <button
              onClick={() => setIsPeriodModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl font-bold shadow hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]" translate="no">add_circle</span>
              Aperturar Primer Periodo
            </button>
          </div>
        )}
      </div>
      {/* Actions and KPI Card */}
      <div className={`w-full md:w-auto grid ${activePeriodo ? 'grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]' : 'grid-cols-1'} gap-2 md:flex md:flex-row md:gap-4 items-stretch md:items-center`}>
        {activePeriodo && (
          <button
            type="button"
            onClick={onExportExcel}
            className="min-w-0 min-h-14 md:min-h-0 flex items-center justify-center gap-2 bg-[#107C41] hover:bg-[#0E6B37] active:bg-[#0A4E28] text-white px-3 md:px-4 py-2 rounded-xl font-bold shadow-md shadow-[#107C41]/25 hover:shadow-lg hover:shadow-[#107C41]/35 md:hover:-translate-y-0.5 transition-all duration-200 text-xs sm:text-sm cursor-pointer select-none"
            title="Exportar lecturas a Microsoft Excel"
          >
            <ExcelIcon className="w-[18px] h-[18px]" />
            <span>Exportar Excel</span>
          </button>
        )}
        <div className="relative min-w-0 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl md:rounded-2xl px-3 sm:px-4 md:px-5 py-2.5 md:py-3 flex items-center justify-between gap-2 md:gap-5 shadow-md md:shadow-lg backdrop-blur-xl md:transition-transform md:hover:scale-[1.02] md:duration-300">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] bg-[size:12px_12px] opacity-[0.03]"></div>
          <div className="relative z-10">
            <p className="text-[9px] sm:text-[10px] text-primary font-bold uppercase tracking-wider mb-0.5 whitespace-nowrap">Avance del mes</p>
            <div className="flex items-baseline gap-1">
              <span className="font-data-mono text-lg md:text-xl font-bold text-primary leading-none">{totalRegistrados}</span>
              <span className="font-data-mono text-[10px] md:text-xs font-bold text-primary/60 leading-none">/ {totalMedidores}</span>
            </div>
          </div>
          <div className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle className="text-primary/10" strokeWidth="3" stroke="currentColor" fill="transparent" r="16" cx="20" cy="20" />
              <circle className="text-primary transition-all duration-1000 ease-out" strokeWidth="3" strokeDasharray="100.5" strokeDashoffset={dashOffset} stroke="currentColor" fill="transparent" r="16" cx="20" cy="20" strokeLinecap="round" />
            </svg>
            <span className="absolute text-[10px] font-bold text-primary">{porcentajeAvance}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
