import React from 'react';

const TenantKPICards = ({ globalStats }) => {
  const total = globalStats.activos + globalStats.inactivos;
  const wActivos = total > 0 ? (globalStats.activos / total) * 100 : 0;
  const wInactivos = total > 0 ? (globalStats.inactivos / total) * 100 : 0;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 mb-4">
        {/* Card 1: Total Socios */}
        <div className="bg-surface border border-outline-variant hover:border-primary/30 rounded-xl p-3 flex items-center gap-3 transition-colors shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
            <span className="material-symbols-outlined text-[20px]">group</span>
          </div>
          <div className="flex flex-col justify-center overflow-hidden flex-1">
            <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider leading-tight truncate">Total de Socios</span>
            <span className="font-data-mono text-lg text-on-surface font-bold leading-none mt-0.5 truncate">
              {globalStats.total}
            </span>
            <span className="text-[10px] text-on-surface-variant mt-1 truncate font-medium">
              <span className="font-bold text-on-surface">{globalStats.socios_sin_medidor || 0}</span> de ellos NO tienen medidor
            </span>
          </div>
        </div>

        {/* Card 2: Total Medidores */}
        <div className="bg-surface border border-outline-variant hover:border-blue-500/30 rounded-xl p-3 flex items-center gap-3 transition-colors shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-500/5 flex items-center justify-center text-blue-500 shrink-0 border border-blue-500/10">
            <span className="material-symbols-outlined text-[20px]">speed</span>
          </div>
          <div className="flex flex-col justify-center overflow-hidden flex-1">
            <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider leading-tight truncate">Total Medidores</span>
            <span className="font-data-mono text-lg text-on-surface font-bold leading-none mt-0.5 truncate">
              {(globalStats.medidores_normal || 0) + (globalStats.medidores_tiempo_real || 0)}
            </span>
            <span className="text-[9px] text-on-surface-variant mt-1 truncate font-medium">
              Norm: <span className="font-bold text-on-surface">{globalStats.medidores_normal || 0}</span> | Punta: <span className="font-bold text-on-surface">{globalStats.medidores_tiempo_real || 0}</span> | Sin Med: <span className="font-bold text-error">{globalStats.socios_sin_medidor || 0}</span>
            </span>
          </div>
        </div>

        {/* Card 2: Conexiones Activas */}
        <div className="bg-surface border border-outline-variant hover:border-green-600/30 rounded-xl p-3 flex items-center gap-3 transition-colors shadow-sm">
          <div className="w-10 h-10 rounded-full bg-green-600/5 flex items-center justify-center text-green-600 shrink-0 border border-green-600/10">
            <span className="material-symbols-outlined text-[20px]">bolt</span>
          </div>
          <div className="flex flex-col justify-center overflow-hidden flex-1">
            <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider leading-tight truncate">Conexiones Activas</span>
            <span className="font-data-mono text-lg text-green-600 font-bold leading-none mt-0.5 truncate">
              {globalStats.activos}
            </span>
            <span className="text-[9px] text-on-surface-variant/70 mt-1 truncate">Con suministro activo</span>
          </div>
        </div>

        {/* Card 3: Suspendidas / Cortadas */}
        <div className="bg-surface border border-outline-variant hover:border-error/30 rounded-xl p-3 flex items-center gap-3 transition-colors shadow-sm">
          <div className="w-10 h-10 rounded-full bg-error/5 flex items-center justify-center text-error shrink-0 border border-error/10">
            <span className="material-symbols-outlined text-[20px]">power_off</span>
          </div>
          <div className="flex flex-col justify-center overflow-hidden flex-1">
            <span className="text-[9px] font-bold text-error uppercase tracking-wider leading-tight truncate">Suspendidas / Cortadas</span>
            <span className="font-data-mono text-lg text-error font-bold leading-none mt-0.5 truncate">
              {globalStats.inactivos}
            </span>
            <span className="text-[9px] text-error/70 mt-1 truncate">Cortes o suspensiones de luz</span>
          </div>
        </div>
      </div>

      {/* Progress Bar under KPIs */}
      <div className="mb-6 flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1">
          <span>Distribución de Suministro</span>
          <span>{total > 0 ? wActivos.toFixed(1) + '% Activas' : '0%'}</span>
        </div>
        <div className="h-3 w-full bg-surface-variant rounded-full flex relative overflow-hidden shadow-inner">
          {total > 0 && (
            <>
              {wActivos > 0 && <div className="h-full bg-green-600 transition-all duration-1000" style={{ width: `${wActivos}%` }} title={`Activas: ${wActivos.toFixed(1)}%`} />}
              {wInactivos > 0 && <div className="h-full bg-error transition-all duration-1000" style={{ width: `${wInactivos}%` }} title={`Suspendidas/Cortadas: ${wInactivos.toFixed(1)}%`} />}
            </>
          )}
        </div>
        <div className="flex items-center gap-4 px-1 mt-1">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-600"></div>
            <span className="text-[9px] text-on-surface-variant">Conexiones Activas</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-error"></div>
            <span className="text-[9px] text-on-surface-variant">Suspendidas / Cortadas</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(TenantKPICards);
