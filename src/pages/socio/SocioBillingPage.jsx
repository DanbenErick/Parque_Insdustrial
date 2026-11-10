import  { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import FullScreenLoader from '../../components/ui/FullScreenLoader';
import { downloadBlob, MIME_TYPES } from '../../utils/downloadFile';
import { buildReceiptPdfFilename } from '../billing/billingUtils';
import { formatPeriodo } from './formatPeriodo';

const STATUS_CONFIG = {
  Pendiente: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'schedule' },
  Pagado: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'check_circle' },
  Vencido: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'error' },
  'Pago Parcial': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'incomplete_circle' },
};

const getStatusConfig = (estado) =>
  STATUS_CONFIG[estado] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: 'info' };

const SocioBillingPage = () => {
  const { user } = useAuth();

  const { data: recibos = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['socio-recibos-list', user?.id],
    queryFn: () => api.get(`/recibos/usuario/${user?.id}`).then(res => res.data),
    enabled: !!user?.id
  });
  const recibosVisibles = recibos.filter((recibo) => Object.hasOwn(STATUS_CONFIG, recibo.estado));

  const handleDownloadPDF = useCallback(async (recibo) => {
    try {
      toast.loading('Generando PDF...', { id: 'pdf-gen' });
      const response = await api.get(`/recibos/${recibo.id}/pdf`, { responseType: 'blob' });
      downloadBlob(response.data, buildReceiptPdfFilename({ ...recibo, socio: recibo.socio || user?.nombre_razonsocial }), MIME_TYPES.PDF);
      toast.success('PDF descargado exitosamente', { id: 'pdf-gen' });
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      toast.error('Error al generar el PDF', { id: 'pdf-gen' });
    }
  }, [user?.nombre_razonsocial]);

  if (isLoading) {
    return <FullScreenLoader title="Consultando tus recibos" subtitle="Estamos verificando importes, vencimientos y estados de pago." />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <span className="material-symbols-outlined text-[48px]" translate="no">error</span>
        <p className="mt-2 font-bold">Error al cargar la información.</p>
        <button onClick={refetch} className="mt-4 px-4 py-2 bg-red-100 rounded-lg">Reintentar</button>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-6 lg:p-8 space-y-4 max-w-[1000px] mx-auto w-full motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-4 motion-safe:duration-500">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-4 sm:px-6">
        <div className="min-w-0 border-l-4 border-emerald-600 pl-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Tu facturación</p><h1 className="mt-1 text-xl font-bold text-slate-900">Mis recibos</h1><p className="mt-1 text-xs text-slate-600 sm:text-sm">Consulta y descarga tus recibos de consumo eléctrico.</p>
        </div>
        <span className="rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">{recibosVisibles.length} {recibosVisibles.length === 1 ? 'recibo' : 'recibos'}</span>
      </div>

      <div className="space-y-4">
        {recibosVisibles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-outline-variant p-12 flex flex-col items-center justify-center text-on-surface-variant shadow-sm">
            <span className="material-symbols-outlined text-[48px] mb-4 opacity-50" translate="no">receipt_long</span>
            <p className="font-bold text-lg">No hay recibos registrados</p>
            <p className="text-sm mt-1">Aún no se ha generado ningún recibo a su nombre.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recibosVisibles.map((recibo) => {
              const status = getStatusConfig(recibo.estado);

              return (
                <div key={recibo.id} className="bg-white rounded-xl border border-emerald-200 overflow-hidden flex flex-col motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 motion-safe:transition-transform motion-safe:hover:-translate-y-1">
                  {/* Card Header */}
                  <div className={`p-4 border-b ${status.border} ${status.bg} flex flex-wrap gap-2 justify-between items-center`}>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Recibo No.</span>
                      <span className="font-data-mono font-bold text-sm text-on-surface">{recibo.numero_comprobante}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 border ${status.border}`}>
                      <span translate="no" className={`material-symbols-outlined text-[14px] ${status.text}`}>{status.icon}</span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${status.text}`}>{recibo.estado}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-grow">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Periodo</p>
                        <p className="font-bold text-base text-emerald-800">{formatPeriodo(recibo.periodo)}</p>
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
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-sm hover:bg-emerald-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]" translate="no">download</span>
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
