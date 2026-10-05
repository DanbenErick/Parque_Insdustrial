import  { memo, useEffect } from 'react';

/**
 * AnularModal — Modal for canceling a receipt without generating a new one.
 */
const AnularModal = memo(({ isOpen, motivo, isProcessing, onMotivoChange, onSubmit, onClose }) => {
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
            <div className="relative px-6 py-4 bg-error overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.28)_1px,transparent_0)] bg-[size:12px_12px] opacity-30"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/30">
                    <span className="material-symbols-outlined text-[24px]" translate="no">cancel</span>
                  </div>
                  <div>
                    <h3 className="text-[20px] font-display font-bold leading-tight drop-shadow-sm">Anular Recibo</h3>
                    <p className="text-error-container text-xs font-medium opacity-90 mt-0.5">Cancela el documento permanentemente</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]" translate="no">close</span>
                </button>
              </div>
            </div>

            <form onSubmit={onSubmit} className="p-6 flex flex-col gap-4 bg-white">
              {/* Elegant Warning Banner */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-error-container/20 border border-error-container shadow-sm">
                <div className="mt-0.5">
                  <span className="material-symbols-outlined text-error text-[20px]" translate="no">warning</span>
                </div>
                <div className="text-xs text-on-surface-variant leading-relaxed">
                  El recibo pasará a estado <span className="font-bold text-error bg-error-container/30 px-1.5 py-0.5 rounded mx-0.5">ANULADO</span> de forma permanente y sus cargos volverán a estado pendiente.
                </div>
              </div>

              {/* Input Area */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-on-surface uppercase tracking-wider pl-1">Motivo de Anulación <span className="text-error">*</span></label>
                <div className="relative group">
                  <textarea
                    required
                    rows="2"
                    className="w-full bg-surface-container-lowest border-2 border-outline-variant/60 rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-error focus:ring-4 focus:ring-error/10 resize-none transition-all duration-300 shadow-inner group-hover:border-outline-variant"
                    placeholder="Ej. Error en facturación, el socio se retiró, etc..."
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
                  className="px-6 py-2 rounded-full font-bold text-xs bg-error text-white hover:bg-[#B3261E] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all duration-300 shadow-[0_4px_10px_-4px_rgba(220,53,69,0.4)] hover:shadow-[0_8px_16px_-4px_rgba(220,53,69,0.5)] hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isProcessing ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]" translate="no">progress_activity</span>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]" translate="no">cancel</span>
                      Confirmar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
});

AnularModal.displayName = 'AnularModal';

export default AnularModal;
