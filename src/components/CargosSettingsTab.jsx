import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '../api/axiosConfig';

const CargosSettingsTab = () => {
  const [cargos, setCargos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    tipo: 'Costo',
    descripcion: '',
    monto_defecto: '',
    es_activo: true,
    periodos_ids: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cargosRes, periodosRes] = await Promise.all([
        api.get('/catalogo-cargos'),
        api.get('/periodos')
      ]);
      setCargos(cargosRes.data);
      setPeriodos(periodosRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (cargo = null) => {
    if (cargo) {
      setFormData({
        id: cargo.id,
        tipo: cargo.tipo,
        descripcion: cargo.descripcion,
        monto_defecto: cargo.monto_defecto,
        es_activo: cargo.es_activo === 1,
        periodos_ids: cargo.periodos_ids || []
      });
    } else {
      setFormData({
        id: null,
        tipo: 'Costo',
        descripcion: '',
        monto_defecto: '',
        es_activo: true,
        periodos_ids: []
      });
    }
    setIsModalOpen(true);
  };

  const handlePeriodoToggle = (periodoId) => {
    setFormData(prev => {
      const isSelected = prev.periodos_ids.includes(periodoId);
      if (isSelected) {
        return { ...prev, periodos_ids: prev.periodos_ids.filter(id => id !== periodoId) };
      } else {
        return { ...prev, periodos_ids: [...prev.periodos_ids, periodoId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.descripcion || !formData.monto_defecto) {
      return toast.error("Complete los campos obligatorios");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        monto_defecto: parseFloat(formData.monto_defecto),
        es_activo: formData.es_activo,
        periodos_ids: formData.periodos_ids
      };

      if (formData.id) {
        await api.put(`/catalogo-cargos/${formData.id}`, payload);
        toast.success('Cargo actualizado exitosamente');
      } else {
        await api.post('/catalogo-cargos', payload);
        toast.success('Cargo creado exitosamente');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar cargo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este cargo?')) {
      try {
        await api.delete(`/catalogo-cargos/${id}`);
        toast.success('Cargo eliminado');
        fetchData();
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-on-surface-variant animate-pulse">Cargando catálogo...</div>;
  }

  return (
    <div className="animate-in fade-in space-y-xl">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-headline-sm font-bold text-on-surface mb-xs">Catálogo de Costos y Multas</h3>
          <p className="text-sm text-on-surface-variant">
            Crea cargos o multas personalizadas y asígnalas a los periodos en los que estarán disponibles.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-md py-2 bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:opacity-90 active:scale-95 flex items-center gap-xs transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nuevo Cargo
        </button>
      </div>

      <div className="border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant text-xs font-bold uppercase tracking-wider">
              <th className="p-md">Tipo</th>
              <th className="p-md">Descripción</th>
              <th className="p-md">Monto Base</th>
              <th className="p-md">Estado</th>
              <th className="p-md text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50">
            {cargos.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-xl text-center text-on-surface-variant italic">
                  No hay cargos o multas configuradas.
                </td>
              </tr>
            ) : (
              cargos.map(cargo => (
                <tr key={cargo.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="p-md">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${cargo.tipo === 'Multa' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                      {cargo.tipo}
                    </span>
                  </td>
                  <td className="p-md font-bold text-on-surface text-sm">
                    {cargo.descripcion}
                    <div className="text-xs text-on-surface-variant font-normal mt-1">
                      {cargo.periodos_ids?.length || 0} periodos asignados
                    </div>
                  </td>
                  <td className="p-md font-data-mono font-bold text-primary">S/ {parseFloat(cargo.monto_defecto).toFixed(2)}</td>
                  <td className="p-md">
                    <span className={`flex items-center gap-1 text-xs font-bold ${cargo.es_activo ? 'text-green-600' : 'text-on-surface-variant'}`}>
                      <span className={`w-2 h-2 rounded-full ${cargo.es_activo ? 'bg-green-500' : 'bg-outline'}`}></span>
                      {cargo.es_activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-md text-right space-x-sm">
                    <button onClick={() => handleOpenModal(cargo)} className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button onClick={() => handleDelete(cargo.id)} className="p-1.5 text-error hover:bg-error/10 rounded transition-colors">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
      {isModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-md"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-surface rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-headline-sm font-bold text-primary">
                {formData.id ? 'Editar Cargo/Multa' : 'Nuevo Cargo/Multa'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:bg-outline-variant/20 p-1 rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-lg overflow-y-auto custom-scrollbar flex-grow space-y-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tipo *</label>
                  <select 
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    className="w-full bg-surface-container border border-outline-variant rounded p-3 text-sm focus:border-primary outline-none transition-colors appearance-none"
                  >
                    <option value="Costo">Costo / Tarifa</option>
                    <option value="Multa">Multa / Infracción</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Monto Base (S/) *</label>
                  <input 
                    type="number" step="0.01" min="0" required
                    value={formData.monto_defecto}
                    onChange={(e) => setFormData({...formData, monto_defecto: e.target.value})}
                    placeholder="Ej. 50.00"
                    className="w-full bg-surface-container border border-outline-variant rounded p-3 text-sm font-data-mono focus:border-primary outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Descripción del Concepto *</label>
                  <input 
                    type="text" required
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    placeholder="Ej. Cuota Extraordinaria Asamblea 2026"
                    className="w-full bg-surface-container border border-outline-variant rounded p-3 text-sm focus:border-primary outline-none transition-colors"
                  />
                </div>
                <div className="md:col-span-2 pt-2 border-t border-outline-variant/30 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer w-fit">
                    <div className={`w-10 h-6 rounded-full relative shadow-inner transition-colors ${formData.es_activo ? 'bg-primary' : 'bg-surface-container-high'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${formData.es_activo ? 'right-1' : 'left-1'}`}></div>
                    </div>
                    <span className="text-sm font-bold text-on-surface">Activo (Disponible para uso)</span>
                  </label>
                </div>
              </div>

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
                      onClick={() => setFormData(prev => ({ ...prev, periodos_ids: periodos.map(p => p.id) }))}
                      className="text-[10px] uppercase font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors"
                    >
                      Marcar Todos
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, periodos_ids: [] }))}
                      className="text-[10px] uppercase font-bold text-on-surface-variant hover:bg-surface-container-high px-2 py-1 rounded transition-colors"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
                
                <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar space-y-4 mt-md border border-outline-variant/50 p-sm rounded-lg bg-surface-container-lowest">
                  {Object.entries(
                    periodos.reduce((acc, curr) => {
                      const year = curr.mes_anio.substring(0, 4);
                      if (!acc[year]) acc[year] = [];
                      acc[year].push(curr);
                      return acc;
                    }, {})
                  )
                  .sort(([yearA], [yearB]) => yearB.localeCompare(yearA)) // Ordenar años descendente
                  .map(([year, periodosAnio]) => {
                    const allSelected = periodosAnio.every(p => formData.periodos_ids.includes(p.id));
                    const someSelected = periodosAnio.some(p => formData.periodos_ids.includes(p.id));
                    
                    return (
                      <div key={year} className="space-y-2">
                        <div className="flex justify-between items-center bg-surface-container py-1 px-2 rounded">
                          <span className="font-bold text-xs text-on-surface">Año {year}</span>
                          <button 
                            type="button"
                            onClick={() => {
                              if (allSelected) {
                                // Deselect this year
                                setFormData(prev => ({ ...prev, periodos_ids: prev.periodos_ids.filter(id => !periodosAnio.find(p => p.id === id)) }));
                              } else {
                                // Select this year
                                const newIds = new Set(formData.periodos_ids);
                                periodosAnio.forEach(p => newIds.add(p.id));
                                setFormData(prev => ({ ...prev, periodos_ids: Array.from(newIds) }));
                              }
                            }}
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
            </form>
            
            <div className="px-lg py-md border-t border-outline-variant bg-surface-container-lowest flex justify-end gap-md">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-md py-2 border border-outline-variant text-on-surface font-bold rounded-lg hover:bg-surface-container transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-md py-2 bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cargo'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default CargosSettingsTab;
