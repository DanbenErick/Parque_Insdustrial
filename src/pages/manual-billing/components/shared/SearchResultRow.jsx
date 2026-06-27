import React from 'react';
import { BadgeType } from './BadgeType';
import { fmtVal } from '../../utils';

export const SearchResultRow = React.memo(({ member, onSelect, isLecturado }) => (
  <li
    onClick={() => onSelect(member)}
    className="px-3 py-2.5 hover:bg-primary/5 rounded-lg cursor-pointer transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 group border border-transparent hover:border-primary/10"
  >
    <div className="flex items-center gap-3 overflow-hidden w-full sm:w-auto flex-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
        isLecturado 
          ? 'bg-green-100 text-green-700 border-green-200 group-hover:bg-green-200' 
          : 'bg-primary/10 text-primary border-primary/20 group-hover:bg-primary/20'
      }`}>
        <span className="material-symbols-outlined text-[16px]">
          {isLecturado ? 'check_circle' : 'speed'}
        </span>
      </div>
      <div className="truncate flex-1">
        <div className="flex items-center gap-2">
          <p className="font-bold font-data-mono text-on-surface text-sm sm:text-base group-hover:text-primary transition-colors tracking-tight">{member.num_serie}</p>
          <BadgeType tipo={member.tipo} />
          {isLecturado && (
            <span className="flex items-center gap-0.5 bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border border-green-200">
              <span className="material-symbols-outlined text-[10px]">done_all</span>
              Lecturado
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="material-symbols-outlined text-[12px] text-on-surface-variant">person</span>
          <span className="text-[10px] text-on-surface-variant truncate font-medium max-w-[150px] sm:max-w-[200px]">{member.propietario}</span>
          <span className="text-[10px] text-on-surface-variant/50 hidden sm:inline">•</span>
          <span className="text-[10px] text-on-surface-variant truncate max-w-[120px] sm:max-w-[150px]">{member.direccion || 'Sin dirección'}</span>
        </div>
      </div>
    </div>
    <div className="flex sm:text-right items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto pl-11 sm:pl-0 mt-1 sm:mt-0">
      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-1 w-full sm:w-auto">
        <span className="text-[10px] text-primary/70 font-bold flex items-center gap-0.5 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
          <span className="material-symbols-outlined text-[12px]">history</span>
          Última: {fmtVal(member.ultima_lectura)} W
        </span>
        <span className="text-[9px] text-on-surface-variant/70 font-data-mono hidden sm:block">ID: {member.documento_identidad}</span>
      </div>
      <span className="hidden sm:block material-symbols-outlined text-primary/30 group-hover:text-primary group-hover:translate-x-1 transition-all text-[18px]">
        arrow_forward
      </span>
    </div>
  </li>
));
