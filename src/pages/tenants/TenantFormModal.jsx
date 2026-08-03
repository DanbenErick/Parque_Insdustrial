import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

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
  const { register, control, handleSubmit, formState: { errors }, reset, watch } = useForm({
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 md:p-4 !m-0">
      <div className="bg-surface-container-lowest w-full h-full md:h-auto max-w-2xl md:rounded-xl shadow-2xl overflow-hidden border-0 md:border border-outline-variant flex flex-col max-h-screen md:max-h-[90vh]">
        <div className="flex justify-between items-start px-md py-3 border-b border-outline-variant bg-surface-container-lowest">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5 flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">{editId ? 'edit_document' : 'add_business'}</span>
            </div>
            <div>
              <h3 className="text-base text-on-surface font-bold leading-tight">{editId ? 'Editar Socio' : 'Registrar Nuevo Socio'}</h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5">{editId ? 'Modifique los datos comerciales o de contacto.' : 'Cree un nuevo registro corporativo y su usuario administrador.'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-md custom-scrollbar">
          <form className="space-y-md" id="tenant-form" onSubmit={handleSubmit(onSubmit)}>
            {/* Section 1: Datos del Socio */}
            <div className="bg-surface rounded-2xl border border-outline-variant/60 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-surface-container-lowest border-b border-outline-variant/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </div>
                <h4 className="font-bold text-on-surface text-sm tracking-wide">DATOS DEL SOCIO</h4>
              </div>
              
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface">
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
                  <label className={LABEL_CLASS}>RUC o DNI *</label>
                  <input 
                    {...register('documento_identidad', { 
                      required: 'El documento es obligatorio',
                      pattern: { value: /^(\d{8}|\d{11})$/, message: 'Debe tener 8 u 11 dígitos' }
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
                    <span className="material-symbols-outlined text-[18px]">speed</span>
                  </div>
                  <h4 className="font-bold text-on-surface text-sm tracking-wide">MEDIDORES ASIGNADOS</h4>
                </div>
                <button type="button" onClick={() => append({ num_serie: '', tipo: 'Normal', direccion: '', lectura_inicial: 0, lectura_inicial_punta: 0, demanda_maxima_fuera_punta: 0, demanda_maxima_punta: 0 })} className="flex items-center gap-1.5 px-3 py-1.5 bg-tertiary/10 text-tertiary rounded-lg hover:bg-tertiary/20 transition-colors font-bold text-xs shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">add_circle</span> Añadir Medidor
                </button>
              </div>

              <div className="p-5 flex flex-col gap-4 bg-surface">
                {fields.map((field, index) => {
                  const tipoValue = watch(`medidores.${index}.tipo`);
                  const isSinMedidor = tipoValue === 'Sin Medidor';
                  const theme = METER_THEMES[index % METER_THEMES.length];
                  
                  return (
                    <div key={field.id} className={`flex flex-col rounded-xl border ${theme.border} ${theme.bg} overflow-hidden shadow-sm transition-all duration-300`}>
                      
                      {/* Cabecera del Medidor */}
                      <div className={`px-4 py-2.5 border-b ${theme.border} ${theme.headerBg} flex justify-between items-center`}>
                        <div className={`flex items-center gap-2 ${theme.text} font-bold`}>
                          <div className={`w-6 h-6 rounded-full bg-white flex items-center justify-center border ${theme.border} shadow-sm`}>
                            <span className="text-[11px] font-black">{index + 1}</span>
                          </div>
                          <span className="material-symbols-outlined text-[18px]">{theme.icon}</span>
                          <span className="text-xs tracking-wider uppercase">Datos del Medidor</span>
                        </div>
                        {fields.length > 1 && (
                          <button type="button" onClick={() => remove(index)} className="text-error bg-white/80 hover:bg-error hover:text-white transition-colors p-1 rounded-md border border-error/20 flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
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
                            <option value="Normal">Normal</option>
                            <option value="Hora Punta">Hora Punta</option>
                            <option value="Sin Medidor">Sin Medidor (Solo Cuotas)</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">expand_more</span>
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
                            <p className="text-[10px] text-on-surface-variant leading-tight">Potencia máxima registrada en horario fuera de punta.</p>
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
                            <p className="text-[10px] text-on-surface-variant leading-tight">Potencia máxima registrada en horario punta.</p>
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

        <div className="p-4 bg-surface-container-high border-t border-outline-variant grid grid-cols-2 gap-3 w-full">
          <button type="button" onClick={onClose} className="w-full px-4 py-2.5 text-sm border border-outline text-on-surface font-bold rounded-xl hover:bg-surface transition-colors active:scale-95 duration-150">
            Cancelar
          </button>
          <button type="submit" form="tenant-form" disabled={isSubmitting} className="w-full px-4 py-2.5 text-sm bg-primary text-on-primary font-bold rounded-xl shadow-sm hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all duration-150 flex justify-center items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">save</span>
            {isSubmitting ? 'Guardando...' : (editId ? 'Actualizar Registro' : 'Registrar Conexión')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TenantFormModal);
