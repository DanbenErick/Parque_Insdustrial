import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../../api/axiosConfig';

export const DeudaPersonalizadaModal = ({ isOpen, onClose, selectedMedidor, activePeriodo }) => {
  const [descripcion, setDescripcion] = useState('Deuda Pendiente');
  const [monto, setMonto] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDescripcion('Deuda Pendiente');
      setMonto('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!descripcion || !monto) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }

    if (parseFloat(monto) <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }

    setIsSaving(true);
    try {
      await api.post('/cargos-personalizados', {
        usuario_id: selectedMedidor.usuario_id || selectedMedidor.socio_id || selectedMedidor.id, // we'll pass the correct user ID
        periodo_id: activePeriodo.id,
        descripcion,
        monto: parseFloat(monto)
      });
      toast.success('Cargo personalizado registrado con éxito');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar el cargo personalizado');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined">payments</span>
            <h2 className="text-lg font-bold text-on-surface">Añadir Deuda Personalizada</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-primary/5 rounded-xl p-3 border border-primary/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium">Socio / Propietario</p>
              <p className="text-sm font-bold text-on-surface line-clamp-1">{selectedMedidor?.propietario || 'Socio'}</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1 flex items-center gap-1">
              Concepto / Descripción <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              onFocus={() => {
                if (descripcion === 'Deuda Pendiente') setDescripcion('');
              }}
              onBlur={() => {
                if (descripcion.trim() === '') setDescripcion('Deuda Pendiente');
              }}
              placeholder="Ej. Saldo pendiente 2023"
              className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-sm transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1 flex items-center gap-1">
              Monto (S/) <span className="text-error">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">S/</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-sm transition-all font-mono"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2 rounded-full border border-outline-variant font-bold text-sm text-on-surface hover:bg-surface-variant transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 rounded-full bg-primary text-on-primary font-bold text-sm hover:shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Guardando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Guardar Cargo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
