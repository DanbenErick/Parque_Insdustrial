import React, { useState } from 'react';

const Reports = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      alert('Datos actualizados correctamente desde el sistema SCADA.');
    }, 1000);
  };

  return (
    <main className="p-xl space-y-lg max-w-[1600px] w-full mx-auto flex-grow">
      {/* Header handled by App.jsx, here we put the page title if needed or assume it's in topbar. In this design it has a specific title. Let's add it here for consistency */}
      <div className="mb-lg">
        <h2 className="font-headline-md text-headline-md font-extrabold text-on-surface">Reportes de Energía y Consumo Industrial</h2>
      </div>

      {/* Filter & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between mb-xl gap-md">
        <div className="flex items-center gap-sm">
          <div className="flex bg-surface-container-high rounded-lg p-1 border border-outline-variant">
            <button className="px-md py-1.5 text-body-sm font-bold bg-white rounded shadow-sm">Mensual</button>
            <button className="px-md py-1.5 text-body-sm font-medium text-on-surface-variant hover:text-on-surface">Anual</button>
          </div>
          <div className="flex items-center bg-white border border-outline-variant rounded-lg px-md py-1.5 gap-sm cursor-pointer hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-body-md">calendar_today</span>
            <span className="font-body-sm">Octubre 2023</span>
            <span className="material-symbols-outlined text-body-sm">expand_more</span>
          </div>
        </div>
        <div className="flex gap-md">
          <button className="flex items-center gap-sm border border-secondary text-secondary px-md py-1.5 rounded-lg hover:bg-surface-container-high transition-colors font-body-sm font-medium">
            <span className="material-symbols-outlined text-body-md">file_download</span>
            Exportar PDF
          </button>
          <button 
            className="flex items-center gap-sm bg-primary text-white px-md py-1.5 rounded-lg hover:opacity-90 transition-opacity font-body-sm font-bold"
            onClick={handleUpdate}
          >
            <span className={`material-symbols-outlined text-body-md ${isUpdating ? 'animate-spin' : ''}`}>refresh</span>
            Actualizar Datos
          </button>
        </div>
      </div>

      {/* High Level Metrics Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
        {/* Metric 1 */}
        <div className="bg-white border border-outline-variant p-md rounded-lg hover:shadow-[0_4px_12px_rgba(15,23,42,0.05)] transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Consumo Total</span>
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-primary text-body-md" style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>
            </div>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-data-mono text-[48px] leading-[56px] tracking-tight text-on-surface font-bold">1,248.5</span>
            <span className="font-body-sm text-on-surface-variant">MWh</span>
          </div>
          <div className="flex items-center mt-md text-error gap-1">
            <span className="material-symbols-outlined text-body-sm">trending_up</span>
            <span className="font-body-sm font-bold">+4.2%</span>
            <span className="font-body-sm text-on-surface-variant ml-1 font-normal">vs mes anterior</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-outline-variant p-md rounded-lg hover:shadow-[0_4px_12px_rgba(15,23,42,0.05)] transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Eficiencia Energética</span>
            <div className="bg-tertiary-fixed/30 p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-tertiary text-body-md" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
            </div>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-data-mono text-[48px] leading-[56px] tracking-tight text-on-surface font-bold">A+</span>
          </div>
          <div className="flex items-center mt-md text-primary gap-1">
            <span className="material-symbols-outlined text-body-sm">check_circle</span>
            <span className="font-body-sm font-bold">Excelente</span>
            <span className="font-body-sm text-on-surface-variant ml-1 font-normal">Nivel óptimo</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-outline-variant p-md rounded-lg hover:shadow-[0_4px_12px_rgba(15,23,42,0.05)] transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Demanda Pico</span>
            <div className="bg-secondary-fixed/50 p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-on-secondary-fixed text-body-md">speed</span>
            </div>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-data-mono text-[48px] leading-[56px] tracking-tight text-on-surface font-bold">2.42</span>
            <span className="font-body-sm text-on-surface-variant">MW</span>
          </div>
          <div className="flex items-center mt-md text-primary gap-1">
            <span className="material-symbols-outlined text-body-sm">trending_down</span>
            <span className="font-body-sm font-bold">-0.8%</span>
            <span className="font-body-sm text-on-surface-variant ml-1 font-normal">Capacidad estable</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-outline-variant p-md rounded-lg hover:shadow-[0_4px_12px_rgba(15,23,42,0.05)] transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Factor de Potencia</span>
            <div className="bg-error/10 p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-error text-body-md">energy_program_saving</span>
            </div>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-data-mono text-[48px] leading-[56px] tracking-tight text-on-surface font-bold">0.96</span>
          </div>
          <div className="flex items-center mt-md text-on-surface-variant gap-1">
            <span className="material-symbols-outlined text-body-sm">info</span>
            <span className="font-body-sm">Dentro de norma</span>
          </div>
        </div>
      </div>

      {/* Main Data Visualizations */}
      <div className="grid grid-cols-12 gap-lg mb-xl">
        {/* Consumption Trend Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant p-lg rounded-lg">
          <div className="flex justify-between items-center mb-xl">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Tendencia de Consumo Histórico</h3>
              <p className="font-body-sm text-on-surface-variant">Análisis de carga por hora en el último período de 24h</p>
            </div>
            <div className="flex gap-sm">
              <span className="flex items-center gap-1.5 text-body-sm font-medium">
                <span className="w-3 h-3 rounded-full bg-primary"></span> Actual
              </span>
              <span className="flex items-center gap-1.5 text-body-sm font-medium text-on-surface-variant">
                <span className="w-3 h-3 rounded-full bg-outline-variant"></span> Promedio
              </span>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="h-64 w-full relative group">
            <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
              <line stroke="#F1F5F9" strokeWidth="1" x1="0" x2="800" y1="0" y2="0" />
              <line stroke="#F1F5F9" strokeWidth="1" x1="0" x2="800" y1="50" y2="50" />
              <line stroke="#F1F5F9" strokeWidth="1" x1="0" x2="800" y1="100" y2="100" />
              <line stroke="#F1F5F9" strokeWidth="1" x1="0" x2="800" y1="150" y2="150" />
              <line stroke="#F1F5F9" strokeWidth="1" x1="0" x2="800" y1="200" y2="200" />
              
              <path d="M0,180 Q100,160 200,120 T400,100 T600,60 T800,40 L800,200 L0,200 Z" fill="url(#chartFill)" opacity="0.1" />
              <defs>
                <linearGradient id="chartFill" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#0891B2', stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#0891B2', stopOpacity:0}} />
                </linearGradient>
              </defs>
              
              <path d="M0,180 Q100,160 200,120 T400,100 T600,60 T800,40" fill="none" stroke="#00647c" strokeWidth="2.5" />
              <line stroke="#bdc8ce" strokeDasharray="8,4" strokeWidth="1.5" x1="0" x2="800" y1="110" y2="110" />
              <circle className="opacity-0 group-hover:opacity-100 transition-opacity" cx="400" cy="100" fill="#00647c" r="4" />
            </svg>
            <div className="absolute bottom-[-24px] w-full flex justify-between px-xs text-[10px] font-data-mono text-on-surface-variant uppercase">
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
              <span>23:59</span>
            </div>
          </div>
        </div>

        {/* Distribution by Sector */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant p-lg rounded-lg">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">Distribución por Manzana</h3>
          <div className="space-y-md">
            <div>
              <div className="flex justify-between items-center mb-xs">
                <span className="font-body-sm font-bold">Manzana A (Textiles)</span>
                <span className="font-data-mono text-body-sm">412 MWh</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '33%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-xs">
                <span className="font-body-sm font-bold">Manzana B (Metalurgia)</span>
                <span className="font-data-mono text-body-sm">524 MWh</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-xs">
                <span className="font-body-sm font-bold">Manzana C (Almacén)</span>
                <span className="font-data-mono text-body-sm">118 MWh</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '9%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-xs">
                <span className="font-body-sm font-bold">Otros / Áreas Comunes</span>
                <span className="font-data-mono text-body-sm">194.5 MWh</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '16%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-xl p-md bg-surface-container-low rounded-lg border border-outline-variant flex items-center gap-md">
            <span className="material-symbols-outlined text-tertiary text-[32px]">lightbulb</span>
            <p className="font-body-sm leading-tight">
              <strong className="text-on-surface">Sugerencia:</strong> La Manzana B presenta un pico anómalo a las 03:00 AM. Se recomienda revisar maquinaria pesada.
            </p>
          </div>
        </div>
      </div>

      {/* High-Density Data Table */}
      <div className="bg-white border border-outline-variant rounded-lg overflow-hidden">
        <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Detalle de Consumo por Sector</h3>
          <div className="flex items-center gap-sm">
            <span className="text-body-sm text-on-surface-variant">Mostrando 12 sectores</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-lg py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Sector / ID</th>
                <th className="px-lg py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Estado Operativo</th>
                <th className="px-lg py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Demanda (kW)</th>
                <th className="px-lg py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">Consumo (kWh)</th>
                <th className="px-lg py-3 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider text-right">Costo Est. ($)</th>
              </tr>
            </thead>
            <tbody className="font-body-sm divide-y divide-outline-variant">
              <tr className="hover:bg-surface-container-low transition-colors h-[40px]">
                <td className="px-lg py-2 font-bold">Manzana A - Sector 01</td>
                <td className="px-lg py-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> ESTABLE
                  </span>
                </td>
                <td className="px-lg py-2 font-data-mono">142.5</td>
                <td className="px-lg py-2 font-data-mono">12,450.0</td>
                <td className="px-lg py-2 font-data-mono text-right">$4,852.00</td>
              </tr>
              <tr className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors h-[40px]">
                <td className="px-lg py-2 font-bold">Manzana B - Sector 04</td>
                <td className="px-lg py-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> ALERTA CARGA
                  </span>
                </td>
                <td className="px-lg py-2 font-data-mono">284.1</td>
                <td className="px-lg py-2 font-data-mono">24,902.1</td>
                <td className="px-lg py-2 font-data-mono text-right">$9,711.50</td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors h-[40px]">
                <td className="px-lg py-2 font-bold">Manzana B - Sector 05</td>
                <td className="px-lg py-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> ESTABLE
                  </span>
                </td>
                <td className="px-lg py-2 font-data-mono">112.4</td>
                <td className="px-lg py-2 font-data-mono">9,842.0</td>
                <td className="px-lg py-2 font-data-mono text-right">$3,838.40</td>
              </tr>
              <tr className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors h-[40px]">
                <td className="px-lg py-2 font-bold">Manzana C - Logística</td>
                <td className="px-lg py-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> ESTABLE
                  </span>
                </td>
                <td className="px-lg py-2 font-data-mono">45.8</td>
                <td className="px-lg py-2 font-data-mono">4,012.5</td>
                <td className="px-lg py-2 font-data-mono text-right">$1,564.80</td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors h-[40px]">
                <td className="px-lg py-2 font-bold">Manzana D - Metalmecánica</td>
                <td className="px-lg py-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> MANTENIMIENTO
                  </span>
                </td>
                <td className="px-lg py-2 font-data-mono">0.0</td>
                <td className="px-lg py-2 font-data-mono">152.0</td>
                <td className="px-lg py-2 font-data-mono text-right">$59.20</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="px-lg py-md border-t border-outline-variant bg-surface-container-low flex justify-between items-center">
          <button className="text-body-sm font-bold text-primary flex items-center gap-sm hover:underline">
            <span className="material-symbols-outlined text-body-md">visibility</span>
            Ver todos los sectores
          </button>
          <div className="flex items-center gap-md">
            <span className="font-body-sm text-on-surface-variant">Página 1 de 3</span>
            <div className="flex gap-xs">
              <button className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center bg-white hover:bg-surface-container-high disabled:opacity-50" disabled>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center bg-white hover:bg-surface-container-high">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Reports;
