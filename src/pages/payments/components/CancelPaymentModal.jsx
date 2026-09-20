const CancelPaymentModal = ({ payment, reason, onReasonChange, onSubmit, onClose, isSubmitting, formatCurrency, backdropProps, contentProps }) => {
  if (!payment) return null;
  return (
    <div {...backdropProps} className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div {...contentProps} className="bg-surface rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden border border-outline-variant animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-outline-variant bg-error/5 flex justify-between items-center"><h3 className="text-base text-error font-bold flex items-center gap-2"><span className="material-symbols-outlined text-[22px]" translate="no">cancel</span>Anular Pago</h3><button type="button" onClick={onClose} disabled={isSubmitting} className="w-7 h-7 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant disabled:opacity-50" aria-label="Cerrar"><span className="material-symbols-outlined text-[18px]" translate="no">close</span></button></div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-3.5 space-y-2 text-xs">
            {[['Socio:', payment.socio], ['Recibo / Comprobante:', payment.numero_comprobante], ['Monto Pagado:', `S/ ${formatCurrency(payment.monto_pagado)}`], ['Fecha de Pago:', new Date(payment.fecha_pago).toLocaleDateString('es-PE')]].map(([label, value]) => <div key={label} className="flex justify-between items-center"><span className="text-on-surface-variant font-medium">{label}</span><span className="font-bold text-on-surface text-right">{value}</span></div>)}
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-900 flex items-start gap-2"><span className="material-symbols-outlined text-[18px] text-amber-700 shrink-0" translate="no">warning</span><span>Al anular este pago, el estado y saldo de la deuda del recibo se recalcularán automáticamente. Si generó saldo a favor, será deducido.</span></div>
          <label className="block"><span className="text-[11px] font-bold text-on-surface block mb-1.5">Motivo de Anulación <span className="text-error">*</span></span><textarea required rows={3} value={reason} onChange={(event) => onReasonChange(event.target.value)} placeholder="Especifique el motivo de anulación..." className="w-full border border-outline-variant rounded-lg p-2.5 text-xs bg-white focus:border-error focus:ring-1 focus:ring-error outline-none resize-none shadow-inner" autoFocus /></label>
          <div className="flex justify-end items-center gap-2 pt-2 border-t border-outline-variant"><button type="button" disabled={isSubmitting} onClick={onClose} className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-variant rounded-md">Cancelar</button><button type="submit" disabled={isSubmitting || !reason.trim()} className="px-4 py-2 text-xs font-bold text-white bg-error rounded-md shadow-sm flex items-center gap-1.5 disabled:opacity-50"><span className={`material-symbols-outlined text-[16px] ${isSubmitting ? 'animate-spin' : ''}`} translate="no">{isSubmitting ? 'sync' : 'delete_forever'}</span>{isSubmitting ? 'Anulando...' : 'Confirmar Anulación'}</button></div>
        </form>
      </div>
    </div>
  );
};

export default CancelPaymentModal;
