import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const SocioPaymentsPage = () => {
  const { user } = useAuth();

  const { data: pagos = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['socio-pagos-list', user?.id],
    queryFn: () => api.get(`/pagos/usuario/${user?.id}`).then(res => res.data),
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-teal-600">
        <span className="material-symbols-outlined animate-spin text-[40px]">sync</span>
        <p className="font-bold animate-pulse">Cargando historial de pagos...</p>
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

  const formatMetodo = (metodo) => {
    switch(metodo) {
      case 'Transferencia': return { icon: 'account_balance', bg: 'bg-blue-100 text-blue-700' };
      case 'Efectivo': return { icon: 'payments', bg: 'bg-green-100 text-green-700' };
      case 'Yape/Plin': return { icon: 'send_to_mobile', bg: 'bg-purple-100 text-purple-700' };
      default: return { icon: 'receipt', bg: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <main className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1000px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Historial de Pagos</h1>
          <p className="text-sm text-on-surface-variant">Consulta de todos los pagos realizados a sus recibos.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden p-2">
        {pagos.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">payments</span>
            <p className="font-bold text-lg">No hay pagos registrados</p>
            <p className="text-sm mt-1">Aún no se ha registrado ningún pago a su nombre.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pagos.map((pago) => {
              const { icon, bg } = formatMetodo(pago.metodo_pago);
              return (
                <div key={pago.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl hover:bg-surface-container-lowest transition-colors border border-transparent hover:border-outline-variant/50 group">
                  
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface flex items-center gap-2">
                        {pago.metodo_pago}
                        {pago.estado_validacion === 'Confirmado' ? (
                          <span className="material-symbols-outlined text-[14px] text-green-500" title="Pago Confirmado">verified</span>
                        ) : (
                          <span className="material-symbols-outlined text-[14px] text-orange-500" title="Pendiente de Validación">pending</span>
                        )}
                      </h3>
                      <p className="text-[11px] text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                        {new Date(pago.fecha_pago).toLocaleString()}
                      </p>
                      {pago.numero_operacion && (
                        <p className="text-[11px] font-data-mono text-on-surface-variant mt-0.5 bg-surface-container inline-block px-1.5 rounded">
                          Op: {pago.numero_operacion}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-0 flex flex-col sm:items-end w-full sm:w-auto pl-16 sm:pl-0">
                    <span className="text-lg font-bold font-data-mono text-teal-600">
                      + S/ {Number(pago.monto_pagado).toFixed(2)}
                    </span>
                    <p className="text-xs text-on-surface-variant">
                      Recibo: <span className="font-bold text-on-surface">{pago.numero_comprobante}</span> ({pago.periodo})
                    </p>
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

export default SocioPaymentsPage;
