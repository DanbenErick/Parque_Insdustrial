import React from 'react';
import Badge from '../../components/ui/Badge';



const TenantTableRow = ({ tenant, specificMedidor, onOpenDrawer, onOpenMenu, isMenuOpen }) => {
  const deudaTotal = parseFloat(tenant.deuda_total || 0);
  const saldoFavor = parseFloat(tenant.saldo_a_favor || 0);
  const direccion = specificMedidor ? (specificMedidor.direccion || tenant.direccion || 'N/A') : (tenant.direccion || 'N/A');

  return (
    <tr className="hover:bg-surface-container-low transition-colors group">
      <td className="px-4 py-2">
        <div className="flex flex-col">
          <button
            className="font-bold text-[11px] text-on-surface hover:text-primary transition-colors text-left focus:outline-none"
            onClick={() => onOpenDrawer(tenant)}
            title="Ver Expediente"
          >
            {tenant.nombre_razonsocial}
          </button>
          <span className="text-[10px] font-bold text-primary mt-0.5">
            Usuario: {tenant.username || '-'}
          </span>
          <span className="text-[10px] text-on-surface-variant font-data-mono">
            {tenant.documento_identidad?.length === 8 ? 'DNI' : 'RUC'}: {tenant.documento_identidad}
          </span>
          {deudaTotal > 0 && (
            <span className="text-[9px] font-bold text-error mt-0.5">
              Deuda: S/ {deudaTotal.toFixed(2)} ({tenant.recibos_pendientes})
            </span>
          )}
          {saldoFavor > 0 && (
            <span className="text-[9px] font-bold text-[#059669] mt-0.5">
              Saldo a Favor: S/ {saldoFavor.toFixed(2)}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-2 font-data-mono text-[11px] text-on-surface-variant" title={direccion}>
        {direccion}
      </td>
      <td className="px-4 py-2">
        {specificMedidor ? (
          <div className="flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant px-1.5 py-1 rounded-md shadow-sm w-fit">
            <span className="font-data-mono text-[10px] font-bold text-on-surface">
              {specificMedidor.num_serie || 'Sin Serie'}
            </span>
            <Badge variant={specificMedidor.tipo === 'Hora Punta' || specificMedidor.tipo === 'Tiempo Real' ? 'purple' : specificMedidor.tipo === 'Sin Medidor' ? 'slate' : 'info'}>
              {specificMedidor.tipo === 'Hora Punta' || specificMedidor.tipo === 'Tiempo Real' ? 'Hora Punta' : (specificMedidor.tipo === 'Normal' ? 'Medidor Normal' : (specificMedidor.tipo || 'Medidor Normal'))}
            </Badge>
          </div>
        ) : (
          <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/70 bg-surface-container-high px-2 py-1 rounded">Sin Medidor</span>
        )}
      </td>

      <td className="px-4 py-2">
        <Badge variant={(specificMedidor ? specificMedidor.operativo : tenant.es_activo) ? 'success' : 'error'}>
          {(specificMedidor ? specificMedidor.operativo : tenant.es_activo) ? 'Activo' : 'Suspendido'}
        </Badge>
      </td>
      <td className="px-4 py-2 text-right">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={(e) => onOpenMenu(tenant, specificMedidor, e)}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              isMenuOpen
                ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
            title="Opciones de socio"
          >
            <span className="material-symbols-outlined text-[20px]" translate="no">more_vert</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default React.memo(TenantTableRow);
