import { memo } from 'react';

const formatCurrency = (value) => parseFloat(value || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

export const CargoLine = memo(({ label, amount, className = 'text-on-surface' }) => (
  <div className={`flex justify-between items-center text-xs ${className}`}><span>{label}</span><span className="font-data-mono font-bold">S/ {formatCurrency(amount)}</span></div>
));

export const CargoLineConditional = memo(({ value, label, className = 'text-error font-medium' }) => {
  if (parseFloat(value || 0) <= 0) return null;
  return <CargoLine label={label} amount={value} className={className} />;
});

export const InfoRow = memo(({ label, value, valueClassName = 'text-on-surface font-bold', hasBorder = true }) => (
  <div className={`flex justify-between items-center ${hasBorder ? 'border-b border-outline-variant/50 pb-2' : ''}`}><span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{label}</span><span className={`text-xs ${valueClassName}`}>{value}</span></div>
));

export const SectionHeader = memo(({ icon, title, children }) => (
  <div className="flex items-center justify-between mb-3 border-b border-outline-variant/50 pb-2"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary/70 text-[18px]" translate="no">{icon}</span><h4 className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{title}</h4></div>{children}</div>
));
