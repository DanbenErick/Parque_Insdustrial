import React from 'react';
import { motion } from 'framer-motion';

const OVERLAY = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const PANEL = { hidden: { scale: 0.95, opacity: 0 }, visible: { scale: 1, opacity: 1 } };
const TRANSITION = { duration: 0.2, ease: "easeOut" };

const ConfirmActionModal = ({ 
  title, 
  message, 
  warningText, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar', 
  isDestructive = false, 
  isLoading = false, 
  icon = 'warning',
  onConfirm, 
  onClose 
}) => {
  return (
    <motion.div
      variants={OVERLAY} initial="hidden" animate="visible" exit="hidden" transition={TRANSITION}
      className="fixed inset-0 z-[60] flex items-center justify-center p-md bg-black/60 backdrop-blur-sm !m-0"
    >
      <motion.div
        variants={PANEL} initial="hidden" animate="visible" exit="hidden" transition={TRANSITION}
        className="bg-surface border border-outline-variant rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        <div className={`px-lg py-md flex justify-between items-center border-b-0 ${isDestructive ? 'bg-error' : 'bg-primary'}`}>
          <h3 className="font-headline-sm font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-white">
              {icon}
            </span>
            {title}
          </h3>
        </div>
        <div className="p-lg">
          <p className="text-on-surface-variant font-body-md whitespace-pre-line">
            {message}
          </p>
          {warningText && (
            <p className={`text-xs mt-2 font-bold ${isDestructive ? 'text-error' : 'text-primary'}`}>
              {warningText}
            </p>
          )}
        </div>
        <div className="px-lg py-md border-t border-outline-variant bg-surface-container-lowest flex justify-end gap-md">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-md py-2 font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-lg py-2 font-bold rounded-lg shadow-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 ${isDestructive ? 'bg-error text-white' : 'bg-primary text-on-primary'}`}
          >
            {isLoading ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">
                {isDestructive ? 'delete' : 'check_circle'}
              </span>
            )}
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default React.memo(ConfirmActionModal);
