import React, { memo, useEffect } from 'react';

/**
 * PdfViewerModal — Full-screen PDF viewer with download capability.
 * Extracted from Billing.jsx to reduce parent component complexity.
 */
const PdfViewerModal = memo(({ isOpen, pdfUrl, pdfId, onDownload, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div
            className="bg-surface rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-outline-variant bg-surface-dim">
              <h3 className="font-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-error">picture_as_pdf</span>
                Visor de Boleta
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={onDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity font-bold text-sm shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Descargar PDF
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="flex-1 bg-surface-container-lowest p-0">
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-none"
                  title="PDF Viewer"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    
  );
});

PdfViewerModal.displayName = 'PdfViewerModal';

export default PdfViewerModal;
