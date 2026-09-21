import { BadgeType } from '../shared/BadgeType';
import { formatPeriodo, fmtVal } from '../../utils';

export const MemberReadingHeader = ({ member, onClose }) => (
  <div className="bg-primary/5 px-4 py-3 border-b border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
    <div className="flex items-center gap-3 overflow-hidden">
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border border-primary/10 shrink-0"><span className="material-symbols-outlined text-[20px]" translate="no">person</span></div>
      <div className="truncate">
        <h3 className="font-bold text-on-surface text-sm leading-tight truncate" title={member.propietario}>{member.propietario}</h3>
        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-on-surface-variant">
          <span className="font-data-mono bg-white px-1.5 py-0.5 rounded border border-outline-variant/50 text-primary/80 font-bold">{member.documento_identidad}</span>
          <span className="hidden md:inline">•</span><span className="truncate max-w-[200px]">{member.direccion || 'Sin dirección'}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      <div className="flex-col items-end hidden md:flex"><span className="text-[9px] uppercase tracking-wider font-bold text-primary/70">Medidor</span><span className="font-data-mono font-bold text-sm text-primary leading-tight">{member.num_serie}</span></div>
      <BadgeType tipo={member.tipo} />
      {onClose && <button type="button" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-primary/10 flex items-center justify-center text-primary/70 hover:text-primary transition-colors ml-2" title="Cerrar y volver a la lista"><span className="material-symbols-outlined text-[20px]" translate="no">close</span></button>}
    </div>
  </div>
);

export const ExistingReadingCard = ({ reading, period, onClose }) => (
  <>
    <div className="bg-green-50/50 border border-green-200/60 rounded-lg px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3 text-left"><span className="material-symbols-outlined text-[24px] text-green-600 shrink-0" translate="no">check_circle</span><div><h4 className="font-bold text-green-800 text-sm leading-none mb-1">Lectura Registrada</h4><p className="text-green-700/80 text-xs leading-tight">Mes de <strong>{formatPeriodo(period?.mes_anio)}</strong> completado.</p></div></div>
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white px-4 py-3 rounded-xl border border-green-200/60 shadow-sm shrink-0 w-full md:w-auto justify-between md:justify-end">
        <div className="flex flex-col items-center md:items-end"><span className="text-[10px] text-green-600/70 font-bold uppercase tracking-wider mb-0.5">L. Registrada</span><span className="font-data-mono text-xl font-black text-green-700 leading-none">{fmtVal(reading.lectura_actual)} <span className="text-[11px] font-bold text-green-600/80">kWh</span></span></div>
        {reading.consumo_calculado !== undefined && <div className="flex flex-col items-center md:items-end border-t md:border-t-0 md:border-l border-green-200/60 pt-2 md:pt-0 md:pl-4 mt-2 md:mt-0 w-full md:w-auto"><span className="text-[10px] text-green-600/70 font-bold uppercase tracking-wider mb-0.5">Consumo (Dif.)</span><span className="font-data-mono text-xl font-black text-green-600 leading-none flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-green-500" translate="no">add_circle</span>{fmtVal(reading.consumo_calculado)} <span className="text-[11px] font-bold text-green-600/80">kWh</span></span></div>}
      </div>
    </div>
    {onClose && <div className="mt-4 flex justify-end"><button type="button" onClick={onClose} className="px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors inline-flex items-center gap-2 shadow-sm"><span className="material-symbols-outlined text-[18px]" translate="no">arrow_back</span>Volver a la lista</button></div>}
  </>
);

const CompactReadingInput = ({ label, value, onChange, tone = 'primary' }) => {
  const isError = tone === 'error';
  return <div className="flex-1 w-full relative h-[48px]"><input type="number" step="0.01" required value={value} onChange={(event) => onChange(event.target.value)} placeholder="0.00" className={`w-full h-full bg-white border rounded-lg pl-3 pr-16 text-sm font-data-mono font-bold focus:outline-none focus:ring-2 text-right shadow-sm transition-all ${isError ? 'border-error/40 focus:border-error text-error focus:ring-error/20' : 'border-primary/40 focus:border-primary text-primary focus:ring-primary/20'}`} /><div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><span className={`text-[9px] font-bold uppercase tracking-wider leading-tight ${isError ? 'text-error' : 'text-primary'}`}>{label}</span></div><span className={`absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] pointer-events-none ${isError ? 'text-error/50' : 'text-primary/50'}`}>kWh</span></div>;
};

export const MeterReplacementFields = ({ peak = false, finalValue, onFinalChange, initialValue, onInitialChange }) => (
  <div className={`flex flex-col md:flex-row gap-2 items-center bg-error/5 p-3 rounded-lg border border-error/20 mb-1 animate-in fade-in zoom-in-95 ${peak ? 'mt-3' : ''}`}>
    <CompactReadingInput label={peak ? 'L. Final Punta (Dañado)' : 'L. Final (Dañado)'} value={finalValue} onChange={onFinalChange} tone="error" />
    <span className="material-symbols-outlined text-error/30 hidden md:block text-[18px]" translate="no">arrow_forward</span>
    <CompactReadingInput label={peak ? 'L. Inicial Punta (Nuevo)' : 'L. Inicial (Nuevo)'} value={initialValue} onChange={onInitialChange} />
  </div>
);

export const ReadingFields = ({ previousLabel, previousValue, currentLabel, currentValue, onCurrentChange, tariff, changedMeter, autoFocus = false, margin = '' }) => (
  <div className={`flex flex-col md:flex-row gap-2 items-center ${margin}`}>
    <div className={`w-full md:w-auto md:min-w-[140px] bg-surface-container-lowest rounded-lg px-3 py-2 border ${changedMeter ? 'border-error/40' : 'border-outline-variant/50'} flex flex-col h-[52px] justify-center`}><span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">{previousLabel}</span><span className={`font-data-mono text-sm font-bold ${changedMeter ? 'text-error line-through opacity-70' : 'text-on-surface/60'}`}>{fmtVal(previousValue)} <span className="text-[9px]">kWh</span></span></div>
    <span className="material-symbols-outlined text-primary/30 hidden md:block text-[18px]" translate="no">arrow_forward</span>
    <div className="flex-1 w-full relative h-[52px]"><input type="number" step="0.01" required autoFocus={autoFocus} value={currentValue} onChange={(event) => onCurrentChange(event.target.value)} placeholder="0.00" className="w-full h-full bg-white border border-primary/40 hover:border-primary focus:border-primary rounded-lg pl-3 pr-14 text-xl font-data-mono font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-right shadow-sm transition-all" /><div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col pointer-events-none"><span className="text-[9px] font-bold text-primary uppercase tracking-wider leading-tight">{currentLabel}</span>{tariff !== undefined && <span className="text-[8px] text-primary/70 font-bold leading-tight mt-0.5">S/ {Number(tariff).toFixed(4)}</span>}</div><span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] text-primary/50 pointer-events-none">kWh</span></div>
  </div>
);

const toneClasses = {
  primary: ['bg-primary/5 border-primary/20', 'text-primary', 'border-primary/10', 'text-primary/60'],
  orange: ['bg-orange-500/5 border-orange-500/20', 'text-orange-600', 'border-orange-500/10', 'text-orange-600/60'],
  blue: ['bg-blue-500/5 border-blue-500/20', 'text-blue-600', 'border-blue-500/10', 'text-blue-600/60'],
  purple: ['bg-purple-500/5 border-purple-500/20', 'text-purple-600', 'border-purple-500/10', 'text-purple-600/60']
};

export const ReadingCalculationSummary = ({ icon, title, measureLabel, formula, amount, tone = 'primary' }) => {
  const [container, text, border, muted] = toneClasses[tone];
  return <div className={`${container} rounded-xl p-3 flex flex-col sm:flex-row justify-between items-center border shadow-sm mt-2 animate-in fade-in zoom-in-95 duration-300`}><div className="flex items-center gap-3 w-full sm:w-auto mb-3 sm:mb-0"><div className={`w-9 h-9 rounded-full bg-white flex items-center justify-center ${text} shadow-sm border ${border} shrink-0`}><span className="material-symbols-outlined text-[18px]" translate="no">{icon}</span></div><div className="flex flex-col"><span className={`text-[11px] font-extrabold ${text} uppercase tracking-widest leading-none mb-1`}>{title}</span><span className={`text-xs ${text} font-black bg-white/80 px-2.5 py-1 rounded-md border ${border} inline-block w-max shadow-sm tracking-wide font-data-mono`}><span className={`text-[9px] ${muted} uppercase tracking-widest mr-1`}>{measureLabel}:</span>{formula}</span></div></div><div className={`flex flex-col items-end w-full sm:w-auto bg-white px-4 py-2 rounded-lg border ${border} shadow-sm`}><span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider mb-0.5">Importe Calculado</span><span className={`font-data-mono font-black ${text} text-xl leading-none`}>S/ {amount.toFixed(2)}</span></div></div>;
};

export const DemandInput = ({ label, unit, value, onChange, tone }) => {
  const colors = {
    blue: ['bg-blue-50/50 border-blue-200 hover:border-blue-300 focus:border-blue-400 text-blue-800 focus:ring-blue-500/20', 'text-blue-700', 'text-blue-600/70'],
    orange: ['bg-orange-50/50 border-orange-200 hover:border-orange-300 focus:border-orange-400 text-orange-800 focus:ring-orange-500/20', 'text-orange-700', 'text-orange-600/70'],
    purple: ['bg-purple-50/50 border-purple-200 hover:border-purple-300 focus:border-purple-400 text-purple-800 focus:ring-purple-500/20', 'text-purple-700', 'text-purple-600/70']
  };
  const [inputColor, labelColor, unitColor] = colors[tone] || colors.blue;
  return <div className="mt-1"><div className="w-full relative h-[52px]"><input type="number" step="0.01" value={value} onChange={(event) => onChange(event.target.value)} placeholder="0.00" className={`w-full h-full border rounded-lg pl-3 pr-16 text-lg font-data-mono font-bold focus:outline-none focus:ring-2 text-right shadow-inner transition-all ${inputColor}`} /><div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><span className={`text-[9px] font-bold uppercase tracking-wider leading-tight flex items-center gap-0.5 ${labelColor}`}><span className="material-symbols-outlined text-[12px]" translate="no">electric_meter</span>{label}</span></div><span className={`absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[10px] pointer-events-none ${unitColor}`}>{unit}</span></div></div>;
};

export const ReadingActions = ({ errors, isSaving, submitLabel = 'Guardar Lectura', disabled = false, onSkip }) => (
  <div className="sticky bottom-0 z-10 mt-2 border-t border-outline-variant/60 bg-surface pt-3 pb-[max(0px,env(safe-area-inset-bottom))]">
    {errors.length > 0 && <div className="mb-2 text-error text-[11px] font-bold flex items-start gap-1.5 bg-error/10 px-3 py-2 rounded-md border border-error/20 animate-in fade-in slide-in-from-top-1"><span className="material-symbols-outlined text-[14px] mt-0.5" translate="no">error</span><div className="flex flex-col"><span className="block text-error/80 uppercase tracking-wider text-[9px] mb-0.5">Errores de validación:</span><ul className="list-disc pl-3">{errors.map((error) => <li key={error} className="leading-tight mb-0.5">{error}</li>)}</ul></div></div>}
    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
      {onSkip && <button type="button" onClick={onSkip} disabled={isSaving} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-outline-variant bg-white px-3 text-xs font-bold text-on-surface-variant hover:bg-amber-50 hover:text-amber-800 disabled:opacity-50"><span className="material-symbols-outlined text-[17px]" translate="no">schedule</span>Omitir</button>}
      <button type="submit" disabled={isSaving || errors.length > 0 || disabled} className={`min-h-11 w-full rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${errors.length === 0 && !disabled ? 'bg-primary text-on-primary hover:opacity-90 hover:shadow-md' : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed opacity-80'}`}><span className={`material-symbols-outlined text-[18px] ${isSaving ? 'animate-spin' : ''}`} translate="no">{isSaving ? 'sync' : 'save'}</span>{isSaving ? 'Guardando...' : submitLabel}</button>
    </div>
    <p className="mt-1.5 text-center text-[9px] text-on-surface-variant">Presione Enter para guardar y continuar.</p>
  </div>
);
