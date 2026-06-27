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
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => onViewDetail(recibo.id)}
            className="text-left focus:outline-none w-full group/btn"
            title="Ver Detalle"
          >
            <div className="flex flex-col gap-1">
              {/* Medidor as the primary prominent element */}
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded text-[12px] font-extrabold uppercase tracking-wider ${
                  recibo.medidor_num_serie 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'bg-surface-container-high text-on-surface-variant border border-outline-variant'
                } group-hover/btn:bg-primary/20 transition-colors`}>
                  <span className="material-symbols-outlined text-[14px]">
                    {recibo.medidor_num_serie ? 'speed' : 'money_off'}
                  </span>
                  {recibo.medidor_num_serie || 'Sin medidor'}
                </span>
              </div>
              
              {/* Socio name as secondary text */}
              <span className="truncate max-w-[200px] font-medium text-on-surface-variant text-[11px] mt-0.5">
                {recibo.socio || 'Desconocido'}
              </span>
            </div>
          </button>
          <span className="font-data-mono text-[10px] text-on-surface-variant/70">DNI/RUC: {recibo.documento_identidad}</span>
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
        <div className="flex items-center justify-end gap-2">
          <div className="relative group/tooltip flex items-center justify-center">
            <button
              onClick={() => onViewPdf(recibo.id)}
              className="w-7 h-7 flex items-center justify-center text-error hover:bg-error/10 rounded-md transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            </button>
            <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-sm z-10">
              Ver PDF
            </span>
          </div>

          <div className="relative group/tooltip flex items-center justify-center">
            <button
              onClick={() => onWhatsApp(recibo)}
              className="w-7 h-7 flex items-center justify-center text-[#25D366] hover:bg-[#25D366]/10 rounded-md transition-colors"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.062-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
            </button>
            <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-sm z-10">
              WhatsApp
            </span>
          </div>

          {recibo.estado !== 'Pagado' && recibo.estado !== 'Anulado' && (
            <div className="relative group/tooltip flex items-center justify-center">
              <button
                onClick={() => onRefacturar(recibo.id)}
                className="w-7 h-7 flex items-center justify-center text-orange-600 hover:bg-orange-100 rounded-md transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">autorenew</span>
              </button>
              <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-sm z-10">
                Refacturar
              </span>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
});

BillingTableRow.displayName = 'BillingTableRow';

export default BillingTableRow;
