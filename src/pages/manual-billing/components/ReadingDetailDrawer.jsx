import React from 'react';
import { formatDateLong, fmtVal, parseSafe } from '../utils';

const DRAWER_VARIANTS = {
  hidden: { x: '100%', opacity: 0.5 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.2 } }
};

const OVERLAY_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export const ReadingDetailDrawer = ({ record, onClose }) => {
  if (!record) return null;

  const isCambioMedidor = Boolean(record.es_cambio_medidor);
  const isPunta = parseSafe(record.lectura_actual_punta) > 0;
  const isReactiva = parseSafe(record.factor_potencia) > 0;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface border-l border-outline-variant shadow-2xl flex flex-col"
      >
        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-on-surface leading-tight">Detalle de Medición</h3>
              <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">{formatDateLong(record.fecha_registro)}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-variant text-on-surface-variant transition-colors border border-transparent hover:border-outline-variant">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-surface">
          {/* Identificación */}
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">person</span> Datos del Socio
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-on-surface-variant">Propietario / Razón Social</p>
                <p className="font-bold text-sm text-on-surface">{record.propietario}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant">Número de Medidor</p>
                <p className="font-data-mono font-bold text-sm text-primary">{record.num_serie}</p>
              </div>
              {isCambioMedidor && (
                <div className="mt-2 bg-error/10 text-error text-[11px] font-bold px-3 py-1.5 rounded flex items-center gap-1.5 w-max border border-error/20">
                  <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                  Cambio de medidor registrado
                </div>
              )}
            </div>
          </div>

          {/* Lectura Normal */}
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">bolt</span> Lectura Energía Activa (Normal)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-variant/30 rounded-lg p-3 border border-outline-variant/30">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">L. Anterior</p>
                <p className="font-data-mono font-bold text-lg text-on-surface/70">{fmtVal(record.lectura_anterior)} <span className="text-[10px]">kWh</span></p>
              </div>
              <div className="bg-primary/5 rounded-lg p-3 border border-primary/20 shadow-inner">
                <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">L. Actual</p>
                <p className="font-data-mono font-bold text-xl text-primary">{fmtVal(record.lectura_actual)} <span className="text-[10px]">kWh</span></p>
              </div>
            </div>
            
            {isCambioMedidor && record.lectura_final_viejo !== undefined && (
              <div className="mt-3 bg-error/5 border border-error/20 rounded-lg p-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] text-error font-bold uppercase tracking-wider mb-1">Final Dañado</p>
                  <p className="font-data-mono font-bold text-sm text-error">{fmtVal(record.lectura_final_viejo)} kWh</p>
                </div>
                <div>
                  <p className="text-[9px] text-primary font-bold uppercase tracking-wider mb-1">Inicial Nuevo</p>
                  <p className="font-data-mono font-bold text-sm text-primary">{fmtVal(record.lectura_inicial_nuevo)} kWh</p>
                </div>
              </div>
            )}
          </div>

          {/* Lectura Punta */}
          {isPunta && (
            <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-orange-700 mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">schedule</span> Lectura Hora Punta
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-variant/30 rounded-lg p-3 border border-outline-variant/30">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">L. Anterior</p>
                  <p className="font-data-mono font-bold text-lg text-on-surface/70">{fmtVal(record.lectura_anterior_punta)} <span className="text-[10px]">kWh</span></p>
                </div>
                <div className="bg-orange-50/50 rounded-lg p-3 border border-orange-200 shadow-inner">
                  <p className="text-[10px] text-orange-700 font-bold uppercase tracking-wider mb-1">L. Actual</p>
                  <p className="font-data-mono font-bold text-xl text-orange-700">{fmtVal(record.lectura_actual_punta)} <span className="text-[10px]">kWh</span></p>
                </div>
              </div>

              {isCambioMedidor && record.lectura_final_viejo_punta !== undefined && (
                <div className="mt-3 bg-error/5 border border-error/20 rounded-lg p-3 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] text-error font-bold uppercase tracking-wider mb-1">Final Dañado (P)</p>
                    <p className="font-data-mono font-bold text-sm text-error">{fmtVal(record.lectura_final_viejo_punta)} kWh</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-primary font-bold uppercase tracking-wider mb-1">Inicial Nuevo (P)</p>
                    <p className="font-data-mono font-bold text-sm text-primary">{fmtVal(record.lectura_inicial_nuevo_punta)} kWh</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reactiva */}
          {isReactiva && (
            <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-700 mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">offline_bolt</span> Energía Reactiva
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-200 shadow-inner">
                  <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider mb-1">Consumo Reactivo</p>
                  <p className="font-data-mono font-bold text-xl text-purple-700">{fmtVal(record.factor_potencia)} <span className="text-[10px]">kVARh</span></p>
                </div>
                <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-200 shadow-inner">
                  <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider mb-1">Precio Asignado</p>
                  <p className="font-data-mono font-bold text-xl text-purple-700"><span className="text-[12px]">S/</span> {fmtVal(record.precio_factor_potencia)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Justificación si existe */}
          {record.justificacion && (
            <div className="bg-secondary-container rounded-xl p-4 border border-secondary/20 shadow-sm">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-secondary-container mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">comment</span> Observación / Justificación
              </h4>
              <p className="text-sm text-on-secondary-container bg-white/40 p-3 rounded-lg">{record.justificacion}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
