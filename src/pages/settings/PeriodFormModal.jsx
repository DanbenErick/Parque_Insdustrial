import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../api/axiosConfig';
import { useYear } from '../../context/YearContext';

const monthNames = [
  { val: '01', name: 'Enero' },
  { val: '02', name: 'Febrero' },
  { val: '03', name: 'Marzo' },
  { val: '04', name: 'Abril' },
  { val: '05', name: 'Mayo' },
  { val: '06', name: 'Junio' },
  { val: '07', name: 'Julio' },
  { val: '08', name: 'Agosto' },
  { val: '09', name: 'Septiembre' },
  { val: '10', name: 'Octubre' },
  { val: '11', name: 'Noviembre' },
  { val: '12', name: 'Diciembre' }
];

const PeriodFormModal = ({ isOpen, onClose, onSuccess, initialData = null, existentes = [] }) => {
  const { activeYear } = useYear();
  const isEditing = !!initialData;
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [mes, setMes] = useState('01');
  const [tarifaKwh, setTarifaKwh] = useState('');
  const [tarifaKwhPunta, setTarifaKwhPunta] = useState('');
  const [tarifaMantenimientoNormal, setTarifaMantenimientoNormal] = useState('');
  const [tarifaMantenimientoTiempoReal, setTarifaMantenimientoTiempoReal] = useState('');
  const [factorMultiplicador, setFactorMultiplicador] = useState('1.0000');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Load defaults or initial data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Editing Mode
        const parts = initialData.mes_anio.split('-');
        // Depending on format YYYY-MM or MM-YYYY
        const m = parts[0].length === 4 ? parts[1] : parts[0];
        setMes(m);
        setTarifaKwh(initialData.tarifa_kwh);
        setTarifaKwhPunta(initialData.tarifa_kwh_punta || '');
        setTarifaMantenimientoNormal(initialData.tarifa_mantenimiento_normal);
        setTarifaMantenimientoTiempoReal(initialData.tarifa_mantenimiento_tiempo_real);
        setFactorMultiplicador(initialData.factor_multiplicador || '1.0000');
        setFechaInicio(initialData.fecha_inicio ? initialData.fecha_inicio.split('T')[0] : '');
        setFechaFin(initialData.fecha_fin ? initialData.fecha_fin.split('T')[0] : '');
      } else {
        // Creation Mode
        const currentMonthStr = (new Date().getMonth() + 1).toString().padStart(2, '0');
        
        let initialMes = currentMonthStr;
        if (existentes.some(p => p.mes_anio.endsWith(`-${currentMonthStr}`))) {
          const firstAvailable = monthNames.find(m => !existentes.some(p => p.mes_anio.endsWith(`-${m.val}`)));
          if (firstAvailable) initialMes = firstAvailable.val;
        }

        setMes(initialMes);
        setTarifaKwh('');
        setTarifaKwhPunta('');
        setTarifaMantenimientoNormal('');
        setTarifaMantenimientoTiempoReal('');
        setFactorMultiplicador('1.0000');
        
        // Predeterminar inicio y fin del mes actual
        if (initialMes) {
          setFechaInicio(`${activeYear}-${initialMes}-01`);
          const lastDay = new Date(activeYear, parseInt(initialMes), 0).getDate();
          setFechaFin(`${activeYear}-${initialMes}-${lastDay}`);
        }
      }
    }
  }, [isOpen, initialData, activeYear, existentes]);

  // Update fechas cuando cambia el mes en creación
  const handleMesChange = (e) => {
    const selectedMes = e.target.value;
    setMes(selectedMes);
    if (!isEditing) {
      setFechaInicio(`${activeYear}-${selectedMes}-01`);
      const lastDay = new Date(activeYear, parseInt(selectedMes), 0).getDate();
      setFechaFin(`${activeYear}-${selectedMes}-${lastDay}`);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!tarifaKwh || !tarifaMantenimientoNormal || !fechaInicio || !fechaFin) {
      return toast.error("Todos los campos son obligatorios.");
    }

    setIsSaving(true);
    const payload = {
      mes_anio: `${activeYear}-${mes}`,
      tarifa_kwh: parseFloat(tarifaKwh),
      tarifa_kwh_punta: tarifaKwhPunta ? parseFloat(tarifaKwhPunta) : 0,
      tarifa_mantenimiento_normal: parseFloat(tarifaMantenimientoNormal),
      tarifa_mantenimiento_tiempo_real: parseFloat(tarifaMantenimientoNormal),
      factor_multiplicador: parseFloat(factorMultiplicador),
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    };

    try {
      if (isEditing) {
        await api.put(`/periodos/${initialData.id}`, payload);
        toast.success("Periodo actualizado correctamente");
      } else {
        await api.post('/periodos', payload);
        toast.success("Periodo creado correctamente");
      }
      onSuccess(); // Llamar callback para recargar datos
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Error al guardar el periodo");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        >
          <div
            className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant"
          >
            <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center bg-surface relative">

              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <span className="material-symbols-outlined">{isEditing ? 'edit_calendar' : 'calendar_add_on'}</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface tracking-tight leading-none">
                  {isEditing ? 'Modificar Periodo' : 'Aperturar Nuevo Periodo'}
                </h3>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                title="Cerrar modal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Mes a Aperturar</label>
                  <select 
                    value={mes}
                    onChange={handleMesChange}
                    disabled={isEditing}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm font-bold text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50 disabled:bg-surface-container shadow-sm"
                  >
                    {monthNames.map(m => {
                      const yaCreado = existentes.some(p => p.mes_anio.endsWith(`-${m.val}`));
                      const isCurrentEditing = isEditing && initialData?.mes_anio.endsWith(`-${m.val}`);
                      return (
                        <option key={m.val} value={m.val} disabled={yaCreado && !isCurrentEditing}>
                          {m.name} {yaCreado && !isCurrentEditing ? '(Ya existe)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Año (Global)</label>
                  <input 
                    type="text" 
                    value={activeYear}
                    disabled
                    className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm font-bold text-on-surface opacity-70 cursor-not-allowed shadow-sm"
                  />
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 grid grid-cols-2 gap-3 shadow-inner">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Tarifa Energía (S/ por kWh)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant text-xs">S/</span>
                    <input 
                      type="number" 
                      step="0.0001"
                      required
                      value={tarifaKwh}
                      onChange={(e) => setTarifaKwh(e.target.value)}
                      placeholder="0.00" 
                      className="w-full bg-white border border-primary/30 rounded-lg pl-7 pr-3 py-1.5 text-sm font-data-mono font-bold text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Tarifa Punta (S/ por kWh)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant text-xs">S/</span>
                    <input 
                      type="number" 
                      step="0.0001"
                      value={tarifaKwhPunta}
                      onChange={(e) => setTarifaKwhPunta(e.target.value)}
                      placeholder="0.00" 
                      className="w-full bg-white border border-primary/30 rounded-lg pl-7 pr-3 py-1.5 text-sm font-data-mono font-bold text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Cuota Mantenimiento</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant text-xs">S/</span>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={tarifaMantenimientoNormal}
                      onChange={(e) => setTarifaMantenimientoNormal(e.target.value)}
                      placeholder="0.00" 
                      className="w-full bg-white border border-primary/30 rounded-lg pl-7 pr-3 py-1.5 text-sm font-data-mono font-bold text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Fecha Inicio Lectura</label>
                  <input 
                    type="date" 
                    required
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm font-bold text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-sm"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Fecha Fin Lectura</label>
                  <input 
                    type="date" 
                    required
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm font-bold text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant mt-2">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg font-bold text-sm text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-6 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {isSaving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                      Guardando
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">{isEditing ? 'save' : 'add_circle'}</span>
                      {isEditing ? 'Actualizar' : 'Aperturar'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        )}
    </>
  );
};

export default PeriodFormModal;
