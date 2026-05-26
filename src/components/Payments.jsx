import React from 'react';

const Payments = () => {
  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar p-lg space-y-lg max-w-[1600px] w-full mx-auto">
      {/* Page Title & Header */}
      <div className="mb-lg flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Historial de Pagos Recibidos</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Seguimiento detallado de ingresos por servicios energéticos</p>
        </div>
        <div className="flex gap-sm">
          <button className="flex items-center px-lg py-2 border border-outline-variant bg-surface text-on-surface-variant font-medium rounded-lg hover:bg-surface-container-low transition-colors text-body-sm">
            <span className="material-symbols-outlined mr-2 text-[18px]">picture_as_pdf</span>
            PDF
          </button>
          <button className="flex items-center px-lg py-2 border border-outline-variant bg-surface text-on-surface-variant font-medium rounded-lg hover:bg-surface-container-low transition-colors text-body-sm">
            <span className="material-symbols-outlined mr-2 text-[18px]">table_view</span>
            Excel
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest p-md data-card rounded-lg flex flex-col justify-between min-h-[120px] shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-label-caps font-label-caps text-on-surface-variant">Total Recaudado (Mes)</span>
            <div className="p-1.5 bg-primary/10 text-primary rounded">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="font-data-mono text-headline-md text-on-surface">S/ 482,930.50</span>
            <div className="flex items-center gap-1 text-primary mt-1">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span className="text-body-sm font-medium">+12.4% vs mes anterior</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-md data-card rounded-lg flex flex-col justify-between min-h-[120px] shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-label-caps font-label-caps text-on-surface-variant">Meta Alcanzada</span>
            <div className="p-1.5 bg-tertiary/10 text-tertiary rounded">
              <span className="material-symbols-outlined text-[20px]">track_changes</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-end mb-2">
              <span className="font-data-mono text-headline-md text-on-surface">86.4%</span>
              <span className="text-body-sm text-on-surface-variant">Meta: S/ 560k</span>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '86.4%' }}></div>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-md data-card rounded-lg flex flex-col justify-between min-h-[120px] shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-label-caps font-label-caps text-on-surface-variant">Transacciones Hoy</span>
            <div className="p-1.5 bg-secondary/10 text-secondary rounded">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="font-data-mono text-headline-md text-on-surface">42 Procesadas</span>
            <div className="flex items-center gap-1 text-on-surface-variant mt-1">
              <span className="text-body-sm font-medium">Último pago: hace 14 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-surface border border-outline-variant rounded-lg p-md mb-lg flex flex-wrap items-center gap-lg">
        <div className="flex flex-col gap-1">
          <label className="text-label-caps font-label-caps text-on-surface-variant">Rango de Fechas</label>
          <div className="flex items-center border border-outline-variant rounded px-3 py-1.5 bg-surface-container-lowest text-body-sm min-w-[240px]">
            <span className="material-symbols-outlined text-[18px] text-outline mr-2">calendar_month</span>
            <span>01 Oct 2024 - 31 Oct 2024</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-label-caps font-label-caps text-on-surface-variant">Inquilino / Empresa</label>
          <select className="border border-outline-variant rounded px-3 py-1.5 bg-surface-container-lowest text-body-sm min-w-[200px] focus:ring-1 focus:ring-primary focus:outline-none">
            <option>Todos los Inquilinos</option>
            <option>Aceros Industriales S.A.</option>
            <option>Textiles del Sur</option>
            <option>Logística Jicamarca</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-label-caps font-label-caps text-on-surface-variant">Método de Pago</label>
          <select className="border border-outline-variant rounded px-3 py-1.5 bg-surface-container-lowest text-body-sm min-w-[160px] focus:ring-1 focus:ring-primary focus:outline-none">
            <option>Todos los métodos</option>
            <option>Transferencia</option>
            <option>Depósito</option>
            <option>Cheque</option>
          </select>
        </div>
        <div className="flex items-end h-full pt-5">
          <button className="bg-primary text-on-primary px-lg py-1.5 rounded-lg font-medium text-body-sm hover:bg-primary-container transition-all active:scale-95">
            Aplicar Filtros
          </button>
          <button className="ml-2 text-on-surface-variant hover:text-primary transition-colors p-2">
            <span className="material-symbols-outlined">refresh</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
        <div className="px-lg py-md border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-md bg-surface-container-low">
          <h4 className="font-headline-sm text-headline-sm font-bold">Historial de Pagos</h4>
          <div className="flex flex-wrap items-center gap-sm">
            <button className="flex items-center gap-2 px-md py-2 bg-[#107C41]/10 text-[#107C41] hover:bg-[#107C41]/20 font-bold text-sm rounded-lg transition-colors border border-[#107C41]/20">
              <span className="material-symbols-outlined text-[18px]">table_view</span>
              Excel
            </button>
            <button className="flex items-center gap-2 px-md py-2 bg-error/10 text-error hover:bg-error/20 font-bold text-sm rounded-lg transition-colors border border-error/20">
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              PDF
            </button>
          </div>
        </div>
        <table className="w-full text-left border-collapse zebra-table">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              <th className="px-md py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Inquilino</th>
              <th className="px-md py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Nº Recibo</th>
              <th className="px-md py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Fecha</th>
              <th className="px-md py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Método</th>
              <th className="px-md py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider text-right">Monto (PEN)</th>
              <th className="px-md py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider text-center">Estado</th>
              <th className="px-md py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {/* Row 1 */}
            <tr className="hover:bg-surface-container-low transition-colors">
              <td className="px-md py-3">
                <div className="flex flex-col">
                  <span className="font-medium text-on-surface text-body-sm">Aceros Industriales S.A.</span>
                  <span className="text-[11px] text-outline uppercase tracking-tight">Sector A - Lote 12</span>
                </div>
              </td>
              <td className="px-md py-3 font-data-mono text-body-sm">REC-2024-0892</td>
              <td className="px-md py-3 text-body-sm text-on-surface-variant">25 Oct 2024</td>
              <td className="px-md py-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-on-secondary-container">account_balance</span>
                  <span className="text-body-sm">Transferencia</span>
                </div>
              </td>
              <td className="px-md py-3 font-data-mono text-body-sm text-right font-bold">12,450.00</td>
              <td className="px-md py-3 text-center">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase">
                  Confirmado
                </span>
              </td>
              <td className="px-md py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button className="p-1 text-on-surface-variant hover:text-primary transition-colors" title="Ver Detalle">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                  <button className="p-1 text-on-surface-variant hover:text-primary transition-colors" title="Descargar Voucher">
                    <span className="material-symbols-outlined">download</span>
                  </button>
                </div>
              </td>
            </tr>
            {/* Row 2 */}
            <tr className="hover:bg-surface-container-low transition-colors">
              <td className="px-md py-3">
                <div className="flex flex-col">
                  <span className="font-medium text-on-surface text-body-sm">Textiles del Sur</span>
                  <span className="text-[11px] text-outline uppercase tracking-tight">Sector C - Lote 05</span>
                </div>
              </td>
              <td className="px-md py-3 font-data-mono text-body-sm">REC-2024-0891</td>
              <td className="px-md py-3 text-body-sm text-on-surface-variant">25 Oct 2024</td>
              <td className="px-md py-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-on-secondary-container">payments</span>
                  <span className="text-body-sm">Depósito</span>
                </div>
              </td>
              <td className="px-md py-3 font-data-mono text-body-sm text-right font-bold">8,200.50</td>
              <td className="px-md py-3 text-center">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-tertiary/10 text-tertiary border border-tertiary/20 uppercase">
                  En Validación
                </span>
              </td>
              <td className="px-md py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button className="p-1 text-on-surface-variant hover:text-primary transition-colors" title="Ver Detalle">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                  <button className="p-1 text-on-surface-variant hover:text-primary transition-colors" title="Descargar Voucher">
                    <span className="material-symbols-outlined">download</span>
                  </button>
                </div>
              </td>
            </tr>
            {/* Row 3 */}
            <tr className="hover:bg-surface-container-low transition-colors">
              <td className="px-md py-3">
                <div className="flex flex-col">
                  <span className="font-medium text-on-surface text-body-sm">Logística Jicamarca</span>
                  <span className="text-[11px] text-outline uppercase tracking-tight">Sector B - Lote 22</span>
                </div>
              </td>
              <td className="px-md py-3 font-data-mono text-body-sm">REC-2024-0890</td>
              <td className="px-md py-3 text-body-sm text-on-surface-variant">24 Oct 2024</td>
              <td className="px-md py-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-on-secondary-container">history_edu</span>
                  <span className="text-body-sm">Cheque</span>
                </div>
              </td>
              <td className="px-md py-3 font-data-mono text-body-sm text-right font-bold">25,000.00</td>
              <td className="px-md py-3 text-center">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase">
                  Confirmado
                </span>
              </td>
              <td className="px-md py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button className="p-1 text-on-surface-variant hover:text-primary transition-colors" title="Ver Detalle">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                  <button className="p-1 text-on-surface-variant hover:text-primary transition-colors" title="Descargar Voucher">
                    <span className="material-symbols-outlined">download</span>
                  </button>
                </div>
              </td>
            </tr>
            {/* Row 4 */}
            <tr className="hover:bg-surface-container-low transition-colors">
              <td className="px-md py-3">
                <div className="flex flex-col">
                  <span className="font-medium text-on-surface text-body-sm">Constructora Norte</span>
                  <span className="text-[11px] text-outline uppercase tracking-tight">Sector A - Lote 02</span>
                </div>
              </td>
              <td className="px-md py-3 font-data-mono text-body-sm">REC-2024-0889</td>
              <td className="px-md py-3 text-body-sm text-on-surface-variant">24 Oct 2024</td>
              <td className="px-md py-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-on-secondary-container">account_balance</span>
                  <span className="text-body-sm">Transferencia</span>
                </div>
              </td>
              <td className="px-md py-3 font-data-mono text-body-sm text-right font-bold">5,600.00</td>
              <td className="px-md py-3 text-center">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase">
                  Confirmado
                </span>
              </td>
              <td className="px-md py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button className="p-1 text-on-surface-variant hover:text-primary transition-colors" title="Ver Detalle">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                  <button className="p-1 text-on-surface-variant hover:text-primary transition-colors" title="Descargar Voucher">
                    <span className="material-symbols-outlined">download</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div className="px-md py-3 bg-surface-container-low flex items-center justify-between">
          <span className="text-body-sm text-on-surface-variant">Mostrando 1-10 de 142 registros</span>
          <div className="flex gap-2">
            <button className="p-1 border border-outline-variant rounded disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button className="px-3 py-1 bg-primary text-on-primary rounded text-body-sm font-bold">1</button>
            <button className="px-3 py-1 hover:bg-surface-container-high rounded text-body-sm">2</button>
            <button className="px-3 py-1 hover:bg-surface-container-high rounded text-body-sm">3</button>
            <button className="p-1 border border-outline-variant rounded">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Payments;
