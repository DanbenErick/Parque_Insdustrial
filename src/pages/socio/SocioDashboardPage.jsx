import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SocioDashboardPage = () => {
  const { user } = useAuth();

  const { data: recibos = [], isLoading: isLoadingRecibos } = useQuery({
    queryKey: ['socio-recibos', user?.id],
    queryFn: () => api.get(`/recibos/usuario/${user?.id}`).then(res => res.data),
    enabled: !!user?.id
  });

  const { data: medidores = [], isLoading: isLoadingMedidores } = useQuery({
    queryKey: ['socio-medidores', user?.id],
    queryFn: () => api.get(`/medidores/usuario/${user?.id}`).then(res => res.data),
    enabled: !!user?.id
  });

  const isLoading = isLoadingRecibos || isLoadingMedidores;

  const kpis = useMemo(() => {
    if (!recibos.length) return { deudaTotal: 0, ultimoRecibo: null, estadoUltimo: 'N/A' };
    
    const deudaTotal = recibos
      .filter(r => r.estado === 'Pendiente' || r.estado === 'Vencido' || r.estado === 'Pago Parcial')
      .reduce((sum, r) => sum + Number(r.total), 0);
      
    const ultimoRecibo = recibos[0];
    
    return {
      deudaTotal,
      ultimoRecibo,
      estadoUltimo: ultimoRecibo.estado
    };
  }, [recibos]);

  // Construir información enriquecida para cada medidor
  const medidoresConConsumo = useMemo(() => {
    return medidores.map(medidor => {
      // Buscar el último recibo emitido para este medidor específico
      const ultimoRecibo = recibos.find(r => r.medidor_num_serie === medidor.num_serie);
      return {
        ...medidor,
        ultimoConsumo: ultimoRecibo ? Number(ultimoRecibo.consumo_calculado || 0) : null,
        ultimaFecha: ultimoRecibo ? new Date(ultimoRecibo.fecha_emision).toLocaleDateString() : 'Sin registros'
      };
    });
  }, [medidores, recibos]);

  const chartData = useMemo(() => {
    const ultimos = [...recibos].slice(0, 6).reverse();
    return {
      labels: ultimos.map(r => r.periodo),
      datasets: [
        {
          label: 'Consumo Fuera Punta (kWh)',
          data: ultimos.map(r => Number(r.consumo_calculado || 0)),
          backgroundColor: 'rgba(16, 185, 129, 0.8)', 
          borderRadius: 4,
        },
        {
          label: 'Consumo Punta (kWh)',
          data: ultimos.map(r => Number(r.consumo_calculado_punta || 0)),
          backgroundColor: 'rgba(245, 158, 11, 0.8)', 
          borderRadius: 4,
        }
      ]
    };
  }, [recibos]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8, font: { size: 10 } } },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { stacked: true, beginAtZero: true, border: { dash: [4, 4] }, ticks: { font: { size: 10 } } }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-emerald-600">
        <span className="material-symbols-outlined animate-spin text-[40px]">sync</span>
        <p className="font-bold animate-pulse">Cargando su portal...</p>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1200px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Premium (Responsive) */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl p-5 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight mb-1">
              Hola, {user?.nombre_razonsocial}
            </h1>
            <p className="text-emerald-100 text-xs md:text-base opacity-90">
              Resumen de consumo y facturación de su empresa.
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-xl flex items-center gap-2 shadow-inner w-full sm:w-auto">
            <span className="material-symbols-outlined text-white">badge</span>
            <div>
              <p className="text-[9px] text-emerald-100 uppercase tracking-wider font-bold leading-tight">Documento</p>
              <p className="font-data-mono font-bold leading-tight text-sm">{user?.documento_identidad}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL: Mis Medidores (Mobile First Grid) */}
      <div>
        <h2 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">electric_meter</span>
          Mis Medidores
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {medidoresConConsumo.map(medidor => (
            <div key={medidor.id} className="bg-white rounded-2xl p-5 border border-outline-variant/60 shadow-sm flex flex-col relative overflow-hidden group hover:border-emerald-500 transition-colors">
              <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                  <span className="material-symbols-outlined text-[24px]">power</span>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-surface-container-lowest text-on-surface-variant text-[10px] uppercase font-bold tracking-wider rounded-lg border border-outline-variant/50">
                    {medidor.tipo || 'Desconocido'}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-0.5">Serie del Medidor</p>
                <h3 className="font-data-mono font-bold text-lg text-on-surface">{medidor.num_serie}</h3>
              </div>
              
              <div className="mt-auto pt-4 border-t border-outline-variant/30 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Último Consumo</p>
                  {medidor.ultimoConsumo !== null ? (
                    <p className="font-data-mono font-bold text-emerald-600 text-xl">
                      {medidor.ultimoConsumo} <span className="text-xs text-on-surface-variant font-sans">kWh</span>
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-on-surface-variant">Sin registros</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Fecha</p>
                  <p className="text-xs font-bold text-on-surface">{medidor.ultimaFecha}</p>
                </div>
              </div>
            </div>
          ))}
          {medidoresConConsumo.length === 0 && (
             <div className="col-span-full p-6 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
               No tiene medidores registrados a su nombre.
             </div>
          )}
        </div>
      </div>

      {/* SECCIÓN SECUNDARIA: Estado de Cuenta y Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        
        {/* Resumen de Deuda */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 border border-outline-variant shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${kpis.deudaTotal > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Total a Pagar</p>
              <h3 className={`text-xl font-bold font-data-mono ${kpis.deudaTotal > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                S/ {kpis.deudaTotal.toFixed(2)}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-outline-variant shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Último Recibo</p>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-data-mono text-on-surface">
                  {kpis.ultimoRecibo ? `S/ ${Number(kpis.ultimoRecibo.total).toFixed(2)}` : 'N/A'}
                </h3>
                {kpis.ultimoRecibo && (
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${
                    kpis.estadoUltimo === 'Pagado' ? 'bg-green-100 text-green-700' :
                    kpis.estadoUltimo === 'Vencido' ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {kpis.estadoUltimo}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link to="/billing" className="flex-1 text-center bg-surface-container hover:bg-surface-container-high transition-colors p-3 rounded-xl text-xs font-bold text-on-surface">
              Ver Recibos
            </Link>
            <Link to="/payments" className="flex-1 text-center bg-emerald-50 hover:bg-emerald-100 transition-colors p-3 rounded-xl text-xs font-bold text-emerald-700">
              Ver Pagos
            </Link>
          </div>
        </div>

        {/* Gráfico */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant shadow-sm p-4 md:p-6 flex flex-col h-[300px] md:h-auto">
          <h2 className="text-sm font-bold text-on-surface mb-1">Historial de Consumo</h2>
          <p className="text-[11px] text-on-surface-variant mb-4">Consumo de sus últimos 6 periodos facturados.</p>
          <div className="flex-grow relative min-h-[200px]">
            {recibos.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant/50">
                <span className="material-symbols-outlined text-[36px] mb-2">bar_chart</span>
                <p className="text-xs">Sin datos de consumo.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
};

export default SocioDashboardPage;
