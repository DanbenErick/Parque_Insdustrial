import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useYear } from '../../context/YearContext';
import SuccessModal from './components/SuccessModal';
import LecturasDetailsModal from './components/LecturasDetailsModal';

const DEFAULT_KWH_RATE = 0.85;

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
  const navigate = useNavigate();
  
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
          // Optimización: Solo descargar las lecturas del año activo
          api.get('/lecturas', { params: { year: activeYear } })
        ]);
        
        setPeriodos(periodosRes.data);
        setLecturas(lecturasRes.data);
      } catch (error) {
        toast.error('Error al cargar datos del servidor');
      }
    };
    fetchData();
  }, [activeYear]);

  // Optimización: useMemo para evitar recalcular en cada render
  const periodosFiltrados = useMemo(() => {
    return periodos.filter(p => {
      if (!p.mes_anio) return false;
      return p.mes_anio.includes(activeYear.toString());
    }).sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
  }, [periodos, activeYear]);

  // Actualizar el periodo seleccionado
  useEffect(() => {
    if (periodosFiltrados.length > 0) {
      if (!selectedPeriodoId || !periodosFiltrados.find(p => p.id.toString() === selectedPeriodoId)) {
        setSelectedPeriodoId(periodosFiltrados[periodosFiltrados.length - 1].id.toString());
      }
    } else {
      setSelectedPeriodoId('');
    }
  }, [periodosFiltrados, selectedPeriodoId]);

  const lecturasDelPeriodo = useMemo(() => {
    if (!selectedPeriodoId) return [];
    return lecturas.filter(l => l.periodo_id === parseInt(selectedPeriodoId));
  }, [lecturas, selectedPeriodoId]);

  const periodoSeleccionado = useMemo(() => {
    if (!selectedPeriodoId) return null;
    return periodosFiltrados.find(p => p.id === parseInt(selectedPeriodoId));
  }, [periodosFiltrados, selectedPeriodoId]);

  const consumoTotal = useMemo(() => {
    return lecturasDelPeriodo.reduce((acc, l) => acc + (parseFloat(l.lectura_actual) - parseFloat(l.lectura_anterior)), 0);
  }, [lecturasDelPeriodo]);

  const costoUnitario = periodoSeleccionado ? parseFloat(periodoSeleccionado.tarifa_kwh) : DEFAULT_KWH_RATE;
  const montoEstimado = consumoTotal * costoUnitario;

  const handleGenerate = async () => {
    if (!selectedPeriodoId) return toast.error('Debe seleccionar un periodo');
    
    setIsProcessing(true);
    setProgress(10);
    
    let progressInterval;
    
    try {
      progressInterval = setInterval(() => {
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
      clearInterval(progressInterval); // Bug fix: Clear interval on error to prevent memory leak
      setIsProcessing(false);
      setProgress(0);
      toast.error(error.response?.data?.error || 'Error al generar recibos');
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/billing');
  };

  return (
    <main className="flex-grow flex flex-col relative overflow-hidden bg-background">
      <div className="flex-grow overflow-y-auto p-xl">
        <div className="max-w-6xl mx-auto space-y-lg">
          
          <div className="flex justify-between items-center mb-lg">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold">Generar Facturación Mensual</h2>
              <p className="font-body-md text-on-surface-variant">Proceso de emisión masiva de comprobantes de pago.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
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

      <AnimatePresence>
        <SuccessModal 
          isOpen={showSuccess} 
          onClose={handleSuccessClose} 
          lecturasCount={lecturasDelPeriodo.length} 
          periodoName={periodoSeleccionado?.mes_anio} 
        />
      </AnimatePresence>

      <AnimatePresence>
        <LecturasDetailsModal 
          isOpen={showDetailsModal} 
          onClose={() => setShowDetailsModal(false)} 
          lecturas={lecturasDelPeriodo} 
        />
      </AnimatePresence>
    </main>
  );
};

export default GenerateInvoices;
