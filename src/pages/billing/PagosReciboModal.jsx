import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import api from '../../api/axiosConfig';

const fmtCurrency = (v) => parseFloat(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const METODO_ICON = { Transferencia: 'account_balance', Efectivo: 'payments' };

/**
 * PagosReciboModal
 * Muestra los pagos registrados para un recibo específico.
 * Permite anular pagos activos y cambiar estado a Pendiente si no tiene pagos.
 */
const PagosReciboModal = ({ recibo, onClose, onSuccess, initialWarning }) => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para anulación de un pago específico
  const [pagoToAnular, setPagoToAnular] = useState(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [isSubmittingAnular, setIsSubmittingAnular] = useState(false);

  // Estado para marcar recibo como pendiente directamente
  const [isSubmittingPendiente, setIsSubmittingPendiente] = useState(false);
  const [reciboEstado, setReciboEstado] = useState(recibo?.estado);

  const fetchPagos = useCallback(async () => {
    if (!recibo?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/pagos/recibo/${recibo.id}`);
      setPagos(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('No se pudieron cargar los pagos');
    } finally {
      setLoading(false);
    }
  }, [recibo?.id]);

  useEffect(() => {
    fetchPagos();
  }, [fetchPagos]);

  const pagosActivos = pagos.filter(p => p.estado_validacion !== 'Anulado' && !p.deleted_at);
  const pagosAnulados = pagos.filter(p => p.estado_validacion === 'Anulado' || p.deleted_at);
  const totalPagado = pagosActivos.reduce((sum, p) => sum + parseFloat(p.monto_pagado || 0), 0);
  const esPagoCascada = reciboEstado === 'Pagado' && pagosActivos.length === 0 && !loading;

  // Manejador para anular pago individual
  const handleConfirmAnular = async (e) => {
    e.preventDefault();
    if (!pagoToAnular) return;
    if (!motivoAnulacion.trim()) {
      return toast.error('Debe ingresar un motivo para anular el pago');
    }

    setIsSubmittingAnular(true);
    try {
      await api.post(`/pagos/${pagoToAnular.id}/anular`, {
        motivo: motivoAnulacion.trim(),
      });
      toast.success('Pago anulado exitosamente');
      setPagoToAnular(null);
      setMotivoAnulacion('');
      await fetchPagos();
      if (onSuccess) onSuccess();
      // Si era el único pago activo, el recibo probablemente pasó a Pendiente/Vencido
      if (pagosActivos.length <= 1) {
        setReciboEstado('Pendiente');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al anular el pago');
    } finally {
      setIsSubmittingAnular(false);
    }
  };

  // Manejador para marcar recibo como pendiente cuando no hay pagos
  const handleMarcarPendiente = async () => {
    setIsSubmittingPendiente(true);
    try {
      await api.post(`/recibos/${recibo.id}/marcar-pendiente`);
      toast.success('El recibo ha sido cambiado a estado Pendiente');
      setReciboEstado('Pendiente');
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al marcar recibo como Pendiente');
    } finally {
      setIsSubmittingPendiente(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !isSubmittingAnular && !isSubmittingPendiente && onClose()}
      />

      {/* Modal principal */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-surface-container-low border-b border-outline-variant/50 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary" translate="no">payments</span>
              <h3 className="text-sm font-bold text-on-surface">Pagos del Recibo</h3>
            </div>
            <p className="text-[11px] font-data-mono text-primary font-semibold mt-1">
              {recibo?.numero_comprobante}
            </p>
            <p className="text-[11px] text-on-surface-variant mt-0.5 truncate max-w-[320px]">
              {recibo?.socio}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]" translate="no">close</span>
          </button>
        </div>

        {/* Resumen del recibo */}
        <div className="px-5 py-3 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-on-surface-variant">Total del recibo:</span>
            <span className="font-data-mono font-bold text-on-surface text-sm">
              S/ {fmtCurrency(recibo?.total)}
            </span>
          </div>
          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
            reciboEstado === 'Pagado' ? 'bg-green-100 text-green-800' :
            reciboEstado === 'Vencido' ? 'bg-red-100 text-red-800' :
            reciboEstado === 'Pago Parcial' ? 'bg-orange-100 text-orange-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {reciboEstado}
          </span>
        </div>

        {/* Contenido */}
        <div className="px-5 py-4 max-h-[55vh] overflow-y-auto custom-scrollbar space-y-3">
          {/* Advertencia inicial si fue invocado por querer poner en pendiente */}
          {initialWarning && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 flex gap-2.5 items-start animate-in fade-in">
              <span className="material-symbols-outlined text-[20px] text-amber-600 shrink-0 mt-0.5" translate="no">warning</span>
              <div className="text-xs text-amber-900 leading-snug">
                <p className="font-bold">Acción requerida para poner en Pendiente:</p>
                <p className="mt-0.5">{initialWarning}</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8 gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px] animate-spin" translate="no">progress_activity</span>
              <span className="text-xs">Cargando pagos...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 py-4 text-error text-xs">
              <span className="material-symbols-outlined text-[18px]" translate="no">error</span>
              {error}
            </div>
          )}

          {/* Pago por cascada (sin pago directo registrado) */}
          {esPagoCascada && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 flex gap-3">
              <span className="material-symbols-outlined text-[22px] text-indigo-500 shrink-0 mt-0.5" translate="no">info</span>
              <div className="space-y-1">
                <p className="text-xs font-bold text-indigo-800">Pagado por consolidación de deuda</p>
                <p className="text-[11px] text-indigo-700 leading-relaxed">
                  Este recibo figura como <strong>Pagado</strong> porque su deuda fue incluida
                  y cobrada en el siguiente periodo, o no tiene un pago directo registrado.
                </p>
              </div>
            </div>
          )}

          {/* Acción para marcar como Pendiente si no tiene pagos activos y no está pendiente */}
          {!loading && pagosActivos.length === 0 && reciboEstado !== 'Pendiente' && reciboEstado !== 'Anulado' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-amber-900">Sin pagos activos</p>
                <p className="text-[11px] text-amber-700">Este recibo no tiene pagos activos. Puedes cambiarlo a Pendiente:</p>
              </div>
              <button
                type="button"
                disabled={isSubmittingPendiente}
                onClick={handleMarcarPendiente}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]" translate="no">restart_alt</span>
                <span>{isSubmittingPendiente ? 'Cambiando...' : 'Poner en Pendiente'}</span>
              </button>
            </div>
          )}

          {/* Pagos activos */}
          {!loading && pagosActivos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-green-600" translate="no">check_circle</span>
                  Pagos Activos ({pagosActivos.length})
                </p>
                <span className="text-[10px] text-on-surface-variant">Anula los pagos para volver a Pendiente</span>
              </div>

              {pagosActivos.map(p => (
                <div key={p.id} className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-green-600" translate="no">
                        {METODO_ICON[p.metodo_pago] || 'credit_card'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-data-mono font-bold text-on-surface text-sm">
                          S/ {fmtCurrency(p.monto_pagado)}
                        </span>
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-green-100 text-green-800">
                          {p.estado_validacion}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                        <span className="text-[11px] text-on-surface-variant">{p.metodo_pago}</span>
                        <span className="text-[11px] text-on-surface-variant">{fmtDate(p.fecha_pago)}</span>
                        {p.numero_operacion && (
                          <span className="font-data-mono text-[10px] text-on-surface-variant/70">
                            Op: {p.numero_operacion}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botón anular pago */}
                  <button
                    type="button"
                    onClick={() => {
                      setPagoToAnular(p);
                      setMotivoAnulacion('Anulado para cambiar estado del recibo a pendiente');
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-700 bg-red-50/50 hover:bg-red-100 text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                    title="Anular este pago"
                  >
                    <span className="material-symbols-outlined text-[14px]" translate="no">block</span>
                    <span>Anular</span>
                  </button>
                </div>
              ))}

              {/* Total pagado */}
              <div className="flex items-center justify-between pt-1 px-1">
                <span className="text-[11px] text-on-surface-variant font-medium">Total pagado:</span>
                <span className={`font-data-mono font-bold text-sm ${
                  Math.abs(totalPagado - parseFloat(recibo?.total || 0)) <= 0.02
                    ? 'text-green-700' : 'text-orange-600'
                }`}>
                  S/ {fmtCurrency(totalPagado)}
                </span>
              </div>
            </div>
          )}

          {/* Pagos anulados */}
          {!loading && pagosAnulados.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]" translate="no">block</span>
                Pagos Anulados ({pagosAnulados.length})
              </p>
              {pagosAnulados.map(p => (
                <div key={p.id} className="rounded-xl border border-outline-variant/40 bg-surface-container-low/50 p-3 flex items-center gap-3 opacity-60">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant" translate="no">block</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-data-mono font-bold text-on-surface-variant text-xs line-through">
                        S/ {fmtCurrency(p.monto_pagado)}
                      </span>
                      <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-gray-200 text-gray-700">
                        Anulado
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2.5 text-[10px] text-on-surface-variant mt-0.5">
                      <span>{p.metodo_pago}</span>
                      <span>{fmtDate(p.fecha_pago)}</span>
                    </div>
                    {p.motivo_anulacion && (
                      <p className="text-[10px] text-error mt-0.5 italic truncate">
                        Motivo: {p.motivo_anulacion}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sin pagos en absoluto */}
          {!loading && !error && pagos.length === 0 && !esPagoCascada && (
            <div className="flex flex-col items-center justify-center py-6 text-on-surface-variant gap-2">
              <span className="material-symbols-outlined text-[36px] opacity-30" translate="no">receipt_long</span>
              <p className="text-xs text-center">No hay pagos registrados para este recibo</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-outline-variant/50 bg-surface-container-low flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-medium transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Sub-modal: Confirmar anulación de pago */}
      {pagoToAnular && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[24px] text-red-600" translate="no">warning</span>
            </div>
            <h4 className="text-sm font-bold text-center text-on-surface">
              ¿Anular este pago?
            </h4>
            <p className="text-xs text-on-surface-variant text-center mt-1">
              Pago de <strong className="font-data-mono text-on-surface">S/ {fmtCurrency(pagoToAnular.monto_pagado)}</strong> ({pagoToAnular.metodo_pago})
            </p>

            <form onSubmit={handleConfirmAnular} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Motivo de anulación <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={motivoAnulacion}
                  onChange={(e) => setMotivoAnulacion(e.target.value)}
                  placeholder="Escribe la razón de la anulación..."
                  className="w-full px-3 py-2 text-xs border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none bg-surface-container-lowest"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  disabled={isSubmittingAnular}
                  onClick={() => {
                    setPagoToAnular(null);
                    setMotivoAnulacion('');
                  }}
                  className="flex-1 py-2 text-xs rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAnular}
                  className="flex-1 py-2 text-xs rounded-lg bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAnular ? (
                    <>
                      <span className="material-symbols-outlined text-[14px] animate-spin" translate="no">progress_activity</span>
                      <span>Anulando...</span>
                    </>
                  ) : (
                    <span>Confirmar Anulación</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default PagosReciboModal;
