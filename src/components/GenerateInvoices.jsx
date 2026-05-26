import React, { useState } from 'react';

const GenerateInvoices = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleGenerate = () => {
    setIsProcessing(true);
    // Simulate progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsProcessing(false);
          setShowSuccess(true);
        }, 500);
      }
    }, 300);
  };

  return (
    <main className="flex-grow flex flex-col relative overflow-hidden bg-background">
      {/* Page Content */}
      <div className="flex-grow overflow-y-auto p-xl">
        <div className="max-w-6xl mx-auto space-y-lg">
          {/* Header Action inside content for layout consistency */}
          <div className="flex justify-between items-center mb-lg">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold">Generar Facturación Mensual</h2>
              <p className="font-body-md text-on-surface-variant">Proceso de emisión masiva de comprobantes de pago.</p>
            </div>
          </div>

          {/* Hero Selection & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
            {/* Config Card */}
            <div className="md:col-span-7 bg-surface border border-outline-variant rounded-lg shadow-sm p-lg flex flex-col justify-between">
              <div>
                <span className="font-label-caps text-[11px] text-secondary uppercase tracking-widest block mb-xs">Configuración de Periodo</span>
                <h3 className="font-headline-sm text-headline-sm mb-lg font-bold">Seleccione Periodo de Facturación</h3>
                <div className="grid grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="font-label-caps text-[11px] text-on-surface-variant">MES</label>
                    <select className="w-full bg-surface-container border border-outline-variant rounded-md p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" defaultValue="Octubre">
                      <option>Enero</option>
                      <option>Febrero</option>
                      <option>Marzo</option>
                      <option>Abril</option>
                      <option>Mayo</option>
                      <option>Junio</option>
                      <option>Julio</option>
                      <option>Agosto</option>
                      <option>Septiembre</option>
                      <option>Octubre</option>
                      <option>Noviembre</option>
                      <option>Diciembre</option>
                    </select>
                  </div>
                  <div className="space-y-xs">
                    <label className="font-label-caps text-[11px] text-on-surface-variant">AÑO</label>
                    <select className="w-full bg-surface-container border border-outline-variant rounded-md p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" defaultValue="2024">
                      <option>2023</option>
                      <option>2024</option>
                      <option>2025</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-xl p-md bg-primary-container/10 border-l-4 border-primary rounded-r">
                <div className="flex items-start gap-md">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <div>
                    <p className="font-body-md text-body-md text-on-primary-container">Se generarán <span className="font-bold">24 facturas</span> para el periodo <span className="font-bold">Octubre 2024</span>.</p>
                    <p className="font-body-sm text-sm text-on-surface-variant mt-xs">Incluye sectores industriales A, B y C del predio Jicamarca.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Quick View */}
            <div className="md:col-span-5 grid grid-cols-1 gap-md">
              <div className="bg-surface border border-outline-variant rounded-lg p-lg flex items-center justify-between shadow-sm">
                <div>
                  <p className="font-label-caps text-[11px] text-secondary uppercase tracking-wider">Monto Estimado</p>
                  <p className="font-data-mono text-headline-md text-on-surface font-bold mt-1">S/ 48,250.00</p>
                </div>
                <span className="material-symbols-outlined text-primary-container text-[48px] opacity-80">account_balance_wallet</span>
              </div>
              <div className="bg-surface border border-outline-variant rounded-lg p-lg flex items-center justify-between shadow-sm">
                <div>
                  <p className="font-label-caps text-[11px] text-secondary uppercase tracking-wider">Consumo Total (kWh)</p>
                  <p className="font-data-mono text-headline-md text-on-surface font-bold mt-1">12,450.00</p>
                </div>
                <span className="material-symbols-outlined text-tertiary text-[48px] opacity-80">bolt</span>
              </div>
            </div>
          </div>

          {/* Readings Checklist */}
          <div className="bg-surface border border-outline-variant rounded-lg shadow-sm overflow-hidden">
            <div className="px-lg py-md bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
              <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Lista de Verificación de Lecturas</h4>
              <button 
                onClick={() => setShowDetailsModal(true)}
                className="bg-primary/10 text-primary px-sm py-xs rounded text-[11px] font-bold tracking-wider hover:bg-primary/20 transition-colors"
              >
                VER DETALLE (100%)
              </button>
            </div>
            <div className="divide-y divide-outline-variant">
              <div className="p-md flex items-center justify-between hover:bg-surface-container-lowest transition-colors px-lg">
                <div className="flex items-center gap-md">
                  <div className="bg-tertiary/10 text-tertiary p-2 rounded">
                    <span className="material-symbols-outlined">water_drop</span>
                  </div>
                  <div>
                    <p className="font-body-md font-bold text-on-surface">Lecturas de Agua Potable</p>
                    <p className="font-body-sm text-sm text-on-surface-variant">24/24 medidores registrados</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#059669]">check_circle</span>
              </div>
              <div className="p-md flex items-center justify-between hover:bg-surface-container-lowest transition-colors px-lg">
                <div className="flex items-center gap-md">
                  <div className="bg-primary/10 text-primary p-2 rounded">
                    <span className="material-symbols-outlined">electric_bolt</span>
                  </div>
                  <div>
                    <p className="font-body-md font-bold text-on-surface">Lecturas de Energía Eléctrica</p>
                    <p className="font-body-sm text-sm text-on-surface-variant">24/24 medidores registrados</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#059669]">check_circle</span>
              </div>
              <div className="p-md flex items-center justify-between hover:bg-surface-container-lowest transition-colors px-lg">
                <div className="flex items-center gap-md">
                  <div className="bg-secondary/10 text-secondary p-2 rounded">
                    <span className="material-symbols-outlined">home_storage</span>
                  </div>
                  <div>
                    <p className="font-body-md font-bold text-on-surface">Cuotas de Mantenimiento</p>
                    <p className="font-body-sm text-sm text-on-surface-variant">Actualizado según tabla de m2</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#059669]">check_circle</span>
              </div>
            </div>
          </div>

          {/* Simulation/Process Area */}
          {isProcessing && (
            <div className="animate-in fade-in duration-500">
              <div className="bg-inverse-surface text-surface-bright rounded-lg p-xl shadow-xl">
                <div className="flex flex-col items-center text-center space-y-md">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle className="text-on-surface-variant opacity-20" cx="48" cy="48" fill="transparent" r="44" stroke="currentColor" strokeWidth="4"></circle>
                      <circle 
                        className="transition-all duration-300" 
                        cx="48" cy="48" fill="transparent" r="44" stroke="#00647c" 
                        strokeDasharray="276" strokeDashoffset={276 - (276 * progress) / 100} strokeWidth="4">
                      </circle>
                    </svg>
                    <span className="font-data-mono text-headline-md">{progress}%</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm font-bold">Procesando Facturación</h4>
                    <p className="text-surface-variant text-sm mt-1">Validando registros y generando archivos PDF/XML...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Final Action */}
          {!isProcessing && !showSuccess && (
            <div className="flex justify-end items-center gap-md py-lg border-t border-outline-variant mt-lg">
              <button className="px-lg py-2 border border-outline text-on-surface-variant hover:bg-surface-container transition-colors rounded-md font-bold">
                Cancelar Operación
              </button>
              <button 
                onClick={handleGenerate}
                className="px-xl py-2 bg-primary text-on-primary font-bold shadow-md hover:opacity-90 active:scale-95 transition-all rounded-md flex items-center gap-sm"
              >
                <span className="material-symbols-outlined">print</span>
                Confirmar y Generar Facturas
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-surface p-xl rounded-xl shadow-2xl max-w-md w-full text-center space-y-md border border-outline-variant">
            <div className="w-20 h-20 bg-[#059669]/10 rounded-full flex items-center justify-center mx-auto mb-lg">
              <span className="material-symbols-outlined text-[#059669] text-[48px]">verified</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">¡Proceso Exitoso!</h3>
            <p className="text-on-surface-variant">Se han generado 24 facturas electrónicas. Los archivos están listos para ser enviados a los inquilinos y SUNAT.</p>
            <div className="grid grid-cols-2 gap-md pt-lg">
              <button className="px-md py-2 border border-outline-variant rounded-md hover:bg-surface-container transition-colors font-bold text-on-surface-variant">Ver Comprobantes</button>
              <button 
                className="px-md py-2 bg-primary text-on-primary rounded-md hover:opacity-90 font-bold" 
                onClick={() => setShowSuccess(false)}
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tenant Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-md">
          <div className="bg-surface border border-outline-variant rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-lg py-md bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
              <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Detalle de Miembros a Facturar</h4>
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
                  <span className="font-label-caps text-[11px] font-bold uppercase hidden md:inline">Filtrar</span>
                </button>
                <button onClick={() => setShowDetailsModal(false)} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full">
                  <span className="material-symbols-outlined text-md">close</span>
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-grow p-0">
              <table className="w-full text-left border-collapse table-zebra">
                <thead>
                  <tr className="bg-surface-container-lowest border-b border-outline-variant sticky top-0">
                    <th className="px-md py-sm font-label-caps text-secondary text-[11px] uppercase tracking-wider font-bold">MIEMBRO / MANZANA</th>
                    <th className="px-md py-sm font-label-caps text-secondary text-[11px] uppercase tracking-wider text-right font-bold">Última Lectura</th>
                    <th className="px-md py-sm font-label-caps text-secondary text-[11px] uppercase tracking-wider text-right font-bold">Consumo (kWh)</th>
                    <th className="px-md py-sm font-label-caps text-secondary text-[11px] uppercase tracking-wider text-right font-bold">Monto Estimado</th>
                    <th className="px-md py-sm font-label-caps text-secondary text-[11px] uppercase tracking-wider text-center font-bold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-sm">
                  <tr className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-md py-md">
                      <p className="font-body-md font-bold text-on-surface">Logística del Pacífico S.A.</p>
                      <p className="text-xs text-on-surface-variant">Manzana A-12</p>
                    </td>
                    <td className="px-md py-md text-right font-data-mono text-on-surface">45,120.50</td>
                    <td className="px-md py-md text-right font-data-mono font-bold text-primary">1,245.00</td>
                    <td className="px-md py-md text-right font-data-mono text-on-surface">S/ 4,850.00</td>
                    <td className="px-md py-md text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#059669]/10 text-[#059669]">LECTURA COMPLETA</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-md py-md">
                      <p className="font-body-md font-bold text-on-surface">Textiles del Sur E.I.R.L.</p>
                      <p className="text-xs text-on-surface-variant">Manzana B-05</p>
                    </td>
                    <td className="px-md py-md text-right font-data-mono text-on-surface">12,840.20</td>
                    <td className="px-md py-md text-right font-data-mono font-bold text-primary">840.50</td>
                    <td className="px-md py-md text-right font-data-mono text-on-surface">S/ 2,420.00</td>
                    <td className="px-md py-md text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#059669]/10 text-[#059669]">LECTURA COMPLETA</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-md py-md">
                      <p className="font-body-md font-bold text-on-surface">Inversiones Metalmecánicas</p>
                      <p className="text-xs text-on-surface-variant">Manzana C-01</p>
                    </td>
                    <td className="px-md py-md text-right font-data-mono text-on-surface">8,520.00</td>
                    <td className="px-md py-md text-right font-data-mono font-bold text-primary">150.25</td>
                    <td className="px-md py-md text-right font-data-mono text-on-surface">S/ 1,120.00</td>
                    <td className="px-md py-md text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#059669]/10 text-[#059669]">LECTURA COMPLETA</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-md py-md">
                      <p className="font-body-md font-bold text-on-surface">Almacenes Generales S.A.</p>
                      <p className="text-xs text-on-surface-variant">Manzana A-03</p>
                    </td>
                    <td className="px-md py-md text-right font-data-mono text-on-surface">22,310.10</td>
                    <td className="px-md py-md text-right font-data-mono font-bold text-primary">450.70</td>
                    <td className="px-md py-md text-right font-data-mono text-on-surface">S/ 1,890.00</td>
                    <td className="px-md py-md text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#059669]/10 text-[#059669]">LECTURA COMPLETA</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-lg py-md bg-surface-container-low border-t border-outline-variant flex justify-end">
               <button onClick={() => setShowDetailsModal(false)} className="px-md py-2 border border-outline-variant rounded-md hover:bg-surface-container transition-colors font-bold text-on-surface-variant">
                  Cerrar
               </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default GenerateInvoices;
