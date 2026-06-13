/**
 * Financial data processing utilities for the Dashboard.
 */

const MESES_MAP = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun',
  '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
};

/**
 * Formats a raw period string (YYYY-MM or MM-YYYY) into a short label.
 */
export const formatPeriodName = (raw) => {
  if (!raw) return '';
  if (!raw.includes('-')) return raw;

  const parts = raw.split('-');
  if (parts[0].length === 4) {
    return `${MESES_MAP[parts[1]] || parts[1]} ${parts[0].slice(2)}`;
  }
  return `${MESES_MAP[parts[0]] || parts[0]} ${parts[1].slice(2)}`;
};

/**
 * Processes recibos into recaudación data for charting.
 * Returns { recaudacionData: Array<{label, recaudado}>, totalRecaudado: number }
 */
export const buildRecaudacionData = (recibos, chartViewMode) => {
  if (!recibos?.length) {
    return { recaudacionData: [], totalRecaudado: 0 };
  }

  // 1. Build financial history grouped by period key
  const financialHistory = {};

  for (const r of recibos) {
    let key = r.periodo;

    if (chartViewMode === 'global' && key?.includes('-')) {
      const parts = key.split('-');
      key = parts[0].length === 4 ? parts[0] : parts[1];
    }

    if (key) {
      if (!financialHistory[key]) {
        financialHistory[key] = 0;
      }
      if (r.estado === 'Pagado') {
        financialHistory[key] += parseFloat(r.total) || 0;
      }
    }
  }

  // 2. Sort and take last 6
  const sortedPeriods = Object.keys(financialHistory)
    .sort((a, b) => a.localeCompare(b))
    .slice(-6);

  // 3. Build final array
  const recaudacionData = sortedPeriods.map(p => ({
    label: chartViewMode === 'global' ? p : formatPeriodName(p),
    recaudado: financialHistory[p],
  }));

  const totalRecaudado = recaudacionData.reduce((acc, curr) => acc + curr.recaudado, 0);

  return { recaudacionData, totalRecaudado };
};

/**
 * Derives KPI display values from raw kpis data + chartData.
 */
export const deriveKpiValues = (kpis, chartData) => {
  const sorted = chartData?.length
    ? [...chartData].sort((a, b) => b.consumo - a.consumo)
    : [];

  return {
    maxConsumo: kpis.maxConsumo ?? (sorted[0]?.consumo || 0),
    maxPeriodo: kpis.maxPeriodo ?? (sorted[0]?.periodo || 'N/A'),
    minConsumo: kpis.minConsumo ?? (sorted[sorted.length - 1]?.consumo || 0),
    minPeriodo: kpis.minPeriodo ?? (sorted[sorted.length - 1]?.periodo || 'N/A'),
    totalConsumo: kpis.totalConsumo ?? 0,
  };
};
