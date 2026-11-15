import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExcelIcon } from '../../../components/ui/ExcelIcon';

const DetailedPaymentsExportModal = ({ socios, selectedId, onSelectedIdChange, onClose, onDownload, isExporting, progress, formatCurrency }) => {
  const [search, setSearch] = useState('');
  const filteredSocios = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('es');
    if (!term) return socios;
    return socios.filter((socio) => socio.nombre.toLocaleLowerCase('es').includes(term));
  }, [search, socios]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isExporting) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExporting, onClose]);

  const isAll = selectedId === 'todos';
  const selectedSocio = socios.find((socio) => String(socio.id) === String(selectedId));

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={(event) => event.target === event.currentTarget && !isExporting && onClose()}>
      <div className="flex max-h-[min(720px,92vh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#107C41]/10 text-[#107C41]"><ExcelIcon className="h-5 w-5" /></span>
            <div><h3 className="text-base font-bold text-on-surface">Reporte detallado de pagos</h3><p className="text-[11px] text-on-surface-variant">Elige un socio o genera un Excel por cada socio.</p></div>
          </div>
          <button type="button" onClick={onClose} disabled={isExporting} className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-variant disabled:opacity-50" aria-label="Cerrar"><span className="material-symbols-outlined text-[19px]" translate="no">close</span></button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 p-5">
          <label className="relative"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[17px] text-on-surface-variant" translate="no">search</span><input autoFocus type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar socio..." className="h-10 w-full rounded-lg border border-outline-variant bg-white pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></label>

          <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-outline-variant bg-white custom-scrollbar">
            <button type="button" onClick={() => onSelectedIdChange('todos')} className={`flex w-full items-center gap-3 border-b border-outline-variant px-4 py-3 text-left transition-colors ${isAll ? 'bg-[#107C41]/10 ring-1 ring-inset ring-[#107C41]/30' : 'hover:bg-surface-container-lowest'}`}>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isAll ? 'bg-[#107C41] text-white' : 'bg-surface-container text-on-surface-variant'}`}><span className="material-symbols-outlined text-[19px]" translate="no">folder_zip</span></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-on-surface">Todos los socios</span><span className="block text-[10px] text-on-surface-variant">Descarga un ZIP con {socios.length} {socios.length === 1 ? 'archivo Excel' : 'archivos Excel'}, uno por socio.</span></span>
              <span className={`material-symbols-outlined text-[20px] ${isAll ? 'text-[#107C41]' : 'text-outline'}`} translate="no">{isAll ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
            </button>

            {filteredSocios.map((socio) => {
              const selected = String(selectedId) === String(socio.id);
              return <button key={socio.id} type="button" onClick={() => onSelectedIdChange(String(socio.id))} className={`flex w-full items-center gap-3 border-b border-outline-variant/60 px-4 py-3 text-left transition-colors last:border-b-0 ${selected ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : 'hover:bg-surface-container-lowest'}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${selected ? 'bg-primary text-on-primary' : 'bg-primary/10 text-primary'}`}><span className="material-symbols-outlined text-[18px]" translate="no">person</span></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-on-surface" title={socio.nombre}>{socio.nombre}</span><span className="block text-[10px] text-on-surface-variant">{socio.cantidad} {socio.cantidad === 1 ? 'pago' : 'pagos'} · S/ {formatCurrency(socio.total)}</span></span><span className={`material-symbols-outlined text-[20px] ${selected ? 'text-primary' : 'text-outline'}`} translate="no">{selected ? 'radio_button_checked' : 'radio_button_unchecked'}</span></button>;
            })}

            {!filteredSocios.length && <div className="px-4 py-8 text-center text-xs text-on-surface-variant"><span className="material-symbols-outlined mb-1 block text-3xl opacity-30" translate="no">person_search</span>No se encontraron socios.</div>}
          </div>

          <div className="rounded-lg border border-[#107C41]/20 bg-[#107C41]/5 px-3 py-2 text-[11px] text-on-surface-variant">
            {isAll ? `Se generará un ZIP con ${socios.length} reportes detallados.` : `Se descargará el reporte de ${selectedSocio?.nombre || 'este socio'}.`}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-outline-variant bg-surface-container-lowest px-5 py-4">
          <button type="button" onClick={onClose} disabled={isExporting} className="h-9 rounded-lg border border-outline-variant bg-white px-4 text-xs font-bold text-on-surface-variant hover:bg-surface-container disabled:opacity-50">Cancelar</button>
          <button type="button" onClick={onDownload} disabled={isExporting || socios.length === 0 || (!isAll && !selectedSocio)} className="flex h-9 items-center gap-2 rounded-lg bg-[#107C41] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#0b6535] disabled:cursor-not-allowed disabled:opacity-50">{isExporting ? <><span className="material-symbols-outlined animate-spin text-[17px]" translate="no">progress_activity</span>{progress ? `Generando ${progress}` : 'Generando...'}</> : <><span className="material-symbols-outlined text-[17px]" translate="no">{isAll ? 'folder_zip' : 'download'}</span>{isAll ? 'Descargar ZIP' : 'Descargar Excel'}</>}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DetailedPaymentsExportModal;
