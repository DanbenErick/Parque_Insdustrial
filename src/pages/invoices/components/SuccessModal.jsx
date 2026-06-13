import React from 'react';
import { motion } from 'framer-motion';

const SuccessModal = ({ isOpen, onClose, lecturasCount, periodoName }) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-surface p-xl rounded-xl shadow-2xl max-w-md w-full text-center space-y-md border border-outline-variant"
      >
        <div className="w-20 h-20 bg-[#059669]/10 rounded-full flex items-center justify-center mx-auto mb-lg">
          <span className="material-symbols-outlined text-[#059669] text-[48px]">verified</span>
        </div>
        <h3 className="font-headline-md text-headline-md text-on-surface font-bold">¡Proceso Exitoso!</h3>
        <p className="text-on-surface-variant">Se han generado {lecturasCount} recibos correctamente para el periodo {periodoName}.</p>
        <div className="grid grid-cols-1 gap-md pt-lg">
          <button 
            className="px-md py-3 bg-primary text-on-primary rounded-md hover:opacity-90 font-bold" 
            onClick={onClose}
          >
            Ir a Módulo de Facturación
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SuccessModal;
