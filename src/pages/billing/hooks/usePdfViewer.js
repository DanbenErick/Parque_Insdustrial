import { useState, useCallback } from 'react';
import api from '../../../api/axiosConfig';
import { toast } from 'sonner';
import { MIME_TYPES, downloadBlob } from '../billingUtils';

/**
 * usePdfViewer — Manages all PDF viewer modal state and handlers.
 */
export const usePdfViewer = () => {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfId, setPdfId] = useState(null);

  const openPdf = useCallback(async (id, version = 'v3') => {
    try {
      // El backend ahora utiliza /pdf para generar el recibo actual
      const endpoint = 'pdf';
      const response = await api.get(`/recibos/${id}/${endpoint}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: MIME_TYPES.PDF });
      const url = window.URL.createObjectURL(blob);

      // Revoke previous URL to prevent memory leaks
      setPdfUrl((prev) => {
        if (prev) window.URL.revokeObjectURL(prev);
        return url;
      });
      setPdfId(id);
      setIsPdfModalOpen(true);
    } catch {
      toast.error(`Error al cargar el PDF${version !== 'v1' ? ` ${version.toUpperCase()}` : ''}`);
    }
  }, []);

  const openReportePdf = useCallback(async (filterParams) => {
    try {
      toast.info('Generando PDF, por favor espere...');
      const response = await api.get('/recibos/reporte/pdf', { params: filterParams, responseType: 'blob' });
      const blob = new Blob([response.data], { type: MIME_TYPES.PDF });
      const url = window.URL.createObjectURL(blob);

      setPdfUrl((prev) => {
        if (prev) window.URL.revokeObjectURL(prev);
        return url;
      });
      setPdfId('Reporte_Facturacion');
      setIsPdfModalOpen(true);
      toast.success('Reporte PDF generado exitosamente');
    } catch {
      toast.error('Error al generar el PDF desde el servidor');
    }
  }, []);

  const downloadFromModal = useCallback(() => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = pdfId === 'Reporte_Facturacion' ? 'Reporte_Facturacion.pdf' : `recibo_${pdfId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('PDF descargado exitosamente');
  }, [pdfUrl, pdfId]);

  const closePdfModal = useCallback(() => {
    setIsPdfModalOpen(false);
    setTimeout(() => {
      setPdfUrl((prev) => {
        if (prev) window.URL.revokeObjectURL(prev);
        return null;
      });
    }, 300);
  }, []);

  return {
    isPdfModalOpen,
    pdfUrl,
    pdfId,
    openPdf,
    openReportePdf,
    downloadFromModal,
    closePdfModal,
  };
};
