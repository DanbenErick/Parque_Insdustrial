import React from 'react';
import { BadgeType } from './BadgeType';
import { formatDateShort, formatDateLong, fmtVal, parseSafe } from '../../utils';

export const ReadingRow = React.memo(({ record, medidorInfo, onEdit = null, showDateFull = false, onClick = null }) => {
  const direccion = (record.medidor_direccion && record.medidor_direccion !== 'Sin dirección' && record.medidor_direccion !== '-')
    ? record.medidor_direccion
    : (medidorInfo?.direccion && medidorInfo.direccion !== 'Sin dirección' && medidorInfo.direccion !== '-')
    ? medidorInfo.direccion
    : (record.direccion && record.direccion !== 'Sin dirección' && record.direccion !== '-')
    ? record.direccion
    : null;

  return (
    <li
      onClick={onClick}
      className={`bg-surface hover:bg-surface-container-lowest border ${onEdit ? 'border-outline-variant/50 hover:border-primary/30 p-3 shadow-sm' : 'border-transparent hover:border-outline-variant/50 p-2'} rounded-lg transition-colors flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 group ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="md:col-span-5 flex flex-col gap-1 overflow-hidden">
        {/* Nombre del socio - Elemento principal más destacado */}
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px] text-primary shrink-0" translate="no">person</span>
          <p
            className="font-bold text-on-surface text-[13px] sm:text-[14px] truncate group-hover:text-primary transition-colors leading-tight"
            title={record.propietario}
          >
            {record.propietario || 'Sin Propietario'}
          </p>
          {record.es_cambio_medidor ? (
            <span className="text-[9px] text-orange-700 font-bold flex items-center gap-0.5 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/50 shrink-0" title="Hubo un cambio de medidor">
              <span className="material-symbols-outlined text-[10px]" translate="no">swap_horiz</span>
              CAMBIO
            </span>
          ) : null}
        </div>

        {/* Secundario: Medidor, Tipo, Dirección y Fecha */}
        <div className="flex items-center gap-2 flex-wrap text-[10px] text-on-surface-variant">
          {/* N° de Medidor y Tipo */}
          <div className="flex items-center gap-1.5 bg-surface-container-high/60 px-1.5 py-0.5 rounded border border-outline-variant/50 shrink-0">
            <span className="material-symbols-outlined text-[12px] text-on-surface-variant" translate="no">speed</span>
            <span className="font-data-mono font-bold text-on-surface text-[11px]" title={`Medidor: ${record.num_serie}`}>
              {record.num_serie}
            </span>
            {(medidorInfo?.tipo || record.medidor_tipo || record.tipo) && (
              <BadgeType tipo={medidorInfo?.tipo || record.medidor_tipo || record.tipo} />
            )}
          </div>

          {/* Dirección */}
          {direccion && (
            <span className="flex items-center gap-1 text-[10px] text-on-surface-variant truncate max-w-[170px] sm:max-w-[210px]" title={`Dirección: ${direccion}`}>
              <span className="material-symbols-outlined text-[12px] shrink-0 text-on-surface-variant/70" translate="no">location_on</span>
              <span className="truncate">{direccion}</span>
            </span>
          )}

          {/* Separador y Fecha */}
          <span className="text-[9px] text-outline-variant hidden sm:inline">•</span>
          <span className="text-[9px] text-on-surface-variant/80 flex items-center gap-1 shrink-0">
            {showDateFull ? formatDateLong(record.fecha_registro) : formatDateShort(record.fecha_registro)}
          </span>
        </div>
      </div>

      <div className="md:col-span-5 flex flex-row flex-wrap items-center gap-x-6 gap-y-2 pt-2 md:pt-0 border-t md:border-t-0 border-outline-variant/50">
      <div className="flex flex-col">
        <div className="font-data-mono font-bold text-primary text-sm sm:text-base leading-none">
          {fmtVal(record.lectura_actual)}<span className="text-[9px] sm:text-[10px] font-normal opacity-70 ml-0.5 sm:ml-1">kWh {showDateFull && '(F.P.)'}</span>
        </div>
        {record.consumo_calculado !== undefined && record.consumo_calculado !== null && (
          <div className="font-data-mono font-bold text-green-600 text-[9px] sm:text-[10px] mt-1 bg-green-50 px-1.5 py-0.5 rounded border border-green-200/50 inline-block">
            +{fmtVal(record.consumo_calculado)} kWh (Consumo)
          </div>
        )}
      </div>
      {(parseSafe(record.lectura_actual_punta) > 0 || parseSafe(record.factor_potencia) > 0 || parseSafe(record.max_demanda_fuera_punta) > 0 || parseSafe(record.max_demanda_punta) > 0) && (
        <div className="flex gap-2 flex-wrap items-center border-l border-outline-variant/50 pl-6">
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

    <div className="md:col-span-2 flex items-center md:justify-end gap-2 shrink-0 mt-2 md:mt-0">
      {onClick && !onEdit && (
        <button
          className="px-3 py-2 bg-primary/5 border border-primary/20 text-primary rounded-lg hover:bg-primary/10 transition-colors flex items-center gap-2 shadow-sm ml-auto"
        >
          <span className="material-symbols-outlined text-[18px]" translate="no">visibility</span>
          <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">Detalles</span>
        </button>
      )}
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(record);
            }}
            className="px-3 py-2 bg-surface border border-outline-variant text-on-surface-variant rounded-lg hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors flex items-center gap-2 shadow-sm"
            title="Modificar lectura"
          >
            <span className="material-symbols-outlined text-[18px]" translate="no">edit</span>
            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">Modificar</span>
          </button>
        )}
      </div>
    </li>
  );
});

