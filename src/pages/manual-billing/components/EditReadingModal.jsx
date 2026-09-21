import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { fmtVal, parseSafe } from '../utils';
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock';

export const EditReadingModal = ({
  editModalData,
  medidorMap,
  setEditModalData,
  handleUpdateLectura,
  editReadingVal, setEditReadingVal,
  editReadingValPunta, setEditReadingValPunta,
  editFactorPotencia, setEditFactorPotencia,
  editMaxDemandaFueraPunta, setEditMaxDemandaFueraPunta,
  editMaxDemandaPunta, setEditMaxDemandaPunta,
  editJustificacion, setEditJustificacion,
  editLecturaFinalAntiguo, setEditLecturaFinalAntiguo,
  editLecturaInicialNuevo, setEditLecturaInicialNuevo,
  editLecturaFinalAntiguoPunta, setEditLecturaFinalAntiguoPunta,
  editLecturaInicialNuevoPunta, setEditLecturaInicialNuevoPunta,
  isSaving
}) => {
  useBodyScrollLock(Boolean(editModalData));

  useEffect(() => {
    if (!editModalData) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSaving) setEditModalData(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editModalData, setEditModalData, isSaving]);

  if (!editModalData) return null;

  const isValidJustification = editJustificacion.trim().split(/\s+/).filter(w => w.length > 0).length >= 3;
  const medidorInfo = editModalData ? medidorMap?.get(editModalData.num_serie) : null;
  const tipoStr = medidorInfo?.tipo || editModalData?.medidor_tipo || editModalData?.tipo || '';
  const isTR = tipoStr === 'Hora Punta' || tipoStr === 'Tiempo Real' ||
               parseSafe(editModalData?.lectura_anterior_punta) > 0 ||
               parseSafe(editModalData?.factor_potencia) > 0 ||
               parseSafe(editModalData?.lectura_actual_punta) > 0;

  const getValidationErrors = () => {
    const errors = [];
    if (!editReadingVal) errors.push(isTR ? "Falta Nueva L. Normal" : "Falta Nueva Lectura");

    const isCambio = editModalData.es_cambio_medidor === 1 || editModalData.es_cambio_medidor === true;

    if (isCambio) {
      if (!editLecturaFinalAntiguo) errors.push("Falta L. Final Dañado");
      if (!editLecturaInicialNuevo) errors.push("Falta L. Inicial Nuevo");

      if (editLecturaFinalAntiguo && parseSafe(editLecturaFinalAntiguo) < parseSafe(editModalData.lectura_anterior)) {
        const diff = parseSafe(editLecturaFinalAntiguo) - parseSafe(editModalData.lectura_anterior);
        errors.push(`La L. Final Dañado es menor a la del mes anterior (Diferencia: ${diff.toFixed(2)} kWh)`);
      }
      if (editReadingVal && editLecturaInicialNuevo && parseSafe(editReadingVal) < parseSafe(editLecturaInicialNuevo)) {
        const diff = parseSafe(editReadingVal) - parseSafe(editLecturaInicialNuevo);
        errors.push(`La nueva lectura es menor a la Inicial Nuevo (Diferencia: ${diff.toFixed(2)} kWh)`);
      }

      if (isTR) {
        if (!editLecturaFinalAntiguoPunta) errors.push("Falta L. Final Dañado (Punta)");
        if (!editLecturaInicialNuevoPunta) errors.push("Falta L. Inicial Nuevo (Punta)");

        if (editLecturaFinalAntiguoPunta && parseSafe(editLecturaFinalAntiguoPunta) < parseSafe(editModalData.lectura_anterior_punta)) {
          const diff = parseSafe(editLecturaFinalAntiguoPunta) - parseSafe(editModalData.lectura_anterior_punta);
          errors.push(`La L. Final Dañado (Punta) es menor a la del mes anterior (Diferencia: ${diff.toFixed(2)} kWh)`);
        }
        if (editReadingValPunta && editLecturaInicialNuevoPunta && parseSafe(editReadingValPunta) < parseSafe(editLecturaInicialNuevoPunta)) {
          const diff = parseSafe(editReadingValPunta) - parseSafe(editLecturaInicialNuevoPunta);
          errors.push(`La nueva lectura Punta es menor a la Inicial Nuevo (Diferencia: ${diff.toFixed(2)} kWh)`);
        }
      }
    } else {
      // La validación de lectura < mes anterior la hace el backend con el valor REAL de la BD
    }

    if (!isValidJustification) errors.push("Justificación incompleta (mínimo 3 palabras)");
    return errors;
  };

  const validationErrors = getValidationErrors();

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200"
      style={{ overscrollBehavior: 'contain' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) setEditModalData(null);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-edit-reading-title"
        className="bg-surface w-full max-w-xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] rounded-2xl shadow-2xl flex flex-col my-auto overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Header - Fijo */}
        <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest shrink-0">
          <h3 id="modal-edit-reading-title" className="font-headline-sm text-primary font-bold flex items-center gap-2 text-base sm:text-lg">
            <span className="material-symbols-outlined" translate="no">edit_note</span> Modificar Lectura
          </h3>
          <button
            onClick={() => setEditModalData(null)}
            disabled={isSaving}
            aria-label="Cerrar modal"
            className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors disabled:opacity-50 shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]" translate="no">close</span>
          </button>
        </div>

        {/* Body - Scrollable */}
        <div
          className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 custom-scrollbar modal-scroll-area"
          style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
        >
          <form id="edit-reading-form" onSubmit={handleUpdateLectura} className="space-y-4">
            <div className="bg-primary/5 px-4 py-3 rounded-lg border border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <p className="font-bold text-on-surface text-sm">{editModalData.propietario}</p>
                <p className="text-[10px] text-on-surface-variant font-data-mono bg-white px-1.5 py-0.5 rounded border border-outline-variant/50 inline-block mt-1">Medidor: {editModalData.num_serie}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">L. Original</span>
                <span className="font-data-mono font-bold text-primary bg-white px-2 py-1 rounded border border-primary/20 shadow-sm">{fmtVal(editModalData.lectura_actual)} <span className="text-[10px]">kWh</span></span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-[9px] font-bold text-primary uppercase tracking-wider block mb-1">Nueva L. Normal</label>
                <div className="relative h-[48px]">
                  <input
                    type="number" step="0.01" required autoFocus
                    value={editReadingVal} onChange={(e) => setEditReadingVal(e.target.value)} placeholder="0.00"
                    className="w-full h-full bg-white border border-primary/40 hover:border-primary focus:border-primary rounded-lg pl-3 pr-12 text-lg font-data-mono font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-right shadow-sm transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] text-on-surface-variant">kWh</span>
                </div>
              </div>

              {isTR && (
                <div className="flex-1">
                  <label className="text-[9px] font-bold text-orange-600 uppercase tracking-wider block mb-1">Nueva L. Punta</label>
                  <div className="relative h-[48px]">
                    <input
                      type="number" step="0.01" required
                      value={editReadingValPunta} onChange={(e) => setEditReadingValPunta(e.target.value)} placeholder="0.00"
                      className="w-full h-full bg-white border border-orange-300 hover:border-orange-500 focus:border-orange-500 rounded-lg pl-3 pr-12 text-lg font-data-mono font-bold text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-right shadow-sm transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] text-on-surface-variant">kWh</span>
                  </div>
                </div>
              )}
            </div>

            {isTR && (
              <>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block mb-1">Máx. Demanda Fuera Punta</label>
                    <div className="relative h-[48px]">
                      <input
                        type="number" step="0.01" required
                        value={editMaxDemandaFueraPunta} onChange={(e) => setEditMaxDemandaFueraPunta(e.target.value)} placeholder="0.00"
                        className="w-full h-full bg-white border border-blue-300 hover:border-blue-500 focus:border-blue-500 rounded-lg pl-3 pr-12 text-lg font-data-mono font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-right shadow-sm transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] text-on-surface-variant">kW</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] font-bold text-orange-600 uppercase tracking-wider block mb-1">Máx. Demanda Punta</label>
                    <div className="relative h-[48px]">
                      <input
                        type="number" step="0.01" required
                        value={editMaxDemandaPunta} onChange={(e) => setEditMaxDemandaPunta(e.target.value)} placeholder="0.00"
                        className="w-full h-full bg-white border border-orange-300 hover:border-orange-500 focus:border-orange-500 rounded-lg pl-3 pr-12 text-lg font-data-mono font-bold text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-right shadow-sm transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] text-on-surface-variant">kW</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full">
                    <label className="text-[9px] font-bold text-purple-600 uppercase tracking-wider block mb-1">Energía Reactiva Capacitiva</label>
                    <div className="relative h-[48px]">
                      <input
                        type="number" step="0.01" required
                        value={editFactorPotencia} onChange={(e) => setEditFactorPotencia(e.target.value)} placeholder="0.00"
                        className="w-full h-full bg-white border border-purple-300 hover:border-purple-500 focus:border-purple-500 rounded-lg pl-3 pr-12 text-lg font-data-mono font-bold text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-right shadow-sm transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] text-on-surface-variant">kVARh</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* EDITAR DATOS DE CAMBIO DE MEDIDOR */}
            {(editModalData.es_cambio_medidor === 1 || editModalData.es_cambio_medidor === true) && (
              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-200/50 space-y-4">
                <h4 className="text-[10px] font-bold text-orange-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]" translate="no">swap_horiz</span> Editar Cambio de Medidor
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-error uppercase tracking-wider block mb-1">Final Dañado (Normal)</label>
                    <div className="relative h-[40px]">
                      <input type="number" step="0.01" required value={editLecturaFinalAntiguo} onChange={(e) => setEditLecturaFinalAntiguo(e.target.value)} className="w-full h-full bg-white border border-error/30 hover:border-error focus:border-error rounded-lg pl-3 pr-10 text-sm font-data-mono font-bold text-error focus:outline-none focus:ring-2 focus:ring-error/20 text-right" />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-bold text-[9px] text-on-surface-variant">kWh</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-primary uppercase tracking-wider block mb-1">Inicial Nuevo (Normal)</label>
                    <div className="relative h-[40px]">
                      <input type="number" step="0.01" required value={editLecturaInicialNuevo} onChange={(e) => setEditLecturaInicialNuevo(e.target.value)} className="w-full h-full bg-white border border-primary/30 hover:border-primary focus:border-primary rounded-lg pl-3 pr-10 text-sm font-data-mono font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-right" />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-bold text-[9px] text-on-surface-variant">kWh</span>
                    </div>
                  </div>

                  {isTR && (
                    <>
                      <div>
                        <label className="text-[9px] font-bold text-error uppercase tracking-wider block mb-1">Final Dañado (Punta)</label>
                        <div className="relative h-[40px]">
                          <input type="number" step="0.01" required value={editLecturaFinalAntiguoPunta} onChange={(e) => setEditLecturaFinalAntiguoPunta(e.target.value)} className="w-full h-full bg-white border border-error/30 hover:border-error focus:border-error rounded-lg pl-3 pr-10 text-sm font-data-mono font-bold text-error focus:outline-none focus:ring-2 focus:ring-error/20 text-right" />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-bold text-[9px] text-on-surface-variant">kWh</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-primary uppercase tracking-wider block mb-1">Inicial Nuevo (Punta)</label>
                        <div className="relative h-[40px]">
                          <input type="number" step="0.01" required value={editLecturaInicialNuevoPunta} onChange={(e) => setEditLecturaInicialNuevoPunta(e.target.value)} className="w-full h-full bg-white border border-primary/30 hover:border-primary focus:border-primary rounded-lg pl-3 pr-10 text-sm font-data-mono font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-right" />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-bold text-[9px] text-on-surface-variant">kWh</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col">
              <div className="flex justify-between items-end mb-1">
                <label className="text-[9px] font-bold text-primary uppercase tracking-wider">Justificación del Cambio *</label>
                <p className={`text-[9px] font-bold ${isValidJustification ? 'text-green-600' : 'text-orange-500'}`}>
                  {editJustificacion.trim().split(/\s+/).filter(w => w.length > 0).length} / 3 palabras min.
                </p>
              </div>
              <textarea
                required value={editJustificacion} onChange={(e) => setEditJustificacion(e.target.value)}
                onFocus={() => {
                  if (editJustificacion === 'Error de digitación') setEditJustificacion('');
                }}
                placeholder="Ej. El operario ingresó un cero de más..."
                className="w-full bg-surface-container-lowest border border-outline-variant/50 hover:border-primary/50 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all resize-none h-[60px]"
              />
            </div>

            {validationErrors.length > 0 && (
              <div className="mt-2 mb-2 text-error text-[11px] font-bold flex items-start gap-1.5 bg-error/10 px-3 py-2 rounded-md border border-error/20">
                <span className="material-symbols-outlined text-[14px] mt-0.5" translate="no">error</span>
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
          </form>
        </div>

        {/* Footer - Fijo */}
        <div className="p-4 border-t border-outline-variant/50 bg-surface-container-lowest flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setEditModalData(null)}
            disabled={isSaving}
            className="w-1/3 py-2 rounded-lg font-bold border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest transition-colors text-sm disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="edit-reading-form"
            disabled={isSaving || validationErrors.length > 0}
            className={`flex-grow py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${validationErrors.length === 0 ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'}`}
          >
            {isSaving ? <><span className="material-symbols-outlined animate-spin text-[18px]" translate="no">sync</span> Actualizando...</> : <><span className="material-symbols-outlined text-[18px]" translate="no">save</span> Guardar Cambios</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default React.memo(EditReadingModal);
