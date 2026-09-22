import React from 'react';
import { createPortal } from 'react-dom';





const PdfPreviewModal = ({ pdfBlobUrl, onClose, downloadFileName = 'documento.pdf', title = 'Visor de PDF' }) => {
  return createPortal(
    <div
      role="dialog" aria-modal="true" aria-label={title}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 !m-0"
    >
      <div
        className="bg-surface w-full max-w-6xl h-[calc(100dvh-1rem)] sm:h-[min(90dvh,900px)] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant/40"
      >
        <div className="shrink-0 px-4 py-3 sm:px-5 border-b border-outline-variant bg-surface-container-low flex justify-between items-center gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[18px]" translate="no">picture_as_pdf</span>
            </div>
            <h3 className="font-headline-sm font-bold text-on-surface truncate">{title}</h3>
          </div>
          <div className="flex gap-2 shrink-0">
            <a
              href={pdfBlobUrl}
              download={downloadFileName}
              className="px-3 sm:px-4 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 flex items-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]" translate="no">download</span>
              <span className="hidden sm:inline">Descargar</span>
            </a>
            <button
              onClick={onClose}
              aria-label="Cerrar visor PDF"
              className="p-2 hover:bg-error/10 hover:text-error text-on-surface-variant rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]" translate="no">close</span>
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <iframe
            src={`${pdfBlobUrl}#toolbar=0`}
            className="w-full h-full border-none"
            title="Reporte PDF"
          />
        </div>
      </div>
    </div>, document.body
  );
};

export default React.memo(PdfPreviewModal);
