import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (isOpen && selectedPeriodoId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [medidoresRes, lecturasRes, usuariosRes] = await Promise.all([
            api.get('/medidores'),
            api.get('/lecturas'),
            api.get('/usuarios')
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
          usuario_id: selectedUsuarioId 
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
        className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      >
        <div
          className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
        
        {/* Header */}
        <div className="px-lg py-md border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
          <h3 className="font-headline-sm text-primary font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">receipt_long</span>
            Generar Facturas
          </h3>
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="text-center">
            <p className="text-xs text-on-surface-variant">Periodo a facturar:</p>
            <p className="text-xl font-bold text-primary">{formatPeriod(periodoSeleccionado.mes_anio)}</p>
          </div>

          {isLoading ? (
            <div className="py-xl flex justify-center">
              <span className="material-symbols-outlined animate-spin text-primary text-[32px]">sync</span>
            </div>
          ) : (
            <>
              {/* Tarifa Info */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-3 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Tarifa Aplicada</p>
                  <p className="font-data-mono font-bold text-base text-on-surface">S/ {Number(periodoSeleccionado.tarifa_kwh).toFixed(4)} <span className="text-xs font-normal text-on-surface-variant">por kWh</span></p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">bolt</span>
                </div>
              </div>

              {/* Toggle Modo */}
              <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant/30 h-9">
                <button 
                  className={`flex-1 text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 ${modo === 'Masivo' ? 'bg-white shadow-sm text-primary border border-outline-variant/20' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  onClick={() => setModo('Masivo')}
                >
                  <span className="material-symbols-outlined text-[16px]">groups</span>
                  Masivo
                </button>
                <button 
                  className={`flex-1 text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 ${modo === 'Individual' ? 'bg-white shadow-sm text-primary border border-outline-variant/20' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  onClick={() => setModo('Individual')}
                >
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  Individual
                </button>
              </div>

              {modo === 'Masivo' ? (
                <>
                  {/* Status Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-surface-container rounded-lg p-2 text-center border border-transparent">
                      <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Medidores</p>
                      <p className="font-data-mono font-bold text-base text-on-surface leading-tight">{totalMedidores}</p>
                    </div>
                    <div className="bg-success/10 border border-success/20 rounded-lg p-2 text-center">
                      <p className="text-[9px] font-bold text-success uppercase tracking-wider mb-0.5">Leídos</p>
                      <p className="font-data-mono font-bold text-base text-success leading-tight">{cantidadLecturas}</p>
                    </div>
                    <div className={`border rounded-lg p-2 text-center ${lecturasFaltantes > 0 ? 'bg-error/10 border-error/20' : 'bg-surface-container border-transparent'}`}>
                      <p className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${lecturasFaltantes > 0 ? 'text-error' : 'text-on-surface-variant'}`}>
                        Faltantes
                      </p>
                      <p className={`font-data-mono font-bold text-base leading-tight ${lecturasFaltantes > 0 ? 'text-error' : 'text-on-surface'}`}>
                        {lecturasFaltantes}
                      </p>
                    </div>
                  </div>

                  {/* Warnings */}
                  {totalMedidores === 0 ? (
                    <div className="bg-error/10 border-l-[3px] border-error px-3 py-2 rounded-r flex items-start gap-2">
                      <span className="material-symbols-outlined text-error text-[16px] mt-0.5">warning</span>
                      <p className="text-[11px] text-error font-medium leading-tight">
                        No hay lecturas registradas para facturar.
                      </p>
                    </div>
                  ) : lecturasFaltantes > 0 ? (
                    <div className="bg-error/10 border-l-[3px] border-error px-3 py-2 rounded-r flex items-start gap-2">
                      <span className="material-symbols-outlined text-error text-[16px] mt-0.5">warning</span>
                      <p className="text-[11px] text-error font-medium leading-tight">
                        Faltan {lecturasFaltantes} lecturas por registrar.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-success/10 border-l-[3px] border-success px-3 py-2 rounded-r flex items-start gap-2">
                      <span className="material-symbols-outlined text-success text-[16px] mt-0.5">check_circle</span>
                      <p className="text-[11px] text-success font-medium leading-tight">
                        Todas las lecturas del mes han sido registradas. Puedes proceder con la generación.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-surface-container-lowest border border-outline-variant p-3 rounded-lg">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Seleccione un Socio</label>
                  <select 
                    value={selectedUsuarioId}
                    onChange={(e) => setSelectedUsuarioId(e.target.value)}
                    className="w-full border border-outline-variant rounded-md text-xs bg-white focus:border-primary focus:ring-1 focus:ring-primary px-2 py-1.5 cursor-pointer outline-none"
                  >
                    <option value="">-- Buscar Socio --</option>
                    {usuarios.map(u => (
                      <option key={u.id} value={u.id}>{u.nombre_razonsocial} ({u.documento_identidad})</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-on-surface-variant mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">info</span>
                    Se verificará que tenga lectura.
                  </p>
                </div>
              )}

              <div className="bg-secondary-container/30 border border-secondary/20 p-2.5 rounded-lg flex items-start gap-2">
                <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">info</span>
                <p className="text-[10px] text-on-surface-variant leading-tight">
                  <strong className="text-on-surface">Nota sobre multas:</strong> Deben agregarse manualmente editando el recibo correspondiente después de generarlos.
                </p>
              </div>

              <div className="bg-error/10 border-l-[3px] border-error px-3 py-2 rounded-r flex items-start gap-2 mt-4">
                <span className="material-symbols-outlined text-error text-[16px] mt-0.5">warning</span>
                <p className="text-[11px] text-error font-medium leading-tight">
                  <strong className="font-bold">Importante:</strong> Al generar facturas para este periodo, cualquier recibo pendiente del mes anterior pasará automáticamente a estado "Vencido".
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-surface-container-lowest border-t border-outline-variant flex gap-3">
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-1.5 h-9 rounded-md font-bold text-xs border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handleGenerate}
            disabled={isProcessing || isLoading || (modo === 'Masivo' ? (lecturasFaltantes > 0 || totalMedidores === 0) : !selectedUsuarioId)}
            className="flex-[2] py-1.5 h-9 rounded-md font-bold text-xs bg-primary text-on-primary hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isProcessing ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                Generando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                Proceder a Generar Facturas
              </>
            )}
          </button>
        </div>

        </div>
      </div>
    )}
    
  );
};

export default GenerateInvoicesModal;
