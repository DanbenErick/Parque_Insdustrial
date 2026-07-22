import React from 'react';
import { BadgeType } from './shared/BadgeType';
import { formatDateLong, fmtVal, parseSafe } from '../utils';

export const ReadingDetailDrawer = ({ record, medidorInfo, onClose, onEdit }) => {
  if (!record) return null;

  const isCambioMedidor = Boolean(record.es_cambio_medidor);
  const tipoMedidor = medidorInfo?.tipo || record.medidor_tipo || record.tipo;
  const isPunta = tipoMedidor === 'Hora Punta' || tipoMedidor === 'Tiempo Real';
  const isReactiva = parseSafe(record.factor_potencia) > 0;

  const factor = parseSafe(record.factor_multiplicador) || 1;
  const tarifaNormal = parseSafe(record.tarifa_kwh) || 0;
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
  const maxDemandaN = parseSafe(record.max_demanda_fuera_punta);
  const maxDemandaP = parseSafe(record.max_demanda_punta);

  const montoNormal = consumoNormal * tarifaNormal * factor;
  const montoPunta = consumoPunta * tarifaPunta * factor;
  const montoReactiva = reactivaKvarh > 0 ? (reactivaKvarh * precioReactiva) : 0; 
  
  const montoTotal = montoNormal + montoPunta + montoReactiva;

  const wasModified = Boolean(record.justificacion);

  return (
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
            animation: slideInRightDrawer 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-backdrop-in {
            animation: fadeInDrawer 0.3s ease-out forwards;
          }
        `}
      </style>
      <div
        className="fixed inset-0 z-50 bg-slate-900/40 animate-backdrop-in !m-0"
        onClick={onClose}
      />
      <div
        className="fixed inset-y-0 right-0 z-50 w-full max-w-[600px] bg-surface flex flex-col shadow-2xl border-l border-outline-variant animate-drawer-in !m-0"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">analytics</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-lg font-bold text-on-surface leading-tight">Detalle de Medición</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {formatDateLong(record.fecha_registro)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button onClick={() => onEdit(record)} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-bold text-xs flex items-center gap-1.5 border border-primary/20">
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Editar
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-surface-container-lowest">
          
          {/* Modified Alert */}
          {wasModified && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
              <span className="material-symbols-outlined text-amber-600 shrink-0 mt-0.5 text-[22px]">edit_note</span>
              <div>
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
                          <span className="text-[10px] uppercase opacity-70">Normal:</span> {fmtVal(record.lectura_actual_original)} kWh
                        </div>
                      )}
                      {record.lectura_actual_punta_original !== null && (
                        <div className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded text-xs font-data-mono font-bold text-amber-900">
                          <span className="text-[10px] uppercase opacity-70">Punta:</span> {fmtVal(record.lectura_actual_punta_original)} kWh
                        </div>
                      )}
                      {record.factor_potencia_original !== null && (
                        <div className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded text-xs font-data-mono font-bold text-amber-900">
                          <span className="text-[10px] uppercase opacity-70">E. Reactiva:</span> {fmtVal(record.factor_potencia_original)} kVARh
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Socio & Medidor Info */}
          <div className="bg-white rounded-2xl border border-outline-variant p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Socio / Propietario</p>
                <h4 className="text-lg font-bold text-on-surface">{record.propietario}</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-surface-container px-3 py-1 rounded-full text-xs font-data-mono font-bold border border-outline-variant">
                  {record.num_serie}
                </span>
                {(medidorInfo?.tipo || record.medidor_tipo || record.tipo) && (
                  <BadgeType tipo={medidorInfo?.tipo || record.medidor_tipo || record.tipo} />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-surface px-3 py-2 rounded-lg border border-outline-variant/50">
              <span className="material-symbols-outlined text-[16px]">account_circle</span>
              <span>Registrado por: <strong>{record.operario || 'Desconocido'}</strong></span>
            </div>

            {isCambioMedidor && (
              <div className="mt-4 bg-orange-50 text-orange-700 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-2 border border-orange-200">
                <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                Hubo un cambio de medidor en este periodo
              </div>
            )}
          </div>

          {/* Consumo y Costos Resumen */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 relative overflow-hidden group">
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[80px] text-blue-500/10 group-hover:scale-110 transition-transform">electric_bolt</span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1 relative z-10">Total Energía</p>
              <h2 className="font-data-mono font-black text-3xl text-blue-900 relative z-10">
                {fmtVal(consumoNormal + consumoPunta)} <span className="text-sm font-bold opacity-70">kWh</span>
              </h2>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 relative overflow-hidden group">
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[80px] text-emerald-500/10 group-hover:scale-110 transition-transform">payments</span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1 relative z-10">Costo Estimado</p>
              <h2 className="font-data-mono font-black text-3xl text-emerald-900 relative z-10">
                <span className="text-xl font-bold opacity-70">S/</span> {fmtVal(montoTotal)}
              </h2>
            </div>
          </div>

          {/* Desglose de Lecturas */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">list_alt</span> Desglose de Lecturas
            </h4>

            {/* Lectura Normal */}
            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="bg-surface-container-lowest px-4 py-3 border-b border-outline-variant flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
                  <span className="font-bold text-sm text-on-surface">Normal</span>
                </div>
                {tarifaNormal > 0 && (
                  <span className="text-xs font-bold text-on-surface-variant bg-surface px-2 py-1 rounded border border-outline-variant/50">
                    S/ {fmtVal(tarifaNormal)} / kWh
                  </span>
                )}
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1">Anterior</p>
                  <p className="font-data-mono font-bold text-lg">{fmtVal(record.lectura_anterior)} <span className="text-[10px]">kWh</span></p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-primary mb-1">Actual</p>
                  <p className="font-data-mono font-bold text-lg text-primary">{fmtVal(record.lectura_actual)} <span className="text-[10px]">kWh</span></p>
                </div>
                <div className="col-span-2 md:col-span-1 bg-primary/5 rounded-lg p-2 border border-primary/10 flex flex-col justify-center">
                  <p className="text-[10px] font-bold uppercase text-primary-dark mb-0.5">Subtotal</p>
                  <p className="font-data-mono font-black text-sm text-primary">S/ {fmtVal(montoNormal)}</p>
                </div>
              </div>
              {isCambioMedidor && record.lectura_final_viejo !== undefined && (
                <div className="px-4 pb-4 grid grid-cols-2 gap-4 border-t border-outline-variant/30 pt-3 mt-2 bg-red-50/30">
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

            {/* Lectura Punta */}
            {isPunta && (
              <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="bg-orange-50 px-4 py-3 border-b border-orange-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-600 text-[18px]">schedule</span>
                    <span className="font-bold text-sm text-orange-800">Hora Punta</span>
                  </div>
                  {tarifaPunta > 0 && (
                    <span className="text-xs font-bold text-orange-700 bg-white px-2 py-1 rounded border border-orange-200">
                      S/ {fmtVal(tarifaPunta)} / kWh
                    </span>
                  )}
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1">Anterior</p>
                    <p className="font-data-mono font-bold text-lg">{fmtVal(record.lectura_anterior_punta)} <span className="text-[10px]">kWh</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-orange-600 mb-1">Actual</p>
                    <p className="font-data-mono font-bold text-lg text-orange-600">{fmtVal(record.lectura_actual_punta)} <span className="text-[10px]">kWh</span></p>
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
                    <span className="material-symbols-outlined text-blue-600 text-[18px]">speed</span>
                    <span className="font-bold text-sm text-blue-800">Máxima Demanda</span>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-2 gap-4">
                  {maxDemandaN > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-blue-600 mb-1">Fuera Punta</p>
                      <p className="font-data-mono font-bold text-lg text-blue-600">{fmtVal(maxDemandaN)} <span className="text-[10px]">kW</span></p>
                    </div>
                  )}
                  {maxDemandaP > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-orange-600 mb-1">Punta</p>
                      <p className="font-data-mono font-bold text-lg text-orange-600">{fmtVal(maxDemandaP)} <span className="text-[10px]">kW</span></p>
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
                    <span className="material-symbols-outlined text-purple-600 text-[18px]">electric_meter</span>
                    <span className="font-bold text-sm text-purple-800">Energía Reactiva Capacitiva</span>
                  </div>
                  <span className="text-xs font-bold text-purple-700 bg-white px-2 py-1 rounded border border-purple-200">
                    Costo: S/ {fmtVal(precioReactiva)}
                  </span>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="col-span-2 md:col-span-2">
                    <p className="text-[10px] font-bold uppercase text-purple-600 mb-1">Energía Registrada</p>
                    <p className="font-data-mono font-bold text-lg text-purple-600">{fmtVal(record.factor_potencia)} <span className="text-[10px]">kVARh</span></p>
                  </div>
                  <div className="col-span-2 md:col-span-1 bg-purple-500/5 rounded-lg p-2 border border-purple-500/10 flex flex-col justify-center">
                    <p className="text-[10px] font-bold uppercase text-purple-800 mb-0.5">Subtotal</p>
                    <p className="font-data-mono font-black text-sm text-purple-600">S/ {fmtVal(montoReactiva)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
