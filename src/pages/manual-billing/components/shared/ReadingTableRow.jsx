import React from 'react';
import { BadgeType } from './BadgeType';
import { formatDateShort, formatDateLong, fmtVal, parseSafe } from '../../utils';

export const ReadingTableRow = React.memo(({ record, medidorInfo, onEdit = null, showDateFull = true, onClick = null }) => {
  const direccion = (record.medidor_direccion && record.medidor_direccion !== 'Sin dirección' && record.medidor_direccion !== '-')
    ? record.medidor_direccion
    : (medidorInfo?.direccion && medidorInfo.direccion !== 'Sin dirección' && medidorInfo.direccion !== '-')
    ? medidorInfo.direccion
    : (record.direccion && record.direccion !== 'Sin dirección' && record.direccion !== '-')
    ? record.direccion
    : null;

  return (
    <tr
      onClick={onClick}
      className={`hover:bg-primary/[0.03] border-b border-outline-variant/40 transition-colors group ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* 1. Socio / Dirección */}
      <td className="px-4 py-3 align-middle max-w-[280px]">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant/60 shrink-0" translate="no">person</span>
            <span className="font-bold text-on-surface text-[13px] group-hover:text-primary transition-colors truncate" title={record.propietario}>
              {record.propietario || 'Sin Propietario'}
            </span>
            {record.es_cambio_medidor ? (
              <span className="text-[9px] text-orange-700 font-bold flex items-center gap-0.5 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/50 shrink-0" title="Hubo un cambio de medidor">
                <span className="material-symbols-outlined text-[10px]" translate="no">swap_horiz</span>
                CAMBIO
              </span>
            ) : null}
          </div>
          {direccion ? (
            <span className="text-[11px] text-on-surface-variant flex items-center gap-1 truncate pl-[22px]" title={`Dirección: ${direccion}`}>
              <span className="material-symbols-outlined text-[12px] shrink-0 text-on-surface-variant/70" translate="no">location_on</span>
              <span className="truncate">{direccion}</span>
            </span>
          ) : (
            <span className="text-[11px] text-on-surface-variant/50 italic pl-[22px]">Sin dirección</span>
          )}
        </div>
      </td>

      {/* 2. Medidor / Tipo / Fecha */}
      <td className="px-4 py-3 align-middle whitespace-nowrap">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-on-surface-variant/60 shrink-0" translate="no">speed</span>
            <span className="font-data-mono font-bold text-on-surface text-xs" title={`Medidor: ${record.num_serie}`}>
              {record.num_serie}
            </span>
            {(medidorInfo?.tipo || record.medidor_tipo || record.tipo) && (
              <BadgeType tipo={medidorInfo?.tipo || record.medidor_tipo || record.tipo} />
            )}
          </div>
          <span className="text-[10px] text-on-surface-variant flex items-center gap-1 pl-[21px]">
            <span className="material-symbols-outlined text-[11px]" translate="no">schedule</span>
            {showDateFull ? formatDateLong(record.fecha_registro) : formatDateShort(record.fecha_registro)}
          </span>
        </div>
      </td>

      {/* 3. Lectura Registrada */}
      <td className="px-4 py-3 align-middle whitespace-nowrap">
        <div className="flex flex-col">
          <div className="font-data-mono font-bold text-primary text-sm leading-tight">
            {fmtVal(record.lectura_actual)} <span className="text-[10px] font-normal text-on-surface-variant">kWh (F.P.)</span>
          </div>
          {(parseSafe(record.lectura_actual_punta) > 0 || parseSafe(record.factor_potencia) > 0 || parseSafe(record.max_demanda_fuera_punta) > 0 || parseSafe(record.max_demanda_punta) > 0) && (
            <div className="flex gap-1.5 flex-wrap items-center mt-1">
              {parseSafe(record.lectura_actual_punta) > 0 && (
                <span className="font-data-mono text-[9px] font-bold text-orange-700 bg-orange-50 border border-orange-200/50 px-1 py-0.5 rounded">
                  {fmtVal(record.lectura_actual_punta)} W (P)
                </span>
              )}
              {parseSafe(record.factor_potencia) > 0 && (
                <span className="font-data-mono text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-200/50 px-1 py-0.5 rounded">
                  {fmtVal(record.factor_potencia)} kVARh
                </span>
              )}
              {parseSafe(record.max_demanda_fuera_punta) > 0 && (
                <span className="font-data-mono text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200/50 px-1 py-0.5 rounded">
                  {fmtVal(record.max_demanda_fuera_punta)} kW MD(N)
                </span>
              )}
              {parseSafe(record.max_demanda_punta) > 0 && (
                <span className="font-data-mono text-[9px] font-bold text-orange-700 bg-orange-50 border border-orange-200/50 px-1 py-0.5 rounded">
                  {fmtVal(record.max_demanda_punta)} kW MD(P)
                </span>
              )}
            </div>
          )}
        </div>
      </td>

      {/* 4. Consumo (kWh) */}
      <td className="px-4 py-3 align-middle whitespace-nowrap">
        {record.consumo_calculado !== undefined && record.consumo_calculado !== null ? (
          <div className="inline-flex items-center gap-1 font-data-mono font-bold text-emerald-700 text-xs bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 shadow-sm">
            <span>+{fmtVal(record.consumo_calculado)} kWh</span>
          </div>
        ) : (
          <span className="text-xs text-on-surface-variant/50 italic">-</span>
        )}
      </td>

      {/* 5. Acciones */}
      <td className="px-4 py-3 align-middle text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(record);
              }}
              className="px-3 py-1.5 bg-surface hover:bg-primary/10 border border-outline-variant hover:border-primary/40 text-on-surface font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Modificar lectura"
            >
              <span className="material-symbols-outlined text-[16px] text-primary" translate="no">edit</span>
              <span>MODIFICAR</span>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

export default ReadingTableRow;
