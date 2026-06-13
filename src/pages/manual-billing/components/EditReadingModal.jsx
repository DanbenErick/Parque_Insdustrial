import React from 'react';
import { motion } from 'framer-motion';
import { MODAL_BACKDROP, MODAL_CONTENT, fmtVal, parseSafe } from '../utils';

export const EditReadingModal = ({
  editModalData,
  setEditModalData,
  handleUpdateLectura,
  editReadingVal, setEditReadingVal,
  editReadingValPunta, setEditReadingValPunta,
  editFactorPotencia, setEditFactorPotencia,
  editPrecioFactorPotencia, setEditPrecioFactorPotencia,
  editJustificacion, setEditJustificacion,
  isSaving
}) => {
  const isValidJustification = editJustificacion.trim().split(/\s+/).filter(w => w.length > 0).length >= 3;

  return (
    <motion.div {...MODAL_BACKDROP} className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <motion.div {...MODAL_CONTENT} className="bg-surface w-full max-w-xl rounded-2xl shadow-2xl flex flex-col">
        <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest rounded-t-2xl">
          <h3 className="font-headline-sm text-primary font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">edit_note</span> Modificar Lectura
          </h3>
          <button onClick={() => setEditModalData(null)} className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleUpdateLectura} className="p-6 space-y-4">
          <div className="bg-primary/5 px-4 py-3 rounded-lg border border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <p className="font-bold text-on-surface text-sm">{editModalData.propietario}</p>
              <p className="text-[10px] text-on-surface-variant font-data-mono bg-white px-1.5 py-0.5 rounded border border-outline-variant/50 inline-block mt-1">Medidor: {editModalData.num_serie}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">L. Original</span>
              <span className="font-data-mono font-bold text-primary bg-white px-2 py-1 rounded border border-primary/20 shadow-sm">{fmtVal(editModalData.lectura_actual)} <span className="text-[10px]">W</span></span>
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

            {(parseSafe(editModalData.lectura_actual_punta) > 0 || parseSafe(editModalData.factor_potencia) > 0) && (
              <>
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
                <div className="flex-1">
                  <label className="text-[9px] font-bold text-purple-600 uppercase tracking-wider block mb-1">Nuevo Reactivo</label>
                  <div className="relative h-[48px]">
                    <input
                      type="number" step="0.01" required
                      value={editFactorPotencia} onChange={(e) => setEditFactorPotencia(e.target.value)} placeholder="0.00"
                      className="w-full h-full bg-white border border-purple-300 hover:border-purple-500 focus:border-purple-500 rounded-lg pl-3 pr-12 text-lg font-data-mono font-bold text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-right shadow-sm transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] text-on-surface-variant">kVARh</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between items-end mb-1">
              <label className="text-[9px] font-bold text-primary uppercase tracking-wider">Justificación del Cambio *</label>
              <p className={`text-[9px] font-bold ${isValidJustification ? 'text-green-600' : 'text-orange-500'}`}>
                {editJustificacion.trim().split(/\s+/).filter(w => w.length > 0).length} / 3 palabras min.
              </p>
            </div>
            <textarea
              required value={editJustificacion} onChange={(e) => setEditJustificacion(e.target.value)}
              placeholder="Ej. El operario ingresó un cero de más..."
              className="w-full bg-surface-container-lowest border border-outline-variant/50 hover:border-primary/50 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all resize-none h-[60px]"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-outline-variant/50">
            <button type="button" onClick={() => setEditModalData(null)} className="w-1/3 py-2 rounded-lg font-bold border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest transition-colors text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving || !editReadingVal || !isValidJustification} className={`flex-grow py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${editReadingVal && isValidJustification ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'}`}>
              {isSaving ? <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Actualizando...</> : <><span className="material-symbols-outlined text-[18px]">save</span> Guardar Cambios</>}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
