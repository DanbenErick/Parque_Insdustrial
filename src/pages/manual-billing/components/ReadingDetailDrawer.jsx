import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BadgeType } from './shared/BadgeType';
import { formatDateLong, fmtVal, parseSafe } from '../utils';
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock';

export const ReadingDetailDrawer = ({ record, medidorInfo, activePeriodo, onClose, onEdit }) => {
  useBodyScrollLock(Boolean(record));

  useEffect(() => {
    if (!record) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [record, onClose]);

  if (!record) return null;

  const isCambioMedidor = Boolean(record.es_cambio_medidor);
  const tipoMedidor = medidorInfo?.tipo || record.medidor_tipo || record.tipo;
  const isPunta = tipoMedidor === 'Hora Punta' || tipoMedidor === 'Tiempo Real';
  const isReactiva = parseSafe(record.factor_potencia) > 0;

  const factor = parseSafe(record.factor_multiplicador) || 1;
  const tarifaNormal = isPunta ? (parseSafe(record.tarifa_kwh_tr) || 0) : (parseSafe(record.tarifa_kwh) || 0);
  const tarifaPunta = parseSafe(record.tarifa_kwh_punta) || 0;
  const precioReactiva = parseSafe(record.precio_factor_potencia) || 0;

  const calcConsumoNormal = isCambioMedidor
    ? Math.max(0, parseSafe(record.lectura_final_viejo) - parseSafe(record.lectura_anterior)) + Math.max(0, parseSafe(record.lectura_actual) - parseSafe(record.lectura_inicial_nuevo))
    : Math.max(0, parseSafe(record.lectura_actual) - parseSafe(record.lectura_anterior));

  const calcConsumoPunta = isPunta
    ? (isCambioMedidor
        ? Math.max(0, parseSafe(record.lectura_final_viejo_punta) - parseSafe(record.lectura_anterior_punta)) + Math.max(0, parseSafe(record.lectura_actual_punta) - parseSafe(record.lectura_inicial_nuevo_punta))
        : Math.max(0, parseSafe(record.lectura_actual_punta) - parseSafe(record.lectura_anterior_punta)))
    : 0;

  const consumoNormal = parseSafe(record.consumo_calculado) || calcConsumoNormal;
  const consumoPunta = parseSafe(record.consumo_calculado_punta) || calcConsumoPunta;
  const reactivaKvarh = parseSafe(record.factor_potencia);
  const maxDemandaN = parseSafe(record.max_demanda_fuera_punta) || 0;
  const maxDemandaP = parseSafe(record.max_demanda_punta) || 0;

  const montoNormal = Math.round((consumoNormal * tarifaNormal * factor) * 10) / 10;
  const montoPunta = Math.round((consumoPunta * tarifaPunta * factor) * 10) / 10;
  const montoReactiva = reactivaKvarh > 0 ? Math.round((reactivaKvarh * precioReactiva) * 10) / 10 : 0;

  const costoPotencia = parseSafe(record.costo_potencia) || 0;
  const costoPotenciaFueraPunta = parseSafe(record.costo_potencia_fuera_punta) || 0;

  const montoDemandaP = isPunta ? Math.round((maxDemandaP * costoPotencia) * 10) / 10 : 0;
  const montoDemandaN = isPunta ? Math.round((maxDemandaN * costoPotenciaFueraPunta) * 10) / 10 : 0;

  const montoMantenimiento = isPunta
    ? parseSafe(activePeriodo?.tarifa_mantenimiento_tiempo_real)
    : parseSafe(activePeriodo?.tarifa_mantenimiento_normal);

  const montoTotal = Math.round((montoNormal + montoPunta + montoReactiva + montoDemandaP + montoDemandaN + montoMantenimiento) * 10) / 10;

  const wasModified = Boolean(record.justificacion);

  return createPortal(
    <>
      <style>
        {`
          @keyframes slideInRightDrawer {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes fadeInDrawer {
            from { opacity: 0; backdrop-filter: blur(0px); }
            to { opacity: 1; backdrop-filter: blur(4px); }
          }
          .animate-drawer-in {
            animation: slideInRightDrawer 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-backdrop-in {
            animation: fadeInDrawer 0.25s ease-out forwards;
          }
        `}
      </style>
      <div
        className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm animate-backdrop-in !m-0 overscroll-contain"
        onClick={onClose}
        style={{ overscrollBehavior: 'contain' }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-reading-title"
        className="fixed inset-y-0 right-0 z-[105] w-full max-w-[600px] h-[100dvh] max-h-[100dvh] bg-surface flex flex-col shadow-2xl border-l border-outline-variant animate-drawer-in !m-0 overflow-hidden"
        style={{ overscrollBehavior: 'contain' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fijo */}
        <div className="px-5 sm:px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]" translate="no">analytics</span>
            </div>
            <div className="min-w-0">
              <h3 id="drawer-reading-title" className="font-headline-sm text-base sm:text-lg font-bold text-on-surface leading-tight truncate">
                Detalle de Medición
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5 truncate">
                {formatDateLong(record.fecha_registro)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(record)}
                className="px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-bold text-xs flex items-center gap-1.5 border border-primary/20"
              >
                <span className="material-symbols-outlined text-[16px]" translate="no">edit</span>
                <span>Editar</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar detalle"
              className="p-2 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]" translate="no">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 custom-scrollbar modal-scroll-area bg-surface-container-lowest"
          style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
        >

          {/* Modified Alert */}
          {wasModified && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
              <span className="material-symbols-outlined text-amber-600 shrink-0 mt-0.5 text-[22px]" translate="no">edit_note</span>
              <div className="min-w-0">
                <h4 className="text-amber-800 font-bold text-sm mb-1">Lectura Modificada Manualmente</h4>
                <p className="text-amber-700/80 text-xs mb-2">Los valores actuales mostrados a continuación son el resultado de una corrección manual. El operario registró el siguiente motivo:</p>
                <div className="bg-white/60 p-3 rounded-lg border border-amber-200/50 text-sm font-medium text-amber-900 italic mb-3">
                  "{record.justificacion}"
                </div>
                {(record.lectura_actual_original !== null && record.lectura_actual_original !== undefined) && (
                  <div className="bg-amber-100/50 rounded-lg p-3 border border-amber-200 flex flex-col gap-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Valores Originales Erróneos:</p>
                    <div className="flex flex-wrap gap-3">
                      {record.lectura_actual_original !== null && (
                        <div className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded text-xs font-data-mono font-bold text-amber-900">
                          <span className="text-[10px] uppercase opacity-70">F. Punta:</span> {fmtVal(record.lectura_actual_original)} kWh
                        </div>
                      )}
                      {record.lectura_actual_punta_original !== null && (
                        <div className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded text-xs font-data-mono font-bold text-amber-900">
                          <span className="text-[10px] uppercase opacity-70">Punta:</span> {fmtVal(record.lectura_actual_punta_original)} kWh
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KPI Header Grid */}
          <div className="bg-white border border-outline-variant rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 block mb-1">Usuario / Razón Social</span>
                <h4 className="text-base sm:text-lg font-bold text-on-surface leading-snug break-words">{record.propietario}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="font-data-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]" translate="no">speed</span>
                    {record.num_serie}
                  </span>
                  <BadgeType type={tipoMedidor} />
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 block mb-1">Monto Estimado</span>
                <p className="font-data-mono text-xl sm:text-2xl font-black text-primary">S/ {fmtVal(montoTotal)}</p>
                <span className="text-[10px] text-on-surface-variant/60 block mt-0.5">Sin impuestos/otros</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-outline-variant/40">
              <div className="bg-surface-container-low p-2.5 rounded-xl text-center">
                <span className="text-[9px] font-bold uppercase text-on-surface-variant block mb-0.5">Factor Mult.</span>
                <span className="font-data-mono font-bold text-xs text-on-surface">{factor}x</span>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-xl text-center">
                <span className="text-[9px] font-bold uppercase text-on-surface-variant block mb-0.5">Tarifa Base</span>
                <span className="font-data-mono font-bold text-xs text-on-surface">S/ {fmtVal(tarifaNormal)}</span>
              </div>
              {isPunta && (
                <div className="bg-surface-container-low p-2.5 rounded-xl text-center">
                  <span className="text-[9px] font-bold uppercase text-orange-600 block mb-0.5">Tarifa Punta</span>
                  <span className="font-data-mono font-bold text-xs text-orange-600">S/ {fmtVal(tarifaPunta)}</span>
                </div>
              )}
              <div className="bg-surface-container-low p-2.5 rounded-xl text-center">
                <span className="text-[9px] font-bold uppercase text-on-surface-variant block mb-0.5">Periodo</span>
                <span className="font-bold text-xs text-on-surface">{record.periodo}</span>
              </div>
            </div>
          </div>

          {/* Bloque: Horario Fuera de Punta / Normal */}
          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]" translate="no">wb_sunny</span>
                <span className="font-bold text-sm text-on-surface">
                  {isPunta ? 'Energía Activa Fuera de Punta' : 'Consumo de Energía Activa'}
                </span>
              </div>
              <span className="font-data-mono font-black text-sm text-primary">
                {fmtVal(consumoNormal)} kWh
              </span>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1">Anterior</p>
                <p className="font-data-mono font-bold text-base text-on-surface">{fmtVal(record.lectura_anterior)} <span className="text-[10px]">kWh</span></p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-primary mb-1">Actual</p>
                <p className="font-data-mono font-bold text-base text-primary">{fmtVal(record.lectura_actual)} <span className="text-[10px]">kWh</span></p>
              </div>
              <div className="col-span-2 md:col-span-1 bg-primary/5 rounded-lg p-2 border border-primary/10 flex flex-col justify-center">
                <p className="text-[10px] font-bold uppercase text-primary mb-0.5">Subtotal</p>
                <p className="font-data-mono font-black text-sm text-primary">S/ {fmtVal(montoNormal)}</p>
              </div>
            </div>
            {isCambioMedidor && record.lectura_final_viejo !== undefined && (
              <div className="px-4 pb-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-3 mt-2 bg-red-50/30">
                <div>
                  <p className="text-[9px] font-bold uppercase text-red-600 mb-1">Dañado (Final)</p>
                  <p className="font-data-mono font-bold text-sm text-red-700">{fmtVal(record.lectura_final_viejo)} <span className="text-[9px]">kWh</span></p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase text-primary mb-1">Nuevo (Inicial)</p>
                  <p className="font-data-mono font-bold text-sm text-primary">{fmtVal(record.lectura_inicial_nuevo)} <span className="text-[9px]">kWh</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Bloque: Horario Punta (Si aplica) */}
          {isPunta && (
            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="bg-orange-50/50 px-4 py-3 border-b border-orange-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-600 text-[18px]" translate="no">bedtime</span>
                  <span className="font-bold text-sm text-orange-900">Energía Activa en Horario Punta</span>
                </div>
                <span className="font-data-mono font-black text-sm text-orange-600">
                  {fmtVal(consumoPunta)} kWh
                </span>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1">Anterior</p>
                  <p className="font-data-mono font-bold text-base text-on-surface">{fmtVal(record.lectura_anterior_punta)} <span className="text-[10px]">kWh</span></p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-orange-600 mb-1">Actual</p>
                  <p className="font-data-mono font-bold text-base text-orange-600">{fmtVal(record.lectura_actual_punta)} <span className="text-[10px]">kWh</span></p>
                </div>
                <div className="col-span-2 md:col-span-1 bg-orange-500/5 rounded-lg p-2 border border-orange-500/10 flex flex-col justify-center">
                  <p className="text-[10px] font-bold uppercase text-orange-800 mb-0.5">Subtotal</p>
                  <p className="font-data-mono font-black text-sm text-orange-600">S/ {fmtVal(montoPunta)}</p>
                </div>
              </div>
              {isCambioMedidor && record.lectura_final_viejo_punta !== undefined && (
                <div className="px-4 pb-4 grid grid-cols-2 gap-4 border-t border-orange-100 pt-3 mt-2 bg-red-50/30">
                  <div>
                    <p className="text-[9px] font-bold uppercase text-red-600 mb-1">Dañado (Final)</p>
                    <p className="font-data-mono font-bold text-sm text-red-700">{fmtVal(record.lectura_final_viejo_punta)} <span className="text-[9px]">kWh</span></p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase text-orange-600 mb-1">Nuevo (Inicial)</p>
                    <p className="font-data-mono font-bold text-sm text-orange-600">{fmtVal(record.lectura_inicial_nuevo_punta)} <span className="text-[9px]">kWh</span></p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Maxima Demanda (if any) */}
          {(maxDemandaN > 0 || maxDemandaP > 0) && (
            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="bg-blue-50/50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]" translate="no">speed</span>
                  <span className="font-bold text-sm text-blue-800">Máxima Demanda</span>
                </div>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {maxDemandaN > 0 && (
                  <div className="flex flex-col">
                    <p className="text-[10px] font-bold uppercase text-blue-600 mb-1">Fuera Punta (S/ {fmtVal(costoPotenciaFueraPunta)}/kW)</p>
                    <p className="font-data-mono font-bold text-base text-blue-600">{fmtVal(maxDemandaN)} <span className="text-[10px]">kW</span></p>
                    <p className="text-xs font-bold text-blue-800 mt-1">Subtotal: S/ {fmtVal(montoDemandaN)}</p>
                  </div>
                )}
                {maxDemandaP > 0 && (
                  <div className="flex flex-col">
                    <p className="text-[10px] font-bold uppercase text-orange-600 mb-1">Punta (S/ {fmtVal(costoPotencia)}/kW)</p>
                    <p className="font-data-mono font-bold text-base text-orange-600">{fmtVal(maxDemandaP)} <span className="text-[10px]">kW</span></p>
                    <p className="text-xs font-bold text-orange-800 mt-1">Subtotal: S/ {fmtVal(montoDemandaP)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Energia Reactiva Capacitiva */}
          {isReactiva && (
            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="bg-purple-50 px-4 py-3 border-b border-purple-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600 text-[18px]" translate="no">electric_meter</span>
                  <span className="font-bold text-sm text-purple-800">Energía Reactiva Capacitiva</span>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-white px-2 py-1 rounded border border-purple-200">
                  Costo: S/ {fmtVal(precioReactiva)}
                </span>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="col-span-2 md:col-span-2">
                  <p className="text-[10px] font-bold uppercase text-purple-600 mb-1">Energía Registrada</p>
                  <p className="font-data-mono font-bold text-base text-purple-600">{fmtVal(record.factor_potencia)} <span className="text-[10px]">kVARh</span></p>
                </div>
                <div className="col-span-2 md:col-span-1 bg-purple-500/5 rounded-lg p-2 border border-purple-500/10 flex flex-col justify-center">
                  <p className="text-[10px] font-bold uppercase text-purple-800 mb-0.5">Subtotal</p>
                  <p className="font-data-mono font-black text-sm text-purple-600">S/ {fmtVal(montoReactiva)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mantenimiento configurado para el periodo */}
          {montoMantenimiento > 0 && (
            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-600 text-[18px]" translate="no">build</span>
                  <span className="font-bold text-sm text-slate-800">Cargo por Mantenimiento</span>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase text-slate-600">Tarifa del periodo</p>
                <p className="font-data-mono font-black text-sm text-slate-800">S/ {fmtVal(montoMantenimiento)}</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </>,
    document.body
  );
};
