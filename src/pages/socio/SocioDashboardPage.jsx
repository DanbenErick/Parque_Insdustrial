import  { useMemo, useState } from 'react';
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
import FullScreenLoader from '../../components/ui/FullScreenLoader';
import { useAppNavigate } from '../../context/NavigationFeedbackContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SocioDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useAppNavigate();
  const [selectedChartMedidor, setSelectedChartMedidor] = useState('Todos');
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);

  const { data: paymentConfig, isLoading: isLoadingPaymentConfig, isError: isPaymentConfigError, refetch: refetchPaymentConfig } = useQuery({
    queryKey: ['payment-config'],
    queryFn: () => api.get('/config').then(res => res.data),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
  });

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
    let recibosFiltrados = recibos;
    if (selectedChartMedidor !== 'Todos') {
      recibosFiltrados = recibos.filter(r => r.medidor_num_serie === selectedChartMedidor);
    }

    const agrupado = {};
    recibosFiltrados.forEach(r => {
      const per = r.periodo;
      if (!agrupado[per]) agrupado[per] = { p: per, normal: 0, punta: 0 };
      agrupado[per].normal += Number(r.consumo_calculado || 0);
      agrupado[per].punta += Number(r.consumo_calculado_punta || 0);
    });

    // Sort descending by period, take top 6, then reverse for chronological order on chart
    const list = Object.values(agrupado).sort((a,b) => b.p.localeCompare(a.p)).slice(0, 6).reverse();

    return {
      labels: list.map(r => r.p),
      datasets: [
        {
          label: 'Consumo Fuera Punta (kWh)',
          data: list.map(r => r.normal),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderRadius: 4,
        },
        {
          label: 'Consumo Punta (kWh)',
          data: list.map(r => r.punta),
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          borderRadius: 4,
        }
      ]
    };
  }, [recibos, selectedChartMedidor]);

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
    return <FullScreenLoader title="Preparando tu portal" subtitle="Consultando tus medidores, consumos y recibos más recientes." />;
  }

  return (
    <main className="p-4 md:p-6 lg:p-8 space-y-4 max-w-[1200px] mx-auto w-full motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-4 motion-safe:duration-500">

      {/* Header Premium (Responsive) */}
      <div className="rounded-xl border border-emerald-200 bg-white px-4 py-4 sm:px-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-4 motion-safe:duration-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 border-l-4 border-emerald-600 pl-4">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700">Mi resumen</p>
            <h1 className="break-words text-lg md:text-2xl font-bold tracking-tight text-slate-900">
              Hola, {user?.nombre_razonsocial}
            </h1>
            <p className="mt-1 text-xs text-slate-600 sm:text-sm">
              Resumen de consumo y facturación de su empresa.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            <div className="text-xs text-slate-500">Documento <span className="font-data-mono font-bold text-slate-800">{user?.documento_identidad || '—'}</span></div>
            <button type="button" onClick={() => setShowPaymentInfo((visible) => !visible)} aria-expanded={showPaymentInfo} aria-controls="payment-info" className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
              <span className="material-symbols-outlined text-[19px]" translate="no" aria-hidden="true">account_balance</span>
              ¿Dónde pagar?
              <span className="material-symbols-outlined text-[18px]" translate="no" aria-hidden="true">{showPaymentInfo ? 'expand_less' : 'expand_more'}</span>
            </button>
          </div>
        </div>
      </div>

      {showPaymentInfo && <section id="payment-info" aria-labelledby="payment-info-title" className="rounded-xl border border-emerald-200 bg-white p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-emerald-700" translate="no" aria-hidden="true">account_balance</span>
          <div className="min-w-0 flex-1">
            <h2 id="payment-info-title" className="text-lg font-bold text-emerald-900">Cuentas de Pago</h2>
            <p className="mt-1 text-sm text-emerald-900">Realiza tu depósito o transferencia a las cuentas oficiales de Parque Jicamarca:</p>
            {isLoadingPaymentConfig ? (
              <p className="mt-3 text-sm text-emerald-800">Consultando los datos de pago...</p>
            ) : isPaymentConfigError ? (
              <p className="mt-3 text-sm text-emerald-900">No se pudieron consultar las cuentas. <button type="button" onClick={() => refetchPaymentConfig()} className="font-bold underline">Reintentar</button></p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="min-w-0 rounded-xl border border-emerald-200 bg-white p-3"><p className="text-xs font-bold uppercase tracking-wide text-emerald-800">{paymentConfig?.cuenta_bancaria ? 'Cuenta bancaria' : 'Banco BCP (Soles)'}</p><p className="mt-1 break-all text-lg font-bold text-emerald-950">{paymentConfig?.cuenta_bancaria || '191-14302973046'}</p></div>
                <div className="min-w-0 rounded-xl border border-emerald-200 bg-white p-3"><p className="text-xs font-bold uppercase tracking-wide text-emerald-800">CCI</p><p className="mt-1 break-all text-lg font-bold text-emerald-950">{paymentConfig?.cuenta_cci || 'No configurado'}</p></div>
                {paymentConfig?.cuenta_yape && <div className="min-w-0 rounded-xl border border-emerald-200 bg-white p-3"><p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Yape / Plin</p><p className="mt-1 break-all text-lg font-bold text-emerald-950">{paymentConfig.cuenta_yape}</p></div>}
              </div>
            )}
            {!isLoadingPaymentConfig && !isPaymentConfigError && <p className="mt-3 text-sm text-emerald-900">Titular: <strong>{paymentConfig?.titular_cuenta || 'Parque Industrial Jicamarca'}</strong></p>}
            <p className="mt-3 text-sm text-emerald-900">Una vez hecho tu pago, envía el comprobante por WhatsApp a la administración para validar tu recibo.</p>
          </div>
        </div>
      </section>}

      {/* SECCIÓN SECUNDARIA: Estado de Cuenta y Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">

        {/* Resumen de Deuda */}
        <div className="flex flex-col gap-4">
          <div className={`rounded-xl bg-white p-4 border flex items-center gap-4 motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1 ${kpis.deudaTotal > 0 ? 'border-amber-200' : 'border-emerald-200'}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${kpis.deudaTotal > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <span className="material-symbols-outlined text-[24px]" translate="no">account_balance_wallet</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Total a Pagar</p>
              <h3 className={`text-xl font-bold font-data-mono ${kpis.deudaTotal > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                S/ {kpis.deudaTotal.toFixed(2)}
              </h3>
              <p className="mt-1 text-xs text-on-surface-variant">{kpis.deudaTotal > 0 ? 'Tienes pagos pendientes' : 'No tienes pagos pendientes'}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-200 flex items-center gap-4 motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]" translate="no">receipt_long</span>
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
            <button type="button" onClick={() => navigate('/billing')} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 transition-colors p-3 rounded-xl text-xs font-bold text-white">
              <span className="material-symbols-outlined text-[17px]" translate="no" aria-hidden="true">receipt_long</span> Ver recibos
            </button>
            <button type="button" onClick={() => navigate('/payments')} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white border border-emerald-200 hover:bg-emerald-50 transition-colors p-3 rounded-xl text-xs font-bold text-emerald-700">
              <span className="material-symbols-outlined text-[17px]" translate="no" aria-hidden="true">payments</span> Ver pagos
            </button>
          </div>
        </div>

        {/* Gráfico */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-emerald-200 p-4 sm:p-5 flex flex-col h-[320px] md:h-auto motion-safe:transition-colors motion-safe:duration-300 hover:border-emerald-300">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1">
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-emerald-600" translate="no" aria-hidden="true">bar_chart</span>Historial de consumo</h2>
            <select
              value={selectedChartMedidor}
              onChange={(e) => setSelectedChartMedidor(e.target.value)}
              className="text-[11px] bg-surface-container border border-outline-variant rounded-md px-2 py-1 outline-none cursor-pointer text-on-surface-variant font-medium min-w-[120px]"
            >
              <option value="Todos">Todos los Medidores</option>
              {medidores.map(m => (
                <option key={m.id} value={m.num_serie}>{m.num_serie} {m.direccion ? `(${m.direccion})` : ''}</option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-on-surface-variant mb-4">Consumo de sus últimos 6 periodos facturados.</p>
          <div className="flex-grow relative min-h-[200px]">
            {recibos.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant/50">
                <span className="material-symbols-outlined text-[36px] mb-2" translate="no">bar_chart</span>
                <p className="text-xs">Sin datos de consumo.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* SECCIÓN PRINCIPAL: Mis Medidores (Mobile First Grid) */}
      <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-1000">
        <h2 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600" translate="no">electric_meter</span>
          Mis Medidores
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {medidoresConConsumo.map(medidor => (
            <div key={medidor.id} className="bg-white rounded-xl p-4 border border-emerald-200 flex flex-col relative overflow-hidden group motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>

              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                  <span className="material-symbols-outlined text-[24px]" translate="no">power</span>
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

                {medidor.direccion && (
                  <>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-3 mb-0.5">Dirección</p>
                    <p className="text-xs font-bold text-on-surface truncate" title={medidor.direccion}>
                      {medidor.direccion}
                    </p>
                  </>
                )}
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

    </main>
  );
};

export default SocioDashboardPage;
