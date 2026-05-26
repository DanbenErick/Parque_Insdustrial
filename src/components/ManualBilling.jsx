import React, { useState } from 'react';

const ManualBilling = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSave = () => {
    setIsProcessing(true);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => setIsProcessing(false), 500);
      }
    }, 200);
  };

  return (
    <main className="flex-grow flex flex-col relative overflow-hidden bg-background">
      <div className="flex-grow overflow-y-auto p-xl">
        <div className="max-w-6xl mx-auto space-y-lg">
          <div className="flex justify-between items-center mb-lg">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold">Generar Facturación Mensual</h2>
              <p className="font-body-md text-on-surface-variant">Registro manual y ajuste de lecturas de consumo.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
            <div className="md:col-span-7 bg-surface border border-outline-variant rounded-lg shadow-sm p-lg flex flex-col justify-between">
              <div>
                <span className="font-label-caps text-[11px] text-secondary uppercase tracking-widest block mb-xs">Configuración de Periodo</span>
                <h3 className="font-headline-sm text-headline-sm mb-lg font-bold">Seleccione Periodo de Facturación</h3>
                <div className="grid grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="font-label-caps text-[11px] text-on-surface-variant">MES</label>
                    <select className="w-full bg-surface-container border border-outline-variant rounded-md p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" defaultValue="Octubre">
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
            </div>

            <div className="md:col-span-5 grid grid-cols-1 gap-md">
              <div className="bg-surface border border-outline-variant rounded-lg p-lg flex items-center justify-between shadow-sm">
                <div>
                  <p className="font-label-caps text-[11px] text-secondary uppercase tracking-wider">Monto Estimado Total</p>
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

          {/* Manual Registration Table */}
          <div className="bg-surface border border-outline-variant rounded-lg shadow-sm overflow-hidden">
            <div className="px-lg py-md bg-surface-container-low border-b border-outline-variant">
              <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Registro Manual de Consumo por Miembro</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-zebra">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant">
                    <th className="px-md py-sm font-label-caps text-[11px] uppercase tracking-wider w-1/4">Miembro / Nave</th>
                    <th className="px-md py-sm font-label-caps text-[11px] uppercase tracking-wider">Última Lectura</th>
                    <th className="px-md py-sm font-label-caps text-[11px] uppercase tracking-wider">Consumo (kWh)</th>
                    <th className="px-md py-sm font-label-caps text-[11px] uppercase tracking-wider">Monto Estimado</th>
                    <th className="px-md py-sm font-label-caps text-[11px] uppercase tracking-wider">Estado</th>
                    <th className="px-md py-sm font-label-caps text-[11px] uppercase tracking-wider text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-sm">
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="px-md py-md">
                      <p className="font-body-md font-bold">Logística del Pacífico S.A.</p>
                      <p className="text-xs text-on-surface-variant">Nave A-12</p>
                    </td>
                    <td className="px-md py-md font-data-mono">45,120.50</td>
                    <td className="px-md py-md">
                      <input className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 font-data-mono font-bold text-on-surface focus:outline-none focus:border-primary" step="0.01" type="number" defaultValue="1245.00" />
                    </td>
                    <td className="px-md py-md">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-data-mono text-primary">S/</span>
                        <input className="w-full bg-surface-container-lowest border border-outline-variant rounded pl-8 pr-2 py-2 font-data-mono font-bold text-primary focus:outline-none focus:border-primary" step="0.01" type="number" defaultValue="4850.00" />
                      </div>
                    </td>
                    <td className="px-md py-md">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">LECTURA COMPLETA</span>
                    </td>
                    <td className="px-md py-md text-center">
                      <button onClick={handleSave} className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-all p-2 rounded-lg group">
                        <span className="material-symbols-outlined block text-sm">save</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="px-md py-md">
                      <p className="font-body-md font-bold">Aceros Industriales S.A.C.</p>
                      <p className="text-xs text-on-surface-variant">Nave B-05</p>
                    </td>
                    <td className="px-md py-md font-data-mono">12,840.10</td>
                    <td className="px-md py-md">
                      <input className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 font-data-mono font-bold text-on-surface focus:outline-none focus:border-primary" step="0.01" type="number" defaultValue="2150.25" />
                    </td>
                    <td className="px-md py-md">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-data-mono text-primary">S/</span>
                        <input className="w-full bg-surface-container-lowest border border-outline-variant rounded pl-8 pr-2 py-2 font-data-mono font-bold text-primary focus:outline-none focus:border-primary" step="0.01" type="number" defaultValue="8240.50" />
                      </div>
                    </td>
                    <td className="px-md py-md">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-[10px] font-bold">PENDIENTE CONFIRMAR</span>
                    </td>
                    <td className="px-md py-md text-center">
                      <button onClick={handleSave} className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-all p-2 rounded-lg group">
                        <span className="material-symbols-outlined block text-sm">save</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {isProcessing && (
            <div className="fixed bottom-4 right-4 bg-inverse-surface text-inverse-on-surface p-md rounded-lg shadow-xl animate-in slide-in-from-bottom-5">
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined animate-spin">sync</span>
                <span className="font-body-sm font-bold">Guardando lecturas... {progress}%</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
};

export default ManualBilling;
