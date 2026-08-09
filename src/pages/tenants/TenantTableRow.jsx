import React from 'react';
import Badge from '../../components/ui/Badge';

const getInitials = (name) => {
  if (!name) return '??';
  return name.substring(0, 2).toUpperCase();
};

const TenantTableRow = ({ tenant, specificMedidor, onOpenDrawer, onOpenEdit, onToggleStatus, onWhatsApp, onResetPassword }) => {
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
          <button onClick={() => onOpenEdit(tenant)} className="text-[9px] font-bold uppercase tracking-wider text-secondary hover:text-secondary-container bg-secondary/10 hover:bg-secondary/20 px-2 py-1 rounded transition-colors">+ Asignar Medidor</button>
        )}
      </td>

      <td className="px-4 py-2">
        <Badge variant={tenant.es_activo ? 'success' : 'error'}>
          {tenant.es_activo ? 'Activo' : 'Suspendido'}
        </Badge>
      </td>
      <td className="px-4 py-2 text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="relative group/btn flex items-center justify-center">
            <button
              onClick={() => onWhatsApp()}
              className="w-7 h-7 flex items-center justify-center rounded-md transition-colors text-[#25D366] hover:bg-[#25D366]/10"
            >
              <span className="material-symbols-outlined text-[15px]">chat</span>
            </button>
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover/btn:block w-max bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg z-50">
              WhatsApp
              <div className="absolute top-full right-2 -mt-px border-[4px] border-transparent border-t-gray-800"></div>
            </div>
          </div>
          
          <div className="relative group/btn flex items-center justify-center">
            <button
              onClick={() => onResetPassword()}
              className="w-7 h-7 flex items-center justify-center rounded-md transition-colors text-secondary hover:bg-secondary/10"
            >
              <span className="material-symbols-outlined text-[15px]">key</span>
            </button>
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover/btn:block w-max bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg z-50">
              Restablecer Clave
              <div className="absolute top-full right-2 -mt-px border-[4px] border-transparent border-t-gray-800"></div>
            </div>
          </div>

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
