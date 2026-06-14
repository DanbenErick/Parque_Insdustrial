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
  isCambioMedidor, setIsCambioMedidor,
  lecturaFinalAntiguo, setLecturaFinalAntiguo,
  lecturaInicialNuevo, setLecturaInicialNuevo,
  lecturaFinalAntiguoPunta, setLecturaFinalAntiguoPunta,
  lecturaInicialNuevoPunta, setLecturaInicialNuevoPunta,
  isSaving, handleSave
}) => {
  const isTR = selectedMember?.tipo === 'Tiempo Real';
  
  const getMissingFields = () => {
    const missing = [];
    if (!currentReading) missing.push(isTR ? "L. Actual (N)" : "L. Actual");
    if (isCambioMedidor) {
      if (!lecturaFinalAntiguo) missing.push("L. Final (Dañado)");
      if (!lecturaInicialNuevo) missing.push("L. Inicial (Nuevo)");
    }
    if (isTR) {
      if (!currentReadingPunta) missing.push("L. Actual (P)");
      if (!factorPotencia) missing.push("Reactivo");
      if (!precioFactorPotencia) missing.push("Precio Reactivo");
      if (isCambioMedidor) {
        if (!lecturaFinalAntiguoPunta) missing.push("L. Final Punta (Dañado)");
        if (!lecturaInicialNuevoPunta) missing.push("L. Inicial Punta (Nuevo)");
      }
    }
    return missing;
  };
  
  const missingFields = getMissingFields();

  const subTotalNormal = isCambioMedidor 
    ? Math.max(0, parseSafe(lecturaFinalAntiguo) - parseSafe(selectedMember?.ultima_lectura)) + Math.max(0, parseSafe(currentReading) - parseSafe(lecturaInicialNuevo))
    : Math.max(0, parseSafe(currentReading) - parseSafe(selectedMember?.ultima_lectura));
    
  const subTotalPunta = isCambioMedidor && isTR
    ? Math.max(0, parseSafe(lecturaFinalAntiguoPunta) - parseSafe(selectedMember?.ultima_lectura_punta)) + Math.max(0, parseSafe(currentReadingPunta) - parseSafe(lecturaInicialNuevoPunta))
    : Math.max(0, parseSafe(currentReadingPunta) - parseSafe(selectedMember?.ultima_lectura_punta));

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
            
            <div className="flex items-center justify-between bg-surface-container-lowest px-3 py-2 rounded-lg border border-outline-variant/50">
              <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                ¿Hubo cambio de medidor este mes?
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isCambioMedidor} onChange={(e) => setIsCambioMedidor(e.target.checked)} />
                <div className="w-9 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {isCambioMedidor && (
              <div className="flex flex-col md:flex-row gap-2 items-center bg-error/5 p-3 rounded-lg border border-error/20 mb-1 animate-in fade-in zoom-in-95">
                <div className="flex-1 w-full relative h-[48px]">
                  <input
                    type="number" step="0.01" required={isCambioMedidor}
                    value={lecturaFinalAntiguo} onChange={(e) => setLecturaFinalAntiguo(e.target.value)} placeholder="0.00"
                    className="w-full h-full bg-white border border-error/40 focus:border-error rounded-lg pl-3 pr-14 text-sm font-data-mono font-bold text-error focus:outline-none focus:ring-2 focus:ring-error/20 text-right shadow-sm transition-all"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col pointer-events-none">
                    <span className="text-[9px] font-bold text-error uppercase tracking-wider leading-tight">L. Final (Dañado)</span>
                  </div>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] text-error/50 pointer-events-none">kWh</span>
                </div>
                
                <span className="material-symbols-outlined text-error/30 hidden md:block text-[18px]">arrow_forward</span>

                <div className="flex-1 w-full relative h-[48px]">
                  <input
                    type="number" step="0.01" required={isCambioMedidor}
                    value={lecturaInicialNuevo} onChange={(e) => setLecturaInicialNuevo(e.target.value)} placeholder="0.00"
                    className="w-full h-full bg-white border border-primary/40 focus:border-primary rounded-lg pl-3 pr-14 text-sm font-data-mono font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-right shadow-sm transition-all"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col pointer-events-none">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-wider leading-tight">L. Inicial (Nuevo)</span>
                  </div>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] text-primary/50 pointer-events-none">kWh</span>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-2 items-center">
              <div className={`w-full md:w-auto md:min-w-[140px] bg-surface-container-lowest rounded-lg px-3 py-2 border ${isCambioMedidor ? 'border-error/40' : 'border-outline-variant/50'} flex flex-col h-[52px] justify-center`}>
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">L. Anterior</span>
                <span className={`font-data-mono text-sm font-bold ${isCambioMedidor ? 'text-error line-through opacity-70' : 'text-on-surface/60'}`}>
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
                  <span className="text-[9px] text-on-surface-variant leading-none">
                    {isCambioMedidor 
                      ? `${(Math.max(0, parseSafe(lecturaFinalAntiguo) - parseSafe(selectedMember?.ultima_lectura))).toFixed(2)} + ${(Math.max(0, parseSafe(currentReading) - parseSafe(lecturaInicialNuevo))).toFixed(2)} = ${subTotalNormal.toFixed(2)} kWh`
                      : `${subTotalNormal.toFixed(2)} kWh`
                    } × S/ {parseFloat(activePeriodo.tarifa_kwh).toFixed(4)}
                  </span>
                  <span className="font-data-mono font-bold text-primary text-sm leading-none">S/ {(subTotalNormal * parseFloat(activePeriodo.tarifa_kwh)).toFixed(2)}</span>
                </div>
              </div>
            )}

            {isTR && (
              <>
                {isCambioMedidor && (
                  <div className="flex flex-col md:flex-row gap-2 items-center bg-error/5 p-3 rounded-lg border border-error/20 mb-1 mt-3 animate-in fade-in zoom-in-95">
                    <div className="flex-1 w-full relative h-[48px]">
                      <input
                        type="number" step="0.01" required={isCambioMedidor}
                        value={lecturaFinalAntiguoPunta} onChange={(e) => setLecturaFinalAntiguoPunta(e.target.value)} placeholder="0.00"
                        className="w-full h-full bg-white border border-error/40 focus:border-error rounded-lg pl-3 pr-16 text-sm font-data-mono font-bold text-error focus:outline-none focus:ring-2 focus:ring-error/20 text-right shadow-sm transition-all"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col pointer-events-none">
                        <span className="text-[9px] font-bold text-error uppercase tracking-wider leading-tight">L. Final Punta (Dañado)</span>
                      </div>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] text-error/50 pointer-events-none">kWh</span>
                    </div>
                    
                    <span className="material-symbols-outlined text-error/30 hidden md:block text-[18px]">arrow_forward</span>

                    <div className="flex-1 w-full relative h-[48px]">
                      <input
                        type="number" step="0.01" required={isCambioMedidor}
                        value={lecturaInicialNuevoPunta} onChange={(e) => setLecturaInicialNuevoPunta(e.target.value)} placeholder="0.00"
                        className="w-full h-full bg-white border border-primary/40 focus:border-primary rounded-lg pl-3 pr-16 text-sm font-data-mono font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-right shadow-sm transition-all"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col pointer-events-none">
                        <span className="text-[9px] font-bold text-primary uppercase tracking-wider leading-tight">L. Inicial Punta (Nuevo)</span>
                      </div>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] text-primary/50 pointer-events-none">kWh</span>
                    </div>
                  </div>
                )}

                <div className={`flex flex-col md:flex-row gap-2 items-center ${!isCambioMedidor ? 'mt-1' : ''}`}>
                  <div className={`w-full md:w-auto md:min-w-[140px] bg-surface-container-lowest rounded-lg px-3 py-2 border ${isCambioMedidor ? 'border-error/40' : 'border-outline-variant/50'} flex flex-col h-[52px] justify-center`}>
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">L. Ant. Punta</span>
                    <span className={`font-data-mono text-sm font-bold ${isCambioMedidor ? 'text-error line-through opacity-70' : 'text-on-surface/60'}`}>
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
                      <span className="text-[9px] text-on-surface-variant leading-none">
                        {isCambioMedidor 
                          ? `${(Math.max(0, parseSafe(lecturaFinalAntiguoPunta) - parseSafe(selectedMember?.ultima_lectura_punta))).toFixed(2)} + ${(Math.max(0, parseSafe(currentReadingPunta) - parseSafe(lecturaInicialNuevoPunta))).toFixed(2)} = ${subTotalPunta.toFixed(2)} kWh`
                          : `${subTotalPunta.toFixed(2)} kWh`
                        } × S/ {parseFloat(activePeriodo.tarifa_kwh_punta || 0).toFixed(4)}
                      </span>
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
              {missingFields.length > 0 && (
                <div className="mb-2 text-error text-[11px] font-bold flex items-start gap-1.5 bg-error/10 px-3 py-2 rounded-md border border-error/20 animate-in fade-in slide-in-from-top-1">
                  <span className="material-symbols-outlined text-[14px] mt-0.5">error</span>
                  <div>
                    <span className="block text-error/80 uppercase tracking-wider text-[9px] mb-0.5">Campos obligatorios faltantes:</span>
                    <span className="leading-tight">{missingFields.join(', ')}</span>
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={isSaving || missingFields.length > 0}
                className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${missingFields.length === 0 ? 'bg-primary text-on-primary hover:opacity-90 hover:shadow-md' : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed opacity-80'}`}
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
