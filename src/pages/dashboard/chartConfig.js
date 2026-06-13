/**
 * Chart.js configuration factories for the Dashboard.
 * Extracted to avoid recreating identical config objects on every render.
 */

// --- Shared tooltip style ---
const SHARED_TOOLTIP = {
  backgroundColor: '#1a1c1e',
  titleColor: '#a0aec0',
  bodyColor: '#ffffff',
  titleFont: { family: 'Hanken Grotesk', size: 10, weight: '600' },
  bodyFont: { family: 'JetBrains Mono', size: 14, weight: 'bold' },
  padding: { top: 10, bottom: 10, left: 14, right: 14 },
  cornerRadius: 10,
  displayColors: true,
  boxWidth: 4,
  boxHeight: 14,
  boxPadding: 6,
};

// --- Consumo chart colors ---
export const getConsumoBarColor = (value, max) => {
  if (max <= 0) return '#e0e5cd';
  if (value === max) return '#515B3A'; // primary
  const ratio = value / max;
  if (ratio > 0.7) return '#6b7654';
  if (ratio > 0.4) return '#8e9877';
  return '#c1c9aa';
};

// --- Recaudación chart colors ---
export const getRecaudacionBarColor = (value, max) => {
  if (max <= 0) return '#dae2fd';
  if (value === max) return '#565e74'; // secondary
  const ratio = value / max;
  if (ratio > 0.7) return '#6d768f';
  if (ratio > 0.4) return '#9199ae';
  return '#b6bccd';
};

// --- Consumo chart data factory ---
export const buildConsumoChartData = (chartData) => {
  const labels = chartData.map(d => d.periodo);
  const values = chartData.map(d => d.consumo);
  const max = Math.max(...values, 0);

  return {
    data: {
      labels,
      datasets: [{
        label: 'Consumo',
        data: values,
        backgroundColor: values.map(v => getConsumoBarColor(v, max)),
        hoverBackgroundColor: '#004d60',
        borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 2, bottomRight: 2 },
        borderSkipped: false,
        barPercentage: 0.65,
        categoryPercentage: 0.7,
      }],
    },
    total: values.reduce((a, b) => a + b, 0),
  };
};

// --- Consumo chart options (static, can be reused) ---
export const CONSUMO_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 800, easing: 'easeOutQuart' },
  plugins: {
    legend: { display: false },
    tooltip: {
      ...SHARED_TOOLTIP,
      usePointStyle: false,
      callbacks: {
        title: (ctx) => ctx[0].label,
        label: (ctx) => ` ${ctx.raw.toLocaleString('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kWh`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#64748b', font: { family: 'Hanken Grotesk', size: 11, weight: '600' }, padding: 8 },
      border: { display: false },
    },
    y: {
      grid: { color: 'rgba(148, 163, 184, 0.12)', drawTicks: false, lineWidth: 1 },
      ticks: {
        color: '#94a3b8',
        font: { family: 'JetBrains Mono', size: 10, weight: '500' },
        padding: 12,
        callback: (v) => v.toLocaleString('es-PE'),
      },
      border: { display: false },
    },
  },
};

// --- Recaudación chart data factory ---
export const buildRecaudacionChartData = (recaudacionData) => {
  const labels = recaudacionData.map(d => d.label);
  const values = recaudacionData.map(d => d.recaudado);
  const max = Math.max(...values, 0);
  const total = values.reduce((a, b) => a + b, 0);

  return {
    data: {
      labels,
      datasets: [{
        label: 'Recaudado',
        data: values,
        backgroundColor: values.map(v => getRecaudacionBarColor(v, max)),
        hoverBackgroundColor: '#047857',
        borderRadius: { topLeft: 2, topRight: 6, bottomLeft: 2, bottomRight: 6 },
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      }],
    },
    total,
  };
};

// --- Recaudación chart options (static) ---
export const RECAUDACION_CHART_OPTIONS = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 900, easing: 'easeOutQuart' },
  plugins: {
    legend: { display: false },
    tooltip: {
      ...SHARED_TOOLTIP,
      callbacks: {
        title: (ctx) => ctx[0].label,
        label: (ctx) => ` S/ ${ctx.raw.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(148, 163, 184, 0.12)', drawTicks: false, lineWidth: 1 },
      ticks: {
        color: '#94a3b8',
        font: { family: 'JetBrains Mono', size: 10, weight: '500' },
        padding: 8,
        callback: (v) => `S/ ${v.toLocaleString('es-PE')}`,
      },
      border: { display: false },
    },
    y: {
      grid: { display: false },
      ticks: { color: '#475569', font: { family: 'Hanken Grotesk', size: 11, weight: 'bold' } },
      border: { display: false },
    },
  },
};
