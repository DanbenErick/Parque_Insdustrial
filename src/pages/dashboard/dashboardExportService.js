/**
 * Export utilities for Dashboard data (Excel, PDF, CSV).
 * Refactored to use API for Excel and PDF to avoid heavy client-side dependencies.
 */

const getFileName = (ext) =>
  `Lecturas_Parque_Industrial_${new Date().toISOString().slice(0, 10)}.${ext}`;

import api from '../../api/axiosConfig';
import { downloadBlob, MIME_TYPES } from '../../utils/downloadFile';

export const handleExportExcel = async () => {
  try {
    const response = await api.get('/dashboard/export/excel', { responseType: 'blob' });
    downloadBlob(response.data, getFileName('xlsx'), MIME_TYPES.EXCEL);
  } catch (error) {
    console.error('Error al exportar a Excel', error);
    alert('Error al exportar a Excel');
  }
};

export const handleExportPDF = async () => {
  try {
    const response = await api.get('/dashboard/export/pdf', { responseType: 'blob' });
    downloadBlob(response.data, getFileName('pdf'), MIME_TYPES.PDF);
  } catch (error) {
    console.error('Error al exportar a PDF', error);
    alert('Error al exportar a PDF');
  }
};

export const handleExportCSV = (readings) => {
  if (!readings?.length) return alert('No hay datos para exportar');

  try {
    const headers = ['Empresa', 'ID', 'Sector', 'Lectura_kWh', 'Tendencia'];
    const rows = readings.map(r => [
      `"${r.company.replace(/"/g, '""')}"`,
      r.id,
      `"${r.sector}"`,
      r.value,
      r.trend,
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, getFileName('csv'), 'text/csv;charset=utf-8;');
  } catch (error) {
    console.error('Error al exportar a CSV', error);
    alert('Error al exportar a CSV');
  }
};
