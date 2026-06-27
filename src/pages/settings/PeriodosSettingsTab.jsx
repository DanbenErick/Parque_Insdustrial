import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../api/axiosConfig';
import { useYear } from '../../context/YearContext';
import PeriodFormModal from './PeriodFormModal';
import PeriodDetailDrawer from './PeriodDetailDrawer';

const formatPeriodo = (periodoStr) => {
  if (!periodoStr) return '';
  const parts = periodoStr.split('-');
  if (parts.length !== 2) return periodoStr;
  
  let year, month;
  if (parts[0].length === 4) {
    year = parts[0];
    month = parts[1];
  } else {
    month = parts[0];
    year = parts[1];
  }
  
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const monthIndex = parseInt(month, 10) - 1;
  
  if (monthIndex >= 0 && monthIndex < 12) {
    return `${monthNames[monthIndex]} ${year}`;
  }
  return periodoStr;
};

const PeriodosSettingsTab = () => {
  const { activeYear, addYear } = useYear();
  const [periodos, setPeriodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriodo, setEditingPeriodo] = useState(null);
  const [drawerPeriodo, setDrawerPeriodo] = useState(null);

  const fetchPeriodos = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/periodos');
      setPeriodos(res.data);
    } catch (error) {
      toast.error('Error al cargar historial de periodos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriodos();
  }, []);

  const periodosFiltrados = periodos.filter(p => {
    if (!p.mes_anio) return false;
    return p.mes_anio.includes(activeYear.toString());
  }).sort((a, b) => b.mes_anio.localeCompare(a.mes_anio));

  const handleEdit = (p) => {
    setEditingPeriodo(p);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPeriodo(null);
    setIsModalOpen(true);
  };

  const handleAddYear = () => {
    const newYear = window.prompt('Ingrese el nuevo año que desea agregar (ej. 2027):');
    if (newYear && !isNaN(parseInt(newYear))) {
      addYear(newYear);
      toast.success(`Año ${newYear} seleccionado. Ahora puedes crear periodos en este año.`);
    }
  };

  return (
    <div className="animate-in fade-in space-y-4">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-base font-bold text-on-surface mb-1">Periodos de Facturación</h3>
          <p className="text-[11px] text-on-surface-variant">
            Historial de tarifas aplicadas por mes en el año {activeYear}. 
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleAddYear}
            className="flex items-center gap-1.5 bg-surface-container-high text-on-surface px-3 py-1.5 h-8 rounded-md text-xs font-bold shadow-sm hover:bg-surface-container-highest transition-colors border border-outline-variant"
          >
            <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
            Nuevo Año
          </button>
          <button 
            onClick={handleCreate}
            className="flex items-center gap-1.5 bg-primary text-on-primary px-3 py-1.5 h-8 rounded-md text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            Nuevo Periodo
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 flex justify-center items-center">
            <span className="material-symbols-outlined animate-spin text-primary text-[32px]">sync</span>
          </div>
        ) : periodosFiltrados.length === 0 ? (
          <div className="p-10 flex flex-col items-center justify-center text-on-surface-variant text-center gap-4 bg-surface-container-lowest">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[32px]">calendar_month</span>
            </div>
            <div>
              <p className="font-bold text-lg text-on-surface">No hay periodos en {activeYear}</p>
              <p className="text-sm max-w-md mx-auto mt-2">Apertura el primer periodo de este año para comenzar a registrar lecturas y generar facturas.</p>
            </div>
            <button 
              onClick={handleCreate}
              className="mt-2 px-6 py-2 bg-surface-container-high hover:bg-surface-container-highest rounded-full text-sm font-bold transition-colors"
            >
              Crear Periodo
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-[10px] uppercase tracking-wider">
                  <th className="py-2 px-4 font-bold text-on-surface-variant">Mes/Año</th>
                  <th className="py-2 px-4 font-bold text-on-surface-variant">Tarifa kWh</th>
                  <th className="py-2 px-4 font-bold text-on-surface-variant">Potencia</th>
                  <th className="py-2 px-4 font-bold text-on-surface-variant">Inicio / Fin</th>
                  <th className="py-2 px-4 font-bold text-on-surface-variant">Registrado por</th>
                  <th className="py-2 px-4 font-bold text-on-surface-variant text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-xs">
                {periodosFiltrados.map((p) => (
                  <tr 
                    key={p.id} 
                    className="hover:bg-surface-container-lowest transition-colors cursor-pointer group"
                    onClick={() => setDrawerPeriodo(p)}
                  >
                    <td className="py-2.5 px-4">
                      <span className="font-bold text-primary group-hover:underline">{formatPeriodo(p.mes_anio)}</span>
                    </td>
                    <td className="py-2.5 px-4 font-data-mono font-bold">
                      S/ {Number(p.tarifa_kwh).toFixed(4)}
                    </td>
                    <td className="py-2.5 px-4 font-data-mono font-bold text-purple-600">
                      S/ {Number(p.costo_potencia || 0).toFixed(4)}
                    </td>
                    <td className="py-2.5 px-4 text-[11px] text-on-surface-variant">
                      {new Date(p.fecha_inicio).toLocaleDateString()} <span className="mx-1 opacity-70 font-medium">/</span> {new Date(p.fecha_fin).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-4 text-[11px] font-medium text-on-surface-variant truncate max-w-[120px]" title={p.creador_nombre || 'Sistema'}>
                      {p.creador_nombre ? p.creador_nombre.split(' ')[0] : 'Sistema'}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                        title="Editar Periodo"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PeriodFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingPeriodo}
        onSuccess={fetchPeriodos}
        existentes={periodos}
      />

      <PeriodDetailDrawer 
        drawerPeriodo={drawerPeriodo}
        setDrawerPeriodo={setDrawerPeriodo}
        handleEdit={(p) => {
          setEditingPeriodo(p);
          setIsModalOpen(true);
        }}
      />
    </div>
  );
};

export default PeriodosSettingsTab;
