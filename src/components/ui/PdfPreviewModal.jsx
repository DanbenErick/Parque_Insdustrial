import React from 'react';
import { motion } from 'framer-motion';

const OVERLAY = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const PANEL = { hidden: { scale: 0.95, opacity: 0 }, visible: { scale: 1, opacity: 1 } };
const TRANSITION = { duration: 0.2, ease: "easeOut" };

const PdfPreviewModal = ({ pdfBlobUrl, onClose, downloadFileName = 'documento.pdf', title = 'Visor de PDF' }) => {
  return (
    <motion.div
      variants={OVERLAY} initial="hidden" animate="visible" exit="hidden" transition={TRANSITION}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 !m-0"
    >
      <motion.div
        variants={PANEL} initial="hidden" animate="visible" exit="hidden" transition={TRANSITION}
        className="bg-surface w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="px-lg py-sm border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            </div>
            <h3 className="font-headline-sm font-bold text-on-surface">{title}</h3>
          </div>
          <div className="flex gap-2">
            <a
              href={pdfBlobUrl}
              download={downloadFileName}
              className="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 flex items-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Descargar
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-error/10 hover:text-error text-on-surface-variant rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
              Cerrar
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <iframe
            src={`${pdfBlobUrl}#toolbar=0`}
            className="w-full h-full border-none"
            title="Reporte PDF"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default React.memo(PdfPreviewModal);
