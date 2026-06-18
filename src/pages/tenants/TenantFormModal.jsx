import React from 'react';

const OVERLAY = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const PANEL = { hidden: { scale: 0.95, opacity: 0 }, visible: { scale: 1, opacity: 1 } };
const TRANSITION = { duration: 0.2, ease: "easeOut" };

const LABEL_CLASS = 'text-xs font-semibold text-on-surface-variant';
const INPUT_CLASS = 'border border-outline-variant rounded px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-all';
const ERROR_INPUT_CLASS = 'border rounded px-3 py-1.5 text-sm focus:border-error focus:ring-1 focus:ring-error/20 bg-error/5 border-error';

const TenantFormModal = ({
  formData, setFormData,
  errors, handleInputChange,
  handleRegister,
  isSubmitting,
  editId,
  onClose
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 md:p-4 !m-0"
    >
      <div
        className="bg-surface-container-lowest w-full h-full md:h-auto max-w-2xl md:rounded-xl shadow-2xl overflow-hidden border-0 md:border border-outline-variant flex flex-col max-h-screen md:max-h-[90vh]"
      >
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
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-md custom-scrollbar">
          <form className="space-y-md" id="tenant-form" onSubmit={handleRegister}>
            {/* Section 1: Datos de la Empresa */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-[18px]">factory</span>
                <span className="font-label-caps text-[11px] font-bold">DATOS DE LA EMPRESA</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className={LABEL_CLASS}>Nombre o Razón Social *</label>
                  <input name="nombre_razonsocial" value={formData.nombre_razonsocial} onChange={handleInputChange} required className={INPUT_CLASS} placeholder="Ej. Alimentos del Sol S.A." type="text" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={LABEL_CLASS}>RUC o DNI *</label>
                  <input name="documento_identidad" value={formData.documento_identidad} onChange={handleInputChange} required className={`${errors.documento_identidad ? ERROR_INPUT_CLASS : INPUT_CLASS} font-data-mono`} placeholder="8 u 11 dígitos" type="text" />
                  {errors.documento_identidad && <span className="text-[10px] text-error font-bold">{errors.documento_identidad}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className={LABEL_CLASS}>Dirección *</label>
                  <input type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} required className={INPUT_CLASS} placeholder="Av. Principal, Mz A" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={LABEL_CLASS}>Tipo de Actividad *</label>
                  <select name="actividad" value={formData.actividad} onChange={handleInputChange} required className={`${INPUT_CLASS} appearance-none`}>
                    <option disabled value="">Seleccione rubro...</option>
                    <option value="Alimentos">Alimentos</option>
                    <option value="Manufactura">Manufactura</option>
                    <option value="Logística">Logística</option>
                    <option value="Químicos">Químicos</option>
                    <option value="Metalmecánica">Metalmecánica</option>
                    <option value="Textil">Textil</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-outline-variant/30"></div>

            {/* Section 2: Datos del Representante */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span className="font-label-caps text-[11px] font-bold">DATOS DEL USUARIO (ADMINISTRADOR)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className={LABEL_CLASS}>Nombre Completo del Representante *</label>
                  <input name="cargo_representante" value={formData.cargo_representante} onChange={handleInputChange} required className={INPUT_CLASS} placeholder="Nombre completo" type="text" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={LABEL_CLASS}>Correo Electrónico *</label>
                  <input name="correo" value={formData.correo} onChange={handleInputChange} required className={errors.correo ? ERROR_INPUT_CLASS : INPUT_CLASS} placeholder="email@empresa.com" type="email" />
                  {errors.correo && <span className="text-[10px] text-error font-bold">{errors.correo}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className={LABEL_CLASS}>Teléfono de Contacto *</label>
                  <input name="telefono" value={formData.telefono} onChange={handleInputChange} required className={errors.telefono ? ERROR_INPUT_CLASS : INPUT_CLASS} placeholder="900 000 000" type="tel" />
                  {errors.telefono && <span className="text-[10px] text-error font-bold">{errors.telefono}</span>}
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-outline-variant/30"></div>

            {/* Section 3: Datos del Medidor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-[18px]">speed</span>
                  <span className="font-label-caps text-[11px] font-bold">MEDIDORES ASIGNADOS</span>
                </div>
                <button type="button" onClick={() => {
                  setFormData(prev => ({ ...prev, medidores: [...prev.medidores, { num_serie: '', tipo: 'Normal' }] }));
                }} className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors font-bold text-[11px]">
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  Añadir Medidor
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {formData.medidores.map((medidor, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-surface-container-lowest rounded-lg border border-outline-variant relative">
                    {formData.medidores.length > 1 && (
                      <button type="button" onClick={() => {
                        const newMedidores = [...formData.medidores];
                        newMedidores.splice(index, 1);
                        setFormData(prev => ({ ...prev, medidores: newMedidores }));
                      }} className="absolute top-1 right-1 text-error hover:bg-error/10 p-1 rounded-full">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    )}
                    <div className="flex flex-col gap-1 md:col-span-7">
                      <label className={LABEL_CLASS}>Número de Serie {index > 0 ? '*' : '(Opcional)'}</label>
                      <input
                        value={medidor.num_serie}
                        disabled={medidor.tipo === 'Sin Medidor'}
                        onChange={(e) => {
                          const newMedidores = [...formData.medidores];
                          newMedidores[index].num_serie = e.target.value;
                          setFormData(prev => ({ ...prev, medidores: newMedidores }));
                        }}
                        required={index > 0 && medidor.tipo !== 'Sin Medidor'}
                        className={`${INPUT_CLASS} font-data-mono ${medidor.tipo === 'Sin Medidor' ? 'bg-surface-container-low text-on-surface-variant/50 cursor-not-allowed' : ''}`}
                        placeholder={medidor.tipo === 'Sin Medidor' ? 'No aplica' : 'Ej. MED-00123'}
                        type="text"
                      />
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-5">
                      <label className={LABEL_CLASS}>Tipo de Medidor *</label>
                      <select value={medidor.tipo} onChange={(e) => {
                        const newMedidores = [...formData.medidores];
                        newMedidores[index].tipo = e.target.value;
                        if (e.target.value === 'Sin Medidor') {
                          newMedidores[index].num_serie = '';
                        }
                        setFormData(prev => ({ ...prev, medidores: newMedidores }));
                      }} required className={`${INPUT_CLASS} appearance-none`}>
                        <option value="Normal">Normal</option>
                        <option value="Tiempo Real">Tiempo Real</option>
                        <option value="Sin Medidor">Sin Medidor</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-on-surface-variant mt-1 italic">{editId ? 'Puede actualizar, eliminar o asignar medidores a este socio.' : 'Si el socio aún no cuenta con un medidor instalado, seleccione la opción "Sin Medidor".'}</p>
            </div>
          </form>
        </div>

        <div className="px-md py-3 bg-surface-container-high border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-on-surface-variant hidden md:block max-w-[200px] leading-tight">
            El socio quedará registrado en el directorio.
          </p>
          <div className="flex flex-col-reverse md:flex-row gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full md:w-auto px-4 py-1.5 text-sm border border-outline text-on-surface font-bold rounded-lg hover:bg-surface transition-colors active:scale-95 duration-150"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="tenant-form"
              disabled={isSubmitting || Object.values(errors).some(e => e !== '')}
              className="w-full md:w-auto px-4 py-1.5 text-sm bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all duration-150 flex justify-center items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              {isSubmitting ? 'Guardando...' : (editId ? 'Actualizar Registro' : 'Registrar Conexión')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TenantFormModal);
