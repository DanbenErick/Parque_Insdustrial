import React from 'react';

const MemberReport = () => {
  return (
    <main className="flex-grow flex flex-col relative overflow-hidden bg-surface">
      <div className="p-lg space-y-lg max-w-[1600px] mx-auto w-full flex-grow overflow-y-auto">
        {/* Header & Export Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-md">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Reporte de Facturación y Consumo</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Resumen detallado de costos eléctricos distribuidos por miembro/inquilino.</p>
          </div>
          <div className="flex gap-sm">
            <button className="flex items-center gap-xs px-md py-2 border border-outline text-on-surface font-semibold rounded-lg hover:bg-surface-container-low transition-all">
              <span className="material-symbols-outlined text-sm">download</span>
              <span className="font-bold text-sm">Exportar Excel</span>
            </button>
            <button className="flex items-center gap-xs px-md py-2 bg-primary text-on-primary font-semibold rounded-lg hover:opacity-90 transition-all shadow-md">
              <span className="material-symbols-outlined text-sm">print</span>
              <span className="font-bold text-sm">Imprimir Recibos</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border border-outline-variant rounded-lg p-md grid grid-cols-1 md:grid-cols-4 gap-md shadow-sm">
          <div className="space-y-xs">
            <label className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">Mes de Facturación</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">calendar_month</span>
              <select className="w-full bg-surface border border-outline-variant rounded-md pl-xl pr-md py-2 text-sm focus:border-primary outline-none appearance-none">
                <option>Octubre 2023</option>
                <option>Septiembre 2023</option>
                <option>Agosto 2023</option>
              </select>
            </div>
          </div>
          <div className="space-y-xs">
            <label className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">Tipo de Miembro</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">category</span>
              <select className="w-full bg-surface border border-outline-variant rounded-md pl-xl pr-md py-2 text-sm focus:border-primary outline-none appearance-none">
                <option>Todos</option>
                <option>Comercial</option>
                <option>Industrial</option>
                <option>Oficinas</option>
              </select>
            </div>
          </div>
          <div className="space-y-xs">
            <label className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">Estado de Pago</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">payments</span>
              <select className="w-full bg-surface border border-outline-variant rounded-md pl-xl pr-md py-2 text-sm focus:border-primary outline-none appearance-none">
                <option>Todos los estados</option>
                <option>Pendiente</option>
                <option>Pagado</option>
                <option>Vencido</option>
              </select>
            </div>
          </div>
          <div className="flex items-end">
            <button className="w-full py-2 bg-surface-container-high hover:bg-surface-variant text-on-surface font-semibold rounded-md transition-all text-sm">
              Aplicar Filtros
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          <div className="bg-white border border-outline-variant rounded-lg p-md shadow-sm">
            <p className="font-label-caps text-[11px] tracking-wider text-on-surface-variant uppercase mb-xs font-bold">Consumo Total</p>
            <h3 className="font-data-mono text-headline-md text-primary font-bold">124.5 <span className="text-body-md font-normal">MWh</span></h3>
            <p className="text-[10px] text-on-surface-variant mt-sm">Mismo periodo mes anterior: 121.2 MWh</p>
          </div>
          <div className="bg-white border border-outline-variant rounded-lg p-md shadow-sm">
            <p className="font-label-caps text-[11px] tracking-wider text-on-surface-variant uppercase mb-xs font-bold">Monto a Facturar</p>
            <h3 className="font-data-mono text-headline-md text-on-surface font-bold">S/ 482,190</h3>
            <p className="text-[10px] text-on-surface-variant mt-sm">Incluye IGV y Cargos Fijos</p>
          </div>
          <div className="bg-white border border-outline-variant rounded-lg p-md shadow-sm">
            <p className="font-label-caps text-[11px] tracking-wider text-on-surface-variant uppercase mb-xs font-bold">Promedio por Miembro</p>
            <h3 className="font-data-mono text-headline-md text-on-surface font-bold">S/ 12,054</h3>
            <p className="text-[10px] text-on-surface-variant mt-sm">Basado en 40 miembros activos</p>
          </div>
          <div className="bg-white border border-outline-variant rounded-lg p-md shadow-sm">
            <p className="font-label-caps text-[11px] tracking-wider text-on-surface-variant uppercase mb-xs font-bold">Recaudación</p>
            <div className="flex items-center gap-md mt-xs">
              <h3 className="font-data-mono text-headline-md text-on-surface font-bold">65%</h3>
              <div className="flex-grow bg-surface-variant h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[65%]"></div>
              </div>
            </div>
            <p className="text-[10px] text-on-surface-variant mt-sm">26 de 40 miembros han pagado</p>
          </div>
        </div>

        {/* Comparison & Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Bar Chart: Comparativa de Consumo */}
          <div className="lg:col-span-2 bg-white border border-outline-variant rounded-lg p-md flex flex-col h-[400px] shadow-md">
            <div className="flex justify-between items-center mb-lg">
              <h4 className="font-headline-sm text-headline-sm font-bold">Comparativa de Consumo por Miembro</h4>
              <span className="text-xs text-on-surface-variant">Top Consumidores (kWh)</span>
            </div>
            <div className="flex-grow flex flex-col gap-sm">
              {[
                { name: 'Supermercado Metro', width: '95%', val: '28,450 kWh' },
                { name: 'Cineplanet', width: '80%', val: '24,120 kWh' },
                { name: 'Gimnasio SmartFit', width: '65%', val: '19,800 kWh' },
                { name: 'Tiendas Ripley', width: '60%', val: '18,250 kWh' },
                { name: 'Restaurante Tanta', width: '45%', val: '13,600 kWh' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-md">
                  <span className="w-32 text-xs font-semibold truncate">{item.name}</span>
                  <div className="flex-grow bg-surface-variant h-6 rounded-sm overflow-hidden relative">
                    <div className="bg-primary h-full transition-all" style={{width: item.width}}></div>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white font-bold">{item.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Donut Chart: Consumo por Inquilino */}
          <div className="bg-white border border-outline-variant rounded-lg p-md flex flex-col h-[400px] shadow-md">
            <h4 className="font-headline-sm text-headline-sm mb-lg font-bold">Consumo por Categoría</h4>
            <div className="flex-grow flex items-center justify-center relative">
              <div className="w-48 h-48 rounded-full border-[20px] border-surface-container-highest relative flex items-center justify-center">
                <div className="absolute inset-[-20px] rounded-full border-[20px] border-primary border-r-transparent border-b-transparent rotate-12"></div>
                <div className="absolute inset-[-20px] rounded-full border-[20px] border-secondary border-t-transparent border-l-transparent -rotate-45"></div>
                <div className="text-center">
                  <span className="font-data-mono text-headline-md font-bold">Oct</span>
                  <p className="text-[10px] text-on-surface-variant font-label-caps uppercase tracking-wider">Facturación</p>
                </div>
              </div>
            </div>
            <div className="space-y-sm mt-md">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-xs">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Anclas / Mayores</span>
                </div>
                <span className="font-data-mono font-bold">54%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-xs">
                  <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  <span>Locales Menores</span>
                </div>
                <span className="font-data-mono font-bold">31%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-xs">
                  <div className="w-2 h-2 rounded-full bg-surface-container-highest"></div>
                  <span>Áreas Comunes</span>
                </div>
                <span className="font-data-mono font-bold">15%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Table: Desglose de Facturación */}
        <div className="bg-white border border-outline-variant rounded-lg overflow-hidden shadow-md mt-lg">
          <div className="p-md border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-md bg-surface-container-low">
            <h4 className="font-headline-sm text-headline-sm font-bold">Desglose de Facturación por Miembro</h4>
            <div className="flex flex-col md:flex-row gap-md items-start md:items-center w-full md:w-auto">
              <span className="text-xs text-on-surface-variant mr-2">Mostrando 40 miembros</span>
              <div className="flex flex-wrap items-center gap-sm">
                <button className="flex items-center gap-2 px-md py-1 bg-[#107C41]/10 text-[#107C41] hover:bg-[#107C41]/20 font-bold text-xs rounded-lg transition-colors border border-[#107C41]/20">
                  <span className="material-symbols-outlined text-[16px]">table_view</span>
                  Excel
                </button>
                <button className="flex items-center gap-2 px-md py-1 bg-error/10 text-error hover:bg-error/20 font-bold text-xs rounded-lg transition-colors border border-error/20">
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                  PDF
                </button>
                <div className="hidden md:block w-[1px] h-4 bg-outline-variant mx-1"></div>
                <button className="text-primary hover:bg-primary/5 px-sm py-1 rounded flex items-center gap-xs transition-colors">
                  <span className="material-symbols-outlined text-md">filter_list</span>
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left zebra-table border-collapse table-zebra">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-[11px] uppercase tracking-wider">
                  <th className="px-md py-sm">Miembro / Local</th>
                  <th className="px-md py-sm">Medidor ID</th>
                  <th className="px-md py-sm">Consumo (kWh)</th>
                  <th className="px-md py-sm">Monto Neto (S/)</th>
                  <th className="px-md py-sm">IGV (18%)</th>
                  <th className="px-md py-sm font-bold">Total Factura (S/)</th>
                  <th className="px-md py-sm">Estado</th>
                  <th className="px-md py-sm text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                  <td className="px-md py-sm">
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface">Supermercado Metro</span>
                      <span className="text-[10px] text-on-surface-variant">Local L-101 (Ancla)</span>
                    </div>
                  </td>
                  <td className="px-md py-sm font-data-mono text-xs">MED-889021</td>
                  <td className="px-md py-sm font-data-mono">28,450</td>
                  <td className="px-md py-sm font-data-mono">92,462.50</td>
                  <td className="px-md py-sm font-data-mono">16,643.25</td>
                  <td className="px-md py-sm font-data-mono font-bold">109,105.75</td>
                  <td className="px-md py-sm">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold">PAGADO</span>
                  </td>
                  <td className="px-md py-sm text-right">
                    <button className="text-primary hover:underline text-xs font-bold mr-md">Ver Recibo</button>
                  </td>
                </tr>
                <tr className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                  <td className="px-md py-sm">
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface">Cineplanet</span>
                      <span className="text-[10px] text-on-surface-variant">Local L-402 (Ocio)</span>
                    </div>
                  </td>
                  <td className="px-md py-sm font-data-mono text-xs">MED-110293</td>
                  <td className="px-md py-sm font-data-mono">24,120</td>
                  <td className="px-md py-sm font-data-mono">78,390.00</td>
                  <td className="px-md py-sm font-data-mono">14,110.20</td>
                  <td className="px-md py-sm font-data-mono font-bold">92,500.20</td>
                  <td className="px-md py-sm">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-[10px] font-bold">PENDIENTE</span>
                  </td>
                  <td className="px-md py-sm text-right">
                    <button className="text-primary hover:underline text-xs font-bold mr-md">Recordar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MemberReport;
