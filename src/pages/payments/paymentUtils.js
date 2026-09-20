const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const fmtCurrency = (value) => parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatPeriod = (period) => {
  if (!period) return '';
  const parts = period.split('-');
  if (parts.length !== 2) return period;
  const year = parts[0].length === 4 ? parts[0] : parts[1];
  const month = parts[0].length === 4 ? parts[1] : parts[0];
  const index = parseInt(month, 10) - 1;
  return index >= 0 && index < 12 ? `${MONTH_NAMES[index]} ${year}` : period;
};

const paymentType = (tipo, badgeLabel, drawerLabel, badgeClass, boxClass, values = {}) => ({
  tipo, badgeLabel, drawerLabel, badgeClass, boxClass,
  subtextType: 'none', subtextMonto: 0, restante: 0, aFavor: 0, previo: 0, acumulado: 0,
  ...values
});

export const getPagoTipoInfo = (payment, fallbackPrevious = 0) => {
  if (!payment) return paymentType('Completo', 'Completo', 'Pago Completo', 'bg-indigo-100 text-indigo-800', 'bg-indigo-50/50 border-indigo-200');
  if (payment.estado_validacion === 'Anulado') return paymentType('Anulado', 'Anulado', 'Pago Anulado', 'bg-error/15 text-error border border-error/30', 'bg-red-50/50 border-red-200');

  const amount = parseFloat(payment.monto_pagado || 0);
  const receiptTotal = parseFloat(payment.recibo_total || 0);
  const previous = payment.previo_pagado !== undefined && payment.previo_pagado !== null ? parseFloat(payment.previo_pagado) : parseFloat(fallbackPrevious || 0);
  const accumulated = previous + amount;
  const epsilon = 0.05;

  if (receiptTotal > 0 && previous >= receiptTotal - epsilon) {
    return paymentType('Adicional', 'Adicional', 'Pago Adicional / Excedente', 'bg-emerald-100 text-emerald-800 border border-emerald-300/40', 'bg-emerald-50/50 border-emerald-200', { subtextType: 'a_favor', subtextMonto: amount, aFavor: amount, previo: previous, acumulado: accumulated });
  }
  if (receiptTotal > 0 && accumulated < receiptTotal - epsilon) {
    const remaining = Math.max(0, receiptTotal - accumulated);
    return paymentType('Parcial', 'Parcial', 'Abono Parcial', 'bg-amber-100 text-amber-800', 'bg-amber-50/50 border-amber-200', { subtextType: 'restante', subtextMonto: remaining, restante: remaining, previo: previous, acumulado: accumulated });
  }
  const excess = receiptTotal > 0 && accumulated > receiptTotal + epsilon ? accumulated - receiptTotal : 0;
  return paymentType('Completo', 'Completo', excess > 0 ? 'Pago Completo con Excedente' : 'Pago Completo', 'bg-indigo-100 text-indigo-800', 'bg-indigo-50/50 border-indigo-200', { subtextType: excess > 0 ? 'a_favor' : 'none', subtextMonto: excess, aFavor: excess, previo: previous, acumulado: accumulated });
};

export const buildFilterParams = (filterMes, activeYear) => {
  if (filterMes && filterMes !== 'Todos' && filterMes !== 'TodosHistorico') return { periodo: filterMes };
  if (filterMes === 'Todos') return { year: activeYear };
  return {};
};
