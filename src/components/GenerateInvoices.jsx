import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '../api/axiosConfig';
import { useYear } from '../context/YearContext';

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

const GenerateInvoices = () => {
  const { activeYear } = useYear();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const [periodos, setPeriodos] = useState([]);
  const [selectedPeriodoId, setSelectedPeriodoId] = useState('');
  const [lecturas, setLecturas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [periodosRes, lecturasRes] = await Promise.all([
          api.get('/periodos'),
          api.get('/lecturas')
        ]);
        
        setPeriodos(periodosRes.data);
        setLecturas(lecturasRes.data);
      } catch (error) {
        toast.error('Error al cargar datos del servidor');
      }
    };
    fetchData();
  }, []);

  // Filtramos periodos por el año global activo y los ordenamos cronológicamente
  const periodosFiltrados = periodos.filter(p => {
    if (!p.mes_anio) return false;
    return p.mes_anio.includes(activeYear.toString());
  }).sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));

  // Actualizar el periodo seleccionado cuando cambia el año activo o se cargan los datos
  useEffect(() => {
    if (periodosFiltrados.length > 0) {
      // Por defecto selecciona el último periodo del año activo (el más reciente)
      setSelectedPeriodoId(periodosFiltrados[periodosFiltrados.length - 1].id.toString());
    } else {
      setSelectedPeriodoId('');
    }
  }, [activeYear, periodos]);

  const lecturasDelPeriodo = lecturas.filter(l => l.periodo_id === parseInt(selectedPeriodoId));
  const periodoSeleccionado = periodosFiltrados.find(p => p.id === parseInt(selectedPeriodoId));

  // Estimaciones basadas en lecturas para mostrar KPIs
  const consumoTotal = lecturasDelPeriodo.reduce((acc, l) => acc + (parseFloat(l.lectura_actual) - parseFloat(l.lectura_anterior)), 0);
  // Asumiendo costo por kWh de ejemplo = 0.85
  const costoUnitario = periodoSeleccionado ? parseFloat(periodoSeleccionado.tarifa_kwh) : 0.85;
  const montoEstimado = consumoTotal * costoUnitario;

  const handleGenerate = async () => {
    if (!selectedPeriodoId) return toast.error('Debe seleccionar un periodo');
    
    setIsProcessing(true);
    setProgress(10);
    
    try {
      // Simular progreso UI mientras esperamos la red
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 15, 90));
      }, 500);

      await api.post('/recibos/generar', { periodo_id: selectedPeriodoId });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setIsProcessing(false);
        setShowSuccess(true);
      }, 500);
      
    } catch (error) {
      setIsProcessing(false);
      setProgress(0);
      toast.error(error.response?.data?.error || 'Error al generar recibos');
    }
  };

  return (
    <main className="flex-grow flex flex-col relative overflow-hidden bg-background">
      {/* Page Content */}
      <div className="flex-grow overflow-y-auto p-xl">
        <div className="max-w-6xl mx-auto space-y-lg">
          {/* Header Action inside content for layout consistency */}
          <div className="flex justify-between items-center mb-lg">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold">Generar Facturación Mensual</h2>
              <p className="font-body-md text-on-surface-variant">Proceso de emisión masiva de comprobantes de pago.</p>
            </div>
          </div>

          {/* Hero Selection & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
            {/* Config Card */}
            <div className="md:col-span-7 bg-surface border border-outline-variant rounded-lg shadow-sm p-lg flex flex-col justify-between">
              <div>
                <span className="font-label-caps text-[11px] text-secondary uppercase tracking-widest block mb-xs">Configuración de Periodo</span>
                <h3 className="font-headline-sm text-headline-sm mb-lg font-bold">Seleccione Periodo de Facturación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="font-label-caps text-[11px] text-on-surface-variant">PERIODO (MES / AÑO)</label>
                    <select 
                      className="w-full bg-surface-container border border-outline-variant rounded-md p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                      value={selectedPeriodoId}
                      onChange={(e) => setSelectedPeriodoId(e.target.value)}
                    >
                      {periodosFiltrados.length === 0 ? (
                  <option value="" disabled>No hay periodos en {activeYear}</option>
                ) : (
                  periodosFiltrados.map(p => (
                    <option key={p.id} value={p.id}>
                      {formatPeriodo(p.mes_anio)}
                    </option>
                  ))
                )}
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-xl p-md bg-primary-container/10 border-l-4 border-primary rounded-r">
                <div className="flex items-start gap-md">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <div>
                    <p className="font-body-md text-body-md text-on-primary-container">
                      Se generarán <span className="font-bold">{lecturasDelPeriodo.length} facturas</span> para el periodo <span className="font-bold">{periodoSeleccionado?.mes_anio || '...'}</span>.
                    </p>
                    <p className="font-body-sm text-sm text-on-surface-variant mt-xs">Solo se facturarán los medidores que ya cuentan con una lectura registrada en este periodo.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Quick View */}
            <div className="md:col-span-5 grid grid-cols-1 gap-md">
              <div className="bg-surface border border-outline-variant rounded-lg p-lg flex items-center justify-between shadow-sm">
                <div>
                  <p className="font-label-caps text-[11px] text-secondary uppercase tracking-wider">Monto Estimado Eléctrico</p>
                  <p className="font-data-mono text-headline-md text-on-surface font-bold mt-1">
                    S/ {montoEstimado.toLocaleString('en-US', {minimumFractionDigits: 2})}
                  </p>
                </div>
                <span className="material-symbols-outlined text-primary-container text-[48px] opacity-80">account_balance_wallet</span>
              </div>
              <div className="bg-surface border border-outline-variant rounded-lg p-lg flex items-center justify-between shadow-sm">
                <div>
                  <p className="font-label-caps text-[11px] text-secondary uppercase tracking-wider">Consumo Total (kWh)</p>
                  <p className="font-data-mono text-headline-md text-on-surface font-bold mt-1">
                    {consumoTotal.toLocaleString('en-US')}
                  </p>
                </div>
                <span className="material-symbols-outlined text-tertiary text-[48px] opacity-80">bolt</span>
              </div>
            </div>
          </div>

          {/* Readings Checklist */}
          <div className="bg-surface border border-outline-variant rounded-lg shadow-sm overflow-hidden">
            <div className="px-lg py-md bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
              <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Lista de Verificación de Lecturas</h4>
              <button 
                onClick={() => setShowDetailsModal(true)}
                className="bg-primary/10 text-primary px-sm py-xs rounded text-[11px] font-bold tracking-wider hover:bg-primary/20 transition-colors"
                disabled={lecturasDelPeriodo.length === 0}
              >
                VER DETALLE LECTURAS
              </button>
            </div>
            <div className="divide-y divide-outline-variant">
              <div className="p-md flex items-center justify-between hover:bg-surface-container-lowest transition-colors px-lg">
                <div className="flex items-center gap-md">
                  <div className="bg-primary/10 text-primary p-2 rounded">
                    <span className="material-symbols-outlined">electric_bolt</span>
                  </div>
                  <div>
                    <p className="font-body-md font-bold text-on-surface">Lecturas de Energía Eléctrica Registradas</p>
                    <p className="font-body-sm text-sm text-on-surface-variant">
                      {lecturasDelPeriodo.length > 0 ? `${lecturasDelPeriodo.length} lecturas listas para facturar` : 'No hay lecturas en este periodo'}
                    </p>
                  </div>
                </div>
                {lecturasDelPeriodo.length > 0 ? (
                   <span className="material-symbols-outlined text-[#059669]">check_circle</span>
                ) : (
                   <span className="material-symbols-outlined text-warning">pending</span>
                )}
              </div>
            </div>
          </div>

          {/* Simulation/Process Area */}
          {isProcessing && (
            <div className="animate-in fade-in duration-500">
              <div className="bg-inverse-surface text-surface-bright rounded-lg p-xl shadow-xl">
                <div className="flex flex-col items-center text-center space-y-md">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle className="text-on-surface-variant opacity-20" cx="48" cy="48" fill="transparent" r="44" stroke="currentColor" strokeWidth="4"></circle>
                      <circle 
                        className="transition-all duration-300" 
                        cx="48" cy="48" fill="transparent" r="44" stroke="#00647c" 
                        strokeDasharray="276" strokeDashoffset={276 - (276 * progress) / 100} strokeWidth="4">
                      </circle>
                    </svg>
                    <span className="font-data-mono text-headline-md">{progress}%</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm font-bold">Procesando Facturación</h4>
                    <p className="text-surface-variant text-sm mt-1">Generando registros en base de datos...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Final Action */}
          {!isProcessing && !showSuccess && (
            <div className="flex justify-end items-center gap-md py-lg border-t border-outline-variant mt-lg">
              <button 
                className="px-xl py-2 bg-primary text-on-primary font-bold shadow-md hover:opacity-90 active:scale-95 transition-all rounded-md flex items-center gap-sm disabled:opacity-50"
                onClick={handleGenerate}
                disabled={lecturasDelPeriodo.length === 0}
              >
                <span className="material-symbols-outlined">print</span>
                Confirmar y Generar Recibos
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-surface p-xl rounded-xl shadow-2xl max-w-md w-full text-center space-y-md border border-outline-variant"
          >
            <div className="w-20 h-20 bg-[#059669]/10 rounded-full flex items-center justify-center mx-auto mb-lg">
              <span className="material-symbols-outlined text-[#059669] text-[48px]">verified</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">¡Proceso Exitoso!</h3>
            <p className="text-on-surface-variant">Se han generado {lecturasDelPeriodo.length} recibos correctamente para el periodo {periodoSeleccionado?.mes_anio}.</p>
            <div className="grid grid-cols-1 gap-md pt-lg">
              <button 
                className="px-md py-3 bg-primary text-on-primary rounded-md hover:opacity-90 font-bold" 
                onClick={() => {
                  setShowSuccess(false);
                  window.location.href = "/billing"; // Redirigir a listado de recibos
                }}
              >
                Ir a Módulo de Facturación
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Tenant Details Modal */}
      <AnimatePresence>
      {showDetailsModal && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-md"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-surface border border-outline-variant rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="px-lg py-md bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
              <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Detalle de Lecturas del Periodo</h4>
              <div className="flex flex-wrap items-center gap-sm">
                <button onClick={() => setShowDetailsModal(false)} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full bg-surface-container-high">
                  <span className="material-symbols-outlined text-md">close</span>
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-grow p-0">
              <table className="w-full text-left border-collapse table-zebra">
                <thead>
                  <tr className="bg-surface-container-lowest border-b border-outline-variant sticky top-0">
                    <th className="px-md py-sm font-label-caps text-secondary text-[11px] uppercase tracking-wider font-bold">ID LECTURA</th>
                    <th className="px-md py-sm font-label-caps text-secondary text-[11px] uppercase tracking-wider font-bold text-center">FECHA REGISTRO</th>
                    <th className="px-md py-sm font-label-caps text-secondary text-[11px] uppercase tracking-wider text-right font-bold">Lec. Anterior</th>
                    <th className="px-md py-sm font-label-caps text-secondary text-[11px] uppercase tracking-wider text-right font-bold">Lec. Actual</th>
                    <th className="px-md py-sm font-label-caps text-secondary text-[11px] uppercase tracking-wider text-right font-bold">Consumo (kWh)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-sm">
                  {lecturasDelPeriodo.map(lectura => (
                    <tr key={lectura.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-md py-md">
                        <p className="font-data-mono font-bold text-on-surface">LEC-{lectura.id}</p>
                      </td>
                      <td className="px-md py-md text-center text-on-surface-variant">
                         {new Date(lectura.fecha_registro).toLocaleDateString()}
                      </td>
                      <td className="px-md py-md text-right font-data-mono text-on-surface">{parseFloat(lectura.lectura_anterior).toLocaleString('en-US')}</td>
                      <td className="px-md py-md text-right font-data-mono text-primary font-bold">{parseFloat(lectura.lectura_actual).toLocaleString('en-US')}</td>
                      <td className="px-md py-md text-right font-data-mono font-bold text-secondary">
                        {(parseFloat(lectura.lectura_actual) - parseFloat(lectura.lectura_anterior)).toLocaleString('en-US')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-lg py-md bg-surface-container-low border-t border-outline-variant flex justify-end">
               <button onClick={() => setShowDetailsModal(false)} className="px-md py-2 border border-outline-variant rounded-md hover:bg-surface-container transition-colors font-bold text-on-surface-variant">
                  Cerrar
               </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </main>
  );
};

export default GenerateInvoices;
