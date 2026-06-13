import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';

const OVERLAY_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const MODAL_VARIANTS = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
};

const TRANSITION = { duration: 0.2, ease: 'easeOut' };

const CargoFormModal = ({ formData, setFormData, periodos, onClose, onSubmit, isSubmitting }) => {

  // --- Memoized: group periodos by year, sorted descending ---
  const groupedPeriodos = useMemo(() => {
    const grouped = periodos.reduce((acc, curr) => {
      const year = curr.mes_anio.substring(0, 4);
      if (!acc[year]) acc[year] = [];
      acc[year].push(curr);
      return acc;
    }, {});

    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  }, [periodos]);

  // --- Handlers using functional state updates to avoid stale closures ---
  const handleFieldChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [setFormData]);

  const handleToggleActive = useCallback(() => {
    setFormData(prev => ({ ...prev, es_activo: !prev.es_activo }));
  }, [setFormData]);

  const handlePeriodoToggle = useCallback((periodoId) => {
    setFormData(prev => {
      const isSelected = prev.periodos_ids.includes(periodoId);
      return {
        ...prev,
        periodos_ids: isSelected
          ? prev.periodos_ids.filter(id => id !== periodoId)
          : [...prev.periodos_ids, periodoId],
      };
    });
  }, [setFormData]);

  const handleSelectAll = useCallback(() => {
    setFormData(prev => ({ ...prev, periodos_ids: periodos.map(p => p.id) }));
  }, [setFormData, periodos]);

  const handleClearAll = useCallback(() => {
    setFormData(prev => ({ ...prev, periodos_ids: [] }));
  }, [setFormData]);

  const handleToggleYear = useCallback((periodosAnio, allSelected) => {
    setFormData(prev => {
      if (allSelected) {
        const yearIds = new Set(periodosAnio.map(p => p.id));
        return { ...prev, periodos_ids: prev.periodos_ids.filter(id => !yearIds.has(id)) };
      }
      const newIds = new Set(prev.periodos_ids);
      periodosAnio.forEach(p => newIds.add(p.id));
      return { ...prev, periodos_ids: Array.from(newIds) };
    });
  }, [setFormData]);

  return (
    <motion.div
      variants={OVERLAY_VARIANTS}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={TRANSITION}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
    >
      <motion.div
        variants={MODAL_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={TRANSITION}
        className="bg-surface rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <h3 className="text-base font-bold text-primary">
            {formData.id ? 'Editar Cargo/Multa' : 'Nuevo Cargo/Multa'}
          </h3>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:bg-outline-variant/20 p-1 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form — submit button is INSIDE the form so e.preventDefault() works correctly */}
        <form onSubmit={onSubmit} className="flex flex-col flex-grow overflow-hidden">
          <div className="p-4 overflow-y-auto custom-scrollbar flex-grow space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Tipo */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Tipo *</label>
                <select
                  value={formData.tipo}
                  onChange={handleFieldChange('tipo')}
                  className="w-full bg-surface-container border border-outline-variant rounded px-3 py-1.5 h-8 text-xs focus:border-primary outline-none transition-colors appearance-none"
                >
                  <option value="Costo">Costo / Tarifa</option>
                  <option value="Multa">Multa / Infracción</option>
                </select>
              </div>

              {/* Monto */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Monto Base (S/) *</label>
                <input
                  type="number" step="0.01" min="0" required
                  value={formData.monto_defecto}
                  onChange={handleFieldChange('monto_defecto')}
                  placeholder="Ej. 50.00"
                  className="w-full bg-surface-container border border-outline-variant rounded px-3 py-1.5 h-8 text-xs font-data-mono focus:border-primary outline-none transition-colors"
                />
              </div>

              {/* Descripción */}
              <div className="space-y-0.5 md:col-span-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Descripción del Concepto *</label>
                <input
                  type="text" required
                  value={formData.descripcion}
                  onChange={handleFieldChange('descripcion')}
                  placeholder="Ej. Cuota Extraordinaria Asamblea 2026"
                  className="w-full bg-surface-container border border-outline-variant rounded px-3 py-1.5 h-8 text-xs focus:border-primary outline-none transition-colors"
                />
              </div>

              {/* Toggle activo */}
              <div className="md:col-span-2 pt-2 border-t border-outline-variant/30 mt-2">
                <label className="flex items-center gap-2 cursor-pointer w-fit" onClick={handleToggleActive}>
                  <div className={`w-10 h-6 rounded-full relative shadow-inner transition-colors ${formData.es_activo ? 'bg-primary' : 'bg-surface-container-high'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${formData.es_activo ? 'right-1' : 'left-1'}`}></div>
                  </div>
                  <span className="text-sm font-bold text-on-surface">Activo (Disponible para uso)</span>
                </label>
              </div>
            </div>

            {/* Periodos section */}
            <div className="mt-lg pt-lg border-t border-outline-variant">
              <div className="flex justify-between items-end mb-xs">
                <div>
                  <h4 className="font-bold text-on-surface text-sm mb-xs">Períodos de Validez</h4>
                  <p className="text-xs text-on-surface-variant">
                    Seleccione los meses en los que este cobro estará disponible para añadirse a los recibos.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[10px] uppercase font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors"
                  >
                    Marcar Todos
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-[10px] uppercase font-bold text-on-surface-variant hover:bg-surface-container-high px-2 py-1 rounded transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar space-y-4 mt-md border border-outline-variant/50 p-sm rounded-lg bg-surface-container-lowest">
                {groupedPeriodos.map(([year, periodosAnio]) => {
                  const allSelected = periodosAnio.every(p => formData.periodos_ids.includes(p.id));

                  return (
                    <div key={year} className="space-y-2">
                      <div className="flex justify-between items-center bg-surface-container py-1 px-2 rounded">
                        <span className="font-bold text-xs text-on-surface">Año {year}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleYear(periodosAnio, allSelected)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${allSelected ? 'bg-primary/20 text-primary' : 'bg-outline-variant/30 text-on-surface-variant hover:text-primary'}`}
                        >
                          {allSelected ? 'Quitar Año' : 'Seleccionar Año'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-sm pl-2">
                        {periodosAnio.map(p => (
                          <label key={p.id} className={`flex items-center gap-xs p-xs border rounded cursor-pointer transition-colors ${formData.periodos_ids.includes(p.id) ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container-low border-outline-variant text-on-surface hover:bg-surface-container'}`}>
                            <input
                              type="checkbox"
                              checked={formData.periodos_ids.includes(p.id)}
                              onChange={() => handlePeriodoToggle(p.id)}
                              className="rounded text-primary focus:ring-primary border-outline"
                            />
                            <span className="text-xs font-bold">{p.mes_anio.substring(5)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer — inside form */}
          <div className="px-4 py-3 border-t border-outline-variant bg-surface-container-lowest flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 h-8 border border-outline-variant text-on-surface text-xs font-bold rounded-md hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1.5 h-8 bg-primary text-on-primary text-xs font-bold rounded-md shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cargo'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default React.memo(CargoFormModal);
