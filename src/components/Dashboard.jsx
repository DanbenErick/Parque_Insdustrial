import React from 'react';

const Dashboard = () => {
  return (
    <main className="p-lg space-y-lg max-w-[1600px] mx-auto w-full flex-grow">
      {/* KPIs Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {/* KPI 1 */}
        <div className="bg-white border border-outline-variant rounded-lg p-md shadow-sm transition-transform hover:-translate-y-0.5 duration-200">
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">Consumo Total Parque</p>
          <div className="flex items-end justify-between">
            <h3 className="font-data-mono text-headline-md text-primary font-bold">1,428.5 <span className="text-body-md">MWh</span></h3>
            <span className="text-[12px] text-primary flex items-center gap-xs font-bold mb-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> 2.4%
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-outline-variant rounded-lg p-md shadow-sm transition-transform hover:-translate-y-0.5 duration-200">
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">Ocupación de Sectores</p>
          <div className="flex items-end justify-between">
            <h3 className="font-data-mono text-headline-md text-on-surface font-bold">84.2 <span className="text-body-md">%</span></h3>
            <span className="text-[12px] text-on-surface-variant mb-1">Estacionario</span>
          </div>
          <div className="w-full bg-surface-variant h-1.5 mt-sm rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[84%]"></div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-outline-variant rounded-lg p-md shadow-sm transition-transform hover:-translate-y-0.5 duration-200">
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">Proyección Mensual</p>
          <div className="flex items-end justify-between">
            <h3 className="font-data-mono text-headline-md text-on-surface font-bold">452,190 <span className="text-body-md text-primary">PEN</span></h3>
            <span className="text-[12px] text-tertiary flex items-center gap-xs font-bold mb-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span> Estimado
            </span>
          </div>
        </div>
      </div>

      {/* Central Layout: Chart & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg">
        {/* Chart Container */}
        <div className="lg:col-span-3 bg-white border border-outline-variant rounded-lg p-md flex flex-col shadow-md h-[400px]">
          <div className="flex justify-between items-center mb-lg">
            <div className="flex items-center gap-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Carga en Tiempo Real</h2>
              <span className="px-sm py-xs bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-widest animate-pulse">Live</span>
            </div>
            <div className="flex gap-xs">
              <button className="px-md py-1 text-[12px] font-bold border border-outline-variant rounded bg-surface-container-low shadow-sm">1h</button>
              <button className="px-md py-1 text-[12px] font-bold border border-outline-variant rounded hover:bg-surface-container-low transition-colors">6h</button>
              <button className="px-md py-1 text-[12px] font-bold border border-outline-variant rounded hover:bg-surface-container-low transition-colors">24h</button>
            </div>
          </div>
          
          {/* Chart Visualization */}
          <div className="flex-1 relative flex flex-col justify-end">
            <div className="absolute inset-0 flex flex-col justify-between py-xs pointer-events-none opacity-50">
              <div className="border-t border-outline-variant w-full text-[10px] text-on-surface-variant">1500 kW</div>
              <div className="border-t border-outline-variant w-full text-[10px] text-on-surface-variant">1000 kW</div>
              <div className="border-t border-outline-variant w-full text-[10px] text-on-surface-variant">500 kW</div>
              <div className="text-[10px] text-on-surface-variant">0 kW</div>
            </div>
            
            <div className="flex items-end h-[220px] gap-1 px-lg">
              {[40,45,60,55,75,85,90,82,65,40,35,50,55,70,95].map((height, i) => (
                <div key={i} className={`flex-1 rounded-t-sm ${i === 14 ? 'bg-primary shadow-[0_-2px_8px_rgba(0,100,124,0.3)]' : `bg-primary/${Math.round(height/10)*10}`}`} style={{ height: `${height}%` }}></div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts Sidebar */}
        <div className="bg-white border border-outline-variant rounded-lg p-md shadow-md flex flex-col h-[400px]">
          <div className="flex items-center gap-xs mb-md">
            <span className="material-symbols-outlined text-error" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
            <h3 className="font-headline-sm text-[16px] text-on-surface">Sectores en Alerta</h3>
          </div>
          
          <div className="space-y-sm flex-grow overflow-y-auto custom-scrollbar pr-1">
            <div className="p-sm bg-error-container/20 border-l-4 border-error rounded flex flex-col gap-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-body-sm text-on-background">Sector B - Nave 12</span>
                <span className="text-[10px] font-data-mono text-error font-bold">98% CAP.</span>
              </div>
              <p className="text-[12px] text-on-surface-variant leading-tight">Industrias Metalex: Pico de consumo detectado (245kW).</p>
            </div>
            
            <div className="p-sm bg-tertiary-container/10 border-l-4 border-tertiary rounded flex flex-col gap-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-body-sm text-on-background">Sector A - Nave 04</span>
                <span className="text-[10px] font-data-mono text-tertiary font-bold">PRÓXIMO</span>
              </div>
              <p className="text-[12px] text-on-surface-variant leading-tight">Almacenes Peruanos: Consumo acumulado supera media mensual.</p>
            </div>
            
            <div className="p-sm bg-surface-container-low border border-outline-variant rounded flex flex-col gap-xs opacity-70">
              <div className="flex justify-between items-center">
                <span className="font-bold text-body-sm text-on-surface-variant">Sector D - Comunes</span>
                <span className="text-[10px] font-data-mono text-on-surface-variant">ESTABLE</span>
              </div>
              <p className="text-[12px] text-on-surface-variant leading-tight">Iluminación externa: Encendido programado exitoso.</p>
            </div>
          </div>
          
          <button className="w-full mt-md py-sm text-center text-primary font-bold text-body-sm hover:bg-primary/5 rounded transition-all border border-primary/20">
            Ver todo el reporte
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-outline-variant rounded-lg overflow-hidden shadow-md">
        <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Últimas Lecturas por Inquilino</h2>
          <button className="flex items-center gap-xs px-md py-sm border border-outline text-on-surface font-semibold rounded-lg hover:bg-white transition-all text-xs">
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="font-bold">Exportar CSV</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/50 text-on-surface-variant font-label-caps text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-md py-sm">Empresa / ID</th>
                <th className="px-md py-sm">Sector / Nave</th>
                <th className="px-md py-sm">Lectura (kWh)</th>
                <th className="px-md py-sm">Tendencia</th>
                <th className="px-md py-sm text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant zebra-table">
              <tr className="hover:bg-surface-container-low/30 transition-colors">
                <td className="px-md py-md">
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface text-body-sm">Corporación Textil Sur</span>
                    <span className="text-[10px] text-on-surface-variant">ID: CT-9923</span>
                  </div>
                </td>
                <td className="px-md py-md">
                  <span className="text-body-sm">Sector A - Nave 15</span>
                </td>
                <td className="px-md py-md">
                  <span className="font-data-mono text-body-sm font-bold">4,520.12</span>
                </td>
                <td className="px-md py-md">
                  <span className="inline-flex items-center gap-xs px-xs py-[2px] bg-red-100 text-red-700 rounded-sm text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span> ALTA
                  </span>
                </td>
                <td className="px-md py-md text-right">
                  <button className="text-primary hover:bg-primary/10 p-1 rounded-full transition-colors">
                    <span className="material-symbols-outlined">analytics</span>
                  </button>
                </td>
              </tr>
              
              <tr className="hover:bg-surface-container-low/30 transition-colors">
                <td className="px-md py-md">
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface text-body-sm">Logística Global SAC</span>
                    <span className="text-[10px] text-on-surface-variant">ID: LG-4401</span>
                  </div>
                </td>
                <td className="px-md py-md">
                  <span className="text-body-sm">Sector C - Nave 02</span>
                </td>
                <td className="px-md py-md">
                  <span className="font-data-mono text-body-sm font-bold">1,215.80</span>
                </td>
                <td className="px-md py-md">
                  <span className="inline-flex items-center gap-xs px-xs py-[2px] bg-secondary-container text-on-secondary-container rounded-sm text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[14px]">trending_flat</span> NORMAL
                  </span>
                </td>
                <td className="px-md py-md text-right">
                  <button className="text-primary hover:bg-primary/10 p-1 rounded-full transition-colors">
                    <span className="material-symbols-outlined">analytics</span>
                  </button>
                </td>
              </tr>
              
              <tr className="hover:bg-surface-container-low/30 transition-colors">
                <td className="px-md py-md">
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface text-body-sm">Alimentos Procesados S.A.</span>
                    <span className="text-[10px] text-on-surface-variant">ID: AP-2188</span>
                  </div>
                </td>
                <td className="px-md py-md">
                  <span className="text-body-sm">Sector B - Nave 08</span>
                </td>
                <td className="px-md py-md">
                  <span className="font-data-mono text-body-sm font-bold">8,932.44</span>
                </td>
                <td className="px-md py-md">
                  <span className="inline-flex items-center gap-xs px-xs py-[2px] bg-green-100 text-green-700 rounded-sm text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[14px]">trending_down</span> BAJA
                  </span>
                </td>
                <td className="px-md py-md text-right">
                  <button className="text-primary hover:bg-primary/10 p-1 rounded-full transition-colors">
                    <span className="material-symbols-outlined">analytics</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
