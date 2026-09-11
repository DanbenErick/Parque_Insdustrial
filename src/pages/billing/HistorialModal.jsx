import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../api/axiosConfig';

const HistorialModal = ({ isOpen, reciboId, onClose }) => {
  const [historial, setHistorial] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

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

  const handleDownloadPdf = async (item) => {
    setDownloadingId(item.id);
    try {
      const response = await api.get(`/recibos/${item.id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Recibo_${item.numero_comprobante || item.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error('Error al descargar PDF');
    } finally {
      setDownloadingId(null);
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
              <span className="material-symbols-outlined text-[20px]" translate="no">history</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface leading-tight">Historial de Refacturaciones</h2>
              <p className="text-sm text-on-surface-variant font-medium">Auditoría de comprobantes para este socio y periodo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]" translate="no">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-surface-container-lowest/30">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-[32px] mb-4 text-primary" translate="no">sync</span>
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
                      isLatest ? 'border-primary/30 ring-1 ring-primary/10' : 'border-outline-variant opacity-85'
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
                          <span className="material-symbols-outlined text-[14px]" translate="no">calendar_today</span>
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

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-3 pt-2.5 border-t border-outline-variant/40">
                        {item.motivo_anulacion ? (
                          <div className="p-2 bg-error/5 rounded-lg border border-error/10 flex items-start gap-2 flex-1">
                            <span className="material-symbols-outlined text-error text-[16px] mt-0.5 shrink-0" translate="no">info</span>
                            <div>
                              <p className="text-[10px] font-bold text-error uppercase mb-0.5">Motivo de Anulación</p>
                              <p className="text-[12px] text-on-surface-variant font-medium">{item.motivo_anulacion}</p>
                            </div>
                          </div>
                        ) : <div />}

                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(item)}
                          disabled={downloadingId === item.id}
                          className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 border border-primary/20 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
                          title="Descargar PDF de este comprobante"
                        >
                          <span className="material-symbols-outlined text-[15px]" translate="no">picture_as_pdf</span>
                          {downloadingId === item.id ? 'Descargando...' : 'Ver PDF'}
                        </button>
                      </div>
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
