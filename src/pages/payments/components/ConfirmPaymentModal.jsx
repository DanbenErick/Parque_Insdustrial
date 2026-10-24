const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

const ConfirmPaymentModal = ({
  isOpen,
  data,
  onAccept,
  onReject,
  isSubmitting,
  formatCurrency,
  backdropProps,
  contentProps,
}) => {
  if (!isOpen || !data) return null;

  const {
    socio,
    medidor,
    comprobante,
    monto,
    metodoPago,
    numeroOperacion,
    fechaPago,
    isPagoExtra,
    saldoPendiente = 0,
  } = data;

  const montoNum = parseFloat(monto || 0);
  const isParcial = montoNum < saldoPendiente - 0.02 && saldoPendiente > 0;
  const isExcedido = montoNum > saldoPendiente + 0.02 && saldoPendiente > 0;

  return (
    <div
      {...backdropProps}
      className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onReject();
        }
      }}
    >
      <div
        {...contentProps}
        className="bg-surface rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden border border-outline-variant animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
          <h3 className="text-base text-on-surface font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-primary" translate="no">
              fact_check
            </span>
            Confirmar Registro de Pago
          </h3>
          <button
            type="button"
            onClick={onReject}
            disabled={isSubmitting}
            className="w-7 h-7 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant disabled:opacity-50 transition-colors"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-[18px]" translate="no">
              close
            </span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-on-surface-variant">
            Por favor revise la información que se registrará en el sistema:
          </p>

          {/* Details Card */}
          <div className="bg-surface-container-low border border-outline-variant/70 rounded-xl p-3.5 space-y-3 text-xs">
            {/* Socio */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]" translate="no">person</span>
                Socio
              </span>
              <span className="font-bold text-sm text-on-surface break-words">
                {socio || 'No especificado'}
              </span>
              {(medidor || comprobante) && (
                <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant font-data-mono mt-0.5">
                  {comprobante && <span>Recibo: {comprobante}</span>}
                  {comprobante && medidor && <span>•</span>}
                  {medidor && (
                    <span className="flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]" translate="no">speed</span>
                      Medidor: {medidor}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-outline-variant/60" />

            {/* Monto */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]" translate="no">payments</span>
                Monto
              </span>
              <div className="text-right">
                <span className="font-data-mono text-lg font-bold text-primary">
                  S/ {formatCurrency ? formatCurrency(montoNum) : montoNum.toFixed(2)}
                </span>
                {isPagoExtra ? (
                  <span className="block text-[9px] font-bold text-emerald-700">Abono a saldo a favor</span>
                ) : isExcedido ? (
                  <span className="block text-[9px] font-bold text-emerald-700">Saldo a favor: S/ {(montoNum - saldoPendiente).toFixed(2)}</span>
                ) : isParcial ? (
                  <span className="block text-[9px] font-bold text-amber-700">Abono parcial (Resta: S/ {(saldoPendiente - montoNum).toFixed(2)})</span>
                ) : (
                  <span className="block text-[9px] font-bold text-emerald-700 uppercase tracking-wide">Pago Completo</span>
                )}
              </div>
            </div>

            <div className="border-t border-outline-variant/60" />

            {/* Método de Pago */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]" translate="no">account_balance</span>
                Método de Pago
              </span>
              <span className="font-bold text-on-surface text-right">
                {metodoPago || '-'}
                {numeroOperacion && (
                  <span className="font-data-mono text-[10px] text-on-surface-variant ml-1 font-normal">
                    (Op: {numeroOperacion})
                  </span>
                )}
              </span>
            </div>

            <div className="border-t border-outline-variant/60" />

            {/* Fecha */}
            <div className="p-2.5 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px] text-primary" translate="no">
                    calendar_month
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant block leading-none">
                    Fecha de Pago
                  </span>
                  <span className="font-data-mono text-sm font-bold text-on-surface mt-0.5 block">
                    {formatDisplayDate(fechaPago)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onReject}
                disabled={isSubmitting}
                className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 px-2.5 py-1 rounded border border-primary/20 bg-surface hover:bg-primary/5 shadow-2xs"
                title="Modificar fecha"
              >
                <span className="material-symbols-outlined text-[13px]" translate="no">edit_calendar</span>
                Modificar
              </button>
            </div>
          </div>

          {/* Hint alert */}
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-900 flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-amber-700 shrink-0" translate="no">
              info
            </span>
            <span className="text-[11px] leading-tight">
              Si la fecha u otro dato necesita corrección, presione <strong>Rechazar</strong> para modificar la fecha antes de guardar.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-outline-variant">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onReject}
              className="flex-1 py-2 px-3 text-xs font-bold text-on-surface-variant hover:bg-surface-variant hover:text-on-surface rounded-md border border-outline-variant transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]" translate="no">close</span>
              Rechazar
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onAccept}
              className="flex-1 py-2 px-3 text-xs font-bold text-white bg-primary hover:opacity-90 active:scale-95 rounded-md shadow-sm flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[16px] ${isSubmitting ? 'animate-spin' : ''}`} translate="no">
                {isSubmitting ? 'sync' : 'check'}
              </span>
              {isSubmitting ? 'Guardando...' : 'Aceptar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPaymentModal;
