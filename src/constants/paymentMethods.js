export const PAYMENT_METHODS = ['Transferencia', 'Efectivo', 'Cheque', 'Depósito', 'Yape/Plin'];

export const PAYMENT_METHOD_CONFIG = {
  Transferencia: { icon: 'account_balance', bg: 'bg-blue-100 text-blue-700' },
  Efectivo: { icon: 'payments', bg: 'bg-green-100 text-green-700' },
  Cheque: { icon: 'description', bg: 'bg-purple-100 text-purple-700' },
  Depósito: { icon: 'account_balance_wallet', bg: 'bg-amber-100 text-amber-700' },
  'Yape/Plin': { icon: 'send_to_mobile', bg: 'bg-purple-100 text-purple-700' },
};

export const getPaymentMethodConfig = (method) => (
  PAYMENT_METHOD_CONFIG[method] || { icon: 'receipt', bg: 'bg-gray-100 text-gray-700' }
);
