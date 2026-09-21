import React from 'react';
import { formatPeriod } from '../billingUtils';

const STATUS_STYLES = {
  Pendiente: 'bg-yellow-100 text-yellow-800',
  Pagado: 'bg-green-100 text-green-800',
  Anulado: 'bg-gray-200 text-gray-800',
  Vencido: 'bg-red-100 text-red-800',
  'Pago Parcial': 'bg-orange-100 text-orange-800',
};

const BillingMobileCard = ({ receipt, onViewDetail, onViewHistory, onViewPayments, onOpenMenu, isMenuOpen }) => {
  const statusClass = STATUS_STYLES[receipt.estado] || STATUS_STYLES.Vencido;
  const canceledCount = Number(receipt.cantidad_anulados || 0);
  const address = receipt.medidor_direccion || receipt.direccion || 'Sin dirección';

  return (
    <article className="bg-white px-4 py-3 active:bg-surface-container-low transition-colors">
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => onViewDetail(receipt.id)} className="min-w-0 flex-1 text-left">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 font-data-mono text-[11px] font-extrabold tracking-wide ${receipt.medidor_num_serie ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-container-high text-on-surface-variant border-outline-variant'}`}>
              <span className="material-symbols-outlined text-[14px]" translate="no">{receipt.medidor_num_serie ? 'electric_meter' : 'money_off'}</span>
              {receipt.medidor_num_serie || 'Sin medidor'}
            </span>
            {receipt.medidor_num_serie && receipt.medidor_tipo && (
              <span className={`rounded border px-1.5 py-1 text-[9px] font-bold uppercase tracking-wider ${receipt.medidor_tipo === 'Tiempo Real' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'}`}>
                {receipt.medidor_tipo === 'Tiempo Real' ? 'Hora punta' : receipt.medidor_tipo}
              </span>
            )}
          </span>
          <span className="mt-2 block text-sm font-bold leading-5 text-on-surface break-words">{receipt.socio || 'Socio desconocido'}</span>
          <span className="mt-1 block font-data-mono text-[10px] text-on-surface-variant">DNI/RUC: {receipt.documento_identidad || '-'}</span>
        </button>

        <button
          type="button"
          onClick={(event) => onOpenMenu(receipt, event)}
          className={`h-9 w-9 shrink-0 rounded-lg border flex items-center justify-center transition-colors ${isMenuOpen ? 'bg-primary/15 text-primary border-primary/30' : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant'}`}
          aria-label={`Opciones del recibo de ${receipt.socio || 'socio'}`}
        >
          <span className="material-symbols-outlined text-[21px]" translate="no">more_vert</span>
        </button>
      </div>

      <div className="mt-2 flex items-start gap-1.5 text-[11px] leading-4 text-on-surface-variant">
        <span className="material-symbols-outlined text-[15px] shrink-0 text-primary/70" translate="no">location_on</span>
        <span className="min-w-0 break-words">{address}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-outline-variant/70 bg-surface-container-lowest p-2.5">
        <div>
          <span className="block text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Periodo</span>
          <span className="mt-0.5 block text-xs font-semibold text-on-surface capitalize">{formatPeriod(receipt.periodo) || 'N/A'}</span>
        </div>
        <div className="text-right">
          <span className="block text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Total</span>
          <span className="mt-0.5 block font-data-mono text-sm font-bold text-on-surface">S/ {Number(receipt.total || 0).toFixed(2)}</span>
          <span className="block text-[9px] text-on-surface-variant">Vence: {receipt.fecha_vencimiento ? new Date(receipt.fecha_vencimiento).toLocaleDateString('es-PE') : '-'}</span>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={() => onViewPayments?.(receipt)} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${statusClass}`}>
          <span className="material-symbols-outlined text-[13px]" translate="no">payments</span>
          {receipt.estado}
        </button>
        {canceledCount > 0 && (
          <button type="button" onClick={() => onViewHistory(receipt.id)} className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-800">
            <span className="material-symbols-outlined text-[12px]" translate="no">history</span>
            {canceledCount} {canceledCount === 1 ? 'anulada' : 'anuladas'}
          </button>
        )}
      </div>
    </article>
  );
};

export default React.memo(BillingMobileCard);
