import { memo, useMemo } from 'react';

const KPI_COLORS = {
  primary: { bg: 'bg-primary/10 text-primary border-primary/20', val: 'text-on-surface' },
  emerald: { bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', val: 'text-emerald-600' },
  tertiary: { bg: 'bg-tertiary/10 text-tertiary border-tertiary/20', val: 'text-tertiary' },
  amber: { bg: 'bg-amber-500/10 text-amber-700 border-amber-500/20', val: 'text-amber-700' },
  secondary: { bg: 'bg-secondary/10 text-secondary border-secondary/20', val: 'text-secondary' }
};

export const PaymentKpiCard = memo(({ icon, label, value, subtitle, colorScheme = 'primary', subtitleIcon }) => {
  const colors = KPI_COLORS[colorScheme] || KPI_COLORS.primary;
  return <div className="bg-surface border border-outline-variant hover:border-primary/30 rounded-xl p-3 flex items-center gap-3 transition-colors shadow-sm"><div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${colors.bg}`}><span className="material-symbols-outlined text-[20px]" translate="no">{icon}</span></div><div className="flex flex-col justify-center overflow-hidden"><span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider leading-tight truncate">{label}</span><span className={`font-data-mono text-lg font-bold leading-none mt-0.5 truncate ${colors.val}`}>{value}</span>{subtitleIcon ? <div className="flex items-center gap-1 mt-1 opacity-80"><span className="material-symbols-outlined text-[10px]" translate="no">{subtitleIcon}</span><span className="text-[9px] truncate">{subtitle}</span></div> : <span className="text-[9px] text-on-surface-variant/70 mt-1 truncate">{subtitle}</span>}</div></div>;
});

export const PaymentDetailRow = memo(({ icon, label, value, valueClassName = 'text-xs font-bold text-on-surface' }) => (
  <div className="flex justify-between items-center p-3"><span className="text-[11px] text-on-surface-variant flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]" translate="no">{icon}</span>{label}</span><span className={valueClassName}>{value}</span></div>
));

export const PaymentTableRow = memo(({ pago, fallbackPrevio, onSelect, onOpenMenu, isMenuOpen, getTipoInfo, formatCurrency }) => {
  const tipoInfo = useMemo(() => getTipoInfo(pago, fallbackPrevio), [pago, fallbackPrevio, getTipoInfo]);
  return (
    <tr className={`hover:bg-surface-container-lowest transition-colors group ${pago.estado_validacion === 'Anulado' ? 'bg-red-500/5 hover:bg-red-500/10' : ''}`}>
      <td className="px-4 py-2"><button type="button" onClick={() => onSelect(pago)} className="font-bold text-on-surface text-[11px] hover:text-primary transition-colors text-left focus:outline-none block mb-0.5" title="Ver Detalles del Pago">{pago.socio}</button>{pago.medidor_num_serie ? <span className="text-[10px] text-on-surface-variant flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-[12px]" translate="no">speed</span>{pago.medidor_num_serie}</span> : <span className="text-[10px] text-on-surface-variant italic mt-0.5 block">Sin Medidor</span>}{pago.saldo_a_favor_socio > 0 && <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold mt-1 inline-block">Saldo a favor: S/ {formatCurrency(pago.saldo_a_favor_socio)}</span>}</td>
      <td className="px-4 py-2"><div className="flex flex-col"><span className="text-[11px] text-on-surface font-medium">{pago.metodo_pago}{pago.numero_operacion && <span className="font-data-mono ml-1 text-[10px] text-on-surface-variant">(Op: {pago.numero_operacion})</span>}</span><span className="text-[10px] text-on-surface-variant">{new Date(pago.fecha_pago).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div></td>
      <td className="px-4 py-2 text-center"><div className="flex flex-col items-center"><span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${tipoInfo.badgeClass}`}>{tipoInfo.badgeLabel}</span>{pago.motivo_anulacion && <span className="text-[9px] text-error font-medium italic mt-0.5 truncate max-w-[150px]" title={`Motivo: ${pago.motivo_anulacion}`}>{pago.motivo_anulacion}</span>}</div></td>
      <td className="px-4 py-2 text-right"><div className={`font-data-mono font-bold text-[12px] ${pago.estado_validacion === 'Anulado' ? 'line-through text-on-surface-variant/60' : 'text-on-surface'}`}>S/ {formatCurrency(pago.monto_pagado)}</div>{pago.estado_validacion !== 'Anulado' && tipoInfo.subtextType === 'restante' && <div className="text-[9px] text-amber-700 font-bold">Restante: S/ {formatCurrency(tipoInfo.subtextMonto)}</div>}{pago.estado_validacion !== 'Anulado' && tipoInfo.subtextType === 'a_favor' && <div className="text-[9px] text-emerald-700 font-bold">A favor: S/ {formatCurrency(tipoInfo.subtextMonto)}</div>}</td>
      <td className="px-4 py-2 text-right"><button type="button" onClick={(event) => onOpenMenu(pago, event)} className={`w-7 h-7 rounded-md inline-flex items-center justify-center transition-colors cursor-pointer ${isMenuOpen ? 'bg-primary/15 text-primary ring-1 ring-primary/30' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`} title="Opciones de pago"><span className="material-symbols-outlined text-[20px]" translate="no">more_vert</span></button></td>
    </tr>
  );
});
