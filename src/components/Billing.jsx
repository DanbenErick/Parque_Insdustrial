import React from 'react';

const Billing = () => {
  return (
    <main className="p-lg space-y-lg max-w-[1600px] w-full flex-grow">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Módulo de Facturación</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Ciclo de facturación actual: <span className="font-bold text-on-surface">Octubre 2024</span></p>
        </div>
        <div className="flex items-center gap-sm">
          <div className="flex flex-col">
            <label className="font-label-caps text-[10px] text-on-surface-variant mb-1 uppercase tracking-wider">Filtrar Mes</label>
            <div className="relative">
              <select className="bg-white border border-outline-variant rounded-lg font-body-sm text-body-sm pl-3 pr-8 py-2 focus:border-primary focus:ring-1 focus:ring-primary appearance-none">
                <option>Octubre 2024</option>
                <option>Septiembre 2024</option>
                <option>Agosto 2024</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
          </div>
          <button className="bg-primary text-on-primary px-lg py-[10px] h-fit self-end flex items-center gap-xs rounded-lg hover:opacity-90 transition-opacity shadow-md">
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="font-bold font-body-sm uppercase tracking-wide">Generar Facturas</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        <div className="bg-white border border-outline-variant rounded-xl p-md shadow-sm">
          <div className="flex justify-between items-start mb-sm">
            <span className="p-2 bg-primary-container/10 rounded-lg">
              <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
            </span>
            <span className="font-label-caps text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">META: 95%</span>
          </div>
          <p className="font-label-caps text-on-surface-variant uppercase mb-xs">Total Recaudado (Soles)</p>
          <div className="flex items-baseline gap-sm">
            <h3 className="font-display text-[32px] font-bold text-primary">S/ 42,580.00</h3>
            <span className="font-data-mono text-primary text-[12px] flex items-center bg-primary-container/5 px-2 py-0.5 rounded">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> 12%
            </span>
          </div>
          <div className="mt-md w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full" style={{ width: '72%' }}></div>
          </div>
          <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant italic">72% de la facturación mensual</p>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-md shadow-sm">
          <div className="flex justify-between items-start mb-sm">
            <span className="p-2 bg-tertiary-container/10 rounded-lg">
              <span className="material-symbols-outlined text-tertiary">pending_actions</span>
            </span>
          </div>
          <p className="font-label-caps text-on-surface-variant uppercase mb-xs">Pendiente de Cobro</p>
          <h3 className="font-display text-[32px] font-bold text-tertiary">S/ 16,520.00</h3>
          <p className="mt-md font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            8 Inquilinos con pago pendiente
          </p>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-md shadow-sm">
          <div className="flex justify-between items-start mb-sm">
            <span className="p-2 bg-error-container/10 rounded-lg">
              <span className="material-symbols-outlined text-error">warning</span>
            </span>
          </div>
          <p className="font-label-caps text-on-surface-variant uppercase mb-xs">Deuda Vencida (&gt;30 días)</p>
          <h3 className="font-display text-[32px] font-bold text-error">S/ 2,450.00</h3>
          <p className="mt-md font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
            2 Inquilinos en estado crítico
          </p>
        </div>
      </div>

      {/* Inquilinos Table Area */}
      <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-md">
        <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h4 className="font-headline-sm text-headline-sm font-bold">Detalle de Facturación por Inquilino</h4>
          <div className="flex gap-sm">
            <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
            </button>
            <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">download</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse zebra-table">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-[11px] uppercase tracking-wider">
                <th className="px-lg py-md border-b border-outline-variant">INQUILINO</th>
                <th className="px-lg py-md border-b border-outline-variant">SECTOR</th>
                <th className="px-lg py-md border-b border-outline-variant">ULT. RECIBO</th>
                <th className="px-lg py-md border-b border-outline-variant">VENCIMIENTO</th>
                <th className="px-lg py-md border-b border-outline-variant text-center">ESTADO</th>
                <th className="px-lg py-md border-b border-outline-variant text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-body-sm">
              <tr className="hover:bg-primary/5 transition-colors group">
                <td className="px-lg py-md">
                  <p className="font-body-md text-body-md font-bold text-on-surface">Textiles del Sur S.A.C.</p>
                  <p className="font-data-mono text-[11px] text-on-surface-variant">RUC: 20554896214</p>
                </td>
                <td className="px-lg py-md">
                  <span className="bg-surface-variant text-on-surface-variant px-sm py-[2px] rounded text-[10px] font-bold uppercase tracking-wide">PLANTA A-12</span>
                </td>
                <td className="px-lg py-md font-data-mono text-body-sm text-on-surface">S/ 12,450.00</td>
                <td className="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">15 Oct 2024</td>
                <td className="px-lg py-md text-center">
                  <span className="inline-flex items-center gap-xs px-xs py-[2px] rounded bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-tight">
                    <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                    Pagado
                  </span>
                </td>
                <td className="px-lg py-md">
                  <div className="flex justify-end gap-sm">
                    <button className="text-primary hover:underline text-xs font-bold mr-2">Ver Recibo</button>
                    <button className="material-symbols-outlined text-on-surface-variant opacity-60 hover:opacity-100">more_vert</button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-primary/5 transition-colors group">
                <td className="px-lg py-md">
                  <p className="font-body-md text-body-md font-bold text-on-surface">Logística Transandina</p>
                  <p className="font-data-mono text-[11px] text-on-surface-variant">RUC: 20112458793</p>
                </td>
                <td className="px-lg py-md">
                  <span className="bg-surface-variant text-on-surface-variant px-sm py-[2px] rounded text-[10px] font-bold uppercase tracking-wide">PLANTA C-04</span>
                </td>
                <td className="px-lg py-md font-data-mono text-body-sm text-on-surface">S/ 8,200.50</td>
                <td className="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">28 Oct 2024</td>
                <td className="px-lg py-md text-center">
                  <span className="inline-flex items-center gap-xs px-xs py-[2px] rounded bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase tracking-tight">
                    <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>schedule</span>
                    Pendiente
                  </span>
                </td>
                <td className="px-lg py-md">
                  <div className="flex justify-end gap-sm">
                    <button className="text-primary hover:underline text-xs font-bold mr-2">Recordar</button>
                    <button className="material-symbols-outlined text-on-surface-variant opacity-60 hover:opacity-100">more_vert</button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-primary/5 transition-colors group">
                <td className="px-lg py-md">
                  <p className="font-body-md text-body-md font-bold text-on-surface">Metales del Centro S.A.</p>
                  <p className="font-data-mono text-[11px] text-on-surface-variant">RUC: 20336985471</p>
                </td>
                <td className="px-lg py-md">
                  <span className="bg-surface-variant text-on-surface-variant px-sm py-[2px] rounded text-[10px] font-bold uppercase tracking-wide">ALMACÉN B-01</span>
                </td>
                <td className="px-lg py-md font-data-mono text-body-sm text-on-surface">S/ 2,450.00</td>
                <td className="px-lg py-md font-body-sm text-body-sm text-error font-bold">10 Oct 2024</td>
                <td className="px-lg py-md text-center">
                  <span className="inline-flex items-center gap-xs px-xs py-[2px] rounded bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-tight">
                    <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>error</span>
                    Vencido
                  </span>
                </td>
                <td className="px-lg py-md">
                  <div className="flex justify-end gap-sm">
                    <button className="text-error hover:underline text-xs font-bold mr-2">Notificar Mora</button>
                    <button className="material-symbols-outlined text-on-surface-variant opacity-60 hover:opacity-100">more_vert</button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-primary/5 transition-colors group">
                <td className="px-lg py-md">
                  <p className="font-body-md text-body-md font-bold text-on-surface">Inversiones Energéticas</p>
                  <p className="font-data-mono text-[11px] text-on-surface-variant">RUC: 20665478932</p>
                </td>
                <td className="px-lg py-md">
                  <span className="bg-surface-variant text-on-surface-variant px-sm py-[2px] rounded text-[10px] font-bold uppercase tracking-wide">PLANTA D-08</span>
                </td>
                <td className="px-lg py-md font-data-mono text-body-sm text-on-surface">S/ 15,300.00</td>
                <td className="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">30 Oct 2024</td>
                <td className="px-lg py-md text-center">
                  <span className="inline-flex items-center gap-xs px-xs py-[2px] rounded bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase tracking-tight">
                    <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>schedule</span>
                    Pendiente
                  </span>
                </td>
                <td className="px-lg py-md">
                  <div className="flex justify-end gap-sm">
                    <button className="text-primary hover:underline text-xs font-bold mr-2">Ver Recibo</button>
                    <button className="material-symbols-outlined text-on-surface-variant opacity-60 hover:opacity-100">more_vert</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="px-lg py-md border-t border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <p className="font-body-sm text-body-sm text-on-surface-variant">Mostrando 1-4 de 24 inquilinos registrados</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center bg-primary text-on-primary font-bold rounded shadow-sm text-xs">1</button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded text-xs">2</button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded text-xs">3</button>
            <span className="px-1 py-1">...</span>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded text-xs">6</button>
          </div>
        </div>
      </div>

      {/* Technical Glimmer */}
      <div className="pt-md pb-12 flex items-center justify-center gap-sm opacity-40 grayscale hover:grayscale-0 transition-all cursor-default">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        <span className="font-data-mono text-[10px] tracking-[0.2em] uppercase">Motor de cálculo en tiempo real optimizado</span>
      </div>
    </main>
  );
};

export default Billing;
