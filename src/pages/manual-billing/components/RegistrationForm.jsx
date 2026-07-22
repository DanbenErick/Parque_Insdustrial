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
  maxDemandaFueraPunta, setMaxDemandaFueraPunta,
  maxDemandaPunta, setMaxDemandaPunta,
  isCambioMedidor, setIsCambioMedidor,
  lecturaFinalAntiguo, setLecturaFinalAntiguo,
  lecturaInicialNuevo, setLecturaInicialNuevo,
  lecturaFinalAntiguoPunta, setLecturaFinalAntiguoPunta,
  lecturaInicialNuevoPunta, setLecturaInicialNuevoPunta,
  isSaving, handleSave
}) => {
  const isTR = selectedMember?.tipo === 'Hora Punta' || selectedMember?.tipo === 'Tiempo Real';
  
  const getValidationErrors = () => {
    const errors = [];
    if (!currentReading) errors.push(isTR ? "Falta L. Actual (N)" : "Falta L. Actual");
    if (isCambioMedidor) {
      if (!lecturaFinalAntiguo) errors.push("Falta L. Final (Dañado)");
      if (!lecturaInicialNuevo) errors.push("Falta L. Inicial (Nuevo)");
    }
    if (isTR) {
      if (!currentReadingPunta) errors.push("Falta L. Actual (P)");
      if (!factorPotencia) errors.push("Falta Energía Reactiva Capacitiva");
      if (!maxDemandaFueraPunta) errors.push("Falta Máx. Demanda (N)");
      if (!maxDemandaPunta) errors.push("Falta Máx. Demanda (P)");
      if (isCambioMedidor) {
        if (!lecturaFinalAntiguoPunta) errors.push("Falta L. Final Punta (Dañado)");
        if (!lecturaInicialNuevoPunta) errors.push("Falta L. Inicial Punta (Nuevo)");
      }
    }
    
    // Validaciones lógicas (Valores menores al anterior)
    if (isCambioMedidor) {
      if (lecturaFinalAntiguo && parseSafe(lecturaFinalAntiguo) < parseSafe(selectedMember?.ultima_lectura)) {
        const diff = parseSafe(lecturaFinalAntiguo) - parseSafe(selectedMember?.ultima_lectura);
        errors.push(`La L. Final (Dañado) es menor a la del mes anterior (Diferencia: ${diff.toFixed(2)} kWh)`);
      }
      if (currentReading && lecturaInicialNuevo && parseSafe(currentReading) < parseSafe(lecturaInicialNuevo)) {
        const diff = parseSafe(currentReading) - parseSafe(lecturaInicialNuevo);
        errors.push(`La lectura es menor a la Inicial del Nuevo (Diferencia: ${diff.toFixed(2)} kWh)`);
      }
      if (isTR) {
        if (lecturaFinalAntiguoPunta && parseSafe(lecturaFinalAntiguoPunta) < parseSafe(selectedMember?.ultima_lectura_punta)) {
          const diff = parseSafe(lecturaFinalAntiguoPunta) - parseSafe(selectedMember?.ultima_lectura_punta);
          errors.push(`La L. Final Punta (Dañado) es menor a la del mes anterior (Diferencia: ${diff.toFixed(2)} kWh)`);
        }
        if (currentReadingPunta && lecturaInicialNuevoPunta && parseSafe(currentReadingPunta) < parseSafe(lecturaInicialNuevoPunta)) {
          const diff = parseSafe(currentReadingPunta) - parseSafe(lecturaInicialNuevoPunta);
          errors.push(`La lectura Punta es menor a la Inicial del Nuevo (Diferencia: ${diff.toFixed(2)} kWh)`);
        }
      }
    } else {
      if (currentReading && parseSafe(currentReading) < parseSafe(selectedMember?.ultima_lectura)) {
        const diff = parseSafe(currentReading) - parseSafe(selectedMember?.ultima_lectura);
        errors.push(`La lectura es menor al del mes anterior (Diferencia: ${diff.toFixed(2)} kWh)`);
      }
      if (isTR && currentReadingPunta && parseSafe(currentReadingPunta) < parseSafe(selectedMember?.ultima_lectura_punta)) {
        const diff = parseSafe(currentReadingPunta) - parseSafe(selectedMember?.ultima_lectura_punta);
        errors.push(`La lectura Punta es menor al del mes anterior (Diferencia: ${diff.toFixed(2)} kWh)`);
      }
    }
    
    return errors;
  };
  
  const validationErrors = getValidationErrors();

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
            <div className="flex flex-col md:flex-row items-center gap-4 bg-white px-4 py-3 rounded-xl border border-green-200/60 shadow-sm shrink-0 w-full md:w-auto justify-between md:justify-end">
              <div className="flex flex-col items-center md:items-end">
                <span className="text-[10px] text-green-600/70 font-bold uppercase tracking-wider mb-0.5">L. Registrada</span>
                <span className="font-data-mono text-xl font-black text-green-700 leading-none">
                  {fmtVal(lecturaExistente.lectura_actual)} <span className="text-[11px] font-bold text-green-600/80">kWh</span>
                </span>
              </div>
              {lecturaExistente.consumo_calculado !== undefined && (
                <div className="flex flex-col items-center md:items-end border-t md:border-t-0 md:border-l border-green-200/60 pt-2 md:pt-0 md:pl-4 mt-2 md:mt-0 w-full md:w-auto">
                  <span className="text-[10px] text-green-600/70 font-bold uppercase tracking-wider mb-0.5">Consumo (Dif.)</span>
                  <span className="font-data-mono text-xl font-black text-green-600 leading-none flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-green-500">add_circle</span>
                    {fmtVal(lecturaExistente.consumo_calculado)} <span className="text-[11px] font-bold text-green-600/80">kWh</span>
                  </span>
                </div>
              )}
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
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-center border border-primary/20 shadow-sm mt-2 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="flex items-center gap-3 z-10 w-full sm:w-auto mb-3 sm:mb-0">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border border-primary/10 shrink-0">
                    <span className="material-symbols-outlined text-[18px]">payments</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-extrabold text-primary uppercase tracking-widest leading-none mb-1">Subtotal Normal</span>
                    <span className="text-xs text-primary font-black bg-white/80 px-2.5 py-1 rounded-md border border-primary/20 inline-block w-max shadow-sm tracking-wide font-data-mono">
                      <span className="text-[9px] text-primary/60 uppercase tracking-widest mr-1">Consumo:</span>
                      {isCambioMedidor 
                        ? `${(Math.max(0, parseSafe(lecturaFinalAntiguo) - parseSafe(selectedMember?.ultima_lectura))).toFixed(2)} + ${(Math.max(0, parseSafe(currentReading) - parseSafe(lecturaInicialNuevo))).toFixed(2)} = ${subTotalNormal.toFixed(2)} kWh`
                        : `${subTotalNormal.toFixed(2)} kWh`
                      } <span className="text-primary/60 font-bold mx-0.5">×</span> S/ {parseFloat(activePeriodo.tarifa_kwh).toFixed(4)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end z-10 w-full sm:w-auto bg-white px-4 py-2 rounded-lg border border-primary/10 shadow-sm">
                  <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider mb-0.5">Importe Calculado</span>
                  <span className="font-data-mono font-black text-primary text-xl leading-none">
                    S/ {(subTotalNormal * parseFloat(activePeriodo.tarifa_kwh)).toFixed(2)}
                  </span>
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
                  <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-center border border-orange-500/20 shadow-sm mt-2 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="flex items-center gap-3 z-10 w-full sm:w-auto mb-3 sm:mb-0">
                      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-orange-600 shadow-sm border border-orange-500/10 shrink-0">
                        <span className="material-symbols-outlined text-[18px]">bolt</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-extrabold text-orange-700 uppercase tracking-widest leading-none mb-1">Subtotal Punta</span>
                        <span className="text-xs text-orange-700 font-black bg-white/80 px-2.5 py-1 rounded-md border border-orange-500/30 inline-block w-max shadow-sm tracking-wide font-data-mono">
                          <span className="text-[9px] text-orange-600/60 uppercase tracking-widest mr-1">Consumo:</span>
                          {isCambioMedidor 
                            ? `${(Math.max(0, parseSafe(lecturaFinalAntiguoPunta) - parseSafe(selectedMember?.ultima_lectura_punta))).toFixed(2)} + ${(Math.max(0, parseSafe(currentReadingPunta) - parseSafe(lecturaInicialNuevoPunta))).toFixed(2)} = ${subTotalPunta.toFixed(2)} kWh`
                            : `${subTotalPunta.toFixed(2)} kWh`
                          } <span className="text-orange-600/60 font-bold mx-0.5">×</span> S/ {parseFloat(activePeriodo.tarifa_kwh_punta || 0).toFixed(4)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end z-10 w-full sm:w-auto bg-white px-4 py-2 rounded-lg border border-orange-500/10 shadow-sm">
                      <span className="text-[9px] text-orange-700/70 font-bold uppercase tracking-wider mb-0.5">Importe Calculado</span>
                      <span className="font-data-mono font-black text-orange-600 text-xl leading-none">
                        S/ {(subTotalPunta * parseFloat(activePeriodo.tarifa_kwh_punta || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-3 mt-1">
                  <div className="flex-1 relative h-[52px]">
                    <input
                      type="number" step="0.01" required
                      value={maxDemandaFueraPunta} onChange={(e) => setMaxDemandaFueraPunta(e.target.value)} placeholder="0.00"
                      className="w-full h-full bg-blue-50/50 border border-blue-200 hover:border-blue-300 focus:border-blue-400 rounded-lg pl-3 pr-16 text-lg font-data-mono font-bold text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-right shadow-inner transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col pointer-events-none">
                      <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wider leading-tight flex items-center gap-0.5"><span className="material-symbols-outlined text-[12px]">electric_meter</span> Máx. Dem. Fuera Punta</span>
                    </div>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] text-blue-600/70 pointer-events-none">kW</span>
                  </div>
                  <div className="flex-1 relative h-[52px]">
                    <input
                      type="number" step="0.01" required
                      value={maxDemandaPunta} onChange={(e) => setMaxDemandaPunta(e.target.value)} placeholder="0.00"
                      className="w-full h-full bg-orange-50/50 border border-orange-200 hover:border-orange-300 focus:border-orange-400 rounded-lg pl-3 pr-16 text-lg font-data-mono font-bold text-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-right shadow-inner transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col pointer-events-none">
                      <span className="text-[9px] font-bold text-orange-700 uppercase tracking-wider leading-tight flex items-center gap-0.5"><span className="material-symbols-outlined text-[12px]">electric_meter</span> Máx. Dem. Punta</span>
                    </div>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] text-orange-600/70 pointer-events-none">kW</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 mt-1">
                  <div className="flex-1 relative h-[52px]">
                    <input
                      type="number" step="0.01" required
                      value={factorPotencia} onChange={(e) => setFactorPotencia(e.target.value)} placeholder="0.00"
                      className="w-full h-full bg-purple-50/50 border border-purple-200 hover:border-purple-300 focus:border-purple-400 rounded-lg pl-3 pr-16 text-lg font-data-mono font-bold text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-right shadow-inner transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col pointer-events-none">
                      <span className="text-[9px] font-bold text-purple-700 uppercase tracking-wider leading-tight flex items-center gap-0.5"><span className="material-symbols-outlined text-[12px]">electric_meter</span> Energía Reactiva Cap.</span>
                    </div>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] text-purple-600/70 pointer-events-none">kVARh</span>
                  </div>
                </div>
                
                {factorPotencia && !isNaN(factorPotencia) && activePeriodo && (
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-center border border-purple-500/20 shadow-sm mt-2 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="flex items-center gap-3 z-10 w-full sm:w-auto mb-3 sm:mb-0">
                      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm border border-purple-500/10 shrink-0">
                        <span className="material-symbols-outlined text-[18px]">electric_meter</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-extrabold text-purple-700 uppercase tracking-widest leading-none mb-1">Subtotal Reactiva</span>
                        <span className="text-xs text-purple-800 font-black bg-white/80 px-2.5 py-1 rounded-md border border-purple-500/30 inline-block w-max shadow-sm tracking-wide font-data-mono">
                          <span className="text-[9px] text-purple-600/60 uppercase tracking-widest mr-1">Reactiva:</span>
                          {parseFloat(factorPotencia).toFixed(2)} kVARh <span className="text-purple-600/60 font-bold mx-0.5">×</span> S/ {parseFloat(activePeriodo.costo_potencia || 0).toFixed(4)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end z-10 w-full sm:w-auto bg-white px-4 py-2 rounded-lg border border-purple-500/10 shadow-sm">
                      <span className="text-[9px] text-purple-700/70 font-bold uppercase tracking-wider mb-0.5">Importe Calculado</span>
                      <span className="font-data-mono font-black text-purple-600 text-xl leading-none">
                        S/ {(parseFloat(factorPotencia) * parseFloat(activePeriodo.costo_potencia || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="mt-2">
              {validationErrors.length > 0 && (
                <div className="mb-2 text-error text-[11px] font-bold flex items-start gap-1.5 bg-error/10 px-3 py-2 rounded-md border border-error/20 animate-in fade-in slide-in-from-top-1">
                  <span className="material-symbols-outlined text-[14px] mt-0.5">error</span>
                  <div className="flex flex-col">
                    <span className="block text-error/80 uppercase tracking-wider text-[9px] mb-0.5">Errores de validación:</span>
                    <ul className="list-disc pl-3">
                      {validationErrors.map((err, i) => (
                        <li key={i} className="leading-tight mb-0.5">{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={isSaving || validationErrors.length > 0}
                className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${validationErrors.length === 0 ? 'bg-primary text-on-primary hover:opacity-90 hover:shadow-md' : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed opacity-80'}`}
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
