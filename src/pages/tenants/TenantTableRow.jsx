import React from 'react';

const getInitials = (name) => {
  if (!name) return '??';
  return name.substring(0, 2).toUpperCase();
};

const TenantTableRow = ({ tenant, onOpenDrawer, onOpenEdit, onToggleStatus }) => {
  const deudaTotal = parseFloat(tenant.deuda_total || 0);
  const saldoFavor = parseFloat(tenant.saldo_a_favor || 0);
  const medidores = tenant.parsedMedidores || [];

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
      <td className="px-4 py-2 font-data-mono text-[11px] text-on-surface-variant max-w-[150px] truncate" title={tenant.direccion || 'N/A'}>
        {tenant.direccion || 'N/A'}
      </td>
      <td className="px-4 py-2">
        {medidores.length > 0 ? (
          <div className="flex flex-col gap-0.5">
            {medidores.map((m, i) => (
              <span key={i} className="font-data-mono text-[10px] font-bold text-primary">
                {m.num_serie}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[10px] text-on-surface-variant italic">Sin medidor</span>
        )}
      </td>
      <td className="px-4 py-2">
        <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">{tenant.actividad_rubro || 'General'}</span>
        <span className="block text-[10px] text-on-surface-variant mt-0.5 font-medium">{tenant.cargo_representante}</span>
      </td>
      <td className="px-4 py-2">
        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${tenant.es_activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {tenant.es_activo ? 'Activo' : 'Suspendido'}
        </span>
      </td>
      <td className="px-4 py-2 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onOpenEdit(tenant)}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors text-blue-600 hover:bg-blue-50"
            title="Editar Socio"
          >
            <span className="material-symbols-outlined text-[15px]">edit</span>
          </button>
          <button
            onClick={() => onToggleStatus(tenant)}
            className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${tenant.es_activo ? 'text-error hover:bg-error/10' : 'text-primary hover:bg-primary/10'}`}
            title={tenant.es_activo ? "Cortar Servicio" : "Reactivar Servicio"}
          >
            <span className="material-symbols-outlined text-[15px]">{tenant.es_activo ? 'power_off' : 'bolt'}</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default React.memo(TenantTableRow);
