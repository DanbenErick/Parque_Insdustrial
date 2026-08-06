import React from 'react';

const formatPeriodo = (periodoStr) => {
  if (!periodoStr) return '';
  const parts = periodoStr.split('-');
  if (parts.length !== 2) return periodoStr;
  
  let year, month;
  if (parts[0].length === 4) {
    year = parts[0];
    month = parts[1];
  } else {
    month = parts[0];
    year = parts[1];
  }
  
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const monthIndex = parseInt(month, 10) - 1;
  
  if (monthIndex >= 0 && monthIndex < 12) {
    return `${monthNames[monthIndex]} ${year}`;
  }
  return periodoStr;
};

const PeriodDetailDrawer = ({ drawerPeriodo, setDrawerPeriodo, handleEdit }) => {
  if (!drawerPeriodo) return null;

  return (
    <>
      <style>
        {`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; backdrop-filter: blur(0px); }
            to { opacity: 1; backdrop-filter: blur(4px); }
          }
          .animate-drawer-slide {
            animation: slideInRight 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
          .animate-drawer-fade {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}
      </style>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] !m-0 animate-drawer-fade"
        onClick={() => setDrawerPeriodo(null)}
      />
      <div
        className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-surface shadow-2xl z-[110] flex flex-col border-l border-outline-variant !m-0 animate-drawer-slide"
      >
        {/* Header del Drawer */}
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">calendar_month</span>
            <h3 className="font-headline-sm font-bold text-on-surface">Detalle del Periodo</h3>
          </div>
          <button onClick={() => setDrawerPeriodo(null)} className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Cuerpo del Drawer */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
          {/* Cabecera Principal */}
          <div className="flex flex-col items-center text-center space-y-3 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shadow-inner">
              <span className="material-symbols-outlined text-3xl">event_available</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-on-surface capitalize">{formatPeriodo(drawerPeriodo.mes_anio)}</h2>
              <p className="text-sm text-on-surface-variant mt-1">Periodo de Facturación</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 uppercase">
                {drawerPeriodo.estado || 'ACTIVO'}
              </span>
            </div>
          </div>

          {/* Tarifas y Costos */}
          <div className="space-y-3">
            <h4 className="text-sm font-label-caps font-bold text-on-surface-variant uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">payments</span>
              Tarifas y Costos
            </h4>
            <div className="bg-white rounded-xl border border-outline-variant divide-y divide-outline-variant shadow-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface border border-outline-variant rounded-xl p-3 shadow-sm hover:border-primary/30 transition-colors group">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">bolt</span> Costo Energía (Fuera Punta)
                  </p>
                  <p className="font-data-mono font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                    S/ {Number(drawerPeriodo.tarifa_kwh).toFixed(4)}
                  </p>
                </div>
                <div className="bg-surface border border-outline-variant rounded-xl p-3 shadow-sm hover:border-orange-500/30 transition-colors group">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-orange-600">bolt</span> Costo Energía (H. Punta)
                  </p>
                  <p className="font-data-mono font-bold text-base text-on-surface group-hover:text-orange-600 transition-colors">
                    S/ {Number(drawerPeriodo.tarifa_kwh_tr || drawerPeriodo.tarifa_kwh).toFixed(4)}
                  </p>
                </div>
                <div className="bg-surface border border-outline-variant rounded-xl p-3 shadow-sm hover:border-orange-500/30 transition-colors group">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-orange-600">schedule</span> Costo Punta (kWh)
                  </p>
                  <p className="font-data-mono font-bold text-base text-on-surface group-hover:text-orange-600 transition-colors">
                    S/ {Number(drawerPeriodo.tarifa_kwh_punta || 0).toFixed(4)}
                  </p>
                </div>
                <div className="bg-surface border border-outline-variant rounded-xl p-3 shadow-sm hover:border-purple-500/30 transition-colors group">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-purple-600">electric_meter</span> Costo Potencia (Punta)
                  </p>
                  <p className="font-data-mono font-bold text-base text-on-surface group-hover:text-purple-600 transition-colors">
                    S/ {Number(drawerPeriodo.costo_potencia || 0).toFixed(4)}
                  </p>
                </div>
                
                <div className="bg-surface border border-outline-variant rounded-xl p-3 shadow-sm hover:border-indigo-500/30 transition-colors group">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-indigo-600">electric_meter</span> Costo Potencia (F. Punta)
                  </p>
                  <p className="font-data-mono font-bold text-base text-on-surface group-hover:text-indigo-600 transition-colors">
                    S/ {Number(drawerPeriodo.costo_potencia_fuera_punta || 0).toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cronograma */}
          <div className="space-y-3">
            <h4 className="text-sm font-label-caps font-bold text-on-surface-variant uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">calendar_clock</span>
              Cronograma
            </h4>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="p-3 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-blue-600">calendar_month</span>
                <span className="text-xs font-bold text-blue-800 uppercase">Periodo de Consumo</span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">Inicio</p>
                  <p className="text-sm font-bold text-on-surface">{new Date(drawerPeriodo.fecha_inicio).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">Fin</p>
                  <p className="text-sm font-bold text-on-surface">{new Date(drawerPeriodo.fecha_fin).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="p-3 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-orange-600">receipt_long</span>
                <span className="text-xs font-bold text-orange-800 uppercase">Fechas de Facturación</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-medium text-on-surface-variant">Emisión de Recibo</p>
                  <p className="text-sm font-bold text-on-surface">{drawerPeriodo.fecha_emision_recibo ? new Date(drawerPeriodo.fecha_emision_recibo).toLocaleDateString() : 'No definido'}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs font-medium text-on-surface-variant">Vencimiento</p>
                  <p className="text-sm font-bold text-on-surface">{drawerPeriodo.fecha_vencimiento ? new Date(drawerPeriodo.fecha_vencimiento).toLocaleDateString() : 'No definido'}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs font-medium text-error">Fecha de Corte</p>
                  <p className="text-sm font-bold text-error">{drawerPeriodo.fecha_corte ? new Date(drawerPeriodo.fecha_corte).toLocaleDateString() : 'No definido'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Auditoría */}
          <div className="space-y-3">
            <h4 className="text-sm font-label-caps font-bold text-on-surface-variant uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">history</span>
              Auditoría y Trazabilidad
            </h4>
            <div className="bg-surface-container rounded-xl p-4 border border-outline-variant shadow-inner">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant mb-0.5">Creado por</p>
                  <p className="text-sm font-bold text-on-surface">
                    {drawerPeriodo.creador_nombre || 'Administrador del Sistema'}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Registrado el {new Date(drawerPeriodo.created_at).toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del Drawer */}
        <div className="p-6 border-t border-outline-variant bg-surface-container-lowest">
          <button
            onClick={() => {
              setDrawerPeriodo(null);
              handleEdit(drawerPeriodo);
            }}
            className="w-full py-3 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-lg font-bold flex justify-center items-center gap-2 border border-primary/20"
          >
            <span className="material-symbols-outlined">edit</span>
            Editar Periodo
          </button>
        </div>
      </div>
    </>
  );
};

export default PeriodDetailDrawer;
