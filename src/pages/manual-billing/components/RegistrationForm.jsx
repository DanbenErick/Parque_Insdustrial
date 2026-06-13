import React from 'react';
import { BadgeType } from './shared/BadgeType';
import { formatPeriodo, fmtVal, parseSafe } from '../utils';

export const RegistrationForm = ({
  selectedMember,
  lecturaExistente,
  activePeriodo,
  currentReading, setCurrentReading,
  currentReadingPunta, setCurrentReadingPunta,
  factorPotencia, setFactorPotencia,
  precioFactorPotencia, setPrecioFactorPotencia,
  isSaving, handleSave
}) => {
  const isTR = selectedMember?.tipo === 'Tiempo Real';
  const subTotalNormal = Math.max(0, parseSafe(currentReading) - parseSafe(selectedMember?.ultima_lectura));
  const subTotalPunta = Math.max(0, parseSafe(currentReadingPunta) - parseSafe(selectedMember?.ultima_lectura_punta));

  return (
    <div className="bg-surface border border-primary/20 rounded-xl shadow-sm overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-primary/5 px-4 py-3 border-b border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border border-primary/10 shrink-0">
            <span className="material-symbols-outlined text-[20px]">person</span>
          </div>
          <div className="truncate">
            <h3 className="font-bold text-on-surface text-sm leading-tight truncate" title={selectedMember.propietario}>{selectedMember.propietario}</h3>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-on-surface-variant">
              <span className="font-data-mono bg-white px-1.5 py-0.5 rounded border border-outline-variant/50 text-primary/80 font-bold">{selectedMember.documento_identidad}</span>
              <span className="hidden md:inline">•</span>
              <span className="truncate max-w-[200px]">{selectedMember.direccion || 'Sin dirección'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-wider font-bold text-primary/70">Medidor</span>
            <span className="font-data-mono font-bold text-sm text-primary leading-tight">{selectedMember.num_serie}</span>
          </div>
          <BadgeType tipo={selectedMember.tipo} />
        </div>
      </div>

      <div className="p-4">
        {lecturaExistente ? (
          <div className="bg-green-50/50 border border-green-200/60 rounded-lg px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3 text-left">
              <span className="material-symbols-outlined text-[24px] text-green-600 shrink-0">check_circle</span>
              <div>
                <h4 className="font-bold text-green-800 text-sm leading-none mb-1">Lectura Registrada</h4>
                <p className="text-green-700/80 text-xs leading-tight">
                  Mes de <strong>{formatPeriodo(activePeriodo?.mes_anio)}</strong> completado.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white px-3 py-2 rounded-lg border border-green-200/50 shadow-sm shrink-0 w-full md:w-auto justify-between md:justify-end">
              <span className="text-[10px] text-green-600/70 font-bold uppercase tracking-wider">Registrado</span>
              <span className="font-data-mono text-lg font-bold text-green-700 leading-none">
                {fmtVal(lecturaExistente.lectura_actual)} <span className="text-[10px]">W</span>
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-2 items-center">
              <div className="w-full md:w-auto md:min-w-[140px] bg-surface-container-lowest rounded-lg px-3 py-2 border border-outline-variant/50 flex flex-col h-[52px] justify-center">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">L. Anterior</span>
                <span className="font-data-mono text-sm font-bold text-on-surface/60">
                  {fmtVal(selectedMember.ultima_lectura)} <span className="text-[9px]">kWh</span>
                </span>
              </div>

              <span className="material-symbols-outlined text-primary/30 hidden md:block text-[18px]">arrow_forward</span>

              <div className="flex-1 w-full relative h-[52px]">
                <input
                  type="number" step="0.01" required autoFocus
                  value={currentReading} onChange={(e) => setCurrentReading(e.target.value)} placeholder="0.00"
                  className="w-full h-full bg-white border border-primary/40 hover:border-primary focus:border-primary rounded-lg pl-3 pr-14 text-xl font-data-mono font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-right shadow-sm transition-all"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col pointer-events-none">
                  <span className="text-[9px] font-bold text-primary uppercase tracking-wider leading-tight">L. Actual {isTR && '(N)'}</span>
                  {activePeriodo && <span className="text-[8px] text-primary/70 font-bold leading-tight mt-0.5">S/ {parseFloat(activePeriodo.tarifa_kwh).toFixed(4)}</span>}
                </div>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] text-primary/50 pointer-events-none">kWh</span>
              </div>
            </div>

            {currentReading && !isNaN(currentReading) && activePeriodo && (
              <div className="bg-primary/5 rounded-lg px-3 py-1.5 flex justify-between items-center border border-primary/10 -mt-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Subtotal Normal</span>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-on-surface-variant leading-none">{subTotalNormal.toFixed(2)} kWh × S/ {parseFloat(activePeriodo.tarifa_kwh).toFixed(4)}</span>
                  <span className="font-data-mono font-bold text-primary text-sm leading-none">S/ {(subTotalNormal * parseFloat(activePeriodo.tarifa_kwh)).toFixed(2)}</span>
                </div>
              </div>
            )}

            {isTR && (
              <>
                <div className="flex flex-col md:flex-row gap-2 items-center mt-1">
                  <div className="w-full md:w-auto md:min-w-[140px] bg-surface-container-lowest rounded-lg px-3 py-2 border border-outline-variant/50 flex flex-col h-[52px] justify-center">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">L. Ant. Punta</span>
                    <span className="font-data-mono text-sm font-bold text-on-surface/60">
                      {fmtVal(selectedMember.ultima_lectura_punta)} <span className="text-[9px]">kWh</span>
                    </span>
                  </div>

                  <span className="material-symbols-outlined text-primary/30 hidden md:block text-[18px]">arrow_forward</span>

                  <div className="flex-1 w-full relative h-[52px]">
                    <input
                      type="number" step="0.01" required
                      value={currentReadingPunta} onChange={(e) => setCurrentReadingPunta(e.target.value)} placeholder="0.00"
                      className="w-full h-full bg-white border border-primary/40 hover:border-primary focus:border-primary rounded-lg pl-3 pr-14 text-xl font-data-mono font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-right shadow-sm transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col pointer-events-none">
                      <span className="text-[9px] font-bold text-primary uppercase tracking-wider leading-tight">L. Actual (P)</span>
                      {activePeriodo && <span className="text-[8px] text-primary/70 font-bold leading-tight mt-0.5">S/ {parseFloat(activePeriodo.tarifa_kwh_punta || 0).toFixed(4)}</span>}
                    </div>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] text-primary/50 pointer-events-none">kWh</span>
                  </div>
                </div>

                {currentReadingPunta && !isNaN(currentReadingPunta) && activePeriodo && (
                  <div className="bg-primary/5 rounded-lg px-3 py-1.5 flex justify-between items-center border border-primary/10 -mt-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Subtotal Punta</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-on-surface-variant leading-none">{subTotalPunta.toFixed(2)} kWh × S/ {parseFloat(activePeriodo.tarifa_kwh_punta || 0).toFixed(4)}</span>
                      <span className="font-data-mono font-bold text-primary text-sm leading-none">S/ {(subTotalPunta * parseFloat(activePeriodo.tarifa_kwh_punta || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-3 mt-1">
                  <div className="flex-1 relative h-[52px]">
                    <input
                      type="number" step="0.01" required
                      value={factorPotencia} onChange={(e) => setFactorPotencia(e.target.value)} placeholder="0.00"
                      className="w-full h-full bg-orange-50/50 border border-orange-200 hover:border-orange-300 focus:border-orange-400 rounded-lg pl-3 pr-14 text-lg font-data-mono font-bold text-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-right shadow-inner transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col pointer-events-none">
                      <span className="text-[9px] font-bold text-orange-700 uppercase tracking-wider leading-tight flex items-center gap-0.5"><span className="material-symbols-outlined text-[12px]">bolt</span> Reactivo</span>
                    </div>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] text-orange-600/70 pointer-events-none">kVARh</span>
                  </div>

                  <div className="flex-1 relative h-[52px]">
                    <input
                      type="number" step="0.0001" required
                      value={precioFactorPotencia} onChange={(e) => setPrecioFactorPotencia(e.target.value)} placeholder="0.0000"
                      className="w-full h-full bg-orange-50/50 border border-orange-200 hover:border-orange-300 focus:border-orange-400 rounded-lg pl-3 pr-8 text-lg font-data-mono font-bold text-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-right shadow-inner transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col pointer-events-none">
                      <span className="text-[9px] font-bold text-orange-700 uppercase tracking-wider leading-tight flex items-center gap-0.5"><span className="material-symbols-outlined text-[12px]">payments</span> Precio</span>
                    </div>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] text-orange-600/70 pointer-events-none">S/</span>
                  </div>
                </div>
                
                {factorPotencia && precioFactorPotencia && !isNaN(factorPotencia) && !isNaN(precioFactorPotencia) && (
                  <div className="bg-orange-50 rounded-lg px-3 py-1.5 flex justify-between items-center border border-orange-100 -mt-1">
                    <span className="text-[10px] font-bold text-orange-900 uppercase tracking-wider">Subtotal Reactiva</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-orange-800/60 leading-none">{parseFloat(factorPotencia).toFixed(2)} × S/ {parseFloat(precioFactorPotencia).toFixed(4)}</span>
                      <span className="font-data-mono font-bold text-orange-900 text-sm leading-none">S/ {(parseFloat(factorPotencia) * parseFloat(precioFactorPotencia)).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="mt-2">
              <button
                type="submit"
                disabled={isSaving || !currentReading}
                className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${currentReading ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'}`}
              >
                {isSaving ? (
                  <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span>Guardando...</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">save</span>Guardar Lectura</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
