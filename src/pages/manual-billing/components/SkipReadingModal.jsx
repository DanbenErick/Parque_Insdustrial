import { useEffect, useState } from 'react';

const REASONS = [
  'Medidor inaccesible',
  'Predio cerrado',
  'Medidor dañado o ilegible',
  'Riesgo de seguridad',
  'Otro'
];

export const SkipReadingModal = ({ isOpen, member, isSubmitting, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setDetail('');
    }
  }, [isOpen, member?.id]);

  if (!isOpen || !member) return null;

  const needsDetail = reason === 'Otro';
  const canSubmit = reason && (!needsDetail || detail.trim());

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    try {
      await onSubmit({ motivo: reason, detalle: detail.trim() });
      onClose();
    } catch {
      // El formulario permanece abierto para que el usuario pueda reintentar.
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-900/55 sm:p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !isSubmitting && onClose()}>
      <form onSubmit={handleSubmit} className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-outline-variant bg-surface shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95">
        <div className="flex items-start justify-between gap-3 border-b border-outline-variant px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-on-surface">Omitir temporalmente</h3>
            <p className="mt-0.5 text-xs text-on-surface-variant">El medidor saldrá de la cola actual, pero seguirá pendiente.</p>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-variant" aria-label="Cerrar">
            <span className="material-symbols-outlined text-[19px]" translate="no">close</span>
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-lg bg-surface-container-low px-3 py-2.5">
            <p className="truncate text-sm font-bold text-on-surface">{member.propietario}</p>
            <p className="mt-0.5 text-[11px] text-on-surface-variant">Medidor {member.num_serie}</p>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-on-surface">Motivo *</span>
            <select autoFocus required value={reason} onChange={(event) => setReason(event.target.value)} className="h-11 w-full rounded-lg border border-outline-variant bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
              <option value="">Seleccione un motivo</option>
              {REASONS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-on-surface">Detalle {needsDetail ? '*' : '(opcional)'}</span>
            <textarea required={needsDetail} maxLength={255} rows="3" value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Añada información útil para retomar la lectura..." className="w-full resize-none rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            <span className="mt-1 block text-right text-[10px] text-on-surface-variant">{detail.length}/255</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-outline-variant bg-surface-container-lowest p-4 sm:flex sm:justify-end">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg border border-outline-variant bg-white px-4 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-variant">Cancelar</button>
          <button type="submit" disabled={!canSubmit || isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50">
            <span className={`material-symbols-outlined text-[18px] ${isSubmitting ? 'animate-spin' : ''}`} translate="no">{isSubmitting ? 'sync' : 'schedule'}</span>
            {isSubmitting ? 'Guardando...' : 'Omitir y continuar'}
          </button>
        </div>
      </form>
    </div>
  );
};
