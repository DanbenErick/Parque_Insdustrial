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
  const [costoPotencia, setCostoPotencia] = useState('');
  const [factorMultiplicador, setFactorMultiplicador] = useState('1.0000');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [fechaInicioLectura, setFechaInicioLectura] = useState('');
  const [fechaFinLectura, setFechaFinLectura] = useState('');
  const [fechaEmision, setFechaEmision] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [fechaCorte, setFechaCorte] = useState('');

  // Load defaults or initial data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Editing Mode
        const parts = initialData.mes_anio.split('-');
        const m = parts[0].length === 4 ? parts[1] : parts[0];
        setMes(m);
        setTarifaKwh(initialData.tarifa_kwh);
        setTarifaKwhPunta(initialData.tarifa_kwh_punta || '');
        setTarifaMantenimientoNormal(initialData.tarifa_mantenimiento_normal || '');
        setTarifaMantenimientoTiempoReal(initialData.tarifa_mantenimiento_tiempo_real || '');
        setCostoPotencia(initialData.costo_potencia || '');
        setFactorMultiplicador(initialData.factor_multiplicador || '1.0000');
        setFechaInicio(initialData.fecha_inicio ? initialData.fecha_inicio.split('T')[0] : '');
        setFechaFin(initialData.fecha_fin ? initialData.fecha_fin.split('T')[0] : '');
        setFechaInicioLectura(initialData.fecha_inicio_lectura ? initialData.fecha_inicio_lectura.split('T')[0] : '');
        setFechaFinLectura(initialData.fecha_fin_lectura ? initialData.fecha_fin_lectura.split('T')[0] : '');
        setFechaEmision(initialData.fecha_emision_recibo ? initialData.fecha_emision_recibo.split('T')[0] : '');
        setFechaVencimiento(initialData.fecha_vencimiento ? initialData.fecha_vencimiento.split('T')[0] : '');
        setFechaCorte(initialData.fecha_corte ? initialData.fecha_corte.split('T')[0] : '');
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
        setCostoPotencia('');
        setFactorMultiplicador('1.0000');
        setFechaInicio('');
        setFechaFin('');
        setFechaEmision('');
        setFechaVencimiento('');
        setFechaCorte('');
        
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

  const handleEmisionChange = (e) => {
    const newEmision = e.target.value;
    setFechaEmision(newEmision);
    
    if (newEmision && !isEditing) {
      const emisionDate = new Date(newEmision);
      // Validar que la fecha sea válida antes de calcular
      if (!isNaN(emisionDate.getTime())) {
        const vencimientoDate = new Date(emisionDate);
        vencimientoDate.setDate(emisionDate.getDate() + 6);
        
        const corteDate = new Date(emisionDate);
        corteDate.setDate(emisionDate.getDate() + 7);
        
        setFechaVencimiento(vencimientoDate.toISOString().split('T')[0]);
        setFechaCorte(corteDate.toISOString().split('T')[0]);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!tarifaKwh || !fechaInicio || !fechaFin || !fechaEmision || !fechaVencimiento || !fechaCorte) {
      return toast.error("Todos los campos son obligatorios.");
    }

    setIsSaving(true);
    const payload = {
      mes_anio: `${activeYear}-${mes}`,
      tarifa_kwh: parseFloat(tarifaKwh),
      tarifa_kwh_punta: tarifaKwhPunta ? parseFloat(tarifaKwhPunta) : 0,
      costo_potencia: costoPotencia ? parseFloat(costoPotencia) : 0,
      tarifa_mantenimiento_normal: tarifaMantenimientoNormal ? parseFloat(tarifaMantenimientoNormal) : 0,
      tarifa_mantenimiento_tiempo_real: tarifaMantenimientoTiempoReal ? parseFloat(tarifaMantenimientoTiempoReal) : 0,
      factor_multiplicador: parseFloat(factorMultiplicador) || 1.0000,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      fecha_emision_recibo: fechaEmision,
      fecha_vencimiento: fechaVencimiento,
      fecha_corte: fechaCorte
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
            className="bg-surface w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant"
          >
            <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-[24px]">{isEditing ? 'edit_calendar' : 'calendar_add_on'}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface tracking-tight leading-none mb-1">
                    {isEditing ? 'Modificar Periodo' : 'Aperturar Nuevo Periodo'}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium">
                    Configure las tarifas y el cronograma de facturación
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors shadow-sm relative z-10 border border-outline-variant/50"
                title="Cerrar modal"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar bg-surface-container-lowest/50">
              
              {/* Sección: Identificación del Periodo */}
              <div className="bg-surface border border-outline-variant rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-1.5 ml-2">
                  <span className="material-symbols-outlined text-[14px]">event</span>
                  Identificación del Periodo
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 flex items-center gap-2 ml-2">
                      Periodo a Aperturar
                      <span className="bg-surface-container-highest px-2 py-0.5 rounded-md text-[9px] flex items-center gap-1 opacity-70">
                        <span className="material-symbols-outlined text-[10px]">lock</span> {activeYear}
                      </span>
                    </label>
                    <div className="relative ml-2">
                      <select 
                        value={mes}
                        onChange={handleMesChange}
                        disabled={isEditing}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-3 pr-8 py-2.5 text-sm font-bold text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:bg-surface-container shadow-sm appearance-none"
                      >
                        {monthNames.map(m => {
                          const yaCreado = existentes.some(p => p.mes_anio.endsWith(`-${m.val}`));
                          const isCurrentEditing = isEditing && initialData?.mes_anio.endsWith(`-${m.val}`);
                          return (
                            <option key={m.val} value={m.val} disabled={yaCreado && !isCurrentEditing}>
                              {m.name} {activeYear} {yaCreado && !isCurrentEditing ? '(Ya existe)' : ''}
                            </option>
                          );
                        })}
                      </select>
                      <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección: Tarifas y Costos */}
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-5 shadow-inner relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">payments</span>
                  Tarifas y Costos
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                  <div className="flex flex-col bg-surface/60 backdrop-blur-sm p-3 rounded-xl border border-white/40 shadow-sm hover:shadow-md transition-shadow">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">bolt</span> Energía (kWh)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant text-sm">S/</span>
                      <input 
                        type="number" 
                        step="0.0001"
                        required
                        value={tarifaKwh}
                        onChange={(e) => setTarifaKwh(e.target.value)}
                        placeholder="0.00" 
                        className="w-full bg-surface border border-outline-variant rounded-lg pl-8 pr-3 py-2 text-sm font-data-mono font-bold text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col bg-surface/60 backdrop-blur-sm p-3 rounded-xl border border-white/40 shadow-sm hover:shadow-md transition-shadow">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-orange-600">schedule</span> Punta (kWh)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant text-sm">S/</span>
                      <input 
                        type="number" 
                        step="0.0001"
                        value={tarifaKwhPunta}
                        onChange={(e) => setTarifaKwhPunta(e.target.value)}
                        placeholder="0.00" 
                        className="w-full bg-surface border border-outline-variant rounded-lg pl-8 pr-3 py-2 text-sm font-data-mono font-bold text-on-surface focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex flex-col bg-surface/60 backdrop-blur-sm p-3 rounded-xl border border-white/40 shadow-sm hover:shadow-md transition-shadow">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-purple-600">electric_meter</span> Costo Potencia (Hora Punta)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant text-sm">S/</span>
                      <input 
                        type="number" 
                        step="0.0001"
                        value={costoPotencia}
                        onChange={(e) => setCostoPotencia(e.target.value)}
                        placeholder="0.00" 
                        className="w-full bg-surface border border-outline-variant rounded-lg pl-8 pr-3 py-2 text-sm font-data-mono font-bold text-on-surface focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 shadow-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cronograma */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Fechas de Periodo */}
                <div className="bg-surface border border-outline-variant rounded-2xl p-4 shadow-sm hover:border-blue-500/30 transition-colors relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-3 flex items-center gap-1.5 ml-2">
                    <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                    Periodo de Consumo
                  </h4>
                  <div className="space-y-3 ml-2">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Inicio de Periodo</label>
                      <input 
                        type="date" 
                        required
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-sm font-bold text-on-surface focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-sm"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Fin de Periodo</label>
                      <input 
                        type="date" 
                        required
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-sm font-bold text-on-surface focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Fechas de Facturación */}
                <div className="bg-surface border border-outline-variant rounded-2xl p-4 shadow-sm hover:border-orange-500/30 transition-colors relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-3 flex items-center gap-1.5 ml-2">
                    <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                    Fechas de Facturación
                  </h4>
                  <div className="space-y-3 ml-2">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Emisión de Recibo</label>
                      <input 
                        type="date" 
                        required
                        value={fechaEmision}
                        onChange={handleEmisionChange}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-sm font-bold text-on-surface focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none shadow-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Vencimiento</label>
                        <input 
                          type="date" 
                          required
                          value={fechaVencimiento}
                          onChange={(e) => setFechaVencimiento(e.target.value)}
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-2 py-2 text-[13px] font-bold text-on-surface focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none shadow-sm"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-error uppercase tracking-wider mb-1 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">warning</span> Corte</label>
                        <input 
                          type="date" 
                          required
                          value={fechaCorte}
                          onChange={(e) => setFechaCorte(e.target.value)}
                          className="w-full bg-error/5 border border-error/20 rounded-xl px-2 py-2 text-[13px] font-bold text-error focus:border-error focus:ring-1 focus:ring-error outline-none shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex w-full gap-4 pt-6 border-t border-outline-variant mt-4">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 px-5 py-3 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors border border-outline-variant"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 transition-all"
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
