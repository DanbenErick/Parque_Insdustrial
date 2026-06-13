import { toast } from 'sonner';
import api from '../../api/axiosConfig';

/**
 * Downloads a blob response from the API as a file.
 * @param {Blob} blob - The blob data to download.
 * @param {string} filename - The desired filename.
 */
const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const handleExportPDF = async (selectedPeriod) => {
  try {
    toast.info('Generando PDF, por favor espere...');
    const response = await api.get(`/recibos/reportes/facturacion/pdf?periodo=${selectedPeriod}`, { responseType: 'blob' });
    downloadBlob(new Blob([response.data], { type: 'application/pdf' }), `Reporte_Consumo_Facturacion_${selectedPeriod}.pdf`);
    toast.success('Reporte PDF descargado exitosamente');
  } catch (error) {
    console.error('Error al generar PDF:', error);
    toast.error('Error al exportar reporte a PDF');
  }
};

export const handleExportExcel = async (selectedPeriod) => {
  try {
    toast.info('Generando Excel, por favor espere...');
    const response = await api.get(`/recibos/reportes/facturacion/excel?periodo=${selectedPeriod}`, { responseType: 'blob' });
    downloadBlob(new Blob([response.data]), `Reporte_Facturacion_${selectedPeriod}.xlsx`);
    toast.success('Reporte Excel descargado exitosamente');
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    toast.error('Error al exportar reporte a Excel');
  }
};
