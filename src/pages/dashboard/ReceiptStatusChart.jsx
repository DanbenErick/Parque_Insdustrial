import { Doughnut } from 'react-chartjs-2';
import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

const count = (value) => Number(value || 0).toLocaleString('es-PE');

const OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '67%',
  animation: { animateRotate: true, duration: 800, easing: 'easeOutQuart' },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => ` ${context.label}: ${count(context.raw)} recibos`,
      },
    },
  },
};

const ITEMS = [
  { label: 'Pagados', key: 'pagados', color: '#515B3A' },
  { label: 'Pendientes', key: 'pendientes', color: '#a36700' },
  { label: 'Vencidos', key: 'vencidos', color: '#565e74' },
];

const ReceiptStatusChart = ({ recibos }) => {
  const values = ITEMS.map(({ key }) => Number(recibos?.[key] || 0));
  const total = Number(recibos?.total || 0);
  const chartData = {
    labels: ITEMS.map(({ label }) => label),
    datasets: [{
      data: values,
      backgroundColor: ITEMS.map(({ color }) => color),
      hoverBackgroundColor: ITEMS.map(({ color }) => color),
      borderWidth: 0,
    }],
  };

  return (
    <section className="bg-white border border-outline-variant rounded-xl p-md shadow-sm min-w-0" aria-label="Estado de recibos">
      <h3 className="font-bold text-on-surface flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">donut_large</span>
        Estado de recibos
      </h3>
      {total > 0 ? (
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative w-36 h-36 shrink-0" role="img"
            aria-label={`${count(values[0])} pagados, ${count(values[1])} pendientes y ${count(values[2])} vencidos`}>
            <Doughnut data={chartData} options={OPTIONS} aria-hidden="true" />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-data-mono text-xl font-bold text-on-surface">{count(total)}</span>
              <span className="text-[10px] text-on-surface-variant">recibos</span>
            </div>
          </div>
          <div className="flex-1 w-full space-y-2 text-sm">
            {ITEMS.map(({ label, color }, index) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                <span className="flex-1 text-on-surface-variant">{label}</span>
                <span className="font-data-mono font-bold text-on-surface">{count(values[index])}</span>
              </div>
            ))}
          </div>
        </div>
      ) : <p className="text-sm text-on-surface-variant">Aún no se han emitido recibos en este período.</p>}
    </section>
  );
};

export default ReceiptStatusChart;
