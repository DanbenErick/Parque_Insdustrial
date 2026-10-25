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
 * Genera el nombre del archivo PDF del recibo según el formato:
 * APELLIDOS_NOMBRE_{10 ultimos caracteres de la direccion del medidor}_PERIODO.pdf
 */
export const buildReceiptPdfFilename = (recibo) => {
  if (!recibo) return 'recibo.pdf';

  // 1. APELLIDOS_NOMBRE
  const fullName = (recibo.socio || recibo.nombre_razonsocial || recibo.propietario || '').trim();
  // Helper: quita tildes, caracteres especiales y normaliza para nombre de archivo
  const toSafe = (s) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9\s_-]/g, '').trim().replace(/\s+/g, '_');

  let apellidosNombre = 'SOCIO';
  if (fullName) {
    if (fullName.includes(',')) {
      const [apellidos, nombres] = fullName.split(',').map((s) => s.trim());
      const ap = toSafe(apellidos);
      const nom = nombres ? toSafe(nombres) : '';
      apellidosNombre = nom ? `${ap}_${nom}` : ap;
    } else {
      apellidosNombre = toSafe(fullName);
    }
  }
  apellidosNombre = (apellidosNombre || 'SOCIO').toUpperCase();

  // 2. 10 últimos caracteres de la dirección del medidor
  const rawDir = (recibo.medidor_direccion || recibo.direccion || recibo.socio_direccion || '').trim();
  let dirPart = 'SIN_DIR';
  if (rawDir && rawDir.toLowerCase() !== 'sin dirección' && rawDir.toLowerCase() !== 'sin direccion' && rawDir !== '-') {
    const last10 = rawDir.length > 10 ? rawDir.slice(-10) : rawDir;
    dirPart = last10
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s_-]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .toUpperCase();
  }
  if (!dirPart) dirPart = 'SIN_DIR';

  // 3. PERIODO — el endpoint /recibos/:id retorna mes_anio; el listado retorna periodo
  const periodo = (recibo.periodo || recibo.mes_anio || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase() || 'PERIODO';

  return `${apellidosNombre}_${dirPart}_${periodo}.pdf`;
};

export { downloadBlob, MIME_TYPES } from '../../utils/downloadFile';
