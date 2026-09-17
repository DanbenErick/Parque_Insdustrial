import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../../api/axiosConfig';

export const DeudaPersonalizadaModal = ({ isOpen, onClose, selectedMedidor, activePeriodo }) => {
  const [descripcion, setDescripcion] = useState('Deuda Pendiente');
  const [monto, setMonto] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [cargosDinamicos, setCargosDinamicos] = useState([]);
  const [isLoadingCargos, setIsLoadingCargos] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadCargos = async () => {
    if (!selectedMedidor?.recibo_id) {
      setCargosDinamicos([]);
      return;
    }
    setIsLoadingCargos(true);
    try {
      const res = await api.get(`/cargos-personalizados/recibo/${selectedMedidor.recibo_id}`);
      setCargosDinamicos(res.data || []);
    } catch (err) {
      console.error('Error al cargar cargos del recibo:', err);
    } finally {
      setIsLoadingCargos(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setDescripcion('Deuda Pendiente');
      setMonto('');
      loadCargos();
    }
  }, [isOpen, selectedMedidor?.recibo_id]);

  if (!isOpen) return null;

  const handleDeleteCargo = async (cargo) => {
    if (!selectedMedidor?.recibo_id) return;
    const confirmDelete = window.confirm(
      `¿Deseas quitar el cargo "${cargo.descripcion}" de S/ ${parseFloat(cargo.monto).toFixed(2)} de este recibo?\n\n(Solo se aplicará a este recibo, no afectará a otros medidores del socio)`
    );
    if (!confirmDelete) return;

    setDeletingId(cargo.id);
    try {
      await api.delete(`/cargos-personalizados/recibo/${selectedMedidor.recibo_id}/cargo-dinamico/${cargo.id}`);
      toast.success('Cargo eliminado de este recibo correctamente');
      setCargosDinamicos(prev => prev.filter(c => c.id !== cargo.id));
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al eliminar el cargo del recibo');
    } finally {
      setDeletingId(null);
    }
  };

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
        usuario_id: selectedMedidor.usuario_id || selectedMedidor.socio_id || selectedMedidor.id,
        periodo_id: activePeriodo?.id,
        recibo_id: selectedMedidor.recibo_id,
        descripcion,
        monto: parseFloat(monto)
      });
      toast.success('Cargo asignado a este recibo con éxito');
      setMonto('');
      setDescripcion('Deuda Pendiente');
      await loadCargos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar el cargo personalizado');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-outline-variant/60 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 text-primary">
            <span className="material-symbols-outlined text-[22px]" translate="no">payments</span>
            <div>
              <h2 className="text-base font-bold text-on-surface">Cargos y Deuda del Recibo</h2>
              <p className="text-[11px] text-on-surface-variant">Asigna o retira cargos específicos de este recibo</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
            title="Cerrar"
          >
            <span className="material-symbols-outlined text-[20px]" translate="no">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Tarjeta de Información del Socio y Recibo */}
          <div className="bg-primary/5 rounded-2xl p-3.5 border border-primary/15 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[20px]" translate="no">person</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Socio / Propietario</p>
                <p className="text-sm font-bold text-on-surface truncate">{selectedMedidor?.propietario || 'Socio'}</p>
                <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                  <span className="material-symbols-outlined text-[12px] align-middle mr-1 text-primary" translate="no">location_on</span>
                  {selectedMedidor?.socio_direccion || selectedMedidor?.direccion || 'Sin dirección'}
                </p>
              </div>
            </div>

            {/* Badges de Recibo y Medidor específicos */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-primary/10">
              {selectedMedidor?.numero_comprobante ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-mono font-bold">
                  <span className="material-symbols-outlined text-[14px]" translate="no">receipt_long</span>
                  <span>{selectedMedidor.numero_comprobante}</span>
                </div>
              ) : selectedMedidor?.recibo_id ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-mono font-bold">
                  <span className="material-symbols-outlined text-[14px]" translate="no">receipt_long</span>
                  <span>Recibo #{selectedMedidor.recibo_id}</span>
                </div>
              ) : null}

              {selectedMedidor?.num_medidor && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-highest text-on-surface text-xs font-mono font-semibold">
                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant" translate="no">speed</span>
                  <span>Medidor: {selectedMedidor.num_medidor}</span>
                </div>
              )}

              {selectedMedidor?.estado && (
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedMedidor.estado === 'Pendiente' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                  selectedMedidor.estado === 'Pago Parcial' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                  'bg-surface-variant text-on-surface-variant'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {selectedMedidor.estado}
                </div>
              )}
            </div>
          </div>

          {/* Sección de Cargos Existentes en Este Recibo */}
          {selectedMedidor?.recibo_id && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary" translate="no">list_alt</span>
                  Cargos en este Recibo
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    {cargosDinamicos.length}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={loadCargos}
                  disabled={isLoadingCargos}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
                  title="Actualizar lista"
                >
                  <span className={`material-symbols-outlined text-[14px] ${isLoadingCargos ? 'animate-spin' : ''}`} translate="no">
                    refresh
                  </span>
                  Actualizar
                </button>
              </div>

              {isLoadingCargos ? (
                <div className="py-5 text-center text-on-surface-variant text-xs flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-[18px]" translate="no">progress_activity</span>
                  <span>Cargando cargos del recibo...</span>
                </div>
              ) : cargosDinamicos.length === 0 ? (
                <div className="py-4 px-3 rounded-xl bg-surface-container-lowest border border-dashed border-outline-variant text-center">
                  <p className="text-xs text-on-surface-variant">No hay cargos dinámicos ni deudas asignadas a este recibo.</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {cargosDinamicos.map((cargo) => (
                    <div
                      key={cargo.id}
                      className="p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/70 hover:border-outline-variant transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-on-surface truncate">{cargo.descripcion}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                            cargo.tipo === 'Personalizado' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                            cargo.tipo === 'Multa' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {cargo.tipo}
                          </span>
                        </div>
                        {cargo.fecha_aplicacion && (
                          <p className="text-[10px] text-on-surface-variant mt-0.5">
                            {new Date(cargo.fecha_aplicacion).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-xs text-on-surface">
                          S/ {parseFloat(cargo.monto).toFixed(2)}
                        </span>

                        {/* Botón para eliminar/quitar el cargo del recibo */}
                        <button
                          type="button"
                          onClick={() => handleDeleteCargo(cargo)}
                          disabled={deletingId === cargo.id}
                          className="p-1.5 rounded-lg text-error hover:bg-error/10 active:scale-95 transition-all disabled:opacity-50"
                          title="Quitar este cargo del recibo"
                        >
                          {deletingId === cargo.id ? (
                            <span className="material-symbols-outlined text-[18px] animate-spin" translate="no">progress_activity</span>
                          ) : (
                            <span className="material-symbols-outlined text-[18px]" translate="no">delete</span>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Formulario para Añadir Nuevo Cargo */}
          <form onSubmit={handleSubmit} className="pt-2 border-t border-outline-variant/60 space-y-3.5">
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary" translate="no">add_circle</span>
              Añadir Nuevo Cargo a este Recibo
            </span>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider ml-1 flex items-center gap-1">
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
                placeholder="Ej. Deuda Pendiente, Corte, Reparación"
                className="w-full px-3.5 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-xs text-on-surface transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider ml-1 flex items-center gap-1">
                Monto (S/) <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs font-semibold">S/</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3.5 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-xs text-on-surface transition-all font-mono font-medium"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving || !monto}
                className="px-5 py-2 rounded-full bg-primary text-on-primary font-bold text-xs hover:shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isSaving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[16px]" translate="no">progress_activity</span>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]" translate="no">add_circle</span>
                    <span>Agregar Cargo</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between shrink-0">
          <p className="text-[10px] text-on-surface-variant">
            Los cambios se guardan y recalculan inmediatamente para este recibo.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-outline-variant font-bold text-xs text-on-surface hover:bg-surface-variant transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
