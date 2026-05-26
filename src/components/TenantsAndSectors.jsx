import React, { useState } from 'react';

const TenantsAndSectors = () => {
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, nave: '', company: '', stats: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMouseEnter = (e, nave, company, stats) => {
    setTooltip({
      show: true,
      x: e.clientX + 15,
      y: e.clientY + 15,
      nave,
      company,
      stats: stats ? `Consumo Actual: ${stats}` : 'Estado: Disponible'
    });
  };

  const handleMouseMove = (e) => {
    setTooltip(prev => ({ ...prev, x: e.clientX + 15, y: e.clientY + 15 }));
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, show: false }));
  };

  return (
    <main className="p-lg space-y-lg max-w-[1600px] mx-auto w-full flex-grow relative">
      {/* Header & Top Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Mapa de Sectores y Miembros</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Visualización en tiempo real de la ocupación y consumo industrial.</p>
        </div>
        <div className="flex flex-wrap gap-md">
          <div className="space-y-xs">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Filtrar por Sector</label>
            <div className="relative">
              <select className="min-w-[180px] bg-white border border-outline-variant rounded-md px-md py-sm font-body-sm focus:border-primary outline-none appearance-none pr-xl">
                <option>Todos los Sectores</option>
                <option>Logística</option>
                <option>Manufactura</option>
                <option>Frío</option>
              </select>
              <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
          </div>
          <div className="space-y-xs">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Estado Ocupación</label>
            <div className="relative">
              <select className="min-w-[180px] bg-white border border-outline-variant rounded-md px-md py-sm font-body-sm focus:border-primary outline-none appearance-none pr-xl">
                <option>Cualquier estado</option>
                <option>Ocupado</option>
                <option>Disponible</option>
                <option>Mantenimiento</option>
              </select>
              <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary font-semibold rounded-md hover:opacity-90 transition-all shadow-md h-[42px]"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span className="font-bold text-body-sm">Registrar Miembro</span>
            </button>
          </div>
        </div>
      </div>

      {/* Industrial Grid Map (Bento) */}
      <div className="bg-white border border-outline-variant rounded-xl p-lg grid grid-cols-12 gap-lg shadow-sm">
        
        {/* Sector A: Alimentos / Frío */}
        <div className="col-span-12 lg:col-span-8 space-y-md">
          <div className="flex items-center gap-2 pb-sm border-b border-outline-variant/30">
            <span className="material-symbols-outlined text-primary text-sm">ac_unit</span>
            <span className="font-label-caps text-label-caps tracking-[0.1em] text-on-surface-variant uppercase">Sector A: Alimentos &amp; Frío</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-md">
            
            {/* Nave A1 */}
            <div 
              className="col-span-1 bg-surface-container-low border border-outline-variant hover:border-primary transition-all rounded-lg p-md group cursor-pointer relative overflow-hidden"
              onMouseEnter={(e) => handleMouseEnter(e, 'NAVE A1', 'Alimentos Lima', '1.2 MW/h')}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="absolute top-2 right-2">
                <span className="material-symbols-outlined text-[16px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
              </div>
              <p className="font-data-mono text-[10px] text-primary/70">NAVE A1</p>
              <p className="font-body-md font-bold text-on-surface mt-1">Alimentos Lima</p>
              <div className="mt-xl flex items-center justify-between">
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">Frío</span>
                <span className="font-data-mono text-xs text-on-surface-variant">1.2 MW/h</span>
              </div>
            </div>

            {/* Nave A2 */}
            <div 
              className="col-span-1 bg-surface-container-low border border-outline-variant hover:border-primary transition-all rounded-lg p-md group cursor-pointer"
              onMouseEnter={(e) => handleMouseEnter(e, 'NAVE A2', 'Agroexport SAC', '0.9 MW/h')}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <p className="font-data-mono text-[10px] text-primary/70">NAVE A2</p>
              <p className="font-body-md font-bold text-on-surface mt-1">Agroexport SAC</p>
              <div className="mt-xl flex items-center justify-between">
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">Frío</span>
                <span className="font-data-mono text-xs text-on-surface-variant">0.9 MW/h</span>
              </div>
            </div>

            {/* Nave A3-4 Empty */}
            <div className="col-span-1 sm:col-span-2 bg-surface-container border border-dashed border-outline-variant rounded-lg p-md flex flex-col items-center justify-center group hover:bg-surface-variant/20 transition-all">
              <p className="font-data-mono text-[10px] text-on-surface-variant/50">NAVE A3 - A4</p>
              <p className="font-body-sm text-on-surface-variant italic">Espacio Disponible</p>
              <button className="mt-2 text-xs font-bold text-primary hover:underline">ASIGNAR</button>
            </div>

            {/* Nave A5 */}
            <div 
              className="col-span-1 sm:col-span-2 bg-surface-container-low border border-outline-variant hover:border-primary transition-all rounded-lg p-md"
              onMouseEnter={(e) => handleMouseEnter(e, 'NAVE A5 (MEZANINE)', 'Logística Inversa S.A.', '0.4 MW/h')}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <p className="font-data-mono text-[10px] text-primary/70">NAVE A5 (MEZANINE)</p>
              <p className="font-body-md font-bold text-on-surface mt-1">Logística Inversa S.A.</p>
              <div className="mt-xl flex items-center justify-between">
                <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-bold uppercase">Logística</span>
                <span className="font-data-mono text-xs text-on-surface-variant">0.4 MW/h</span>
              </div>
            </div>

            {/* Nave A6 */}
            <div 
              className="col-span-1 sm:col-span-2 bg-surface-container-low border border-outline-variant hover:border-primary transition-all rounded-lg p-md"
              onMouseEnter={(e) => handleMouseEnter(e, 'NAVE A6', 'Distribuidora Norte', '0.7 MW/h')}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <p className="font-data-mono text-[10px] text-primary/70">NAVE A6</p>
              <p className="font-body-md font-bold text-on-surface mt-1">Distribuidora Norte</p>
              <div className="mt-xl flex items-center justify-between">
                <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-bold uppercase">Logística</span>
                <span className="font-data-mono text-xs text-on-surface-variant">0.7 MW/h</span>
              </div>
            </div>

          </div>
        </div>

        {/* Sector B: Manufactura */}
        <div className="col-span-12 lg:col-span-4 space-y-md">
          <div className="flex items-center gap-2 pb-sm border-b border-outline-variant/30">
            <span className="material-symbols-outlined text-tertiary text-sm">precision_manufacturing</span>
            <span className="font-label-caps text-label-caps tracking-[0.1em] text-on-surface-variant uppercase">Sector B: Manufactura</span>
          </div>
          <div className="grid grid-cols-1 gap-md">
            
            {/* Nave B1 */}
            <div 
              className="bg-surface-container-low border border-tertiary/20 hover:border-tertiary transition-all rounded-lg p-md min-h-[160px] flex flex-col justify-between"
              onMouseEnter={(e) => handleMouseEnter(e, 'NAVE B1 (FULL)', 'Metalmecánica Perú', '4.8 MW/h')}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div>
                <p className="font-data-mono text-[10px] text-tertiary/70">NAVE B1 (FULL)</p>
                <p className="font-body-md font-bold text-on-surface mt-1">Metalmecánica Perú</p>
                <p className="text-[11px] text-on-surface-variant mt-1">Actividad: Fundición y ensamble</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] bg-tertiary-container/10 text-tertiary px-2 py-0.5 rounded font-bold uppercase">Manufactura</span>
                <div className="flex items-end gap-1">
                  <span className="font-data-mono text-xl text-tertiary font-bold">4.8</span>
                  <span className="text-[10px] text-tertiary/70 mb-1">MW/h</span>
                </div>
              </div>
            </div>

            {/* Nave B2 Alert */}
            <div 
              className="bg-error-container/10 border border-error/30 rounded-lg p-md flex flex-col justify-between min-h-[120px]"
              onMouseEnter={(e) => handleMouseEnter(e, 'NAVE B2', 'Textiles del Sur', null)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div>
                <div className="flex justify-between items-start">
                  <p className="font-data-mono text-[10px] text-error/70">NAVE B2</p>
                  <span className="bg-error text-on-error text-[10px] px-2 rounded-full font-bold animate-pulse">ALERTA</span>
                </div>
                <p className="font-body-md font-bold text-on-surface mt-1">Textiles del Sur</p>
              </div>
              <div className="mt-4 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-error font-semibold uppercase">Exceso detectado</span>
                  <span className="font-data-mono text-xs text-error font-bold">+15%</span>
                </div>
                <div className="w-full h-1 bg-error/10 rounded-full overflow-hidden">
                  <div className="bg-error h-full w-[85%]"></div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Active Members Table */}
      <section className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-md">
        <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Miembros Activos</h4>
          <div className="flex gap-md items-center">
            <span className="text-xs text-on-surface-variant">Mostrando 4 de 18 miembros activos</span>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container transition-colors rounded text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">download</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container transition-colors rounded text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left zebra-table border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-[11px] uppercase tracking-wider">
                <th className="px-lg py-sm font-bold">Nombre de Empresa</th>
                <th className="px-lg py-sm font-bold">ID Nave</th>
                <th className="px-lg py-sm font-bold">Tipo de Actividad</th>
                <th className="px-lg py-sm font-bold">Consumo Mes (MW/h)</th>
                <th className="px-lg py-sm font-bold">Estado Pago</th>
                <th className="px-lg py-sm text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-body-sm">
              <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors group">
                <td className="px-lg py-md">
                  <div className="flex items-center gap-md">
                    <div className="w-9 h-9 rounded bg-primary-container/20 flex items-center justify-center text-primary font-bold text-xs">AL</div>
                    <span className="font-semibold text-on-surface">Alimentos Lima S.A.</span>
                  </div>
                </td>
                <td className="px-lg py-md font-data-mono text-on-surface-variant">A-001</td>
                <td className="px-lg py-md">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[11px] font-bold uppercase">Frío</span>
                </td>
                <td className="px-lg py-md font-data-mono font-semibold">1,245.80</td>
                <td className="px-lg py-md">
                  <span className="flex items-center gap-2 text-[12px] text-green-600 font-semibold">
                    <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                    Al día
                  </span>
                </td>
                <td className="px-lg py-md text-right">
                  <button className="w-8 h-8 flex items-center justify-center ml-auto hover:bg-surface-variant rounded-full text-primary transition-all opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </td>
              </tr>

              <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors group">
                <td className="px-lg py-md">
                  <div className="flex items-center gap-md">
                    <div className="w-9 h-9 rounded bg-tertiary-container/20 flex items-center justify-center text-tertiary font-bold text-xs">MP</div>
                    <span className="font-semibold text-on-surface">Metalmecánica Perú</span>
                  </div>
                </td>
                <td className="px-lg py-md font-data-mono text-on-surface-variant">B-001</td>
                <td className="px-lg py-md">
                  <span className="bg-tertiary-container/20 text-tertiary px-3 py-1 rounded-full text-[11px] font-bold uppercase">Manufactura</span>
                </td>
                <td className="px-lg py-md font-data-mono font-semibold">4,812.30</td>
                <td className="px-lg py-md">
                  <span className="flex items-center gap-2 text-[12px] text-green-600 font-semibold">
                    <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                    Al día
                  </span>
                </td>
                <td className="px-lg py-md text-right">
                  <button className="w-8 h-8 flex items-center justify-center ml-auto hover:bg-surface-variant rounded-full text-primary transition-all opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </td>
              </tr>

              <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors group">
                <td className="px-lg py-md">
                  <div className="flex items-center gap-md">
                    <div className="w-9 h-9 rounded bg-secondary-container/20 flex items-center justify-center text-on-secondary-container font-bold text-xs">LI</div>
                    <span className="font-semibold text-on-surface">Logística Inversa S.A.</span>
                  </div>
                </td>
                <td className="px-lg py-md font-data-mono text-on-surface-variant">A-005</td>
                <td className="px-lg py-md">
                  <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[11px] font-bold uppercase">Logística</span>
                </td>
                <td className="px-lg py-md font-data-mono font-semibold">420.15</td>
                <td className="px-lg py-md">
                  <span className="flex items-center gap-2 text-[12px] text-tertiary font-semibold">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    Pendiente
                  </span>
                </td>
                <td className="px-lg py-md text-right">
                  <button className="w-8 h-8 flex items-center justify-center ml-auto hover:bg-surface-variant rounded-full text-primary transition-all opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </td>
              </tr>

              <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors group">
                <td className="px-lg py-md">
                  <div className="flex items-center gap-md">
                    <div className="w-9 h-9 rounded bg-error-container/20 flex items-center justify-center text-error font-bold text-xs">TS</div>
                    <span className="font-semibold text-on-surface">Textiles del Sur</span>
                  </div>
                </td>
                <td className="px-lg py-md font-data-mono text-on-surface-variant">B-002</td>
                <td className="px-lg py-md">
                  <span className="bg-tertiary-container/20 text-tertiary px-3 py-1 rounded-full text-[11px] font-bold uppercase">Manufactura</span>
                </td>
                <td className="px-lg py-md font-data-mono font-semibold">2,105.40</td>
                <td className="px-lg py-md">
                  <span className="flex items-center gap-2 text-[12px] text-error font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    Vencido
                  </span>
                </td>
                <td className="px-lg py-md text-right">
                  <button className="w-8 h-8 flex items-center justify-center ml-auto hover:bg-surface-variant rounded-full text-primary transition-all opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-md border-t border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <span className="text-xs text-on-surface-variant">Mostrando 4 de 18 miembros activos</span>
          <div className="flex gap-xs">
            <button className="p-xs hover:bg-surface-container-low border border-outline-variant rounded disabled:opacity-50"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
            <button className="px-sm py-xs bg-primary text-on-primary text-xs font-bold rounded">1</button>
            <button className="px-sm py-xs hover:bg-surface-container-low text-xs rounded">2</button>
            <button className="px-sm py-xs hover:bg-surface-container-low text-xs rounded">3</button>
            <button className="p-xs hover:bg-surface-container-low border border-outline-variant rounded"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
          </div>
        </div>
      </section>

      {/* Tooltip */}
      {tooltip.show && (
        <div 
          className="fixed pointer-events-none bg-inverse-surface text-inverse-on-surface px-md py-sm rounded-lg text-body-sm shadow-xl z-[100] border border-outline"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="flex flex-col gap-1">
            <span className="font-data-mono text-primary-fixed-dim text-[10px]">{tooltip.nave}</span>
            <span className="font-bold">{tooltip.company}</span>
            <span className="text-white/60 text-[11px]">{tooltip.stats}</span>
          </div>
        </div>
      )}
      
      {/* Nuevo Miembro Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-outline-variant flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-lg py-md border-b border-outline-variant bg-surface-container-high">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Registrar Nuevo Inquilino</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Cree un nuevo registro corporativo y su usuario administrador.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-xs hover:bg-surface-container-highest rounded-full transition-colors group"
              >
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-error transition-colors">close</span>
              </button>
            </div>
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-lg custom-scrollbar">
              <form className="space-y-lg" id="tenant-form" onSubmit={(e) => e.preventDefault()}>
                {/* Section 1: Datos de la Empresa */}
                <div className="space-y-md">
                  <div className="flex items-center gap-sm text-primary">
                    <span className="material-symbols-outlined text-[20px]">factory</span>
                    <span className="font-label-caps text-label-caps font-bold">DATOS DE LA EMPRESA</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="flex flex-col gap-xs">
                      <label className="font-body-sm text-body-sm font-semibold text-on-surface-variant">Nombre o Razón Social</label>
                      <input className="border border-outline-variant rounded px-md py-sm font-body-md focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-all" placeholder="Ej. Alimentos del Sol S.A." type="text" />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-body-sm text-body-sm font-semibold text-on-surface-variant">RUC</label>
                      <input className="border border-outline-variant rounded px-md py-sm font-data-mono focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-all" maxLength="11" placeholder="11 dígitos" type="text" />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-body-sm text-body-sm font-semibold text-on-surface-variant">Sector Asignado</label>
                      <select className="border border-outline-variant rounded px-md py-sm font-body-md focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-all appearance-none" defaultValue="">
                        <option disabled value="">Seleccione Nave...</option>
                        <option>Nave A-01</option>
                        <option>Nave A-02</option>
                        <option>Nave B-01</option>
                        <option>Sect. Exterior 04</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-body-sm text-body-sm font-semibold text-on-surface-variant">Tipo de Actividad</label>
                      <select className="border border-outline-variant rounded px-md py-sm font-body-md focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-all appearance-none" defaultValue="">
                        <option disabled value="">Seleccione rubro...</option>
                        <option>Alimentos</option>
                        <option>Manufactura</option>
                        <option>Logística</option>
                        <option>Químicos</option>
                        <option>Metalmecánica</option>
                      </select>
                    </div>
                  </div>
                </div>
                {/* Visual Divider */}
                <div className="h-[1px] bg-outline-variant/30"></div>
                {/* Section 2: Datos del Usuario Administrador */}
                <div className="space-y-md">
                  <div className="flex items-center gap-sm text-primary">
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    <span className="font-label-caps text-label-caps font-bold">DATOS DEL USUARIO (ADMINISTRADOR)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="flex flex-col gap-xs md:col-span-2">
                      <label className="font-body-sm text-body-sm font-semibold text-on-surface-variant">Nombre Completo del Representante</label>
                      <input className="border border-outline-variant rounded px-md py-sm font-body-md focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-all" placeholder="Nombre completo" type="text" />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-body-sm text-body-sm font-semibold text-on-surface-variant">Correo Electrónico</label>
                      <input className="border border-outline-variant rounded px-md py-sm font-body-md focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-all" placeholder="email@empresa.com" type="email" />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-body-sm text-body-sm font-semibold text-on-surface-variant">Teléfono de Contacto</label>
                      <input className="border border-outline-variant rounded px-md py-sm font-body-md focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-all" placeholder="+51 900 000 000" type="tel" />
                    </div>
                    <div className="flex flex-col gap-xs md:col-span-2">
                      <div className="bg-surface-container-low p-md border-l-4 border-tertiary-container rounded">
                        <label className="font-body-sm text-body-sm font-semibold text-on-surface-variant flex items-center gap-xs">
                          Código de Acceso Eléctrico 
                          <span className="material-symbols-outlined text-[16px]" title="Código manual para seguimiento de consumo de Watts">info</span>
                        </label>
                        <input className="mt-xs border border-outline-variant rounded px-md py-sm font-data-mono focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white w-full" placeholder="Ej. ACC-WATT-2024" type="text" />
                        <p className="text-[11px] text-on-surface-variant mt-xs italic">Este código vincula el medidor inteligente con la cuenta del usuario.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            {/* Modal Footer */}
            <div className="px-lg py-md bg-surface-container-high border-t border-outline-variant flex justify-between items-center">
              <p className="text-[12px] text-on-surface-variant max-w-[200px] leading-tight">
                Al registrar, se enviará un correo de bienvenida al inquilino.
              </p>
              <div className="flex gap-md">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-lg py-sm border border-outline text-on-surface font-bold rounded-lg hover:bg-surface transition-colors active:scale-95 duration-150"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    alert("Miembro registrado exitosamente.");
                    setIsModalOpen(false);
                  }}
                  className="px-lg py-sm bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all duration-150 flex items-center gap-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Registrar Inquilino
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
};

export default TenantsAndSectors;
