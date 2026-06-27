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
          <div className="flex flex-wrap gap-2">
            {medidores.map((m, i) => {
              const isHoraPunta = m.tipo === 'Hora Punta' || m.tipo === 'Tiempo Real';
              const isSinMedidor = m.tipo === 'Sin Medidor';
              
              let badgeColor = 'bg-blue-500/10 text-blue-600'; // Normal default
              if (isHoraPunta) badgeColor = 'bg-purple-500/10 text-purple-600';
              if (isSinMedidor) badgeColor = 'bg-slate-500/10 text-slate-600';

              const displayTipo = isHoraPunta ? 'Hora Punta' : (m.tipo || 'Normal');

              return (
                <div key={i} className="flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant px-1.5 py-1 rounded-md shadow-sm">
                  <span className="font-data-mono text-[10px] font-bold text-on-surface">
                    {m.num_serie}
                  </span>
                  <span className={`text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
                    {displayTipo}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <span className="text-[9px] font-bold uppercase tracking-wider bg-surface-variant text-on-surface-variant px-1.5 py-0.5 rounded">Sin medidor</span>
        )}
      </td>

      <td className="px-4 py-2">
        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${tenant.es_activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {tenant.es_activo ? 'Activo' : 'Suspendido'}
        </span>
      </td>
      <td className="px-4 py-2 text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="relative group/btn flex items-center justify-center">
            <button
              onClick={() => onOpenEdit(tenant)}
              className="w-7 h-7 flex items-center justify-center rounded-md transition-colors text-blue-600 hover:bg-blue-50"
            >
              <span className="material-symbols-outlined text-[15px]">edit</span>
            </button>
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover/btn:block w-max bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg z-50">
              Editar Socio
              <div className="absolute top-full right-2 -mt-px border-[4px] border-transparent border-t-gray-800"></div>
            </div>
          </div>
          
          <div className="relative group/btn flex items-center justify-center">
            <button
              onClick={() => onToggleStatus(tenant)}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${tenant.es_activo ? 'text-error hover:bg-error/10' : 'text-primary hover:bg-primary/10'}`}
            >
              <span className="material-symbols-outlined text-[15px]">{tenant.es_activo ? 'power_off' : 'bolt'}</span>
            </button>
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover/btn:block w-max bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg z-50">
              {tenant.es_activo ? "Cortar Servicio" : "Reactivar Servicio"}
              <div className="absolute top-full right-2 -mt-px border-[4px] border-transparent border-t-gray-800"></div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default React.memo(TenantTableRow);
