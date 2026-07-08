import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const SocioBillingPage = () => {
  const { user } = useAuth();

  const { data: recibos = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['socio-recibos-list', user?.id],
    queryFn: () => api.get(`/recibos/usuario/${user?.id}`).then(res => res.data),
    enabled: !!user?.id
  });

  const handleDownloadPDF = async (recibo) => {
    try {
      toast.loading('Generando PDF...', { id: 'pdf-gen' });
      const response = await api.get(`/recibos/${recibo.id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Recibo_${recibo.periodo}_${(user?.nombre_razonsocial || '').replace(/\\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success('PDF descargado exitosamente', { id: 'pdf-gen' });
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      toast.error('Error al generar el PDF', { id: 'pdf-gen' });
    }
  };

  const getStatusConfig = (estado) => {
    switch (estado) {
      case 'Pendiente': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'schedule' };
      case 'Pagado': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'check_circle' };
      case 'Vencido': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'error' };
      case 'Pago Parcial': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'incomplete_circle' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: 'info' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-emerald-600">
        <span className="material-symbols-outlined animate-spin text-[40px]">sync</span>
        <p className="font-bold animate-pulse">Cargando sus recibos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <span className="material-symbols-outlined text-[48px]">error</span>
        <p className="mt-2 font-bold">Error al cargar la información.</p>
        <button onClick={refetch} className="mt-4 px-4 py-2 bg-red-100 rounded-lg">Reintentar</button>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1000px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Mis Recibos</h1>
          <p className="text-sm text-on-surface-variant">Historial de facturación por consumo eléctrico.</p>
        </div>
      </div>

      <div className="space-y-4">
        {recibos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-outline-variant p-12 flex flex-col items-center justify-center text-on-surface-variant shadow-sm">
            <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">receipt_long</span>
            <p className="font-bold text-lg">No hay recibos registrados</p>
            <p className="text-sm mt-1">Aún no se ha generado ningún recibo a su nombre.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recibos.map((recibo) => {
              const status = getStatusConfig(recibo.estado);
              
              return (
                <div key={recibo.id} className="bg-white rounded-2xl border border-outline-variant/60 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  {/* Card Header */}
                  <div className={`p-4 border-b ${status.border} ${status.bg} flex justify-between items-center`}>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Recibo No.</span>
                      <span className="font-data-mono font-bold text-sm text-on-surface">{recibo.numero_comprobante}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 border ${status.border}`}>
                      <span className={`material-symbols-outlined text-[14px] ${status.text}`}>{status.icon}</span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${status.text}`}>{recibo.estado}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-grow">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Periodo</p>
                        <p className="font-bold text-sm text-on-surface">{recibo.periodo}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Medidor</p>
                        <p className="font-data-mono text-sm font-bold text-on-surface">{recibo.medidor_num_serie || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Emisión</p>
                        <p className="text-xs text-on-surface-variant font-bold">
                          {new Date(recibo.fecha_emision).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Vencimiento</p>
                        <p className="text-xs text-on-surface-variant font-bold">
                          {new Date(recibo.fecha_vencimiento).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-dashed border-outline-variant/60 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-0.5">Total a Pagar</p>
                        <p className="font-data-mono text-xl font-bold text-emerald-600">S/ {Number(recibo.total).toFixed(2)}</p>
                      </div>
                      <div>
                        {recibo.estado !== 'Pagado' && recibo.saldo_restante !== null && (
                          <div className="text-right">
                            <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">Saldo Restante</p>
                            <p className="font-data-mono text-sm font-bold text-orange-600">S/ {Number(recibo.saldo_restante).toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-3 bg-surface-container-lowest border-t border-outline-variant/30 flex">
                    <button 
                      onClick={() => handleDownloadPDF(recibo)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm hover:bg-emerald-100 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      Descargar PDF
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default SocioBillingPage;
