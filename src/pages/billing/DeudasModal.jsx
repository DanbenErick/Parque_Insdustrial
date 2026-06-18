import React, { memo, useEffect } from 'react';

/**
 * DeudasModal — Modal for selecting debt report scope (monthly vs historic).
 * Extracted from Billing.jsx to reduce parent component complexity.
 */
const DeudasModal = memo(({ isOpen, filterMes, onExport, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ea580c]">request_quote</span>
                Generar Reporte de Deudas
              </h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600 mb-6">
                Seleccione el alcance del reporte de deudas en Excel. Puede descargar solo las deudas del periodo actualmente filtrado o el historial completo.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => onExport('mensual')}
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-[#ea580c] hover:bg-[#ea580c]/5 transition-all text-left group"
                >
                  <div>
                    <div className="font-semibold text-slate-800 group-hover:text-[#ea580c] transition-colors">
                      Deudas del Periodo Actual
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {filterMes === 'Todos' || filterMes === 'TodosHistorico' ? 'Actualmente viendo todos los periodos' : `Periodo: ${filterMes}`}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-[#ea580c]">chevron_right</span>
                </button>

                <button
                  onClick={() => onExport('historico')}
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-[#107C41] hover:bg-[#107C41]/5 transition-all text-left group"
                >
                  <div>
                    <div className="font-semibold text-slate-800 group-hover:text-[#107C41] transition-colors">
                      Historial de Todos los Años
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Descarga todas las deudas vigentes e históricas
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-[#107C41]">history</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    
  );
});

DeudasModal.displayName = 'DeudasModal';

export default DeudasModal;
