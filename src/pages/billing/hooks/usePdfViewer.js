import { useState, useCallback } from 'react';
import api from '../../../api/axiosConfig';
import { toast } from 'sonner';
import { MIME_TYPES, buildReceiptPdfFilename } from '../billingUtils';
import { createBlobUrl } from '../../../utils/downloadFile';

/**
 * usePdfViewer — Manages all PDF viewer modal state and handlers.
 */
export const usePdfViewer = () => {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfId, setPdfId] = useState(null);
  const [pdfReceipt, setPdfReceipt] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const openPdf = useCallback(async (receiptOrId, version = 'v3') => {
    setIsGenerating(true);
    try {
      let receipt = typeof receiptOrId === 'object' && receiptOrId !== null ? receiptOrId : null;
      const id = receipt ? receipt.id : receiptOrId;

      // El backend ahora utiliza /pdf para generar el recibo actual
      const endpoint = 'pdf';
      const response = await api.get(`/recibos/${id}/${endpoint}`, { responseType: 'blob' });
      const url = createBlobUrl(response.data, MIME_TYPES.PDF);

      // Si no tenemos el recibo completo con socio y periodo, consultar los datos del recibo
      if (!receipt || !receipt.socio || !receipt.periodo) {
        try {
          const res = await api.get(`/recibos/${id}`);
          receipt = res.data?.data || res.data || receipt;
        } catch {
          // ignore
        }
      }

      // Revoke previous URL to prevent memory leaks
      setPdfUrl((prev) => {
        if (prev) window.URL.revokeObjectURL(prev);
        return url;
      });
      setPdfId(id);
      setPdfReceipt(receipt);
      setIsPdfModalOpen(true);
    } catch {
      toast.error(`Error al cargar el PDF${version !== 'v1' ? ` ${version.toUpperCase()}` : ''}`);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const openReportePdf = useCallback(async (filterParams) => {
    setIsGenerating(true);
    try {
      const response = await api.get('/recibos/reporte/pdf', { params: filterParams, responseType: 'blob' });
      const url = createBlobUrl(response.data, MIME_TYPES.PDF);

      setPdfUrl((prev) => {
        if (prev) window.URL.revokeObjectURL(prev);
        return url;
      });
      setPdfId('Reporte_Facturacion');
      setPdfReceipt(null);
      setIsPdfModalOpen(true);
      toast.success('Reporte PDF generado exitosamente');
    } catch {
      toast.error('Error al generar el PDF desde el servidor');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const downloadFromModal = useCallback(() => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    let filename = 'recibo.pdf';
    if (pdfId === 'Reporte_Facturacion') {
      filename = 'Reporte_Facturacion.pdf';
    } else if (pdfReceipt) {
      filename = buildReceiptPdfFilename(pdfReceipt);
    } else {
      filename = `recibo_${pdfId}.pdf`;
    }
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('PDF descargado exitosamente');
  }, [pdfUrl, pdfId, pdfReceipt]);

  const closePdfModal = useCallback(() => {
    setIsPdfModalOpen(false);
    setTimeout(() => {
      setPdfUrl((prev) => {
        if (prev) window.URL.revokeObjectURL(prev);
        return null;
      });
      setPdfReceipt(null);
    }, 300);
  }, []);

  return {
    isPdfModalOpen,
    pdfUrl,
    pdfId,
    pdfReceipt,
    openPdf,
    openReportePdf,
    downloadFromModal,
    closePdfModal,
    isGenerating,
  };
};
