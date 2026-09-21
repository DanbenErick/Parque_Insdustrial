import { toast } from 'sonner';
import api from '../../api/axiosConfig';
import { createBlobUrl, downloadBlob, MIME_TYPES } from '../../utils/downloadFile';

export const exportToExcel = async () => {
  try {
    toast.info('Generando Excel, por favor espere...');
    const response = await api.get('/usuarios/export/excel?rol_id=3', { responseType: 'blob' });

    downloadBlob(response.data, `Socios_${new Date().toISOString().slice(0, 10)}.xlsx`, MIME_TYPES.EXCEL);

    toast.success('Excel descargado exitosamente');
  } catch (error) {
    console.error(error);
    toast.error('Error al exportar a Excel');
  }
};

export const generatePDFPreview = async () => {
  try {
    toast.info('Generando PDF, por favor espere...');
    const response = await api.get('/usuarios/export/pdf?rol_id=3', { responseType: 'blob' });
    const url = createBlobUrl(response.data, MIME_TYPES.PDF);
    toast.success('Reporte generado exitosamente');
    return url;
  } catch (error) {
    console.error(error);
    toast.error('Error al generar el PDF');
    return null;
  }
};
