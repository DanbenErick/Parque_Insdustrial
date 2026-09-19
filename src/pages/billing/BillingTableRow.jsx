import  { memo } from 'react';
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

const BillingTableRow = memo(({ recibo, onViewDetail, onViewHistorial, onViewPagos, onOpenMenu, isMenuOpen }) => {
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
                  <span className="material-symbols-outlined text-[14px]" translate="no">
                    {recibo.medidor_num_serie ? 'speed' : 'money_off'}
                  </span>
                  {recibo.medidor_num_serie || 'Sin medidor'}
                </span>
                {recibo.medidor_num_serie && recibo.medidor_tipo && (
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    recibo.medidor_tipo === 'Tiempo Real' ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                  }`}>
                    {recibo.medidor_tipo === 'Tiempo Real' ? 'Hora Punta' : recibo.medidor_tipo}
                  </span>
                )}
                {Number(recibo.cantidad_anulados || 0) > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewHistorial(recibo.id);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide bg-amber-500/15 text-amber-800 border border-amber-500/30 hover:bg-amber-500/25 transition-all shadow-xs cursor-pointer"
                    title={`Este periodo tiene ${recibo.cantidad_anulados} comprobante(s) anulado(s). Haz clic para ver detalles del historial.`}
                  >
                    <span className="material-symbols-outlined text-[12px] text-amber-600" translate="no">history</span>
                    <span>{recibo.cantidad_anulados} {Number(recibo.cantidad_anulados) === 1 ? 'Anulada' : 'Anuladas'}</span>
                  </button>
                )}
              </div>

              {/* Socio name as secondary text */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="truncate max-w-[200px] font-medium text-on-surface-variant text-[11px]">
                  {recibo.socio || 'Desconocido'}
                </span>
                {recibo.estado === 'Vencido' && (
                  <div className="relative group/risk flex items-center justify-center">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error"></span>
                    </span>
                    <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-error text-white text-[10px] font-bold rounded opacity-0 group-hover/risk:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-sm z-20">
                      🚨 RIESGO DE CORTE
                    </span>
                  </div>
                )}
              </div>
            </div>
          </button>
          <div className="flex flex-col mt-0.5">
            <span className="font-data-mono text-[10px] text-on-surface-variant/70">DNI/RUC: {recibo.documento_identidad}</span>
            <span className="font-data-mono text-[10px] text-on-surface-variant/70 flex items-center gap-0.5 mt-0.5">
              <span className="material-symbols-outlined text-[10px]" translate="no">location_on</span>
              {recibo.medidor_direccion || recibo.direccion || 'Sin dirección'}
            </span>
          </div>
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
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => onViewPagos?.(recibo)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide cursor-pointer transition-all hover:opacity-85 hover:shadow-xs active:scale-95 ${estado.bg} ${estado.text}`}
            title="Ver pagos registrados de este recibo"
          >
            <span className="material-symbols-outlined text-[12px]" translate="no">payments</span>
            <span>{recibo.estado}</span>
          </button>
          {Number(recibo.cantidad_anulados || 0) > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewHistorial(recibo.id);
              }}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors shadow-2xs"
              title={`Clic para ver los detalles de las facturas anuladas`}
            >
              <span className="material-symbols-outlined text-[10px] text-amber-600" translate="no">warning</span>
              {recibo.cantidad_anulados} {Number(recibo.cantidad_anulados) === 1 ? 'anulada' : 'anuladas'}
            </button>
          )}
        </div>
      </td>
      <td className="px-4 py-2 text-right">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={(e) => onOpenMenu(recibo, e)}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              isMenuOpen
                ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
            title="Opciones de recibo"
          >
            <span className="material-symbols-outlined text-[20px]" translate="no">more_vert</span>
          </button>
        </div>
      </td>
    </tr>
  );
});

BillingTableRow.displayName = 'BillingTableRow';

export default BillingTableRow;
