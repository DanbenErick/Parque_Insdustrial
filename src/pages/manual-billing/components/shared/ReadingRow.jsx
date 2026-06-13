import React from 'react';
import { formatDateShort, formatDateLong, fmtVal, parseSafe } from '../../utils';

export const ReadingRow = React.memo(({ record, onEdit = null, showDateFull = false }) => (
  <li className={`bg-surface hover:bg-surface-container-lowest border ${onEdit ? 'border-outline-variant/50 hover:border-primary/30 p-3 shadow-sm' : 'border-transparent hover:border-outline-variant/50 p-2'} rounded-lg transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2 group`}>
    <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
      <p className="font-bold text-on-surface text-[11px] sm:text-xs truncate group-hover:text-primary transition-colors" title={record.propietario}>{record.propietario}</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[9px] text-primary/80 font-data-mono font-bold bg-primary/5 px-1 py-0.5 rounded">{record.num_serie}</span>
        <span className="text-[9px] text-on-surface-variant hidden sm:inline">•</span>
        <span className="text-[9px] text-on-surface-variant flex items-center gap-1">
          {showDateFull ? formatDateLong(record.fecha_registro) : formatDateShort(record.fecha_registro)}
        </span>
      </div>
    </div>
    
    <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-outline-variant/50">
      <div className="text-left md:text-right">
        <div className="font-data-mono font-bold text-primary text-sm sm:text-base leading-none">
          {fmtVal(record.lectura_actual)}<span className="text-[9px] sm:text-[10px] font-normal opacity-70 ml-0.5 sm:ml-1">W {showDateFull && '(N)'}</span>
        </div>
        {(parseSafe(record.lectura_actual_punta) > 0 || parseSafe(record.factor_potencia) > 0) && (
          <div className="flex gap-2 mt-1.5 justify-start md:justify-end">
            {parseSafe(record.lectura_actual_punta) > 0 && (
              <span className="font-data-mono font-bold text-orange-700 text-[9px] sm:text-[10px] leading-none bg-orange-50 border border-orange-200/50 px-1.5 py-0.5 rounded">
                {fmtVal(record.lectura_actual_punta)} W <span className="opacity-70">P</span>
              </span>
            )}
            {parseSafe(record.factor_potencia) > 0 && (
              <span className="font-data-mono font-bold text-purple-700 text-[9px] sm:text-[10px] leading-none bg-purple-50 border border-purple-200/50 px-1.5 py-0.5 rounded">
                {fmtVal(record.factor_potencia)} kVARh {showDateFull && <span className="opacity-70">FP</span>}
              </span>
            )}
          </div>
        )}
      </div>
      
      {onEdit && (
        <button
          onClick={() => onEdit(record)}
          className="px-3 py-2 bg-surface border border-outline-variant text-on-surface-variant rounded-lg hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">Modificar</span>
        </button>
      )}
    </div>
  </li>
));
