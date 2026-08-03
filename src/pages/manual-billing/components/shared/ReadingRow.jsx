import React from 'react';
import { BadgeType } from './BadgeType';
import { formatDateShort, formatDateLong, fmtVal, parseSafe } from '../../utils';

export const ReadingRow = React.memo(({ record, medidorInfo, onEdit = null, showDateFull = false, onClick = null }) => (
  <li 
    onClick={onClick}
    className={`bg-surface hover:bg-surface-container-lowest border ${onEdit ? 'border-outline-variant/50 hover:border-primary/30 p-3 shadow-sm' : 'border-transparent hover:border-outline-variant/50 p-2'} rounded-lg transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2 group ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex flex-col gap-0.5 overflow-hidden flex-1 min-w-[160px]">
      <div className="flex items-center gap-2">
        <p className="font-bold font-data-mono text-on-surface text-[12px] sm:text-[13px] truncate group-hover:text-primary transition-colors" title={record.num_serie}>{record.num_serie}</p>
        {(medidorInfo?.tipo || record.medidor_tipo || record.tipo) && <BadgeType tipo={medidorInfo?.tipo || record.medidor_tipo || record.tipo} />}
        {record.es_cambio_medidor ? (
          <span className="text-[9px] text-orange-700 font-bold flex items-center gap-0.5 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/50" title="Hubo un cambio de medidor">
            <span className="material-symbols-outlined text-[10px]">swap_horiz</span>
            CAMBIO
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
        <span className="material-symbols-outlined text-[12px] text-on-surface-variant">person</span>
        <span className="text-[10px] text-on-surface-variant truncate max-w-[150px] sm:max-w-[200px]" title={record.propietario}>{record.propietario}</span>
        <span className="text-[9px] text-on-surface-variant hidden sm:inline">•</span>
        <span className="text-[9px] text-on-surface-variant flex items-center gap-1">
          {showDateFull ? formatDateLong(record.fecha_registro) : formatDateShort(record.fecha_registro)}
        </span>
      </div>
    </div>
    
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between md:justify-end gap-4 md:gap-6 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-outline-variant/50 max-w-full md:max-w-[70%]">
      <div className="text-left md:text-right flex flex-col md:items-end min-w-0 w-full">
        <div className="font-data-mono font-bold text-primary text-sm sm:text-base leading-none">
          {fmtVal(record.lectura_actual)}<span className="text-[9px] sm:text-[10px] font-normal opacity-70 ml-0.5 sm:ml-1">kWh {showDateFull && '(N)'}</span>
        </div>
        {record.consumo_calculado !== undefined && record.consumo_calculado !== null && (
          <div className="font-data-mono font-bold text-green-600 text-[9px] sm:text-[10px] mt-1 bg-green-50 px-1.5 py-0.5 rounded border border-green-200/50 inline-block w-max">
            +{fmtVal(record.consumo_calculado)} kWh (Consumo)
          </div>
        )}
        {(parseSafe(record.lectura_actual_punta) > 0 || parseSafe(record.factor_potencia) > 0 || parseSafe(record.max_demanda_fuera_punta) > 0 || parseSafe(record.max_demanda_punta) > 0) && (
          <div className="flex gap-2 mt-1.5 justify-start md:justify-end flex-wrap">
            {parseSafe(record.lectura_actual_punta) > 0 && (
              <span className="font-data-mono font-bold text-orange-700 text-[9px] sm:text-[10px] leading-none bg-orange-50 border border-orange-200/50 px-1.5 py-0.5 rounded">
                {fmtVal(record.lectura_actual_punta)} W <span className="opacity-70">P</span>
              </span>
            )}
            {parseSafe(record.factor_potencia) > 0 && (
              <span className="font-data-mono font-bold text-purple-700 text-[9px] sm:text-[10px] leading-none bg-purple-50 border border-purple-200/50 px-1.5 py-0.5 rounded">
                {fmtVal(record.factor_potencia)} kVARh
              </span>
            )}
            {parseSafe(record.max_demanda_fuera_punta) > 0 && (
              <span className="font-data-mono font-bold text-blue-700 text-[9px] sm:text-[10px] leading-none bg-blue-50 border border-blue-200/50 px-1.5 py-0.5 rounded">
                {fmtVal(record.max_demanda_fuera_punta)} kW <span className="opacity-70">M.D.(N)</span>
              </span>
            )}
            {parseSafe(record.max_demanda_punta) > 0 && (
              <span className="font-data-mono font-bold text-orange-700 text-[9px] sm:text-[10px] leading-none bg-orange-50 border border-orange-200/50 px-1.5 py-0.5 rounded">
                {fmtVal(record.max_demanda_punta)} kW <span className="opacity-70">M.D.(P)</span>
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 shrink-0 mt-3 md:mt-0">
        {onClick && !onEdit && (
          <button
            className="px-3 py-2 bg-primary/5 border border-primary/20 text-primary rounded-lg hover:bg-primary/10 transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">Ver Detalles</span>
          </button>
        )}
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(record);
            }}
            className="px-3 py-2 bg-surface border border-outline-variant text-on-surface-variant rounded-lg hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">Modificar</span>
          </button>
        )}
      </div>
    </div>
  </li>
));
