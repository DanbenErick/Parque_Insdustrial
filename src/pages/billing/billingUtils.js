/**
 * Billing Module — Shared Utilities
 * Extracted from Billing.jsx to eliminate code duplication.
 */

/**
 * Builds the filter params object used across multiple API calls.
 * Centralizes the repeated params-building logic.
 */
export const buildFilterParams = ({ filterMes, filterEstado, debouncedSearchTerm, activeYear }) => {
  const params = {};

  if (filterMes && filterMes !== 'Todos' && filterMes !== 'TodosHistorico') {
    params.periodo = filterMes;
  } else if (filterMes === 'Todos') {
    params.year = activeYear;
  }

  if (filterEstado !== 'Todos') {
    params.estado = filterEstado;
  }

  if (debouncedSearchTerm) {
    params.search = debouncedSearchTerm;
  }

  return params;
};

/**
 * Formats a period string like "2025-06" or "06-2025" into "Junio 2025".
 */
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const formatPeriod = (periodoStr) => {
  if (!periodoStr) return '';
  const parts = periodoStr.split('-');
  if (parts.length !== 2) return periodoStr;
  const year = parts[0].length === 4 ? parts[0] : parts[1];
  const month = parts[0].length === 4 ? parts[1] : parts[0];
  const monthIndex = parseInt(month, 10) - 1;
  if (monthIndex >= 0 && monthIndex < 12) return `${MONTH_NAMES[monthIndex]} ${year}`;
  return periodoStr;
};

/**
 * Creates a Blob URL from an API response and triggers a download.
 * Used by Excel/PDF export handlers.
 */
export const downloadBlob = (data, filename, mimeType) => {
  const blob = new Blob([data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * MIME types used across the module.
 */
export const MIME_TYPES = {
  PDF: 'application/pdf',
  EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};
