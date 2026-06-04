import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../api/axiosConfig';

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
          // Solo medidores operativos
          setMedidores(medidoresRes.data.filter(m => m.operativo));
          setLecturas(lecturasRes.data);
          setUsuarios(usuariosRes.data.filter(u => u.nombre_rol === 'Miembro'));
        } catch (error) {
          toast.error('Error al cargar datos para validación');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, selectedPeriodoId]);

  if (!isOpen) return null;

  const periodoSeleccionado = periodos.find(p => p.id === parseInt(selectedPeriodoId));
  if (!periodoSeleccionado) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
         <div className="bg-surface p-xl rounded-2xl w-full max-w-md">
            <h3 className="font-headline-sm font-bold text-on-surface mb-4">Error</h3>
            <p>No ha seleccionado un periodo válido.</p>
            <button onClick={onClose} className="mt-4 w-full bg-primary text-on-primary py-2 rounded-lg font-bold">Cerrar</button>
         </div>
      </div>
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
        
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
        <div className="p-lg space-y-md">
          <div className="text-center mb-sm">
            <p className="text-on-surface-variant">Periodo a facturar:</p>
            <p className="font-headline-md font-bold text-primary">{formatPeriod(periodoSeleccionado.mes_anio)}</p>
          </div>

          {isLoading ? (
            <div className="py-xl flex justify-center">
              <span className="material-symbols-outlined animate-spin text-primary text-[32px]">sync</span>
            </div>
          ) : (
            <>
              {/* Tarifa Info */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tarifa Aplicada</p>
                  <p className="font-data-mono font-bold text-lg text-on-surface">S/ {Number(periodoSeleccionado.tarifa_kwh).toFixed(4)} <span className="text-sm font-normal">por kWh</span></p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">bolt</span>
                </div>
              </div>

              {/* Toggle Modo */}
              <div className="flex bg-surface-container-low p-1 rounded-xl mb-4 border border-outline-variant/30">
                <button 
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${modo === 'Masivo' ? 'bg-white shadow text-primary border border-outline-variant/20' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  onClick={() => setModo('Masivo')}
                >
                  <span className="material-symbols-outlined text-[18px]">groups</span>
                  Masivo
                </button>
                <button 
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${modo === 'Individual' ? 'bg-white shadow text-primary border border-outline-variant/20' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  onClick={() => setModo('Individual')}
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Individual
                </button>
              </div>

              {modo === 'Masivo' ? (
                <>
                  {/* Status Grid */}
                  <div className="grid grid-cols-3 gap-sm">
                    <div className="bg-surface-container rounded-xl p-md text-center">
                      <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Medidores</p>
                      <p className="font-data-mono font-bold text-xl text-on-surface">{totalMedidores}</p>
                    </div>
                    <div className="bg-success/10 border border-success/20 rounded-xl p-md text-center">
                      <p className="text-[11px] font-bold text-success uppercase tracking-wider mb-1">Leídos</p>
                      <p className="font-data-mono font-bold text-xl text-success">{cantidadLecturas}</p>
                    </div>
                    <div className={`border rounded-xl p-md text-center ${lecturasFaltantes > 0 ? 'bg-error/10 border-error/20' : 'bg-surface-container border-transparent'}`}>
                      <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${lecturasFaltantes > 0 ? 'text-error' : 'text-on-surface-variant'}`}>
                        Faltantes
                      </p>
                      <p className={`font-data-mono font-bold text-xl ${lecturasFaltantes > 0 ? 'text-error' : 'text-on-surface'}`}>
                        {lecturasFaltantes}
                      </p>
                    </div>
                  </div>

                  {/* Warnings */}
                  {totalMedidores === 0 ? (
                    <div className="bg-error/10 border-l-4 border-error p-md rounded-r-lg flex items-start gap-3">
                      <span className="material-symbols-outlined text-error">warning</span>
                      <p className="text-sm text-error font-medium leading-tight">
                        No hay lecturas registradas para facturar en este periodo.
                      </p>
                    </div>
                  ) : lecturasFaltantes > 0 ? (
                    <div className="bg-error/10 border-l-4 border-error p-md rounded-r-lg flex items-start gap-3">
                      <span className="material-symbols-outlined text-error">warning</span>
                      <p className="text-sm text-error font-medium leading-tight">
                        No puedes generar las facturas porque faltan {lecturasFaltantes} lecturas por registrar. Ve al Módulo de Registro Manual para completarlas.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-success/10 border-l-4 border-success p-md rounded-r-lg flex items-start gap-3">
                      <span className="material-symbols-outlined text-success">check_circle</span>
                      <p className="text-sm text-success font-medium leading-tight">
                        Todas las lecturas del mes han sido registradas. Puedes proceder con la generación.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Seleccione un Miembro</label>
                  <select 
                    value={selectedUsuarioId}
                    onChange={(e) => setSelectedUsuarioId(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg font-body-md bg-white focus:border-primary focus:ring-1 focus:ring-primary px-3 py-2 cursor-pointer outline-none"
                  >
                    <option value="">-- Buscar Miembro --</option>
                    {usuarios.map(u => (
                      <option key={u.id} value={u.id}>{u.nombre_razonsocial} ({u.documento_identidad})</option>
                    ))}
                  </select>
                  <p className="text-xs text-on-surface-variant mt-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    Se verificará que el miembro tenga una lectura registrada en este periodo.
                  </p>
                </div>
              )}

              <div className="bg-secondary-container/30 border border-secondary/20 p-md rounded-lg flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <strong className="text-on-surface">Nota sobre multas:</strong> Si un miembro incurre en multas por manipulación o reconexión, estas deben agregarse de manera manual editando su recibo correspondiente después de haberlos generado.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-md bg-surface-container-lowest border-t border-outline-variant flex gap-sm">
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-2.5 rounded-xl font-bold border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handleGenerate}
            disabled={isProcessing || isLoading || (modo === 'Masivo' ? (lecturasFaltantes > 0 || totalMedidores === 0) : !selectedUsuarioId)}
            className="flex-[2] py-2.5 rounded-xl font-bold bg-primary text-on-primary hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isProcessing ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                Generando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                Proceder a Generar Facturas
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default GenerateInvoicesModal;
