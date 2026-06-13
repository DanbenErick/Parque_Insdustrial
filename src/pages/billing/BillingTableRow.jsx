import React, { memo } from 'react';
import { formatPeriod } from './billingUtils';

/**
 * BillingTableRow — A single row in the billing table.
 * Memoized to prevent re-renders when sibling rows change.
 */

// Moved outside component: constant object, no need to recreate on every render
const ESTADO_CONFIG = {
  Pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  Pagado: { bg: 'bg-green-100', text: 'text-green-800' },
  Anulado: { bg: 'bg-gray-200', text: 'text-gray-800' },
  Vencido: { bg: 'bg-red-100', text: 'text-red-800' },
  'Pago Parcial': { bg: 'bg-orange-100', text: 'text-orange-800' },
};

const BillingTableRow = memo(({ recibo, onViewPdf, onWhatsApp, onRefacturar, onViewDetail }) => {
  const estado = ESTADO_CONFIG[recibo.estado] || ESTADO_CONFIG.Vencido;

  return (
    <tr className="hover:bg-surface-container-lowest transition-colors group">
      <td className="px-4 py-2">
        <div className="flex flex-col">
          <button
            onClick={() => onViewDetail(recibo.id)}
            className="font-bold text-on-surface text-[11px] hover:text-primary transition-colors text-left focus:outline-none"
            title="Ver Detalle"
          >
            <span className="truncate max-w-[180px] block">{recibo.socio || 'Desconocido'}</span>
          </button>
          <span className="font-data-mono text-[10px] text-on-surface-variant">DNI/RUC: {recibo.documento_identidad}</span>
        </div>
      </td>
      <td className="px-4 py-2">
        <span className="text-[11px] text-on-surface font-medium capitalize">
          {formatPeriod(recibo.periodo) || 'N/A'}
        </span>
      </td>
      <td className="px-4 py-2">
        <div className="flex flex-col items-start">
          <div className="font-data-mono font-bold text-on-surface text-[12px]">
            S/ {parseFloat(recibo.total).toFixed(2)}
          </div>
          <div className="text-[9px] text-on-surface-variant font-medium">
            Vence: {recibo.fecha_vencimiento ? new Date(recibo.fecha_vencimiento).toLocaleDateString('es-PE') : '-'}
          </div>
        </div>
      </td>
      <td className="px-4 py-2 text-center">
        <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide ${estado.bg} ${estado.text}`}>
          {recibo.estado}
        </span>
      </td>
      <td className="px-4 py-2 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onViewPdf(recibo.id)}
            className="w-7 h-7 flex items-center justify-center text-error hover:bg-error/10 rounded-md transition-colors"
            title="Ver PDF"
          >
            <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
          </button>
          <button
            onClick={() => onWhatsApp(recibo)}
            className="w-7 h-7 flex items-center justify-center text-[#25D366] hover:bg-[#25D366]/10 rounded-md transition-colors"
            title="Enviar por WhatsApp"
          >
            <span className="material-symbols-outlined text-[15px]">chat</span>
          </button>
          {recibo.estado !== 'Pagado' && recibo.estado !== 'Anulado' && (
            <button
              onClick={() => onRefacturar(recibo.id)}
              className="w-7 h-7 flex items-center justify-center text-orange-600 hover:bg-orange-100 rounded-md transition-colors"
              title="Refacturar"
            >
              <span className="material-symbols-outlined text-[15px]">autorenew</span>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

BillingTableRow.displayName = 'BillingTableRow';

export default BillingTableRow;
