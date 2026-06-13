import React from 'react';

const ReportTableRow = React.memo(({ member }) => {
  const m = member;
  return (
    <tr className="hover:bg-surface-container-low transition-colors group">
      <td className="px-4 py-2">
        <div className="flex flex-col">
          <div className="text-on-surface font-bold text-[11px] truncate max-w-[200px]" title={m.propietario}>
            {m.propietario}
          </div>
          <div className="text-on-surface-variant text-[10px] mt-0.5 truncate max-w-[200px]" title={m.direccion || 'N/A'}>
            {m.direccion || 'N/A'}
          </div>
        </div>
      </td>
      <td className="px-4 py-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="text-on-surface-variant">Ant: <span className="font-data-mono">{parseFloat(m.lectura_anterior).toLocaleString('es-PE', { minimumFractionDigits: 1 })}</span></span>
            <span className="text-on-surface-variant px-0.5">•</span>
            <span className="text-on-surface-variant">Act: <span className="font-data-mono">{parseFloat(m.lectura_actual).toLocaleString('es-PE', { minimumFractionDigits: 1 })}</span></span>
          </div>
          <div className="text-[11px] font-bold text-primary mt-0.5">
            Consumo: {parseFloat(m.consumo).toLocaleString('es-PE', { minimumFractionDigits: 1 })} kWh
          </div>
        </div>
      </td>
      <td className="px-4 py-2">
        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight ${m.estado === 'Pagado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {m.estado}
        </span>
      </td>
      <td className="px-4 py-2 text-right">
        <span className="font-data-mono text-[12px] font-bold text-on-surface">S/ {parseFloat(m.total).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
      </td>
    </tr>
  );
});

ReportTableRow.displayName = 'ReportTableRow';

export default ReportTableRow;
