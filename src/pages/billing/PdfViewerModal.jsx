import  { memo, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * PdfViewerModal — Full-screen PDF viewer with download capability.
 * Extracted from Billing.jsx to reduce parent component complexity.
 */
const PdfViewerModal = memo(({ isOpen, pdfUrl, onDownload, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return createPortal(
        <div
          role="dialog" aria-modal="true" aria-label="Visor de recibo PDF"
          className="fixed inset-0 z-[100] !m-0 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
        >
          <div
            className="bg-surface rounded-2xl shadow-2xl w-full max-w-5xl h-[calc(100dvh-1rem)] sm:h-[min(90dvh,900px)] flex flex-col overflow-hidden border border-outline-variant/40"
          >
            <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-3 border-b border-outline-variant bg-surface-container-low">
              <h3 className="font-headline-sm font-bold text-on-surface flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-error" translate="no">picture_as_pdf</span>
                <span className="truncate">Recibo PDF</span>
              </h3>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={onDownload}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity font-bold text-sm shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]" translate="no">download</span>
                  <span className="hidden sm:inline">Descargar PDF</span>
                </button>
                <button
                  onClick={onClose}
                  aria-label="Cerrar visor PDF"
                  className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined" translate="no">close</span>
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 bg-surface-container-lowest">
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-none"
                  title="PDF Viewer"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="material-symbols-outlined animate-spin text-primary text-4xl" translate="no">progress_activity</span>
                </div>
              )}
            </div>
          </div>
        </div>
    , document.body);
});

PdfViewerModal.displayName = 'PdfViewerModal';

export default PdfViewerModal;
