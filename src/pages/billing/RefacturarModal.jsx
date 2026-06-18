import React, { memo, useEffect } from 'react';

/**
 * RefacturarModal — Modal for re-invoicing a receipt.
 * Extracted from Billing.jsx to reduce parent component complexity.
 */
const RefacturarModal = memo(({ isOpen, motivo, isProcessing, onMotivoChange, onSubmit, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape' && !isProcessing) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, isProcessing, onClose]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-scrim/60 backdrop-blur-md p-4 transition-all duration-300"
        >
          <div
            className="bg-surface-container-lowest rounded-[32px] w-full max-w-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col border border-outline-variant/30"
          >
            {/* Header with gradient */}
            <div className="relative px-6 py-4 bg-orange-500 overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/30">
                    <span className="material-symbols-outlined text-[24px]">autorenew</span>
                  </div>
                  <div>
                    <h3 className="text-[20px] font-display font-bold leading-tight drop-shadow-sm">Refacturar Recibo</h3>
                    <p className="text-orange-50 text-xs font-medium opacity-90 mt-0.5">Corrige valores y genera un nuevo documento</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            <form onSubmit={onSubmit} className="p-6 flex flex-col gap-4 bg-white">
              {/* Elegant Warning Banner */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100 shadow-sm">
                <div className="mt-0.5">
                  <span className="material-symbols-outlined text-orange-500 text-[20px]">info</span>
                </div>
                <div className="text-xs text-on-surface-variant leading-relaxed">
                  El recibo actual pasará a estado <span className="font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded mx-0.5">ANULADO</span>. Se emitirá uno nuevo con las tarifas y lecturas más recientes.
                </div>
              </div>

              {/* Input Area */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-on-surface uppercase tracking-wider pl-1">Motivo de Refacturación <span className="text-error">*</span></label>
                <div className="relative group">
                  <textarea
                    required
                    rows="2"
                    className="w-full bg-surface-container-lowest border-2 border-outline-variant/60 rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 resize-none transition-all duration-300 shadow-inner group-hover:border-outline-variant"
                    placeholder="Ej. Se corrigió la lectura de Hora Punta que estaba en 0..."
                    value={motivo}
                    onChange={(e) => onMotivoChange(e.target.value)}
                  />
                  <div className="absolute right-3 bottom-3 text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-widest pointer-events-none">
                    Auditoría
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/30 mt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-full font-bold text-xs text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                  disabled={isProcessing}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !motivo.trim()}
                  className="px-6 py-2 rounded-full font-bold text-xs bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all duration-300 shadow-[0_4px_10px_-4px_rgba(234,88,12,0.4)] hover:shadow-[0_8px_16px_-4px_rgba(234,88,12,0.5)] hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isProcessing ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">autorenew</span>
                      Confirmar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    
  );
});

RefacturarModal.displayName = 'RefacturarModal';

export default RefacturarModal;
