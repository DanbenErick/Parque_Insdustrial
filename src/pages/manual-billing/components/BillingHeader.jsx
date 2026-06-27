import React from 'react';
import { formatPeriodo } from '../utils';

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
  dashOffset
}) => {
  return (
    <div className="mb-md flex flex-col md:flex-row justify-between md:items-end gap-md">
      <div>
        <h2 className="text-2xl text-on-surface font-bold leading-tight">Módulo Lectura de Medidor</h2>
        <p className="text-sm text-on-surface-variant">Busca el medidor e ingresa el consumo actual con facilidad.</p>
        {activePeriodo && periodosFiltrados.length > 0 ? (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Periodo a Trabajar:</span>
            <div className="relative inline-flex items-center bg-white/50 backdrop-blur-md border border-outline-variant/60 rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-300">
              <select
                value={activePeriodo.id}
                onChange={(e) => {
                  const selected = periodosFiltrados.find(p => p.id === parseInt(e.target.value));
                  if (selected) setActivePeriodo(selected);
                  resetForm();
                }}
                className="appearance-none bg-transparent border-none py-2 pl-3 pr-9 text-base font-bold text-primary cursor-pointer focus:outline-none focus:ring-0"
              >
                {periodosFiltrados.map(p => (
                  <option key={p.id} value={p.id}>{formatPeriodo(p.mes_anio)}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 text-primary pointer-events-none text-[18px]">calendar_month</span>
            </div>
            <button
              onClick={() => setIsPeriodModalOpen(true)}
              className="p-1.5 ml-1 text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center"
              title="Aperturar nuevo periodo"
            >
              <span className="material-symbols-outlined text-[24px]">add_circle</span>
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-start gap-3">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-lg text-sm">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              No hay periodos creados para el año {activeYear}
            </div>
            <button
              onClick={() => setIsPeriodModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl font-bold shadow hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Aperturar Primer Periodo
            </button>
          </div>
        )}
      </div>
      {/* KPI Card */}
      <div className="flex">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl px-5 py-3 flex items-center gap-5 shadow-lg backdrop-blur-xl transition-transform hover:scale-[1.02] duration-300">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
          <div className="relative z-10">
            <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-0.5">Avance del Mes</p>
            <div className="flex items-baseline gap-1">
              <span className="font-data-mono text-xl font-bold text-primary leading-none">{totalRegistrados}</span>
              <span className="font-data-mono text-xs font-bold text-primary/60 leading-none">/ {totalMedidores}</span>
            </div>
          </div>
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
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
