import { useState, useCallback } from 'react';
import api from '../../../api/axiosConfig';
import { toast } from 'sonner';

/**
 * useAnular — Manages the cancel receipt modal state and submission.
 */
export const useAnular = (onSuccess) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receiptId, setReceiptId] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const open = useCallback((id) => {
    setReceiptId(id);
    setMotivo('');
    setIsModalOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsModalOpen(false);
    setMotivo('');
  }, []);

  const submit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!motivo.trim()) return toast.error('El motivo es obligatorio.');
      if (motivo.trim().length < 5) return toast.error('Ingrese un motivo más detallado.');

      setIsProcessing(true);
      try {
        const res = await api.post(`/recibos/${receiptId}/anular`, { motivo });
        toast.success(res.data.message || 'Recibo anulado exitosamente');
        close();
        onSuccess?.();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Error al anular recibo');
      } finally {
        setIsProcessing(false);
      }
    },
    [motivo, receiptId, close, onSuccess],
  );

  return {
    isModalOpen,
    motivo,
    isProcessing,
    open,
    close,
    submit,
    setMotivo,
  };
};
