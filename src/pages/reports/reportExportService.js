import { toast } from 'sonner';
import api from '../../api/axiosConfig';
import { downloadBlob, MIME_TYPES } from '../../utils/downloadFile';

export const handleExportPDF = async (selectedPeriod) => {
  try {
    toast.info('Generando PDF, por favor espere...');
    const response = await api.get(`/recibos/reporte/pdf?periodo=${selectedPeriod}`, { responseType: 'blob' });
    downloadBlob(response.data, `Reporte_Consumo_Facturacion_${selectedPeriod}.pdf`, MIME_TYPES.PDF);
    toast.success('Reporte PDF descargado exitosamente');
  } catch (error) {
    console.error('Error al generar PDF:', error);
    toast.error('Error al exportar reporte a PDF');
  }
};

export const handleExportExcel = async (selectedPeriod) => {
  try {
    toast.info('Generando Excel, por favor espere...');
    const response = await api.get(`/recibos/reporte/excel?periodo=${selectedPeriod}`, { responseType: 'blob' });
    downloadBlob(response.data, `Reporte_Facturacion_${selectedPeriod}.xlsx`, MIME_TYPES.EXCEL);
    toast.success('Reporte Excel descargado exitosamente');
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    toast.error('Error al exportar reporte a Excel');
  }
};
