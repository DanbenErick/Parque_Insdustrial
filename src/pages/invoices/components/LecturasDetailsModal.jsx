import React from 'react';
import { motion } from 'framer-motion';

const LecturasDetailsModal = ({ isOpen, onClose, lecturas }) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-md"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-surface border border-outline-variant rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="px-lg py-md bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
          <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Detalle de Lecturas del Periodo</h4>
          <div className="flex flex-wrap items-center gap-sm">
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full bg-surface-container-high">
              <span className="material-symbols-outlined text-md">close</span>
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-grow p-0">
          <table className="w-full text-left border-collapse table-zebra">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant sticky top-0">
                <th className="px-md py-sm font-label-caps text-secondary text-[11px] uppercase tracking-wider font-bold">ID LECTURA</th>
                <th className="px-md py-sm font-label-caps text-secondary text-[11px] uppercase tracking-wider font-bold text-center">FECHA REGISTRO</th>
                <th className="px-md py-sm font-label-caps text-secondary text-[11px] uppercase tracking-wider text-right font-bold">Lec. Anterior</th>
                <th className="px-md py-sm font-label-caps text-secondary text-[11px] uppercase tracking-wider text-right font-bold">Lec. Actual</th>
                <th className="px-md py-sm font-label-caps text-secondary text-[11px] uppercase tracking-wider text-right font-bold">Consumo (kWh)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              {lecturas.map(lectura => (
                <tr key={lectura.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-md py-md">
                    <p className="font-data-mono font-bold text-on-surface">LEC-{lectura.id}</p>
                  </td>
                  <td className="px-md py-md text-center text-on-surface-variant">
                     {new Date(lectura.fecha_registro).toLocaleDateString()}
                  </td>
                  <td className="px-md py-md text-right font-data-mono text-on-surface">{parseFloat(lectura.lectura_anterior).toLocaleString('en-US')}</td>
                  <td className="px-md py-md text-right font-data-mono text-primary font-bold">{parseFloat(lectura.lectura_actual).toLocaleString('en-US')}</td>
                  <td className="px-md py-md text-right font-data-mono font-bold text-secondary">
                    {(parseFloat(lectura.lectura_actual) - parseFloat(lectura.lectura_anterior)).toLocaleString('en-US')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-lg py-md bg-surface-container-low border-t border-outline-variant flex justify-end">
           <button onClick={onClose} className="px-md py-2 border border-outline-variant rounded-md hover:bg-surface-container transition-colors font-bold text-on-surface-variant">
              Cerrar
           </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LecturasDetailsModal;
