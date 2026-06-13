import React, { memo } from 'react';

/**
 * BillingKPICards — KPI summary cards + progress bar.
 * Extracted from Billing.jsx to reduce component size.
 */
const BillingKPICards = memo(({ totalRecaudado, pendienteCobro, deudaVencida, usuariosPendientes, usuariosVencidos }) => {
  const total = totalRecaudado + pendienteCobro + deudaVencida;
  const percentRecaudado = total > 0 ? ((totalRecaudado / total) * 100).toFixed(1) : '0';
  const emitidoPct = (totalRecaudado + pendienteCobro) > 0
    ? Math.round((totalRecaudado / (totalRecaudado + pendienteCobro)) * 100)
    : 0;

  // Progress bar widths
  const wRecaudado = total > 0 ? (totalRecaudado / total) * 100 : 0;
  const wPendiente = total > 0 ? (pendienteCobro / total) * 100 : 0;
  const wVencida = total > 0 ? (deudaVencida / total) * 100 : 0;

  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Card 1: Total Recaudado */}
        <div className="bg-surface border border-outline-variant hover:border-primary/30 rounded-xl p-3 flex items-center gap-3 transition-colors shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          </div>
          <div className="flex flex-col justify-center overflow-hidden flex-1">
            <div className="flex justify-between items-center w-full">
              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider leading-tight truncate">Total Recaudado</span>
              <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">META 95%</span>
            </div>
            <span className="font-data-mono text-lg text-on-surface font-bold leading-none mt-0.5 truncate">
              S/ {totalRecaudado.toFixed(2)}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[9px] text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded">
                {emitidoPct}% emitido
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Pendiente de Cobro */}
        <div className="bg-surface border border-outline-variant hover:border-tertiary/30 rounded-xl p-3 flex items-center gap-3 transition-colors shadow-sm">
          <div className="w-10 h-10 rounded-full bg-tertiary/5 flex items-center justify-center text-tertiary shrink-0 border border-tertiary/10">
            <span className="material-symbols-outlined text-[20px]">pending_actions</span>
          </div>
          <div className="flex flex-col justify-center overflow-hidden flex-1">
            <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider leading-tight truncate">Pendiente de Cobro</span>
            <span className="font-data-mono text-lg text-on-surface font-bold leading-none mt-0.5 truncate">
              S/ {pendienteCobro.toFixed(2)}
            </span>
            <span className="text-[9px] text-on-surface-variant/70 mt-1 truncate">• {usuariosPendientes} Empresa(s)</span>
          </div>
        </div>

        {/* Card 3: Deuda Vencida */}
        <div className="bg-surface border border-outline-variant hover:border-error/30 rounded-xl p-3 flex items-center gap-3 transition-colors shadow-sm">
          <div className="w-10 h-10 rounded-full bg-error/5 flex items-center justify-center text-error shrink-0 border border-error/10">
            <span className="material-symbols-outlined text-[20px]">warning</span>
          </div>
          <div className="flex flex-col justify-center overflow-hidden flex-1">
            <span className="text-[9px] font-bold text-error uppercase tracking-wider leading-tight truncate">Deuda Vencida (&gt;30 días)</span>
            <span className="font-data-mono text-lg text-error font-bold leading-none mt-0.5 truncate">
              S/ {deudaVencida.toFixed(2)}
            </span>
            <span className="text-[9px] text-error/70 mt-1 truncate">• {usuariosVencidos} en riesgo</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1">
          <span>Avance General de Facturación</span>
          <span>{percentRecaudado}%</span>
        </div>
        <div className="h-3 w-full bg-surface-variant rounded-full flex relative overflow-hidden shadow-inner">
          {total > 0 && (
            <>
              {wRecaudado > 0 && (
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${wRecaudado}%` }} title={`Recaudado: ${wRecaudado.toFixed(1)}%`} />
              )}
              {wPendiente > 0 && (
                <div className="h-full bg-tertiary transition-all duration-1000" style={{ width: `${wPendiente}%` }} title={`Pendiente: ${wPendiente.toFixed(1)}%`} />
              )}
              {wVencida > 0 && (
                <div className="h-full bg-error transition-all duration-1000" style={{ width: `${wVencida}%` }} title={`Deuda Vencida: ${wVencida.toFixed(1)}%`} />
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-4 px-1 mt-1">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="text-[9px] text-on-surface-variant">Recaudado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-tertiary"></div>
            <span className="text-[9px] text-on-surface-variant">Pendiente Regular</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-error"></div>
            <span className="text-[9px] text-on-surface-variant">Vencido</span>
          </div>
        </div>
      </div>
    </>
  );
});

BillingKPICards.displayName = 'BillingKPICards';

export default BillingKPICards;
