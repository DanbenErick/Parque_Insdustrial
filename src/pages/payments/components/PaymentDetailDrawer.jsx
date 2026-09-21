import { createPortal } from 'react-dom';
import { PaymentDetailRow as DetailRow } from './PaymentPresentation';
import { fmtCurrency, getPagoTipoInfo } from '../paymentUtils';

const PaymentDetailDrawer = ({ payment, previousAmount = 0, onClose, onEdit, onViewReceipt, backdropProps }) => {
  if (!payment) return null;
  const typeInfo = getPagoTipoInfo(payment, previousAmount);

  return createPortal(
    <div {...backdropProps} className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="w-full max-w-sm bg-surface h-full shadow-2xl flex flex-col">
        <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <h3 className="text-base text-on-surface font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary" translate="no">receipt_long</span>
            Detalle del Pago
          </h3>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors" aria-label="Cerrar detalle">
            <span className="material-symbols-outlined text-[18px]" translate="no">close</span>
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
          <div className="bg-surface-container-low rounded-xl p-4 flex flex-col items-center justify-center border border-outline-variant/50">
            <span className="text-[10px] text-on-surface-variant font-bold tracking-wider mb-1.5 uppercase">Monto pagado</span>
            <span className="font-data-mono text-3xl font-bold text-primary">S/ {fmtCurrency(payment.monto_pagado)}</span>
            <div className="mt-3 flex flex-col items-center gap-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${payment.estado_validacion === 'Anulado' ? 'bg-error/10 text-error border border-error/20' : 'bg-[#059669]/10 text-[#059669] border border-[#059669]/20'}`}>
                {payment.estado_validacion || 'Confirmado'}
              </span>
              {payment.motivo_anulacion && <span className="text-[10px] text-error/90 italic bg-error/5 border border-error/10 rounded px-2.5 py-1 text-center mt-1 max-w-xs">Motivo: {payment.motivo_anulacion}</span>}
            </div>
          </div>

          <section>
            <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Información del cliente</h4>
            <div className="bg-white border border-outline-variant rounded-lg p-3">
              <div className="font-bold text-xs text-on-surface">{payment.socio}</div>
              <div className="text-[11px] text-on-surface-variant mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]" translate="no">folder</span>
                Recibo asociado: <span className="font-data-mono font-bold text-xs">{payment.numero_comprobante}</span>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Detalles de la transacción</h4>
            <div className="bg-white border border-outline-variant rounded-lg divide-y divide-outline-variant">
              <DetailRow icon="calendar_today" label="Fecha y Hora" value={new Date(payment.fecha_pago).toLocaleString('es-PE')} />
              <DetailRow icon="payments" label="Método de Pago" value={payment.metodo_pago} />
              {payment.numero_operacion && <DetailRow icon="tag" label="N° de Operación" value={payment.numero_operacion} valueClassName="font-data-mono text-xs font-bold text-on-surface" />}
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Detalle del pago</h4>
            <div className={`border rounded-lg p-3 ${typeInfo.boxClass}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-on-surface">Tipo de abono</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${typeInfo.badgeClass}`}>{typeInfo.drawerLabel}</span>
              </div>
              <AmountRow label="Total del recibo" value={payment.recibo_total} />
              {typeInfo.previo > 0 && <AmountRow label="Pagos anteriores al recibo" value={typeInfo.previo} muted />}
              <AmountRow label="Monto de este pago" value={payment.monto_pagado} />
              {typeInfo.tipo === 'Parcial' && <AmountRow label="Deuda restante tras este pago" value={typeInfo.restante} accent="amber" bordered />}
              {typeInfo.subtextType === 'a_favor' && <AmountRow label="Saldo a favor generado" value={typeInfo.aFavor} accent="emerald" bordered />}
            </div>
          </section>

          <div className="pt-6 mt-auto space-y-2">
            {payment.estado_validacion !== 'Anulado' && (
              <button type="button" onClick={() => onEdit(payment)} className="w-full py-1.5 h-8 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-900 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors">
                <span className="material-symbols-outlined text-[16px]" translate="no">edit</span>
                Modificar datos del pago
              </button>
            )}
            <button type="button" onClick={onViewReceipt} className="w-full py-1.5 h-8 bg-surface-container-low hover:bg-surface-variant border border-outline-variant text-on-surface text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors">
              <span className="material-symbols-outlined text-[16px]" translate="no">receipt_long</span>
              Ver recibo completo
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const AmountRow = ({ label, value, muted = false, accent, bordered = false }) => {
  const tone = accent === 'amber' ? 'text-amber-700' : accent === 'emerald' ? 'text-emerald-700' : muted ? 'text-on-surface-variant' : 'text-on-surface';
  const labelTone = accent === 'amber' ? 'text-amber-900 font-bold' : accent === 'emerald' ? 'text-emerald-900 font-bold' : 'text-on-surface-variant';
  const border = bordered ? `pt-2 border-t ${accent === 'amber' ? 'border-amber-200/50' : 'border-emerald-200/50'}` : 'mb-2';
  return <div className={`flex justify-between items-center ${border}`}><span className={`text-[11px] ${labelTone}`}>{label}</span><span className={`font-data-mono text-xs font-bold ${tone}`}>S/ {fmtCurrency(value)}</span></div>;
};

export default PaymentDetailDrawer;
