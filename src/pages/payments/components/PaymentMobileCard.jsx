import React, { useMemo } from 'react';

const PaymentMobileCard = ({ payment, previousAmount, onSelect, onOpenMenu, isMenuOpen, getTypeInfo, formatCurrency }) => {
  const typeInfo = useMemo(() => getTypeInfo(payment, previousAmount), [payment, previousAmount, getTypeInfo]);
  const isCanceled = payment.estado_validacion === 'Anulado';

  return (
    <article className={`px-4 py-3 transition-colors ${isCanceled ? 'bg-red-500/5' : 'bg-white'}`}>
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => onSelect(payment)} className="min-w-0 flex-1 text-left">
          <span className="block text-sm font-bold leading-5 text-on-surface break-words">{payment.socio}</span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-on-surface-variant">
            <span className="inline-flex items-center gap-1 font-data-mono">
              <span className="material-symbols-outlined text-[13px]" translate="no">electric_meter</span>
              {payment.medidor_num_serie || 'Sin medidor'}
            </span>
            {payment.numero_comprobante && <span className="font-data-mono">· {payment.numero_comprobante}</span>}
          </span>
        </button>
        <button
          type="button"
          onClick={(event) => onOpenMenu(payment, event)}
          className={`h-9 w-9 shrink-0 rounded-lg border flex items-center justify-center transition-colors ${isMenuOpen ? 'bg-primary/15 text-primary border-primary/30' : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant'}`}
          aria-label={`Opciones del pago de ${payment.socio}`}
        >
          <span className="material-symbols-outlined text-[21px]" translate="no">more_vert</span>
        </button>
      </div>

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-lg border border-outline-variant/70 bg-surface-container-lowest p-2.5">
        <div className="min-w-0">
          <span className="block text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Método y fecha</span>
          <span className="mt-0.5 block truncate text-xs font-semibold text-on-surface">{payment.metodo_pago}</span>
          {payment.numero_operacion && <span className="block truncate font-data-mono text-[9px] text-on-surface-variant">Op: {payment.numero_operacion}</span>}
          <span className="block text-[10px] text-on-surface-variant">{new Date(payment.fecha_pago).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="text-right">
          <span className="block text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Monto</span>
          <span className={`mt-0.5 block font-data-mono text-base font-bold ${isCanceled ? 'line-through text-on-surface-variant/60' : 'text-on-surface'}`}>S/ {formatCurrency(payment.monto_pagado)}</span>
          {!isCanceled && typeInfo.subtextType === 'restante' && <span className="block text-[9px] font-bold text-amber-700">Restante: S/ {formatCurrency(typeInfo.subtextMonto)}</span>}
          {!isCanceled && typeInfo.subtextType === 'a_favor' && <span className="block text-[9px] font-bold text-emerald-700">A favor: S/ {formatCurrency(typeInfo.subtextMonto)}</span>}
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${typeInfo.badgeClass}`}>{typeInfo.badgeLabel}</span>
        {payment.saldo_a_favor_socio > 0 && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">Saldo a favor: S/ {formatCurrency(payment.saldo_a_favor_socio)}</span>}
        {payment.motivo_anulacion && <span className="basis-full text-[10px] italic text-error">Motivo: {payment.motivo_anulacion}</span>}
      </div>
    </article>
  );
};

export default React.memo(PaymentMobileCard);
