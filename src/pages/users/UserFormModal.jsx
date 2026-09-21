import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

const LABEL_CLASS = 'text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-0.5 after:content-["*"] after:text-error';
const INPUT_CLASS = 'w-full bg-surface-container border border-outline-variant rounded-md px-3 py-1.5 text-xs focus:outline-none transition-colors';
const ERROR_CLASS = 'text-error text-[10px] mt-0.5 font-bold ml-1';

const UserFormModal = ({ initialData, onSubmit, onClose, isSaving, isEdit, editingUser }) => {
  useBodyScrollLock(true);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData,
    mode: 'onChange'
  });

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSaving) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isSaving]);

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
      style={{ overscrollBehavior: 'contain' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="bg-surface border border-outline-variant rounded-2xl shadow-2xl w-full max-w-lg max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Header - Fijo */}
        <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center bg-surface shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
              <span className="material-symbols-outlined text-[20px]" translate="no">{isEdit ? 'edit' : 'person_add'}</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-on-surface tracking-tight leading-none truncate">
                {isEdit ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-1 truncate">
                {isEdit ? 'Modifique los datos y permisos de la cuenta' : 'Ingrese los datos para la nueva cuenta'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Cerrar formulario"
            className="h-8 w-8 bg-surface border border-transparent hover:border-outline-variant hover:bg-surface-variant rounded-lg transition-all text-on-surface-variant hover:text-on-surface flex items-center justify-center shrink-0 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]" translate="no">close</span>
          </button>
        </div>

        {/* Body - Scrollable */}
        <div
          className="flex-1 min-h-0 overflow-y-auto custom-scrollbar modal-scroll-area p-4 sm:p-5 space-y-3"
          style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
        >
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
                  Contraseña
                </label>
                <input
                  type="password"
                  maxLength={128}
                  className={`${INPUT_CLASS} font-data-mono ${errors.clave_acceso ? 'border-error focus:ring-1 focus:ring-error focus:border-error' : 'focus:border-primary focus:ring-1 focus:ring-primary/20'}`}
                  placeholder="Clave inicial"
                  {...register("clave_acceso", {
                    required: "La contraseña es obligatoria",
                    validate: (value) => {
                      if (value.length < 8) return "Mínimo 8 caracteres";
                      return true;
                    }
                  })}
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

        {/* Footer - Fijo */}
        <div className="p-3.5 sm:p-4 border-t border-outline-variant bg-surface-container-lowest grid grid-cols-2 gap-3 w-full shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="w-full px-4 py-2.5 text-sm font-bold border border-outline text-on-surface hover:bg-surface-variant rounded-xl transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full px-4 py-2.5 text-sm bg-primary text-on-primary font-bold rounded-xl shadow-sm hover:shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving
              ? <span className="material-symbols-outlined animate-spin text-[18px]" translate="no">sync</span>
              : <span className="material-symbols-outlined text-[18px] transition-transform" translate="no">{isEdit ? 'save' : 'add_circle'}</span>
            }
            {isSaving ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};

export default React.memo(UserFormModal);
