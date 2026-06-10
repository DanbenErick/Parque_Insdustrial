import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '../api/axiosConfig';
import { useYear } from '../context/YearContext';
import PeriodFormModal from './PeriodFormModal';

const formatPeriodo = (periodoStr) => {
  if (!periodoStr) return '';
  // Support both YYYY-MM and MM-YYYY formats
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
    return `${monthNames[monthIndex]}`;
  }
  return periodoStr;
};

const ManualBilling = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [currentReading, setCurrentReading] = useState('');
  const [currentReadingPunta, setCurrentReadingPunta] = useState('');
  const [factorPotencia, setFactorPotencia] = useState('');
  const [precioFactorPotencia, setPrecioFactorPotencia] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [medidores, setMedidores] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [activePeriodo, setActivePeriodo] = useState(null);
  const [lecturas, setLecturas] = useState([]); // Lecturas reales de la DB
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [editReadingVal, setEditReadingVal] = useState('');
  const [editReadingValPunta, setEditReadingValPunta] = useState('');
  const [editFactorPotencia, setEditFactorPotencia] = useState('');
  const [editPrecioFactorPotencia, setEditPrecioFactorPotencia] = useState('');
  const [editJustificacion, setEditJustificacion] = useState('');
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const { activeYear } = useYear();
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);

  // Filtramos periodos por el año global activo y los ordenamos cronológicamente
  const periodosFiltrados = periodos.filter(p => {
    if (!p.mes_anio) return false;
    return p.mes_anio.includes(activeYear.toString());
  }).sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));

  const fetchPeriodos = async () => {
    try {
      const res = await api.get('/periodos');
      setPeriodos(res.data);
    } catch (error) {
      toast.error('Error al cargar periodos');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medidoresRes, periodosRes, lecturasRes] = await Promise.all([
          api.get('/medidores'),
          api.get('/periodos'),
          api.get('/lecturas')
        ]);
        
        setMedidores(medidoresRes.data);
        setPeriodos(periodosRes.data);
        setLecturas(lecturasRes.data);
      } catch (error) {
        toast.error('Error al cargar datos iniciales');
      }
    };
    
    fetchData();
  }, []);

  // Seleccionar automáticamente el último periodo del año activo cuando cambien los datos o el año
  useEffect(() => {
    if (periodosFiltrados.length > 0) {
      // Tomamos el último periodo del año
      setActivePeriodo(periodosFiltrados[periodosFiltrados.length - 1]);
    } else {
      setActivePeriodo(null);
    }
  }, [activeYear, periodos.length]);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setSelectedMember(null);
  };

  const getFilteredMedidores = () => {
    if (searchTerm.trim() === '') return medidores;
    const termLower = searchTerm.toLowerCase();
    return medidores.filter(m => 
      (m.propietario && m.propietario.toLowerCase().includes(termLower)) || 
      (m.documento_identidad && m.documento_identidad.includes(searchTerm)) || 
      (m.num_serie && m.num_serie.toLowerCase().includes(termLower))
    );
  };

  const currentSearchResults = getFilteredMedidores();

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setSearchTerm(member.propietario || member.num_serie);
    setSearchResults([]);
    setCurrentReading('');
    setCurrentReadingPunta('');
    setFactorPotencia('');
    setPrecioFactorPotencia('');
  };

  const handleEditFromTable = (record) => {
    setEditModalData(record);
    setEditReadingVal(record.lectura_actual);
    setEditReadingValPunta(record.lectura_actual_punta || '');
    setEditFactorPotencia(record.factor_potencia || '');
    setEditPrecioFactorPotencia(record.precio_factor_potencia || '');
    setEditJustificacion('');
    setIsModalOpen(false); // Cerramos el historial completo si estaba abierto
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentReading || !selectedMember || !activePeriodo) return;

    setIsSaving(true);
    
    try {
      const payload = {
        medidor_id: selectedMember.id,
        periodo_id: activePeriodo.id,
        lectura_anterior: parseFloat(selectedMember.ultima_lectura || 0),
        lectura_actual: parseFloat(currentReading),
        lectura_anterior_punta: parseFloat(selectedMember.ultima_lectura_punta || 0),
        lectura_actual_punta: currentReadingPunta ? parseFloat(currentReadingPunta) : 0,
        factor_potencia: factorPotencia ? parseFloat(factorPotencia) : 0,
        precio_factor_potencia: precioFactorPotencia ? parseFloat(precioFactorPotencia) : 0,
        estado: 'Validado'
      };

      await api.post('/lecturas', payload);
      
      // Actualizar la lista de lecturas global
      const newLectura = {
        id: Date.now(), // ID temporal hasta recargar
        propietario: selectedMember.propietario,
        num_serie: selectedMember.num_serie,
        lectura_anterior: parseFloat(selectedMember.ultima_lectura || 0),
        lectura_actual: parseFloat(currentReading),
        periodo: activePeriodo.mes_anio,
        fecha_registro: new Date().toISOString()
      };
      
      setLecturas(prev => [newLectura, ...prev]);
      toast.success('Lectura guardada con éxito');
      
      // Actualizar el medidor en el estado local para que refleje la nueva lectura si lo buscan de nuevo
      setMedidores(medidores.map(m => 
        m.id === selectedMember.id 
          ? { ...m, ultima_lectura: currentReading }
          : m
      ));

      setSelectedMember(null);
      setSearchTerm('');
      setCurrentReading('');
      setCurrentReadingPunta('');
      setFactorPotencia('');
      setPrecioFactorPotencia('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar la lectura');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateLectura = async (e) => {
    e.preventDefault();
    if (!editReadingVal || !editModalData || !editJustificacion) return;

    setIsSaving(true);
    
    try {
      const payload = {
        lectura_anterior: parseFloat(editModalData.lectura_anterior || 0),
        lectura_actual: parseFloat(editReadingVal),
        lectura_anterior_punta: parseFloat(editModalData.lectura_anterior_punta || 0),
        lectura_actual_punta: editReadingValPunta ? parseFloat(editReadingValPunta) : 0,
        factor_potencia: editFactorPotencia ? parseFloat(editFactorPotencia) : 0,
        justificacion: editJustificacion,
        estado: 'Validado'
      };

      await api.put(`/lecturas/${editModalData.id}`, payload);
      
      // Actualizar la lectura en la lista global
      setLecturas(prev => prev.map(l => 
        l.id === editModalData.id 
          ? { 
              ...l, 
              lectura_actual: parseFloat(editReadingVal), 
              lectura_actual_punta: editReadingValPunta ? parseFloat(editReadingValPunta) : 0,
              factor_potencia: editFactorPotencia ? parseFloat(editFactorPotencia) : 0,
              fecha_registro: new Date().toISOString() 
            } 
          : l
      ));
      
      // Actualizar el medidor en el estado local (si coincide con la vista actual)
      setMedidores(medidores.map(m => 
        m.num_serie === editModalData.num_serie 
          ? { ...m, ultima_lectura: editReadingVal }
          : m
      ));

      setEditModalData(null);
      toast.success('Lectura modificada y justificada con éxito');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al actualizar la lectura');
    } finally {
      setIsSaving(false);
    }
  };

  const lecturasPeriodoActivo = lecturas.filter(l => activePeriodo && l.periodo === activePeriodo.mes_anio);
  const totalRegistrados = lecturasPeriodoActivo.length;
  const totalMedidores = medidores.length;
  // Limitar el porcentaje al 100% en caso de registros antiguos duplicados
  const porcentajeAvance = totalMedidores > 0 ? Math.min(100, Math.round((totalRegistrados / totalMedidores) * 100)) : 0;
  
  // Calcular circunferencia para el SVG (r=20 -> 2*PI*20 = ~125.6)
  const dashOffset = 125.6 - (125.6 * porcentajeAvance) / 100;
  
  const lecturaExistente = selectedMember ? lecturasPeriodoActivo.find(l => l.num_serie === selectedMember.num_serie) : null;

  return (
    <main className="p-4 md:p-xl space-y-4 md:space-y-lg max-w-[1600px] mx-auto w-full flex-grow relative flex flex-col h-full">
        <div className="space-y-lg w-full">
          
          <div className="mb-md flex flex-col md:flex-row justify-between md:items-end gap-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold">Registro de Lectura</h2>
              <p className="font-body-md text-on-surface-variant">Busca el medidor e ingresa el consumo actual.</p>
              {activePeriodo && periodosFiltrados.length > 0 ? (
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Mes a lecturar:</span>
                  <div className="relative inline-flex items-center bg-surface border border-outline-variant rounded-lg hover:border-primary/50 transition-colors shadow-sm">
                    <select
                      id="periodoSelect"
                      value={activePeriodo.id}
                      onChange={(e) => {
                        const selected = periodosFiltrados.find(p => p.id === parseInt(e.target.value));
                        if (selected) setActivePeriodo(selected);
                        // Limpiar formulario al cambiar de mes
                        setSelectedMember(null);
                        setSearchTerm('');
                        setCurrentReading('');
                        setCurrentReadingPunta('');
                        setFactorPotencia('');
                      }}
                      className="appearance-none bg-transparent border-none py-2 pl-3 pr-9 text-base font-bold text-primary cursor-pointer focus:outline-none focus:ring-0"
                    >
                      {periodosFiltrados.map(p => (
                        <option key={p.id} value={p.id}>{formatPeriodo(p.mes_anio)}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-2 text-primary pointer-events-none text-[18px]">
                      calendar_month
                    </span>
                  </div>
                  <button
                    onClick={() => setIsPeriodModalOpen(true)}
                    className="p-1.5 ml-1 text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center"
                    title="Aperturar nuevo periodo"
                  >
                    <span className="material-symbols-outlined text-[24px]">add_circle</span>
                  </button>
                </div>
              ) : (
                <div className="mt-4 flex flex-col items-start gap-3">
                  <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-lg text-sm">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    No hay periodos creados para el año {activeYear}
                  </div>
                  <button
                    onClick={() => setIsPeriodModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl font-bold shadow hover:opacity-90 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    Aperturar Primer Periodo
                  </button>
                </div>
              )}
            </div>
            {/* KPI Cards */}
            <div className="flex gap-md">
              <div className="bg-surface border border-outline-variant rounded-xl p-md flex items-center gap-md shadow-sm min-w-[200px]">
                <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                        <circle className="text-outline-variant" strokeWidth="4" stroke="currentColor" fill="transparent" r="20" cx="24" cy="24" />
                        <circle className="text-primary transition-all duration-1000 ease-out" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset={dashOffset} stroke="currentColor" fill="transparent" r="20" cx="24" cy="24" strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-on-surface">{porcentajeAvance}%</span>
                </div>
                <div>
                  <p className="font-label-caps text-[10px] text-secondary uppercase tracking-wider">Avance del Mes</p>
                  <p className="font-data-mono text-headline-sm text-on-surface font-bold">{totalRegistrados} <span className="text-sm font-normal text-on-surface-variant">/ {totalMedidores}</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
            
            {/* Left Column: Search & Form */}
            <div className="lg:col-span-7 space-y-lg">
              {/* 1. Panel de Búsqueda */}
              <div className="bg-surface border border-outline-variant rounded-xl shadow-sm p-md md:p-lg relative z-30">
                <label className="font-label-caps text-[11px] text-secondary uppercase tracking-widest block mb-xs">Búsqueda Rápida</label>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-[28px]">search</span>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={handleSearch}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => {
                          // Pequeño timeout para permitir que el click en el dropdown registre
                          setTimeout(() => setIsSearchFocused(false), 200);
                        }}
                        placeholder="Ej. Nombre, RUC, o Serie (ENG-...)" 
                        className="w-full bg-surface-container-lowest border-2 border-primary/20 rounded-xl pl-14 pr-4 py-4 text-lg font-bold text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner"
                    />
                </div>
                
                {/* Search Results Dropdown */}
                {isSearchFocused && currentSearchResults.length > 0 && !selectedMember && (
                  <div className="absolute left-0 right-0 mt-2 mx-md md:mx-lg bg-surface border-2 border-primary rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto animate-in slide-in-from-top-2 fade-in">
                    <ul className="divide-y divide-outline-variant">
                      {currentSearchResults.map((member) => (
                        <li 
                          key={member.id} 
                          onClick={() => handleSelectMember(member)}
                          className="p-md hover:bg-primary/10 cursor-pointer transition-colors flex justify-between items-center group"
                        >
                          <div>
                            <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{member.propietario}</p>
                            <p className="text-xs text-on-surface-variant mt-1">
                              RUC/DNI: <span className="font-data-mono">{member.documento_identidad}</span> | Dirección: {member.direccion || 'No registrada'}
                            </p>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex gap-1">
                                <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${member.tipo === 'Tiempo Real' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                                  {member.tipo || 'Normal'}
                                </span>
                                <span className="bg-surface-container-low px-2 py-1 rounded border border-outline-variant text-[10px] font-data-mono text-on-surface-variant">
                                  {member.num_serie}
                                </span>
                              </div>
                              <span className="text-[10px] text-primary font-bold">Ult: {member.ultima_lectura} W</span>
                            </div>
                            <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-2 align-middle">
                              chevron_right
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {searchTerm.length > 0 && currentSearchResults.length === 0 && !selectedMember && (
                  <div className="absolute left-0 right-0 mt-2 mx-md md:mx-lg bg-surface border border-outline-variant rounded-xl shadow-lg p-md text-center text-on-surface-variant animate-in fade-in">
                    No se encontraron medidores o socios que coincidan.
                  </div>
                )}
              </div>

              {/* 2. Formulario de Ingreso */}
              {selectedMember ? (
                <div className="bg-primary/5 border-2 border-primary rounded-xl shadow-lg p-md md:p-lg animate-in slide-in-from-top-4 fade-in duration-300">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-primary/20 pb-md mb-md gap-sm">
                    <div>
                      <h3 className="font-headline-sm font-bold text-on-surface">{selectedMember.propietario}</h3>
                      <p className="text-sm text-on-surface-variant mt-1">
                        DNI/RUC: <span className="font-data-mono">{selectedMember.documento_identidad}</span> | Dirección: <span className="font-bold">{selectedMember.direccion || 'No registrada'}</span>
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <div className="bg-white px-md py-sm rounded-lg border border-primary/30 flex items-center gap-2 shadow-sm">
                        <span className="material-symbols-outlined text-primary">electric_meter</span>
                        <span className="font-data-mono font-bold text-sm text-primary">{selectedMember.num_serie}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${selectedMember.tipo === 'Tiempo Real' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                        {selectedMember.tipo || 'Normal'}
                      </span>
                    </div>
                  </div>

                  {lecturaExistente ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-md flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-[32px] text-green-600">check_circle</span>
                      </div>
                      <h4 className="font-bold text-green-800 text-lg">Lectura ya Registrada</h4>
                      <p className="text-green-700 text-sm mt-1 max-w-sm">
                        Este medidor ya cuenta con una lectura guardada para el mes de <strong>{formatPeriodo(activePeriodo?.mes_anio)}</strong>.
                      </p>
                      <div className="mt-md bg-white px-md py-sm rounded-lg border border-green-200 shadow-sm inline-block">
                        <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Valor Registrado</p>
                        <p className="font-data-mono text-2xl font-bold text-green-700 mt-1">
                          {parseFloat(lecturaExistente.lectura_actual).toLocaleString('en-US', {minimumFractionDigits: 2})} W
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-lg items-end">
                      <div className="bg-surface-container-low rounded-xl p-md border border-outline-variant flex flex-col justify-center">
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Lectura Anterior</span>
                        <span className="font-data-mono text-[24px] text-on-surface opacity-70">
                          {parseFloat(selectedMember.ultima_lectura || 0).toLocaleString('en-US', {minimumFractionDigits: 2})} <span className="text-sm">kWh</span>
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex justify-between items-end mb-2">
                          <label className="text-xs font-bold text-primary uppercase tracking-wider">Lectura Actual (Ingresar kWh) {selectedMember.tipo === 'Tiempo Real' && 'Normal'}</label>
                          {activePeriodo && (
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-bold">
                              Precio: S/ {parseFloat(activePeriodo.tarifa_kwh).toFixed(4)} / kWh
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input 
                            type="number" 
                            step="0.01"
                            required
                            autoFocus
                            value={currentReading}
                            onChange={(e) => setCurrentReading(e.target.value)}
                            placeholder="0.00" 
                            className="w-full bg-white border-2 border-primary rounded-xl pl-4 pr-20 py-4 text-[28px] font-data-mono font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/20 text-right shadow-inner"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">kWh</span>
                        </div>
                      </div>

                        {/* Previsualización Consumo Normal */}
                        {currentReading && !isNaN(currentReading) && activePeriodo && (
                          <div className="md:col-span-2 bg-primary/10 rounded-lg p-sm flex justify-between items-center border border-primary/20 -mt-2">
                            <span className="text-sm font-bold text-primary">Subtotal Energía Normal:</span>
                            <div className="text-right">
                              <span className="text-xs text-on-surface-variant block">Consumo: {Math.max(0, parseFloat(currentReading) - parseFloat(selectedMember.ultima_lectura || 0)).toFixed(2)} kWh × S/ {parseFloat(activePeriodo.tarifa_kwh).toFixed(4)}</span>
                              <span className="font-data-mono font-bold text-primary">S/ {(Math.max(0, parseFloat(currentReading) - parseFloat(selectedMember.ultima_lectura || 0)) * parseFloat(activePeriodo.tarifa_kwh)).toFixed(2)}</span>
                            </div>
                          </div>
                        )}

                        {selectedMember.tipo === 'Tiempo Real' && (
                          <>
                            <div className="bg-surface-container-low rounded-xl p-md border border-outline-variant flex flex-col justify-center mt-2">
                              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Lectura Anterior Punta</span>
                              <span className="font-data-mono text-[24px] text-on-surface opacity-70">
                                {parseFloat(selectedMember.ultima_lectura_punta || 0).toLocaleString('en-US', {minimumFractionDigits: 2})} <span className="text-sm">kWh</span>
                              </span>
                            </div>

                            <div className="flex flex-col mt-2">
                              <div className="flex justify-between items-end mb-2">
                                <label className="text-xs font-bold text-primary uppercase tracking-wider">Lectura Actual Punta</label>
                                {activePeriodo && (
                                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-bold">
                                    Precio: S/ {parseFloat(activePeriodo.tarifa_kwh_punta || 0).toFixed(4)} / kWh
                                  </span>
                                )}
                              </div>
                              <div className="relative">
                                <input 
                                  type="number" 
                                  step="0.01"
                                  required
                                  value={currentReadingPunta}
                                  onChange={(e) => setCurrentReadingPunta(e.target.value)}
                                  placeholder="0.00" 
                                  className="w-full bg-white border-2 border-primary rounded-xl pl-4 pr-20 py-4 text-[28px] font-data-mono font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/20 text-right shadow-inner"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">kWh</span>
                              </div>
                            </div>

                            {/* Previsualización Consumo Punta */}
                            {currentReadingPunta && !isNaN(currentReadingPunta) && activePeriodo && (
                              <div className="md:col-span-2 bg-primary/10 rounded-lg p-sm flex justify-between items-center border border-primary/20 -mt-2">
                                <span className="text-sm font-bold text-primary">Subtotal Energía Punta:</span>
                                <div className="text-right">
                                  <span className="text-xs text-on-surface-variant block">Consumo: {Math.max(0, parseFloat(currentReadingPunta) - parseFloat(selectedMember.ultima_lectura_punta || 0)).toFixed(2)} kWh × S/ {parseFloat(activePeriodo.tarifa_kwh_punta || 0).toFixed(4)}</span>
                                  <span className="font-data-mono font-bold text-primary">S/ {(Math.max(0, parseFloat(currentReadingPunta) - parseFloat(selectedMember.ultima_lectura_punta || 0)) * parseFloat(activePeriodo.tarifa_kwh_punta || 0)).toFixed(2)}</span>
                                </div>
                              </div>
                            )}

                            <div className="md:col-span-2 flex flex-col md:flex-row gap-4 mt-2 p-md bg-orange-50 border border-orange-200 rounded-xl">
                              <div className="flex-1 flex flex-col">
                                <label className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                                  Consumo Reactivo (kVARh)
                                </label>
                                <input 
                                  type="number" 
                                  step="0.01"
                                  required
                                  value={factorPotencia}
                                  onChange={(e) => setFactorPotencia(e.target.value)}
                                  placeholder="0.00" 
                                  className="w-full bg-white border border-orange-300 rounded-lg pl-4 pr-4 py-3 text-xl font-data-mono font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-orange-500 text-right shadow-inner"
                                />
                              </div>
                              <div className="flex-1 flex flex-col">
                                <label className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[16px]">payments</span>
                                  Precio Energía Reactiva (S/)
                                </label>
                                <input 
                                  type="number" 
                                  step="0.0001"
                                  required
                                  value={precioFactorPotencia}
                                  onChange={(e) => setPrecioFactorPotencia(e.target.value)}
                                  placeholder="0.0000" 
                                  className="w-full bg-white border border-orange-300 rounded-lg pl-4 pr-4 py-3 text-xl font-data-mono font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-orange-500 text-right shadow-inner"
                                />
                              </div>
                            </div>
                            
                            {/* Previsualización Factor Potencia */}
                            {factorPotencia && precioFactorPotencia && !isNaN(factorPotencia) && !isNaN(precioFactorPotencia) && (
                              <div className="md:col-span-2 bg-orange-100 rounded-lg p-sm flex justify-between items-center border border-orange-300 -mt-2">
                                <span className="text-sm font-bold text-orange-900">Subtotal E. Reactiva:</span>
                                <div className="text-right">
                                  <span className="text-xs text-orange-800/80 block">Cálculo: {parseFloat(factorPotencia).toFixed(2)} × S/ {parseFloat(precioFactorPotencia).toFixed(4)}</span>
                                  <span className="font-data-mono font-bold text-orange-900">S/ {(parseFloat(factorPotencia) * parseFloat(precioFactorPotencia)).toFixed(2)}</span>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                      <div className="md:col-span-2 mt-sm">
                        <button 
                          type="submit" 
                          disabled={isSaving || !currentReading}
                          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-sm transition-all shadow-md ${currentReading ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'}`}
                        >
                          {isSaving ? (
                            <>
                              <span className="material-symbols-outlined animate-spin">sync</span>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined">save</span>
                              Guardar Lectura
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center text-center animate-in fade-in h-[320px]">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-md">
                    <span className="material-symbols-outlined text-[48px] text-primary">barcode_scanner</span>
                  </div>
                  <h3 className="font-headline-sm text-on-surface font-bold">Esperando Búsqueda...</h3>
                  <p className="text-sm text-on-surface-variant mt-2 max-w-sm">
                    Utiliza el buscador de arriba para encontrar un socio o medidor. El formulario de registro aparecerá aquí.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: History Summary */}
            <div className="lg:col-span-5 h-full">
              <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
                <div className="px-md py-sm bg-surface-container-low border-b border-outline-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">history</span>
                  <h4 className="font-bold text-sm text-on-surface-variant">Lecturas Registradas ({formatPeriodo(activePeriodo?.mes_anio)})</h4>
                </div>
                <div className="overflow-x-auto flex-grow">
                  <table className="w-full text-left table-auto">
                    <thead className="sticky top-0 bg-surface-container-lowest shadow-sm z-10">
                      <tr className="text-on-surface-variant border-b border-outline-variant text-[10px] uppercase tracking-wider">
                        <th className="px-md py-2">Fecha/Hora</th>
                        <th className="px-md py-2">Socio/Medidor</th>
                        <th className="px-md py-2 text-right text-primary font-bold">Lectura (W)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant text-sm">
                      {lecturasPeriodoActivo.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="px-md py-xl text-center text-on-surface-variant italic">
                            No hay lecturas registradas en este periodo.
                          </td>
                        </tr>
                      ) : (
                        lecturasPeriodoActivo.slice(0, 5).map((record) => (
                          <tr key={record.id} className="hover:bg-surface-container-lowest transition-colors group">
                            <td className="px-md py-3 text-xs text-on-surface-variant whitespace-nowrap align-top">
                              {new Date(record.fecha_registro).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-md py-3 align-top">
                              <p className="font-bold text-on-surface text-xs truncate max-w-[150px]">{record.propietario}</p>
                              <p className="text-[10px] text-on-surface-variant font-data-mono">{record.num_serie}</p>
                            </td>
                            <td className="px-md py-3 text-right align-top">
                              <div className="font-data-mono font-bold text-primary text-sm leading-tight">
                                {parseFloat(record.lectura_actual).toLocaleString('en-US', {minimumFractionDigits: 2})} W <span className="text-[9px] font-normal opacity-70">N</span>
                              </div>
                              {(parseFloat(record.lectura_actual_punta || 0) > 0 || parseFloat(record.factor_potencia || 0) > 0) && (
                                <>
                                  <div className="font-data-mono font-bold text-orange-600 text-xs mt-1 leading-tight">
                                    {parseFloat(record.lectura_actual_punta || 0).toLocaleString('en-US', {minimumFractionDigits: 2})} W <span className="text-[9px] font-normal opacity-70">P</span>
                                  </div>
                                  <div className="font-data-mono font-bold text-purple-600 text-xs mt-1 leading-tight">
                                    {parseFloat(record.factor_potencia || 0).toLocaleString('en-US', {minimumFractionDigits: 2})} kVARh
                                  </div>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {lecturasPeriodoActivo.length > 0 && (
                  <div className="p-md border-t border-outline-variant bg-surface-container-lowest">
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="w-full py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">list_alt</span>
                      Ver todas las lecturas ({lecturasPeriodoActivo.length})
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Modal de Detalle Completo */}
        <AnimatePresence>
        {isModalOpen && (() => {
          const filteredModalLecturas = lecturasPeriodoActivo.filter(record => {
            if (!modalSearchTerm.trim()) return true;
            const term = modalSearchTerm.toLowerCase();
            const fullMember = medidores.find(m => m.num_serie === record.num_serie);
            const docId = fullMember?.documento_identidad || '';
            
            return (
              (record.propietario && record.propietario.toLowerCase().includes(term)) ||
              (record.num_serie && record.num_serie.toLowerCase().includes(term)) ||
              docId.includes(term)
            );
          });

          return (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-surface w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
              >
                <div className="px-xl py-md border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-lowest rounded-t-2xl">
                  <div>
                    <h3 className="font-headline-sm text-primary font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined">list_alt</span>
                      Todas las Lecturas
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-1">Periodo: {formatPeriodo(activePeriodo?.mes_anio)} • Mostrando: {filteredModalLecturas.length}</p>
                  </div>
                  
                  <div className="flex-grow w-full md:max-w-sm md:mx-4">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                      <input 
                        type="text" 
                        value={modalSearchTerm}
                        onChange={(e) => setModalSearchTerm(e.target.value)}
                        placeholder="Buscar nombre, medidor, DNI o RUC..." 
                        className="w-full bg-surface border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setIsModalOpen(false);
                      setModalSearchTerm(''); // Reset al cerrar
                    }}
                    className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors flex-shrink-0 absolute right-4 top-4 md:static"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <div className="overflow-y-auto p-0 flex-grow">
                  <table className="w-full text-left table-auto">
                    <thead className="sticky top-0 bg-surface-container-lowest shadow-sm z-10">
                      <tr className="text-on-surface-variant border-b border-outline-variant text-xs uppercase tracking-wider">
                        <th className="px-xl py-4 font-bold">Fecha / Hora</th>
                        <th className="px-xl py-4 font-bold">Empresa / Socio</th>
                        <th className="px-xl py-4 font-bold">Medidor</th>
                        <th className="px-xl py-4 text-right text-primary font-bold">Lectura Registrada</th>
                        <th className="px-xl py-4 text-center font-bold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {filteredModalLecturas.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-xl py-12 text-center text-on-surface-variant">
                            No se encontraron lecturas que coincidan con la búsqueda.
                          </td>
                        </tr>
                      ) : (
                        filteredModalLecturas.map((record) => (
                          <tr key={record.id} className="hover:bg-surface-container-lowest transition-colors group">
                            <td className="px-xl py-3 text-sm text-on-surface-variant whitespace-nowrap">
                              {new Date(record.fecha_registro).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-xl py-3">
                              <p className="font-bold text-on-surface text-sm">{record.propietario}</p>
                            </td>
                            <td className="px-xl py-3 text-sm font-data-mono text-on-surface-variant">
                              {record.num_serie}
                            </td>
                            <td className="px-xl py-3 text-right align-top">
                              <div className="font-data-mono font-bold text-primary text-sm leading-tight">
                                {parseFloat(record.lectura_actual).toLocaleString('en-US', {minimumFractionDigits: 2})} W <span className="text-[10px] font-normal opacity-70">N</span>
                              </div>
                              {(parseFloat(record.lectura_actual_punta || 0) > 0 || parseFloat(record.factor_potencia || 0) > 0) && (
                                <>
                                  <div className="font-data-mono font-bold text-orange-600 text-xs mt-1 leading-tight">
                                    {parseFloat(record.lectura_actual_punta || 0).toLocaleString('en-US', {minimumFractionDigits: 2})} W <span className="text-[10px] font-normal opacity-70">P</span>
                                  </div>
                                  <div className="font-data-mono font-bold text-purple-600 text-xs mt-1 leading-tight">
                                    {parseFloat(record.factor_potencia || 0).toLocaleString('en-US', {minimumFractionDigits: 2})} kVARh <span className="text-[10px] font-normal opacity-70">FP</span>
                                  </div>
                                </>
                              )}
                            </td>
                            <td className="px-xl py-3 text-center align-top">
                              <button
                                onClick={() => handleEditFromTable(record)}
                                className="px-3 py-1.5 border border-outline-variant text-on-surface-variant rounded-lg hover:border-primary hover:text-primary transition-colors inline-flex items-center gap-1 opacity-0 group-hover:opacity-100"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                <span className="text-xs font-bold uppercase tracking-wider">Modificar</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
        </AnimatePresence>

        {/* Modal de Modificación de Lectura */}
        <AnimatePresence>
        {editModalData && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-surface w-full max-w-xl rounded-2xl shadow-2xl flex flex-col"
            >
              <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest rounded-t-2xl">
                <h3 className="font-headline-sm text-primary font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined">edit_note</span>
                  Modificar Lectura
                </h3>
                <button 
                  onClick={() => setEditModalData(null)}
                  className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <form onSubmit={handleUpdateLectura} className="p-lg space-y-6">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-md">
                  <p className="font-bold text-on-surface">{editModalData.propietario}</p>
                  <p className="text-sm text-on-surface-variant font-data-mono mt-1">Medidor: {editModalData.num_serie}</p>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Lectura Original: <span className="font-bold text-on-surface">{parseFloat(editModalData.lectura_actual).toLocaleString('en-US', {minimumFractionDigits: 2})} W</span>
                  </p>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Nueva Lectura (kWh) {parseFloat(editModalData.lectura_actual_punta || 0) > 0 ? 'Normal' : ''}</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      autoFocus
                      value={editReadingVal}
                      onChange={(e) => setEditReadingVal(e.target.value)}
                      placeholder="0.00" 
                      className="w-full bg-white border-2 border-primary rounded-xl pl-4 pr-20 py-3 text-[20px] font-data-mono font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/20 shadow-inner"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">kWh</span>
                  </div>
                </div>

                {(parseFloat(editModalData.lectura_actual_punta || 0) > 0 || parseFloat(editModalData.factor_potencia || 0) > 0) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">Nueva Lectura Punta</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.01"
                          required
                          value={editReadingValPunta}
                          onChange={(e) => setEditReadingValPunta(e.target.value)}
                          placeholder="0.00" 
                          className="w-full bg-white border-2 border-orange-500 rounded-xl pl-4 pr-16 py-3 text-[18px] font-data-mono font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-orange-500/20 shadow-inner"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">kWh</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Nuevo Factor Potencia</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.01"
                          required
                          value={editFactorPotencia}
                          onChange={(e) => setEditFactorPotencia(e.target.value)}
                          placeholder="0.00" 
                          className="w-full bg-white border-2 border-purple-500 rounded-xl pl-4 pr-16 py-3 text-[18px] font-data-mono font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-purple-500/20 shadow-inner"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">kVARh</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Justificación del Cambio *</label>
                  <textarea 
                    required
                    value={editJustificacion}
                    onChange={(e) => setEditJustificacion(e.target.value)}
                    placeholder="Ej. El operario ingresó un cero de más..." 
                    className="w-full bg-surface-container-lowest border-2 border-outline-variant rounded-xl p-4 text-sm font-body-md text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none h-24"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[10px] text-on-surface-variant italic">Este motivo quedará registrado en la auditoría.</p>
                    <p className={`text-[10px] font-bold ${editJustificacion.trim().split(/\s+/).filter(w => w.length > 0).length >= 3 ? 'text-green-600' : 'text-orange-500'}`}>
                      {editJustificacion.trim().split(/\s+/).filter(w => w.length > 0).length} / 3 palabras min.
                    </p>
                  </div>
                </div>

                <div className="flex gap-md pt-2 border-t border-outline-variant">
                  <button 
                    type="button" 
                    onClick={() => setEditModalData(null)}
                    className="w-1/3 py-3 rounded-xl font-bold border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSaving || !editReadingVal || editJustificacion.trim().split(/\s+/).filter(w => w.length > 0).length < 3}
                    className={`flex-grow py-3 rounded-xl font-bold flex items-center justify-center gap-sm transition-all shadow-md ${editReadingVal && editJustificacion.trim().split(/\s+/).filter(w => w.length > 0).length >= 3 ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'}`}
                  >
                    {isSaving ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      {/* Modal Apertura de Periodo */}
      <PeriodFormModal 
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        onSuccess={fetchPeriodos}
        existentes={periodosFiltrados}
      />

    </main>
  );
};

export default ManualBilling;
