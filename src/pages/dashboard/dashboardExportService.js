/**
 * Export utilities for Dashboard data (Excel, PDF, CSV).
 * Refactored to use API for Excel and PDF to avoid heavy client-side dependencies.
 */

const getFileName = (ext) =>
  `Lecturas_Parque_Industrial_${new Date().toISOString().slice(0, 10)}.${ext}`;

import api from '../../api/axiosConfig';

export const handleExportExcel = async () => {
  try {
    const response = await api.get('/dashboard/export/excel', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', getFileName('xlsx'));
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Error al exportar a Excel', error);
    alert('Error al exportar a Excel');
  }
};

export const handleExportPDF = async () => {
  try {
    const response = await api.get('/dashboard/export/pdf', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', getFileName('pdf'));
    document.body.appendChild(link);
    link.click();
    link.remove();
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
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', getFileName('csv'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar a CSV', error);
    alert('Error al exportar a CSV');
  }
};
