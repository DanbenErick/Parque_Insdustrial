import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../api/axiosConfig';

const HistorialModal = ({ isOpen, reciboId, onClose }) => {
  const [historial, setHistorial] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && reciboId) {
      fetchHistorial();
    } else {
      setHistorial([]);
    }
    // eslint-disable-next-line
  }, [isOpen, reciboId]);

  const fetchHistorial = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/recibos/${reciboId}/historial`);
      setHistorial(response.data);
    } catch (error) {
      toast.error('Error al obtener el historial del recibo.');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-elevation-3 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">history</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface leading-tight">Historial de Refacturaciones</h2>
              <p className="text-sm text-on-surface-variant font-medium">Auditoría de cambios para este recibo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-surface-container-lowest/30">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-[32px] mb-4 text-primary">sync</span>
              <p className="font-bold">Cargando historial...</p>
            </div>
          ) : historial.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              <p>No se encontró historial para este recibo.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-outline-variant ml-4 space-y-8 pb-4">
              {historial.map((item, index) => {
                const isLatest = index === 0;
                const isAnulado = item.estado === 'Anulado';
                
                return (
                  <div key={item.id} className="relative pl-6">
                    {/* Timeline dot */}
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-surface ${
                      isLatest ? 'bg-primary ring-4 ring-primary/20' : (isAnulado ? 'bg-error' : 'bg-surface-variant')
                    }`}></div>
                    
                    <div className={`bg-surface border rounded-xl p-4 shadow-sm transition-all ${
                      isLatest ? 'border-primary/30 ring-1 ring-primary/10' : 'border-outline-variant opacity-80'
                    }`}>
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-data-mono font-bold text-on-surface text-[14px]">
                            {item.numero_comprobante}
                          </span>
                          {isLatest && (
                            <span className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                              Actual
                            </span>
                          )}
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                            isAnulado ? 'bg-error/10 text-error' : 'bg-surface-container-high text-on-surface-variant'
                          }`}>
                            {item.estado}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {new Date(item.created_at).toLocaleString('es-PE')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-0.5">Total</p>
                          <p className="font-data-mono font-bold text-[14px] text-on-surface">S/ {parseFloat(item.total).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-0.5">Energía</p>
                          <p className="font-data-mono text-[13px] text-on-surface-variant">
                            S/ {(parseFloat(item.cargo_energia) + parseFloat(item.cargo_energia_punta || 0)).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-0.5">Fijo/Mant</p>
                          <p className="font-data-mono text-[13px] text-on-surface-variant">
                            S/ {(parseFloat(item.cargo_fijo) + parseFloat(item.cargo_mantenimiento)).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-0.5">Descuento</p>
                          <p className="font-data-mono text-[13px] text-emerald-600">S/ {parseFloat(item.descuento || 0).toFixed(2)}</p>
                        </div>
                      </div>

                      {item.motivo_anulacion && (
                        <div className="mt-2 p-2.5 bg-error/5 rounded-lg border border-error/10 flex items-start gap-2">
                          <span className="material-symbols-outlined text-error text-[16px] mt-0.5">info</span>
                          <div>
                            <p className="text-[10px] font-bold text-error uppercase mb-0.5">Motivo de Anulación</p>
                            <p className="text-[12px] text-on-surface-variant font-medium">{item.motivo_anulacion}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistorialModal;
