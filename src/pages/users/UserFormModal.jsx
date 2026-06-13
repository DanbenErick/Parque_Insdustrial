import React from 'react';
import { motion } from 'framer-motion';

const OVERLAY = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const PANEL = { hidden: { scale: 0.95, opacity: 0 }, visible: { scale: 1, opacity: 1 } };
const TRANSITION = { duration: 0.2, ease: 'easeOut' };

const LABEL_CLASS = 'text-[10px] font-bold text-on-surface-variant uppercase tracking-wider';
const INPUT_CLASS = 'w-full bg-surface-container border border-outline-variant rounded-md px-3 py-1.5 text-xs focus:border-primary outline-none';

const UserFormModal = ({ formData, onFieldChange, onSubmit, onClose, isSaving, isEdit, editingUser }) => (
  <motion.div
    variants={OVERLAY} initial="hidden" animate="visible" exit="hidden" transition={TRANSITION}
    className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/60 backdrop-blur-sm"
  >
    <motion.form
      variants={PANEL} initial="hidden" animate="visible" exit="hidden" transition={TRANSITION}
      onSubmit={onSubmit}
      className="bg-surface border border-outline-variant rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
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
      <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={LABEL_CLASS}>Tipo de Rol</label>
            <select
              name="rol_id" value={formData.rol_id} onChange={onFieldChange}
              className={`${INPUT_CLASS} appearance-none`}
              disabled={isEdit && editingUser?.rol_id === 1}
            >
              <option value="1">Administrador</option>
              <option value="2">Operario (Moderador)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className={LABEL_CLASS}>DNI / RUC</label>
            <input required type="text" name="documento_identidad" value={formData.documento_identidad} onChange={onFieldChange} className={`${INPUT_CLASS} font-data-mono`} placeholder="Documento" />
          </div>
        </div>

        <div className="space-y-1">
          <label className={LABEL_CLASS}>Nombre Completo o Razón Social</label>
          <input required type="text" name="nombre_razonsocial" value={formData.nombre_razonsocial} onChange={onFieldChange} className={INPUT_CLASS} placeholder="Ej. Juan Pérez o Corp Industrial S.A." />
        </div>

        {!isEdit && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={LABEL_CLASS}>
                {formData.rol_id === '3' ? 'PIN (6 dígitos)' : 'Contraseña'}
              </label>
              <input
                required type={formData.rol_id === '3' ? 'text' : 'password'}
                maxLength={formData.rol_id === '3' ? 6 : undefined}
                name="clave_acceso" value={formData.clave_acceso} onChange={onFieldChange}
                className={`${INPUT_CLASS} font-data-mono`} placeholder="Clave inicial"
              />
            </div>
            <div className="space-y-1">
              <label className={LABEL_CLASS}>Correo Electrónico</label>
              <input required type="email" name="correo" value={formData.correo} onChange={onFieldChange} className={INPUT_CLASS} placeholder="usuario@correo.com" />
            </div>
          </div>
        )}

        {isEdit && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={LABEL_CLASS}>Cargo</label>
              <input required type="text" name="cargo_representante" value={formData.cargo_representante} onChange={onFieldChange} className={INPUT_CLASS} />
            </div>
            <div className="space-y-1">
              <label className={LABEL_CLASS}>Correo Electrónico</label>
              <input required type="email" name="correo" value={formData.correo} onChange={onFieldChange} className={INPUT_CLASS} />
            </div>
          </div>
        )}

        {!isEdit && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={LABEL_CLASS}>Cargo</label>
              <input required type="text" name="cargo_representante" value={formData.cargo_representante} onChange={onFieldChange} className={INPUT_CLASS} placeholder="Ej. Gerente / Operador" />
            </div>
            <div className="space-y-1">
              <label className={LABEL_CLASS}>Teléfono de Contacto</label>
              <input required type="text" name="telefono" value={formData.telefono} onChange={onFieldChange} className={INPUT_CLASS} placeholder="Teléfono / Celular" />
            </div>
          </div>
        )}

        {isEdit && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={LABEL_CLASS}>Teléfono de Contacto</label>
              <input required type="text" name="telefono" value={formData.telefono} onChange={onFieldChange} className={INPUT_CLASS} />
            </div>
            <div className="space-y-1">
              <label className={LABEL_CLASS}>Dirección</label>
              <input required type="text" name="direccion" value={formData.direccion} onChange={onFieldChange} className={INPUT_CLASS} />
            </div>
          </div>
        )}

        {!isEdit && (
          <div className="space-y-1">
            <label className={LABEL_CLASS}>Dirección</label>
            <input required type="text" name="direccion" value={formData.direccion} onChange={onFieldChange} className={INPUT_CLASS} placeholder="Ej. Calle las Artes Mz A Lt 15" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-outline-variant bg-surface-container-lowest flex justify-end gap-3">
        <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors">Cancelar</button>
        <button
          type="submit" disabled={isSaving}
          className="group px-6 py-2 text-sm bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:shadow-md hover:opacity-90 transition-all flex items-center gap-2"
        >
          {isSaving
            ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
            : <span className="material-symbols-outlined text-[18px] group-hover:-translate-y-0.5 transition-transform">{isEdit ? 'save' : 'add_circle'}</span>
          }
          {isSaving ? 'Guardando' : isEdit ? 'Guardar Cambios' : 'Crear Usuario'}
        </button>
      </div>
    </motion.form>
  </motion.div>
);

export default React.memo(UserFormModal);
