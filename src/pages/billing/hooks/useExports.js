import { useCallback } from 'react';
import api from '../../../api/axiosConfig';
import { toast } from 'sonner';
import { MIME_TYPES, downloadBlob } from '../billingUtils';

/**
 * useExports — Centralizes all export handlers (Excel, PDF masivo, etc.)
 */
export const useExports = ({ filterParams, filterMes, activeYear, uniqueMonths, recibos }) => {

  const handleExportExcel = useCallback(async () => {
    try {
      const response = await api.get('/recibos/reporte/excel', {
        params: filterParams,
        responseType: 'blob',
      });
      downloadBlob(response.data, 'Reporte_Facturacion.xlsx', MIME_TYPES.EXCEL);
      toast.success('Excel descargado exitosamente');
    } catch {
      toast.error('Error al descargar el Excel');
    }
  }, [filterParams]);

  const handleExportExcelDeudas = useCallback(
    async (tipo) => {
      try {
        let queryParams = '';
        if (
          tipo === 'mensual' &&
          filterMes &&
          filterMes !== 'Todos' &&
          filterMes !== 'TodosHistorico'
        ) {
          queryParams = `?periodo=${filterMes}`;
        }
        const response = await api.get(
          `/recibos/reportes/deudas/excel${queryParams}`,
          { responseType: 'blob' },
        );
        const filename = `Reporte_Deudas_${
          tipo === 'mensual'
            ? filterMes !== 'Todos'
              ? filterMes
              : 'Global'
            : 'Historico_General'
        }.xlsx`;
        downloadBlob(response.data, filename, MIME_TYPES.EXCEL);
        toast.success('Excel de Deudas descargado exitosamente');
      } catch {
        toast.error('Error al descargar el Excel de Deudas');
      }
    },
    [filterMes],
  );

  const handleExportExcelSinMedidor = useCallback(async () => {
    try {
      const params = {};
      if (filterMes && filterMes !== 'Todos' && filterMes !== 'TodosHistorico') {
        params.periodo = filterMes;
      } else if (filterMes === 'Todos') {
        params.year = activeYear;
      }
      const response = await api.get('/recibos/reporte/excel-sin-medidor', {
        params,
        responseType: 'blob',
      });
      downloadBlob(
        response.data,
        `Reporte_SinMedidor_${filterMes || activeYear}.xlsx`,
        MIME_TYPES.EXCEL,
      );
      toast.success('Excel descargado exitosamente');
    } catch {
      toast.error('Error al descargar el Excel de Sin Medidor');
    }
  }, [filterMes, activeYear]);

  const handleExportAllPdfV2 = useCallback(async () => {
    try {
      const params = { ...filterParams };
      const selectedMes =
        filterMes !== 'Todos' && filterMes !== 'TodosHistorico'
          ? filterMes
          : uniqueMonths.length > 0
          ? uniqueMonths[0]
          : null;

      if (selectedMes) params.periodo = selectedMes;

      toast.loading('Generando PDF masivo...', { id: 'pdfMasivo' });
      const response = await api.get('/recibos/export/all-v2', { params, responseType: 'blob' });
      downloadBlob(
        response.data,
        `recibos_masivos_${params.periodo || 'todos'}.pdf`,
        MIME_TYPES.PDF,
      );
      toast.success('PDF masivo generado con éxito', { id: 'pdfMasivo' });
    } catch {
      toast.error('Error al generar el PDF masivo', { id: 'pdfMasivo' });
    }
  }, [filterParams, filterMes, uniqueMonths]);

  const handleWhatsApp = useCallback(async (recibo) => {
    if (!recibo.telefono) {
      return toast.error('El socio no tiene un número de teléfono registrado.');
    }

    let phone = recibo.telefono.replace(/\s+/g, '');
    if (!phone.startsWith('+')) {
      if (phone.length === 9) phone = '51' + phone;
    } else {
      phone = phone.replace('+', '');
    }

    const total = parseFloat(recibo.total).toLocaleString('en-US', { minimumFractionDigits: 2 });
    const fechaVen = recibo.fecha_vencimiento
      ? new Date(recibo.fecha_vencimiento).toLocaleDateString('es-PE')
      : '-';

    const text = `👋 Hola *${recibo.socio}*,

Espero que tengas un excelente día. ☀️
Te escribimos para enviarte tu recibo de luz correspondiente al periodo *${recibo.periodo}*.

⚡ *Detalle de Facturación:*
- *Monto Total a Pagar:* S/ ${total}
- *Fecha de Vencimiento:* ${fechaVen}

📄 *Nota:* Te estamos adjuntando en breve tu recibo detallado en PDF por este medio.

¡Muchas gracias por tu pago puntual! 🙌`;

    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');

    toast.success('Descargando PDF para enviar por WhatsApp...', { duration: 2000 });
    
    api.get(`/recibos/${recibo.id}/pdf-v3`, { responseType: 'blob' })
      .then((response) => {
        downloadBlob(
          response.data,
          `Recibo_${recibo.periodo}_${recibo.socio.replace(/\s+/g, '_')}.pdf`,
          MIME_TYPES.PDF,
        );
      })
      .catch(() => {
        toast.error('Error al descargar el PDF.');
      });
  }, []);

  return {
    handleExportExcel,
    handleExportExcelDeudas,
    handleExportExcelSinMedidor,
    handleExportAllPdfV2,
    handleWhatsApp,
  };
};
