import React from 'react';
import { BadgeType } from './BadgeType';
import { fmtVal } from '../../utils';

export const SearchResultRow = React.memo(({ member, onSelect }) => (
  <li
    onClick={() => onSelect(member)}
    className="px-3 py-2.5 hover:bg-primary/5 rounded-lg cursor-pointer transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 group border border-transparent hover:border-primary/10"
  >
    <div className="flex items-center gap-3 overflow-hidden w-full sm:w-auto">
      <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10 group-hover:bg-primary/10 transition-colors">
        <span className="material-symbols-outlined text-[16px]">person</span>
      </div>
      <div className="truncate flex-1">
        <p className="font-bold text-on-surface text-sm truncate group-hover:text-primary transition-colors">{member.propietario}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-[10px] text-on-surface-variant font-data-mono bg-surface-container px-1 rounded">{member.documento_identidad}</span>
          <span className="text-[10px] text-on-surface-variant/50 hidden sm:inline">•</span>
          <span className="text-[10px] text-on-surface-variant truncate max-w-[120px] sm:max-w-[200px]">{member.direccion || 'Sin dirección'}</span>
        </div>
      </div>
    </div>
    <div className="flex sm:text-right items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto pl-11 sm:pl-0 mt-1 sm:mt-0">
      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-1 w-full sm:w-auto">
        <div className="flex items-center gap-1.5">
          <BadgeType tipo={member.tipo} />
          <span className="bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10 text-[9px] font-data-mono font-bold text-primary/80">
            {member.num_serie}
          </span>
        </div>
        <span className="text-[9px] text-primary/70 font-bold flex items-center gap-0.5">
          <span className="material-symbols-outlined text-[10px]">history</span>
          Ult: {fmtVal(member.ultima_lectura)} W
        </span>
      </div>
      <span className="hidden sm:block material-symbols-outlined text-primary/30 group-hover:text-primary group-hover:translate-x-1 transition-all text-[18px]">
        arrow_forward
      </span>
    </div>
  </li>
));
