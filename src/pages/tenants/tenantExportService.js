import { toast } from 'sonner';
import api from '../../api/axiosConfig';

export const exportToExcel = async () => {
  try {
    toast.info('Generando Excel, por favor espere...');
    const response = await api.get('/usuarios/export/excel?rol_id=3', { responseType: 'blob' });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Socios_${new Date().toISOString().slice(0, 10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
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
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    toast.success('Reporte generado exitosamente');
    return url;
  } catch (error) {
    console.error(error);
    toast.error('Error al generar el PDF');
    return null;
  }
};
