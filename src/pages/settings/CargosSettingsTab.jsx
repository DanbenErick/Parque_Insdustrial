import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import api from '../../api/axiosConfig';
import CargoFormModal from './CargoFormModal';

// --- Constant: avoids duplicating the initial form state ---
const INITIAL_FORM_DATA = {
  id: null,
  tipo: 'Costo',
  descripcion: '',
  monto_defecto: '',
  es_activo: true,
  es_global: false,
  periodos_ids: [],
};

const CargosSettingsTab = () => {
  const [cargos, setCargos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // --- useCallback: stable reference for fetchData ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cargosRes, periodosRes] = await Promise.all([
        api.get('/catalogo-cargos'),
        api.get('/periodos'),
      ]);
      setCargos(cargosRes.data);
      setPeriodos(periodosRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Memoized: pre-format monto for each cargo row ---
  const formattedCargos = useMemo(() =>
    cargos.map(cargo => ({
      ...cargo,
      montoFormateado: parseFloat(cargo.monto_defecto).toFixed(2),
    })),
  [cargos]);

  const handleOpenModal = useCallback((cargo = null) => {
    if (cargo) {
      setFormData({
        id: cargo.id,
        tipo: cargo.tipo,
        descripcion: cargo.descripcion,
        monto_defecto: cargo.monto_defecto,
        es_activo: cargo.es_activo === 1 || cargo.es_activo === true,
        es_global: cargo.es_global === 1 || cargo.es_global === true,
        periodos_ids: cargo.periodos_ids || [],
      });
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.descripcion || !formData.monto_defecto) {
      return toast.error('Complete los campos obligatorios');
    }

    setIsSubmitting(true);
    try {
      const payload = {
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        monto_defecto: parseFloat(formData.monto_defecto),
        es_activo: formData.es_activo,
        es_global: formData.es_global,
        periodos_ids: formData.es_global ? [] : formData.periodos_ids,
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
  }, [formData, fetchData]);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('¿Está seguro de eliminar este cargo?')) {
      try {
        await api.delete(`/catalogo-cargos/${id}`);
        toast.success('Cargo eliminado');
        fetchData();
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  }, [fetchData]);

  if (isLoading) {
    return <div className="p-8 text-center text-on-surface-variant animate-pulse">Cargando catálogo...</div>;
  }

  return (
    <div className="animate-in fade-in space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-on-surface mb-1">Catálogo de Costos y Multas</h3>
          <p className="text-[11px] text-on-surface-variant">
            Crea cargos o multas personalizadas y asígnalas a los periodos en los que estarán disponibles.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-3 py-1.5 h-8 bg-primary text-on-primary text-xs font-bold rounded-md shadow-sm hover:opacity-90 active:scale-95 flex items-center gap-1 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Nuevo Cargo
        </button>
      </div>

      {/* Table */}
      <div className="border border-outline-variant rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
              <th className="py-2 px-4">Tipo</th>
              <th className="py-2 px-4">Descripción</th>
              <th className="py-2 px-4">Monto Base</th>
              <th className="py-2 px-4">Estado</th>
              <th className="py-2 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50">
            {formattedCargos.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-4 px-4 text-center text-[11px] text-on-surface-variant italic">
                  No hay cargos o multas configuradas.
                </td>
              </tr>
            ) : (
              formattedCargos.map(cargo => (
                <tr key={cargo.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cargo.tipo === 'Multa' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                      {cargo.tipo}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-on-surface text-xs">
                    {cargo.descripcion}
                    <div className="text-[10px] text-on-surface-variant font-normal mt-0.5">
                      {(cargo.es_global === 1 || cargo.es_global === true) 
                        ? <span className="text-primary font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">public</span> Global (Todos)</span>
                        : `${cargo.periodos_ids?.length || 0} periodos asignados`}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-data-mono font-bold text-primary text-xs">S/ {cargo.montoFormateado}</td>
                  <td className="py-2.5 px-4">
                    <span className={`flex items-center gap-1 text-[11px] font-bold ${cargo.es_activo ? 'text-green-600' : 'text-on-surface-variant'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cargo.es_activo ? 'bg-green-500' : 'bg-outline'}`}></span>
                      {cargo.es_activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right space-x-1">
                    <button onClick={() => handleOpenModal(cargo)} className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors">
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button onClick={() => handleDelete(cargo.id)} className="p-1.5 text-error hover:bg-error/10 rounded-md transition-colors">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal — isolated in its own component to prevent table re-renders on form input */}
      
        {isModalOpen && (
          <CargoFormModal
            formData={formData}
            setFormData={setFormData}
            periodos={periodos}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      
    </div>
  );
};

export default CargosSettingsTab;
