import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../../api/axiosConfig';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

const LABEL_CLASS = 'text-xs font-semibold text-on-surface-variant';
const INPUT_CLASS = 'border border-outline-variant rounded px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-all';
const ERROR_INPUT_CLASS = 'border rounded px-3 py-1.5 text-sm focus:border-error focus:ring-1 focus:ring-error/20 bg-error/5 border-error';

const METER_THEMES = [
  { bg: 'bg-blue-50/30', border: 'border-blue-200', text: 'text-blue-700', headerBg: 'bg-blue-100/50', icon: 'electric_meter' },
  { bg: 'bg-emerald-50/30', border: 'border-emerald-200', text: 'text-emerald-700', headerBg: 'bg-emerald-100/50', icon: 'speed' },
  { bg: 'bg-purple-50/30', border: 'border-purple-200', text: 'text-purple-700', headerBg: 'bg-purple-100/50', icon: 'bolt' },
  { bg: 'bg-orange-50/30', border: 'border-orange-200', text: 'text-orange-700', headerBg: 'bg-orange-100/50', icon: 'analytics' },
  { bg: 'bg-rose-50/30', border: 'border-rose-200', text: 'text-rose-700', headerBg: 'bg-rose-100/50', icon: 'offline_bolt' }
];

const TenantFormModal = ({
  initialData,
  onSubmit,
  isSubmitting,
  editId,
  onClose
}) => {
  useBodyScrollLock(true);

  const { register, control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    defaultValues: initialData || {
      nombre_razonsocial: '',
      documento_identidad: '',
      actividad: 'General',
      correo: '',
      telefono: '',
      clave_acceso: '',
      medidores: [{ num_serie: '', tipo: 'Normal', direccion: '', lectura_inicial: 0, lectura_inicial_punta: 0, demanda_maxima_fuera_punta: 0, demanda_maxima_punta: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medidores'
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  // Tecla Escape para cerrar
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSubmitting, onClose]);

  // Al abrir en modo creación, generar DNI temporal automáticamente
  const generarDniTemporal = useCallback(async () => {
    try {
      const { data } = await api.get('/usuarios/generar-dni-temporal');
      setValue('documento_identidad', data.dni, { shouldValidate: true });
    } catch {
      // Fallback local si el endpoint falla
      const aleatorio = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      setValue('documento_identidad', `99${aleatorio}`, { shouldValidate: true });
    }
  }, [setValue]);

  useEffect(() => {
    if (!editId) {
      generarDniTemporal();
    }
  }, [editId, generarDniTemporal]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200"
      style={{ overscrollBehavior: 'contain' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-tenant-title"
        className="bg-surface-container-lowest w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] rounded-[24px] shadow-2xl overflow-hidden border border-outline-variant/60 flex flex-col my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Header - Fijo */}
        <div className="flex justify-between items-center px-5 sm:px-6 py-3.5 sm:py-4 border-b border-outline-variant/60 bg-surface-container-lowest shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
              <span className="material-symbols-outlined text-[20px]" translate="no">{editId ? 'edit_document' : 'add_business'}</span>
            </div>
            <div className="min-w-0">
              <h3 id="modal-tenant-title" className="text-base text-on-surface font-bold leading-tight truncate">
                {editId ? 'Editar Socio' : 'Registrar Nuevo Socio'}
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
                {editId ? 'Modifique los datos comerciales o de contacto.' : 'Cree un nuevo registro corporativo y su usuario administrador.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors shrink-0 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]" translate="no">close</span>
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div
          className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 custom-scrollbar modal-scroll-area"
          style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
        >
          <form className="space-y-5" id="tenant-form" onSubmit={handleSubmit(onSubmit)}>
            {/* Section 1: Datos del Socio */}
            <div className="bg-surface rounded-2xl border border-outline-variant/60 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-surface-container-lowest border-b border-outline-variant/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <span className="material-symbols-outlined text-[18px]" translate="no">person</span>
                </div>
                <h4 className="font-bold text-on-surface text-sm tracking-wide">DATOS DEL SOCIO</h4>
              </div>

              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface">
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className={LABEL_CLASS}>Nombre del Socio o Razón Social *</label>
                  <input
                    {...register('nombre_razonsocial', { required: 'El nombre es obligatorio' })}
                    className={errors.nombre_razonsocial ? ERROR_INPUT_CLASS : INPUT_CLASS}
                    placeholder="Nombre completo o Empresa"
                    type="text"
                  />
                  {errors.nombre_razonsocial && <span className="text-[10px] text-error font-bold">{errors.nombre_razonsocial.message}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className={LABEL_CLASS}>RUC o DNI *</label>
                    {!editId && (
                      <button
                        type="button"
                        onClick={generarDniTemporal}
                        className="text-[10px] font-bold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded transition-colors flex items-center gap-1"
                        title="Genera un DNI temporal de 8 dígitos. Podrás cambiarlo después."
                      >
                        <span className="material-symbols-outlined text-[12px]" translate="no">casino</span>
                        Generar temporal
                      </button>
                    )}
                  </div>
                  <input
                    {...register('documento_identidad', {
                      required: 'El documento es obligatorio',
                      pattern: { value: /(^\d{8}$|^\d{11}$)/, message: 'Debe tener 8 u 11 dígitos' }
                    })}
                    className={`${errors.documento_identidad ? ERROR_INPUT_CLASS : INPUT_CLASS} font-data-mono`}
                    placeholder="8 u 11 dígitos"
                    type="text"
                  />
                  {errors.documento_identidad && <span className="text-[10px] text-error font-bold">{errors.documento_identidad.message}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className={LABEL_CLASS}>Teléfono de Contacto *</label>
                  <input
                    {...register('telefono', {
                      required: 'El teléfono es obligatorio',
                      pattern: { value: /^\d{9}$/, message: 'Debe tener 9 dígitos' }
                    })}
                    className={errors.telefono ? ERROR_INPUT_CLASS : INPUT_CLASS}
                    placeholder="900 000 000"
                    type="tel"
                  />
                  {errors.telefono && <span className="text-[10px] text-error font-bold">{errors.telefono.message}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className={LABEL_CLASS}>Correo Electrónico (Opcional)</label>
                  <input
                    {...register('correo', {
                      validate: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Correo inválido'
                    })}
                    className={errors.correo ? ERROR_INPUT_CLASS : INPUT_CLASS}
                    placeholder="email@empresa.com"
                    type="email"
                  />
                  {errors.correo && <span className="text-[10px] text-error font-bold">{errors.correo.message}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className={LABEL_CLASS}>Tipo de Actividad (Opcional)</label>
                  <select {...register('actividad')} className={`${INPUT_CLASS} appearance-none bg-surface`}>
                    <option value="General">General</option>
                    <option value="Alimentos">Alimentos</option>
                    <option value="Manufactura">Manufactura</option>
                    <option value="Logística">Logística</option>
                    <option value="Químicos">Químicos</option>
                    <option value="Metalmecánica">Metalmecánica</option>
                    <option value="Textil">Textil</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Datos del Medidor */}
            <div className="bg-surface rounded-2xl border border-outline-variant/60 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-surface-container-lowest border-b border-outline-variant/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary shadow-inner">
                    <span className="material-symbols-outlined text-[18px]" translate="no">speed</span>
                  </div>
                  <h4 className="font-bold text-on-surface text-sm tracking-wide">MEDIDORES ASIGNADOS</h4>
                </div>
                <button type="button" onClick={() => append({ num_serie: '', tipo: 'Normal', direccion: '', lectura_inicial: 0, lectura_inicial_punta: 0, demanda_maxima_fuera_punta: 0, demanda_maxima_punta: 0 })} className="flex items-center gap-1.5 px-3 py-1.5 bg-tertiary/10 text-tertiary rounded-lg hover:bg-tertiary/20 transition-colors font-bold text-xs shadow-sm">
                  <span className="material-symbols-outlined text-[16px]" translate="no">add_circle</span> Añadir Medidor
                </button>
              </div>

              <div className="p-4 sm:p-5 flex flex-col gap-4 bg-surface">
                {fields.map((field, index) => {
                  const tipoValue = watch(`medidores.${index}.tipo`);
                  const isSinMedidor = tipoValue === 'Sin Medidor';
                  const theme = METER_THEMES[index % METER_THEMES.length];

                  return (
                    <div key={field.id} className={`flex flex-col rounded-xl border ${theme.border} ${theme.bg} overflow-hidden shadow-sm transition-all duration-300`}>
                      <input type="hidden" {...register(`medidores.${index}.medidor_id`)} />
                      {/* Cabecera del Medidor */}
                      <div className={`px-4 py-2.5 border-b ${theme.border} ${theme.headerBg} flex justify-between items-center`}>
                        <div className={`flex items-center gap-2 ${theme.text} font-bold`}>
                          <div className={`w-6 h-6 rounded-full bg-white flex items-center justify-center border ${theme.border} shadow-sm`}>
                            <span className="text-[11px] font-black">{editId ? '✓' : index + 1}</span>
                          </div>
                          <span className="material-symbols-outlined text-[18px]" translate="no">{theme.icon}</span>
                          <span className="text-xs tracking-wider uppercase">Datos del Medidor</span>
                        </div>
                        {fields.length > 1 && (
                          <button type="button" onClick={() => remove(index)} className="text-error bg-white/80 hover:bg-error hover:text-white transition-colors p-1 rounded-md border border-error/20 flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-[16px]" translate="no">delete</span>
                          </button>
                        )}
                      </div>

                      {/* Cuerpo del Medidor */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4">

                        <div className="flex flex-col gap-1 md:col-span-4">
                          <label className={LABEL_CLASS}>Número de Serie {index > 0 ? '*' : '(Opcional)'}</label>
                          <input
                            {...register(`medidores.${index}.num_serie`, {
                              required: (!isSinMedidor && index > 0) ? 'Requerido' : false
                            })}
                            disabled={isSinMedidor}
                            className={`${errors.medidores?.[index]?.num_serie ? ERROR_INPUT_CLASS : INPUT_CLASS} font-data-mono ${isSinMedidor ? 'bg-surface-variant/50 text-on-surface-variant/50 cursor-not-allowed' : ''}`}
                            placeholder={isSinMedidor ? 'No aplica' : 'Ej. MED-00123'}
                            type="text"
                          />
                        </div>

                        <div className="flex flex-col gap-1 md:col-span-3">
                          <label className={LABEL_CLASS}>Tipo de Medidor *</label>
                          <div className="relative">
                            <select
                              {...register(`medidores.${index}.tipo`)}
                              className={`${INPUT_CLASS} appearance-none w-full bg-surface`}
                            >
                              <option value="Normal">Medidor Normal</option>
                              <option value="Hora Punta">Hora Punta</option>
                              <option value="Sin Medidor">Sin Medidor (Solo Cuotas)</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]" translate="no">expand_more</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 md:col-span-5">
                          <label className={LABEL_CLASS}>Dirección del Medidor *</label>
                          <input
                            {...register(`medidores.${index}.direccion`, {
                              required: !isSinMedidor ? 'Requerido' : false
                            })}
                            disabled={isSinMedidor}
                            className={`${errors.medidores?.[index]?.direccion ? ERROR_INPUT_CLASS : INPUT_CLASS} ${isSinMedidor ? 'bg-surface-variant/50 text-on-surface-variant/50 cursor-not-allowed' : ''}`}
                            placeholder={isSinMedidor ? 'No aplica' : 'Ej. Av. Principal, Mz A'}
                            type="text"
                          />
                        </div>

                        {!isSinMedidor && (
                          <div className="flex flex-col gap-1 md:col-span-6">
                            <label className={LABEL_CLASS}>
                              Lectura Inicial Fuera de Punta (kWh)
                            </label>
                            <input
                              {...register(`medidores.${index}.lectura_inicial`, { valueAsNumber: true })}
                              className={`${INPUT_CLASS} font-data-mono text-right`}
                              placeholder="0.00"
                              type="number"
                              step="0.01"
                            />
                            <p className="text-[10px] text-on-surface-variant leading-tight">Valor con el que inicia el medidor en el sistema.</p>
                          </div>
                        )}

                        {tipoValue === 'Hora Punta' && (
                          <>
                            <div className="flex flex-col gap-1 md:col-span-6">
                              <label className={LABEL_CLASS}>Lectura Inicial Hora Punta (kWh)</label>
                              <input
                                {...register(`medidores.${index}.lectura_inicial_punta`, { valueAsNumber: true })}
                                className={`${INPUT_CLASS} font-data-mono text-right border-amber-200`}
                                placeholder="0.00"
                                type="number"
                                step="0.01"
                              />
                              <p className="text-[10px] text-on-surface-variant leading-tight">Valor inicial en horario punta.</p>
                            </div>

                            <div className="flex flex-col gap-1 md:col-span-6">
                              <label className={LABEL_CLASS}>Máxima Demanda Fuera de Punta (kW)</label>
                              <input
                                {...register(`medidores.${index}.demanda_maxima_fuera_punta`, { valueAsNumber: true })}
                                className={`${INPUT_CLASS} font-data-mono text-right`}
                                placeholder="0.00"
                                type="number"
                                step="0.01"
                              />
                              <p className="text-[10px] text-on-surface-variant leading-tight">Potencia máxima registrada en horario fuera de punta. (Informativo: no se suma, cada mes tiene su demanda)</p>
                            </div>

                            <div className="flex flex-col gap-1 md:col-span-6">
                              <label className={LABEL_CLASS}>Máxima Demanda Hora Punta (kW)</label>
                              <input
                                {...register(`medidores.${index}.demanda_maxima_punta`, { valueAsNumber: true })}
                                className={`${INPUT_CLASS} font-data-mono text-right border-amber-200`}
                                placeholder="0.00"
                                type="number"
                                step="0.01"
                              />
                              <p className="text-[10px] text-on-surface-variant leading-tight">Potencia máxima registrada en horario punta. (Informativo: no se suma, cada mes tiene su demanda)</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fijo */}
        <div className="p-3.5 sm:p-4 bg-surface-container-high border-t border-outline-variant grid grid-cols-2 gap-3 w-full shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 text-sm border border-outline text-on-surface font-bold rounded-xl hover:bg-surface transition-colors active:scale-95 duration-150 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="tenant-form"
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 text-sm bg-primary text-on-primary font-bold rounded-xl shadow-sm hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all duration-150 flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]" translate="no">sync</span>
                Guardando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]" translate="no">save</span>
                {editId ? 'Actualizar Registro' : 'Registrar Conexión'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default React.memo(TenantFormModal);
