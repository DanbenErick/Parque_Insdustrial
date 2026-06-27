import React from 'react';
import { useForm } from 'react-hook-form';

const LABEL_CLASS = 'text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-0.5 after:content-["*"] after:text-error';
const INPUT_CLASS = 'w-full bg-surface-container border border-outline-variant rounded-md px-3 py-1.5 text-xs focus:outline-none transition-colors';
const ERROR_CLASS = 'text-error text-[10px] mt-0.5 font-bold ml-1';

const UserFormModal = ({ initialData, onSubmit, onClose, isSaving, isEdit, editingUser }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: initialData,
    mode: 'onChange'
  });

  const selectedRol = watch('rol_id');

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="bg-surface border border-outline-variant rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <span className="material-symbols-outlined text-[20px]">{isEdit ? 'edit' : 'person_add'}</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface tracking-tight leading-none">
              {isEdit ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="h-8 w-8 bg-surface border border-transparent hover:border-outline-variant hover:bg-surface-variant rounded-lg transition-all text-on-surface-variant hover:text-on-surface flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={LABEL_CLASS}>Tipo de Rol</label>
              <select
                {...register("rol_id")}
                className={`${INPUT_CLASS} appearance-none focus:border-primary`}
                disabled={isEdit && editingUser?.rol_id === 1}
              >
                <option value="1">Administrador</option>
                <option value="2">Operario (Moderador)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className={LABEL_CLASS}>Documento</label>
              <input 
                type="text" 
                placeholder="Ej. 76543210" 
                maxLength={11}
                className={`${INPUT_CLASS} font-data-mono ${errors.documento_identidad ? 'border-error focus:ring-1 focus:ring-error focus:border-error' : 'focus:border-primary focus:ring-1 focus:ring-primary/20'}`}
                {...register("documento_identidad", {
                  required: "El documento es obligatorio",
                  pattern: {
                    value: /^[0-9]{8,11}$/,
                    message: "Debe contener entre 8 y 11 números"
                  }
                })}
                onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }}
              />
              {errors.documento_identidad && <p className={ERROR_CLASS}>{errors.documento_identidad.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className={LABEL_CLASS}>Nombre Completo</label>
            <input 
              type="text" 
              placeholder="Ej. Juan Pérez" 
              className={`${INPUT_CLASS} ${errors.nombre_razonsocial ? 'border-error focus:ring-1 focus:ring-error focus:border-error' : 'focus:border-primary focus:ring-1 focus:ring-primary/20'}`}
              {...register("nombre_razonsocial", {
                required: "El nombre es obligatorio",
                minLength: { value: 3, message: "Mínimo 3 caracteres" }
              })}
            />
            {errors.nombre_razonsocial && <p className={ERROR_CLASS}>{errors.nombre_razonsocial.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {!isEdit && (
              <div className="space-y-1">
                <label className={LABEL_CLASS}>
                  {selectedRol === '3' ? 'PIN (6 dígitos)' : 'Contraseña'}
                </label>
                <input
                  type={selectedRol === '3' ? 'text' : 'password'}
                  maxLength={selectedRol === '3' ? 6 : undefined}
                  className={`${INPUT_CLASS} font-data-mono ${errors.clave_acceso ? 'border-error focus:ring-1 focus:ring-error focus:border-error' : 'focus:border-primary focus:ring-1 focus:ring-primary/20'}`}
                  placeholder="Clave inicial"
                  {...register("clave_acceso", {
                    required: "La contraseña es obligatoria",
                    validate: (value) => {
                      if (selectedRol === '3' && !/^\d{6}$/.test(value)) {
                        return "El PIN debe tener exactamente 6 números";
                      }
                      if (value.length < 6) return "Mínimo 6 caracteres";
                      return true;
                    }
                  })}
                  onInput={(e) => { 
                    if (selectedRol === '3') {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }
                  }}
                />
                {errors.clave_acceso && <p className={ERROR_CLASS}>{errors.clave_acceso.message}</p>}
              </div>
            )}
            <div className="space-y-1">
              <label className={LABEL_CLASS}>Correo Electrónico</label>
              <input 
                type="email" 
                placeholder="usuario@correo.com" 
                className={`${INPUT_CLASS} ${errors.correo ? 'border-error focus:ring-1 focus:ring-error focus:border-error' : 'focus:border-primary focus:ring-1 focus:ring-primary/20'}`}
                {...register("correo", {
                  required: "El correo es obligatorio",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Correo inválido (ej. abc@xyz.com)"
                  }
                })}
              />
              {errors.correo && <p className={ERROR_CLASS}>{errors.correo.message}</p>}
            </div>
            
            {isEdit && (
              <div className="space-y-1">
                <label className={LABEL_CLASS}>Cargo</label>
                <input 
                  type="text" 
                  placeholder="Ej. Gerente / Operador"
                  className={`${INPUT_CLASS} ${errors.cargo_representante ? 'border-error focus:ring-1 focus:ring-error focus:border-error' : 'focus:border-primary focus:ring-1 focus:ring-primary/20'}`}
                  {...register("cargo_representante", {
                    required: "El cargo es obligatorio",
                    minLength: { value: 2, message: "Mínimo 2 caracteres" }
                  })}
                />
                {errors.cargo_representante && <p className={ERROR_CLASS}>{errors.cargo_representante.message}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {!isEdit && (
              <div className="space-y-1">
                <label className={LABEL_CLASS}>Cargo</label>
                <input 
                  type="text" 
                  placeholder="Ej. Gerente / Operador"
                  className={`${INPUT_CLASS} ${errors.cargo_representante ? 'border-error focus:ring-1 focus:ring-error focus:border-error' : 'focus:border-primary focus:ring-1 focus:ring-primary/20'}`}
                  {...register("cargo_representante", {
                    required: "El cargo es obligatorio",
                    minLength: { value: 2, message: "Mínimo 2 caracteres" }
                  })}
                />
                {errors.cargo_representante && <p className={ERROR_CLASS}>{errors.cargo_representante.message}</p>}
              </div>
            )}
            
            <div className="space-y-1">
              <label className={LABEL_CLASS}>Teléfono de Contacto</label>
              <input 
                type="tel" 
                placeholder="Ej. 999888777" 
                maxLength={9}
                className={`${INPUT_CLASS} ${errors.telefono ? 'border-error focus:ring-1 focus:ring-error focus:border-error' : 'focus:border-primary focus:ring-1 focus:ring-primary/20'}`}
                {...register("telefono", {
                  required: "El teléfono es obligatorio",
                  pattern: {
                    value: /^9[0-9]{8}$/,
                    message: "Debe empezar con 9 y tener 9 dígitos"
                  }
                })}
                onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }}
              />
              {errors.telefono && <p className={ERROR_CLASS}>{errors.telefono.message}</p>}
            </div>
            
            {isEdit && (
              <div className="space-y-1">
                <label className={LABEL_CLASS}>Dirección</label>
                <input 
                  type="text" 
                  placeholder="Ej. Calle las Artes Mz A"
                  className={`${INPUT_CLASS} ${errors.direccion ? 'border-error focus:ring-1 focus:ring-error focus:border-error' : 'focus:border-primary focus:ring-1 focus:ring-primary/20'}`}
                  {...register("direccion", {
                    required: "La dirección es obligatoria",
                    minLength: { value: 3, message: "Mínimo 3 caracteres" }
                  })}
                />
                {errors.direccion && <p className={ERROR_CLASS}>{errors.direccion.message}</p>}
              </div>
            )}
          </div>

          {!isEdit && (
            <div className="space-y-1">
              <label className={LABEL_CLASS}>Dirección</label>
              <input 
                type="text" 
                placeholder="Ej. Calle las Artes Mz A"
                className={`${INPUT_CLASS} ${errors.direccion ? 'border-error focus:ring-1 focus:ring-error focus:border-error' : 'focus:border-primary focus:ring-1 focus:ring-primary/20'}`}
                {...register("direccion", {
                  required: "La dirección es obligatoria",
                  minLength: { value: 3, message: "Mínimo 3 caracteres" }
                })}
              />
              {errors.direccion && <p className={ERROR_CLASS}>{errors.direccion.message}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant bg-surface-container-lowest grid grid-cols-2 gap-3 w-full">
          <button type="button" onClick={onClose} className="w-full px-4 py-2.5 text-sm font-bold border border-outline text-on-surface hover:bg-surface-variant rounded-xl transition-colors">Cancelar</button>
          <button
            type="submit" disabled={isSaving}
            className="w-full px-4 py-2.5 text-sm bg-primary text-on-primary font-bold rounded-xl shadow-sm hover:shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving
              ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
              : <span className="material-symbols-outlined text-[18px] transition-transform">{isEdit ? 'save' : 'add_circle'}</span>
            }
            {isSaving ? 'Guardando' : isEdit ? 'Guardar Cambios' : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default React.memo(UserFormModal);
