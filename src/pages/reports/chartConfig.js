/**
 * Static chart option configs for the Reports page.
 * Extracted outside the component to avoid re-creation on every render.
 */

const FONT_BODY = 'Hanken Grotesk';
const FONT_MONO = 'JetBrains Mono';

const SHARED_TOOLTIP = {
  backgroundColor: '#1a1c1e',
  titleColor: '#a0aec0',
  bodyColor: '#ffffff',
  titleFont: { family: FONT_BODY, size: 10, weight: '600' },
  bodyFont: { family: FONT_MONO, size: 13, weight: 'bold' },
  padding: { top: 10, bottom: 10, left: 14, right: 14 },
  cornerRadius: 10,
  displayColors: true,
  boxWidth: 4,
  boxHeight: 14,
  boxPadding: 6,
};

export const FINANCIAL_CHART_OPTIONS = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 800, easing: 'easeOutQuart' },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        boxWidth: 10,
        boxHeight: 10,
        borderRadius: 3,
        useBorderRadius: true,
        padding: 16,
        font: { family: FONT_BODY, size: 11, weight: '600' },
        color: '#475569'
      }
    },
    tooltip: {
      ...SHARED_TOOLTIP,
      callbacks: {
        label: (context) => ` ${context.dataset.label}: S/ ${parseFloat(context.raw).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: { color: 'rgba(148, 163, 184, 0.12)', drawTicks: false, lineWidth: 1 },
      ticks: {
        color: '#94a3b8',
        font: { family: FONT_MONO, size: 10, weight: '500' },
        padding: 8,
        callback: (value) => `S/ ${value.toLocaleString('es-PE')}`
      },
      border: { display: false }
    },
    y: {
      grid: { display: false },
      ticks: {
        color: '#475569',
        font: { family: FONT_BODY, size: 11, weight: '600' },
        padding: 8,
      },
      border: { display: false }
    }
  }
};

export const CONSUMO_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 800, easing: 'easeOutQuart' },
  plugins: {
    legend: { display: false },
    tooltip: {
      ...SHARED_TOOLTIP,
      bodyFont: { family: FONT_MONO, size: 14, weight: 'bold' },
      callbacks: {
        label: (context) => ` Consumo: ${parseFloat(context.raw).toLocaleString('es-PE')} kWh`
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: '#64748b',
        font: { family: FONT_BODY, size: 11, weight: '600' },
        padding: 8,
      },
      border: { display: false }
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(148, 163, 184, 0.12)', drawTicks: false, lineWidth: 1 },
      ticks: {
        color: '#94a3b8',
        font: { family: FONT_MONO, size: 10, weight: '500' },
        padding: 12,
        callback: (value) => `${value.toLocaleString('es-PE')}`
      },
      border: { display: false }
    }
  }
};

export const buildDoughnutOptions = (paidCount, pendingCount) => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { animateRotate: true, duration: 1000, easing: 'easeOutQuart' },
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        boxWidth: 10,
        boxHeight: 10,
        borderRadius: 3,
        useBorderRadius: true,
        padding: 16,
        font: { family: FONT_BODY, size: 11, weight: '600' },
        color: '#475569'
      }
    },
    tooltip: {
      ...SHARED_TOOLTIP,
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const val = context.raw || 0;
          const total = paidCount + pendingCount;
          const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
          return ` ${label}: ${val} recibo(s) (${pct}%)`;
        }
      }
    }
  },
  cutout: '68%'
});

export const buildRecaudacionOptions = () => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 900, easing: 'easeOutQuart' },
  plugins: {
    legend: { display: false },
    tooltip: {
      ...SHARED_TOOLTIP,
      bodyFont: { family: FONT_MONO, size: 14, weight: 'bold' },
      callbacks: {
        label: (context) => ` Recaudado: S/ ${parseFloat(context.raw).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: { color: 'rgba(148, 163, 184, 0.12)', drawTicks: false, lineWidth: 1 },
      ticks: {
        color: '#94a3b8',
        font: { family: FONT_MONO, size: 10, weight: '500' },
        padding: 8,
        callback: (value) => `S/ ${value.toLocaleString('es-PE')}`
      },
      border: { display: false }
    },
    y: {
      grid: { display: false },
      ticks: {
        color: '#475569',
        font: { family: FONT_BODY, size: 11, weight: '600' },
        padding: 12,
      },
      border: { display: false }
    }
  }
});
