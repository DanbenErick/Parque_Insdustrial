import { useState, useCallback } from 'react';
import api from '../../../api/axiosConfig';
import { toast } from 'sonner';

/**
 * useRefacturar — Manages the re-invoicing modal state and submission.
 */
export const useRefacturar = (onSuccess) => {
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
        const res = await api.post(`/recibos/${receiptId}/refacturar`, { motivo });
        toast.success(res.data.message || 'Recibo refacturado exitosamente');
        close();
        onSuccess?.();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Error al refacturar recibo');
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
