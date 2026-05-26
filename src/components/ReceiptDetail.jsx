import React from 'react';

const ReceiptDetail = () => {
  return (
    <main className="flex-grow flex flex-col relative overflow-hidden bg-background">
      {/* TopAppBar inside content for layout consistency */}
      <div className="flex justify-between items-center mb-lg p-xl pb-0">
        <h2 className="font-headline-lg text-headline-lg text-primary font-bold">Detalle de Recibo</h2>
      </div>

      <div className="flex-grow overflow-y-auto p-xl pt-md pb-32">
        <div className="receipt-container space-y-lg max-w-6xl mx-auto">
          {/* Actions Toolbar */}
          <div className="flex justify-between items-center bg-white p-md rounded-xl border border-outline-variant shadow-sm print-hidden">
            <button className="flex items-center text-secondary hover:text-primary transition-colors font-label-caps text-[11px] uppercase tracking-widest font-bold">
              <span className="material-symbols-outlined mr-xs">arrow_back</span> REGRESAR
            </button>
            <div className="flex gap-md">
              <button className="flex items-center px-md py-2 border border-outline-variant rounded-lg text-secondary hover:bg-surface-container-low transition-colors font-bold text-sm">
                <span className="material-symbols-outlined mr-sm">mail</span> Enviar por Correo
              </button>
              <button 
                className="flex items-center px-md py-2 border border-outline-variant rounded-lg text-secondary hover:bg-surface-container-low transition-colors font-bold text-sm" 
                onClick={() => window.print()}
              >
                <span className="material-symbols-outlined mr-sm">print</span> Imprimir
              </button>
              <button className="flex items-center px-md py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-all font-bold text-sm shadow-sm">
                <span className="material-symbols-outlined mr-sm">picture_as_pdf</span> Descargar PDF
              </button>
            </div>
          </div>

          {/* Receipt Document */}
          <div className="bg-white border border-outline-variant shadow-sm rounded-lg overflow-hidden" id="receipt-document">
            {/* Document Header */}
            <div className="p-xl border-b border-outline-variant flex flex-col md:flex-row justify-between items-start gap-lg">
              <div className="space-y-sm">
                <div className="flex items-center gap-md">
                  <div className="w-16 h-16 bg-inverse-surface flex items-center justify-center rounded-lg shadow-inner">
                    <span className="material-symbols-outlined text-primary-fixed text-[40px]">factory</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Parque Industrial Jicamarca S.A.</h3>
                    <p className="text-body-sm text-on-surface-variant">RUC: 20456789123 | Av. Industrial 450, Lima</p>
                  </div>
                </div>
                <div className="pt-md">
                  <h4 className="font-label-caps text-[11px] tracking-wider text-primary font-bold">DATOS DEL INQUILINO</h4>
                  <p className="font-headline-sm text-headline-sm font-bold mt-1">Corporación Textil del Norte S.A.C.</p>
                  <div className="grid grid-cols-2 gap-x-xl gap-y-xs mt-xs">
                    <p className="text-body-sm text-on-surface-variant">RUC: <span className="text-on-surface font-bold">20123456789</span></p>
                    <p className="text-body-sm text-on-surface-variant">Manzana / Sector: <span className="text-on-surface font-bold">Lote B-22 / Sector 4</span></p>
                    <p className="text-body-sm text-on-surface-variant">Mes de Facturación: <span className="text-on-surface font-bold">Agosto 2024</span></p>
                    <p className="text-body-sm text-on-surface-variant">Vencimiento: <span className="text-on-surface font-bold">15 Sep 2024</span></p>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-xs w-full md:w-auto">
                <div className="bg-surface-container-high px-md py-sm rounded-lg inline-block text-center w-full md:w-auto">
                  <span className="block font-label-caps text-[11px] tracking-wider text-on-surface-variant text-center font-bold">TOTAL A PAGAR</span>
                  <span className="block font-headline-lg text-headline-lg text-primary font-bold">S/ 4,892.50</span>
                </div>
                <p className="text-[12px] text-error font-bold tracking-widest text-center md:text-right mt-2">ESTADO: PENDIENTE</p>
              </div>
            </div>

            {/* Consumption Breakdown Grid */}
            <div className="p-xl grid grid-cols-1 md:grid-cols-3 gap-xl bg-surface-container-lowest">
              {/* Meter Readings */}
              <div className="md:col-span-2">
                <h4 className="font-label-caps text-[11px] tracking-wider text-on-surface-variant mb-md font-bold">DETALLE DE LECTURAS (MEDIDOR 0921-X)</h4>
                <div className="grid grid-cols-2 gap-md">
                  <div className="p-md bg-white border border-outline-variant rounded-lg shadow-sm">
                    <span className="text-sm text-on-surface-variant block mb-xs">Lectura Anterior (01/08)</span>
                    <span className="font-data-mono text-xl text-on-surface font-bold">12,450.00 <span className="text-xs font-sans text-on-surface-variant font-normal">MW/h</span></span>
                  </div>
                  <div className="p-md bg-white border border-outline-variant rounded-lg shadow-sm">
                    <span className="text-sm text-on-surface-variant block mb-xs">Lectura Actual (31/08)</span>
                    <span className="font-data-mono text-xl text-on-surface font-bold">13,215.40 <span className="text-xs font-sans text-on-surface-variant font-normal">MW/h</span></span>
                  </div>
                </div>
                <div className="mt-md p-md bg-primary-container/10 border border-primary-container/20 rounded-lg flex justify-between items-center shadow-sm">
                  <div>
                    <span className="text-[12px] text-primary font-bold block tracking-wider">CONSUMO TOTAL DEL PERIODO</span>
                    <span className="text-sm text-primary">Incremento de 6.2% respecto al mes anterior</span>
                  </div>
                  <div className="text-right">
                    <span className="font-data-mono text-headline-md text-primary font-bold">765.40</span>
                    <span className="text-sm text-primary font-bold ml-1">MW/h</span>
                  </div>
                </div>
              </div>

              {/* Consumption Trend Mini-Chart Simulation */}
              <div className="bg-white border border-outline-variant rounded-lg p-md flex flex-col shadow-sm">
                <h4 className="font-label-caps text-[11px] tracking-wider text-on-surface-variant mb-md font-bold">TENDENCIA 6 MESES</h4>
                <div className="flex-1 flex items-end justify-between gap-1 px-sm h-24">
                  <div className="w-full bg-outline-variant rounded-t" style={{height: '40%'}}></div>
                  <div className="w-full bg-outline-variant rounded-t" style={{height: '55%'}}></div>
                  <div className="w-full bg-outline-variant rounded-t" style={{height: '45%'}}></div>
                  <div className="w-full bg-outline-variant rounded-t" style={{height: '70%'}}></div>
                  <div className="w-full bg-outline-variant rounded-t" style={{height: '85%'}}></div>
                  <div className="w-full bg-primary rounded-t" style={{height: '95%'}}></div>
                </div>
                <div className="flex justify-between mt-sm text-[10px] text-on-surface-variant font-bold tracking-widest">
                  <span>MAR</span><span>ABR</span><span>MAY</span><span>JUN</span><span>JUL</span><span className="text-primary">AGO</span>
                </div>
              </div>
            </div>

            {/* Billing Concepts Table */}
            <div className="px-xl py-lg">
              <h4 className="font-label-caps text-[11px] tracking-wider text-on-surface-variant mb-md font-bold">CONCEPTOS DE FACTURACIÓN</h4>
              <table className="w-full text-left border-collapse table-zebra">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low">
                    <th className="px-md py-sm font-label-caps text-[11px] text-on-surface-variant font-bold">Descripción</th>
                    <th className="px-md py-sm font-label-caps text-[11px] text-on-surface-variant text-right font-bold">Cant/Unid</th>
                    <th className="px-md py-sm font-label-caps text-[11px] text-on-surface-variant text-right font-bold">Precio Unit.</th>
                    <th className="px-md py-sm font-label-caps text-[11px] text-on-surface-variant text-right font-bold">Importe (S/)</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-outline-variant/50">
                    <td className="px-md py-md">Consumo Energía Activa (Baja Tensión)</td>
                    <td className="px-md py-md text-right font-data-mono">765.40 MW/h</td>
                    <td className="px-md py-md text-right font-data-mono">5.120</td>
                    <td className="px-md py-md text-right font-data-mono">3,918.85</td>
                  </tr>
                  <tr className="border-b border-outline-variant/50">
                    <td className="px-md py-md">Cargo Fijo Mensual</td>
                    <td className="px-md py-md text-right font-data-mono">1.00</td>
                    <td className="px-md py-md text-right font-data-mono">45.00</td>
                    <td className="px-md py-md text-right font-data-mono">45.00</td>
                  </tr>
                  <tr className="border-b border-outline-variant/50">
                    <td className="px-md py-md">Mantenimiento de Red e Infraestructura</td>
                    <td className="px-md py-md text-right font-data-mono">1.00</td>
                    <td className="px-md py-md text-right font-data-mono">182.00</td>
                    <td className="px-md py-md text-right font-data-mono">182.00</td>
                  </tr>
                  <tr className="border-b border-outline-variant/50">
                    <td className="px-md py-md">Alumbrado Público Prorrateado</td>
                    <td className="px-md py-md text-right font-data-mono">1.00</td>
                    <td className="px-md py-md text-right font-data-mono">2.50</td>
                    <td className="px-md py-md text-right font-data-mono">2.50</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer Summary and QR */}
            <div className="p-xl border-t border-outline-variant flex flex-col md:flex-row gap-xl items-center bg-surface-container-low/50">
              <div className="flex-1 flex flex-col sm:flex-row gap-lg items-center sm:items-start text-center sm:text-left">
                <div className="bg-white p-sm border border-outline-variant rounded-lg shadow-sm">
                  <img alt="Código QR para validación y pago" className="w-24 h-24" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ReceiptHash8f2a1c9e3b7d5f0a4e6c8b2d1a3f5e7g9h0i1j2k" />
                </div>
                <div className="max-w-xs">
                  <h5 className="font-label-caps text-[11px] tracking-wider text-on-surface-variant font-bold">VALIDACIÓN DIGITAL</h5>
                  <p className="text-sm text-on-surface-variant mt-xs">Escanee este código para validar la autenticidad del recibo o realizar el pago directo vía App PI Jicamarca.</p>
                  <p className="text-[10px] font-data-mono text-outline mt-sm">HASH: 8f2a1c9e3b7d5f0a4e6c8b2d1a3f5e7g9h0i1j2k</p>
                </div>
              </div>
              <div className="w-full md:w-64 space-y-xs">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Subtotal:</span>
                  <span className="font-data-mono font-bold">S/ 4,148.35</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">IGV (18%):</span>
                  <span className="font-data-mono font-bold">S/ 744.15</span>
                </div>
                <div className="flex justify-between pt-sm border-t border-outline-variant mt-2">
                  <span className="font-bold text-on-surface">TOTAL:</span>
                  <span className="font-headline-sm text-primary font-bold">S/ 4,892.50</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notice / Disclaimer */}
          <div className="bg-tertiary-container/10 border-l-4 border-tertiary p-md flex items-start gap-md print-hidden rounded-r-md">
            <span className="material-symbols-outlined text-tertiary">warning</span>
            <p className="text-sm text-on-tertiary-fixed-variant">
              <strong className="font-bold">Aviso importante:</strong> Si el pago no se registra antes de la fecha de vencimiento (15 Sep 2024), se procederá al corte preventivo del suministro de acuerdo al reglamento interno del Parque Industrial. Evite recargos por mora.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ReceiptDetail;
