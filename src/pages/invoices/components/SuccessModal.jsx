import React from 'react';

const SuccessModal = ({ isOpen, onClose, lecturasCount, periodoName }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center"
    >
      <div
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
      </div>
    </div>
  );
};

export default SuccessModal;
