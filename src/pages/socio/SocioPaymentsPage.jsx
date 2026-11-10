import 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import FullScreenLoader from '../../components/ui/FullScreenLoader';
import { toast } from 'sonner';
import { downloadBlob, MIME_TYPES } from '../../utils/downloadFile';
import { formatPeriodo } from './formatPeriodo';

const formatFechaPago = (fecha) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(fecha || ''));
  return match ? `${match[3]}/${match[2]}/${match[1]}` : 'No disponible';
};

const SocioPaymentsPage = () => {
  const { user } = useAuth();

  const { data: pagos = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['socio-pagos-list', user?.id],
    queryFn: () => api.get(`/pagos/usuario/${user?.id}`).then(res => res.data),
    enabled: !!user?.id
  });

  const downloadTicket = async (pago) => {
    try {
      const response = await api.get(`/pagos/${pago.id}/ticket`, { responseType: 'blob' });
      downloadBlob(response.data, `ticket_pago_${pago.id}.pdf`, MIME_TYPES.PDF);
    } catch {
      toast.error('No se pudo descargar el ticket. Inténtalo nuevamente.');
    }
  };

  if (isLoading) {
    return <FullScreenLoader title="Consultando tus pagos" subtitle="Ordenando comprobantes y movimientos registrados." />;
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
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Tus movimientos</p><h1 className="mt-1 text-xl font-bold text-slate-900">Historial de pagos</h1><p className="mt-1 text-xs text-slate-600 sm:text-sm">Consulta tus pagos y descarga sus tickets.</p>
        </div>
        <span className="rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">{pagos.length} {pagos.length === 1 ? 'pago' : 'pagos'}</span>
      </div>

      <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
        {pagos.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] mb-4 opacity-50" translate="no">payments</span>
            <p className="font-bold text-lg">No hay pagos registrados</p>
            <p className="text-sm mt-1">Aún no se ha registrado ningún pago a su nombre.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pagos.map((pago) => (
              <article key={pago.id} className="rounded-xl border border-emerald-200 border-l-4 border-l-emerald-500 bg-white p-4 sm:p-5 motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{formatPeriodo(pago.periodo)}</p>
                    <h3 className="mt-1 text-base font-bold text-on-surface">Recibo {pago.numero_comprobante || '—'}</h3>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]" translate="no" aria-hidden="true">calendar_today</span>
                      Fecha de pago: {formatFechaPago(pago.fecha_pago)}
                    </p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {pago.metodo_pago || 'Método no indicado'}{pago.numero_operacion ? ` · Operación: ${pago.numero_operacion}` : ''} · {pago.estado_validacion === 'Confirmado' ? 'Confirmado' : 'Pendiente de validación'}
                    </p>
                  </div>
                  <div className="flex flex-col items-stretch gap-3 border-t border-outline-variant/30 pt-3 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                    <span className="text-xl font-bold font-data-mono text-teal-700">S/ {Number(pago.monto_pagado).toFixed(2)}</span>
                    <button type="button" onClick={() => downloadTicket(pago)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" aria-label={`Descargar ticket del pago de ${pago.numero_comprobante || pago.id}`}>
                      <span className="material-symbols-outlined text-[18px]" translate="no" aria-hidden="true">download</span>
                      Descargar ticket
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default SocioPaymentsPage;
