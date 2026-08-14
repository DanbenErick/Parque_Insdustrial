import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import api from '../../api/axiosConfig';

const GenerateInvoicesModal = ({ isOpen, onClose, onSuccess, selectedPeriodoId, periodos }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [medidores, setMedidores] = useState([]);
  const [lecturas, setLecturas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modo, setModo] = useState('Masivo'); // 'Masivo' o 'Individual'
  const [selectedUsuarioId, setSelectedUsuarioId] = useState('');
  const [selectedMedidorId, setSelectedMedidorId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAutocompleteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = useMemo(() => {
    let opts = [];
    usuarios.forEach(u => {
      const userMedidores = medidores.filter(m => m.usuario_id === u.id);
      if (userMedidores.length > 0) {
        userMedidores.forEach(m => {
          opts.push({
            usuarioId: u.id,
            medidorId: m.id,
            nombre: u.nombre_razonsocial,
            medidorStr: `Medidor: ${m.num_serie} (${m.tipo})`,
            label: `${u.nombre_razonsocial} - Medidor: ${m.num_serie} (${m.tipo})`,
            direccion: m.direccion || 'Sin dirección',
            searchValue: `${u.nombre_razonsocial} ${m.num_serie} ${m.tipo} ${m.direccion || ''}`.toLowerCase()
          });
        });
      } else {
        opts.push({
          usuarioId: u.id,
          medidorId: null,
          nombre: u.nombre_razonsocial,
          medidorStr: 'Sin Medidor',
          label: `${u.nombre_razonsocial} (Sin Medidor)`,
          direccion: u.direccion || 'Sin dirección',
          searchValue: `${u.nombre_razonsocial} sin medidor ${u.direccion || ''}`.toLowerCase()
        });
      }
    });
    return opts;
  }, [usuarios, medidores]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(o => o.searchValue.includes(term));
  }, [options, searchTerm]);

  const handleSelectOption = (opt) => {
    setSelectedUsuarioId(opt.usuarioId);
    setSelectedMedidorId(opt.medidorId);
    setSearchTerm(opt.label);
    setIsAutocompleteOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsAutocompleteOpen(true);
    if (selectedUsuarioId) {
      setSelectedUsuarioId('');
      setSelectedMedidorId(null);
    }
  };

  useEffect(() => {
    if (isOpen && selectedPeriodoId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [medidoresRes, lecturasRes, usuariosRes] = await Promise.all([
            api.get('/medidores'),
            api.get('/lecturas?limit=10000'),
            api.get('/usuarios?limit=10000')
          ]);
          // Helper for paginated APIs
          const getRawData = (res) => Array.isArray(res.data) ? res.data : (res.data?.data || []);
          
          // Solo medidores operativos
          setMedidores(getRawData(medidoresRes).filter(m => m.operativo));
          setLecturas(getRawData(lecturasRes));
          setUsuarios(getRawData(usuariosRes).filter(u => u.nombre_rol === 'Socio'));
        } catch (error) {
          toast.error('Error al cargar datos para validación');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, selectedPeriodoId]);



  const periodoSeleccionado = periodos.find(p => p.id === parseInt(selectedPeriodoId));
  if (!periodoSeleccionado) {
    return (
    <>
      {isOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
             <div
               className="bg-surface p-xl rounded-2xl w-full max-w-md"
             >
                <h3 className="font-headline-sm font-bold text-on-surface mb-4">Error</h3>
                <p>No ha seleccionado un periodo válido.</p>
                <button onClick={onClose} className="mt-4 w-full bg-primary text-on-primary py-2 rounded-lg font-bold">Cerrar</button>
             </div>
          </div>
      )}
    </>
  );
  }

  const formatPeriod = (periodStr) => {
    if (!periodStr) return '';
    const parts = periodStr.split('-');
    if (parts.length !== 2) return periodStr;
    const year = parts[0].length === 4 ? parts[0] : parts[1];
    const month = parts[0].length === 4 ? parts[1] : parts[0];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthIndex = parseInt(month, 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) return `${monthNames[monthIndex]} ${year}`;
    return periodStr;
  };

  const totalMedidores = medidores.length;
  // Una lectura es válida si pertenece a este periodo y a un medidor operativo
  const lecturasValidas = lecturas.filter(l => 
    l.periodo === periodoSeleccionado.mes_anio && 
    medidores.some(m => m.num_serie === l.num_serie)
  );
  const cantidadLecturas = lecturasValidas.length;
  const lecturasFaltantes = totalMedidores - cantidadLecturas;

  const handleGenerate = async () => {
    if (modo === 'Masivo' && lecturasFaltantes > 0) {
      return toast.error('No se puede generar. Faltan lecturas por registrar.');
    }
    
    if (modo === 'Individual' && !selectedUsuarioId) {
      return toast.error('Seleccione un usuario para generar la factura.');
    }
    
    setIsProcessing(true);
    try {
      if (modo === 'Masivo') {
        await api.post('/recibos/generar', { periodo_id: selectedPeriodoId });
        toast.success('Facturas generadas exitosamente');
      } else {
        await api.post('/recibos/generar/individual', { 
          periodo_id: selectedPeriodoId, 
          usuario_id: selectedUsuarioId,
          medidor_id: selectedMedidorId
        });
        toast.success('Factura individual generada exitosamente');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al generar facturas');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {isOpen && (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
      >
        <div
          className="bg-surface w-full max-w-xl rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        >
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-outline-variant/50 bg-surface-container-lowest/50 flex justify-between items-center relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-on-surface font-bold">Generar Facturas</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Emite los recibos del periodo seleccionado</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50 relative z-10"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Resumen del periodo en un solo bloque */}
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Periodo a facturar</p>
              <p className="text-xl font-bold text-primary">{formatPeriod(periodoSeleccionado.mes_anio)}</p>
            </div>
            <div className="h-10 w-px bg-outline-variant/50 mx-4"></div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tarifa Base</p>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
                <p className="font-data-mono font-bold text-base text-on-surface">S/ {Number(periodoSeleccionado.tarifa_kwh).toFixed(4)} <span className="text-xs font-normal text-on-surface-variant">/ kWh</span></p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined animate-spin text-primary text-[32px]">sync</span>
              <p className="text-sm text-on-surface-variant animate-pulse">Verificando lecturas disponibles...</p>
            </div>
          ) : (
            <>
              {/* Toggle Modo */}
              <div className="flex bg-surface-container-lowest p-1.5 rounded-[14px] border border-outline-variant/50 shadow-sm relative">
                <div 
                  className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-primary rounded-[10px] transition-transform duration-300 ease-in-out shadow-sm ${modo === 'Individual' ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'}`}
                ></div>
                
                <button 
                  className={`flex-1 text-sm font-bold rounded-[10px] py-2 transition-colors flex items-center justify-center gap-2 relative z-10 ${modo === 'Masivo' ? 'text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                  onClick={() => setModo('Masivo')}
                >
                  <span className={`material-symbols-outlined text-[18px] ${modo === 'Masivo' ? 'animate-in zoom-in' : ''}`}>groups</span>
                  Masivo
                </button>
                <button 
                  className={`flex-1 text-sm font-bold rounded-[10px] py-2 transition-colors flex items-center justify-center gap-2 relative z-10 ${modo === 'Individual' ? 'text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                  onClick={() => setModo('Individual')}
                >
                  <span className={`material-symbols-outlined text-[18px] ${modo === 'Individual' ? 'animate-in zoom-in' : ''}`}>person</span>
                  Individual
                </button>
              </div>

              {modo === 'Masivo' ? (
                <>
                  {/* Status Grid */}
                  <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-surface-container-lowest rounded-xl p-3 text-center border border-outline-variant/50 shadow-sm flex flex-col justify-center">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Medidores</p>
                      <p className="font-data-mono font-bold text-2xl text-on-surface leading-none">{totalMedidores}</p>
                    </div>
                    <div className="bg-success/5 border border-success/20 rounded-xl p-3 text-center shadow-sm flex flex-col justify-center">
                      <p className="text-[10px] font-bold text-success uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">check_circle</span>
                        Leídos
                      </p>
                      <p className="font-data-mono font-bold text-2xl text-success leading-none">{cantidadLecturas}</p>
                    </div>
                    <div className={`border rounded-xl p-3 text-center shadow-sm flex flex-col justify-center transition-colors ${lecturasFaltantes > 0 ? 'bg-error/5 border-error/20' : 'bg-surface-container-lowest border-outline-variant/50'}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1 ${lecturasFaltantes > 0 ? 'text-error' : 'text-on-surface-variant'}`}>
                        {lecturasFaltantes > 0 && <span className="material-symbols-outlined text-[12px]">warning</span>}
                        Faltantes
                      </p>
                      <p className={`font-data-mono font-bold text-2xl leading-none ${lecturasFaltantes > 0 ? 'text-error' : 'text-on-surface'}`}>
                        {lecturasFaltantes}
                      </p>
                    </div>
                  </div>

                  {/* Warnings Masivo */}
                  <div className="animate-in fade-in duration-300">
                    {totalMedidores === 0 ? (
                      <div className="bg-error/10 border border-error/20 px-4 py-3 rounded-xl flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-error text-[18px]">error</span>
                        </div>
                        <div>
                          <p className="text-sm text-error font-bold mb-0.5">Sin registros</p>
                          <p className="text-xs text-error/80 font-medium">No hay medidores operativos registrados para facturar.</p>
                        </div>
                      </div>
                    ) : lecturasFaltantes > 0 ? (
                      <div className="bg-error/10 border border-error/20 px-4 py-3 rounded-xl flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-error text-[18px]">warning</span>
                        </div>
                        <div>
                          <p className="text-sm text-error font-bold mb-0.5">Lecturas incompletas</p>
                          <p className="text-xs text-error/80 font-medium">Aún faltan {lecturasFaltantes} lecturas por registrar este mes.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-success/10 border border-success/20 px-4 py-3 rounded-xl flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-success text-[18px]">check_circle</span>
                        </div>
                        <div>
                          <p className="text-sm text-success font-bold mb-0.5">Listo para emitir</p>
                          <p className="text-xs text-success/80 font-medium">Todas las lecturas están completas. Ya puedes proceder.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-surface-container-lowest border border-outline-variant/60 p-5 rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">person_search</span>
                    Buscar Socio o Medidor
                  </label>
                  
                  <div className="relative" ref={dropdownRef}>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                      <input 
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => setIsAutocompleteOpen(true)}
                        placeholder="Buscar por socio o medidor..."
                        className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                      {searchTerm && (
                        <button 
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface bg-surface-variant/50 hover:bg-surface-variant w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedUsuarioId('');
                            setSelectedMedidorId(null);
                            setIsAutocompleteOpen(true);
                          }}
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      )}
                    </div>
                    
                    {isAutocompleteOpen && (
                      <div className="absolute z-50 mt-1 w-full bg-surface border border-outline-variant rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                        {filteredOptions.length > 0 ? (
                          <ul className="py-1">
                            {filteredOptions.map((opt, idx) => (
                              <li 
                                key={idx}
                                onClick={() => handleSelectOption(opt)}
                                className={`px-4 py-3 cursor-pointer hover:bg-primary/5 transition-colors border-b border-outline-variant/20 last:border-0 ${selectedUsuarioId === opt.usuarioId && selectedMedidorId === opt.medidorId ? 'bg-primary/10' : ''}`}
                              >
                                <div className="flex flex-col gap-1.5 w-full">
                                  {/* Nombre y Dirección destacados */}
                                  <div className="flex flex-col gap-0.5">
                                    <div className={`font-bold text-sm whitespace-normal leading-snug ${selectedUsuarioId === opt.usuarioId && selectedMedidorId === opt.medidorId ? 'text-primary' : 'text-on-surface'}`}>
                                      {opt.nombre}
                                    </div>
                                    <div className={`flex items-start gap-1.5 ${selectedUsuarioId === opt.usuarioId && selectedMedidorId === opt.medidorId ? 'text-primary' : 'text-primary/90'}`}>
                                      <span className="material-symbols-outlined text-[16px] mt-0.5">
                                        location_on
                                      </span>
                                      <span className="font-bold text-[13px] whitespace-normal leading-snug">
                                        {opt.direccion}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Medidor en segundo plano */}
                                  <div className="flex items-start gap-1.5 text-on-surface-variant text-[11px] font-medium border-t border-outline-variant/20 pt-1.5">
                                    <span className="material-symbols-outlined text-[14px] opacity-70">
                                      {opt.medidorId ? 'electric_meter' : 'person_off'}
                                    </span>
                                    <span className="whitespace-normal leading-tight">
                                      {opt.medidorStr}
                                    </span>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-4 text-center text-sm text-on-surface-variant flex flex-col items-center gap-1">
                            <span className="material-symbols-outlined text-[24px] opacity-50">search_off</span>
                            No se encontraron resultados
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 bg-secondary/5 px-3 py-2.5 rounded-lg border border-secondary/10 flex items-start gap-2">
                    <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">verified</span>
                    <p className="text-xs text-on-surface-variant leading-tight">
                      El sistema verificará automáticamente si el socio seleccionado cuenta con lecturas este mes.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-surface-container-lowest border border-outline-variant/40 p-3 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">info</span>
                  <p className="text-[11px] text-on-surface-variant leading-tight">
                    <strong className="text-on-surface block mb-0.5">Registro de Multas</strong>
                    Las multas y otros cargos adicionales se agregan editando la factura individualmente.
                  </p>
                </div>

                <div className="bg-error/5 border border-error/10 p-3 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-error text-[20px] mt-0.5">history</span>
                  <p className="text-[11px] text-error/80 leading-tight">
                    <strong className="text-error block mb-0.5">Cambio de Estado</strong>
                    Los recibos pendientes del mes pasado pasarán automáticamente a "Vencido".
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-surface-container-lowest border-t border-outline-variant/50 flex gap-3">
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handleGenerate}
            disabled={isProcessing || isLoading || (modo === 'Masivo' ? (lecturasFaltantes > 0 || totalMedidores === 0) : !selectedUsuarioId)}
            className="flex-[2] py-2.5 rounded-xl font-bold text-sm bg-primary text-on-primary hover:brightness-110 hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:shadow-none"
          >
            {isProcessing ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                Generando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">magic_button</span>
                Generar {modo === 'Masivo' ? 'Facturas Masivas' : 'Factura Individual'}
              </>
            )}
          </button>
        </div>

        </div>
      </div>
      )}
    </>
  );
};

export default GenerateInvoicesModal;
