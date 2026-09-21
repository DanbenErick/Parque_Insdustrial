import React from 'react';
import Badge from '../../../components/ui/Badge';

const isMeterActive = (meter) => meter.operativo !== false && meter.operativo !== 0 && meter.operativo !== '0';

const TenantMobileCard = ({ tenant, onOpenDrawer, onOpenMenu, isMenuOpen }) => {
  const meter = tenant.specificMedidor;
  const debt = Number(tenant.deuda_total || 0);
  const credit = Number(tenant.saldo_a_favor || 0);
  const address = meter?.direccion || tenant.direccion || 'Sin dirección registrada';
  const documentType = tenant.documento_identidad?.length === 8 ? 'DNI' : 'RUC';
  const meterType = meter?.tipo === 'Hora Punta' || meter?.tipo === 'Tiempo Real'
    ? 'Hora Punta'
    : meter?.tipo === 'Normal' ? 'Normal' : meter?.tipo;

  return (
    <article className="px-4 py-3 bg-white active:bg-surface-container-low transition-colors">
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => onOpenDrawer(tenant)} className="min-w-0 flex-1 text-left">
          <span className="block text-sm font-bold text-on-surface leading-5 break-words">{tenant.nombre_razonsocial}</span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-on-surface-variant">
            <span className="font-data-mono font-semibold">{documentType}: {tenant.documento_identidad}</span>
            {tenant.username && <span className="font-bold text-primary">@{tenant.username}</span>}
          </span>
        </button>
        <button
          type="button"
          onClick={(event) => onOpenMenu(tenant, meter, event)}
          className={`h-9 w-9 shrink-0 rounded-lg border flex items-center justify-center transition-colors ${isMenuOpen ? 'bg-primary/15 text-primary border-primary/30' : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant'}`}
          aria-label={`Opciones de ${tenant.nombre_razonsocial}`}
        >
          <span className="material-symbols-outlined text-[21px]" translate="no">more_vert</span>
        </button>
      </div>

      <div className="mt-2.5 flex items-start gap-2 text-[11px] leading-4 text-on-surface-variant">
        <span className="material-symbols-outlined text-[16px] shrink-0 text-primary/70" translate="no">location_on</span>
        <span className="break-words min-w-0">{address}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {meter ? (
          <>
            <span className="inline-flex items-center gap-1 rounded-md border border-outline-variant bg-surface-container-lowest px-2 py-1 font-data-mono text-[10px] font-bold text-on-surface">
              <span className="material-symbols-outlined text-[14px] text-primary" translate="no">electric_meter</span>
              {meter.num_serie || 'Sin serie'}
            </span>
            {meterType && <Badge variant={meterType === 'Hora Punta' ? 'purple' : 'info'}>{meterType}</Badge>}
            <Badge variant={isMeterActive(meter) ? 'success' : 'warning'}>{isMeterActive(meter) ? 'Activo' : 'Dado de baja'}</Badge>
          </>
        ) : (
          <>
            <Badge variant="slate">Sin medidor</Badge>
            <Badge variant={tenant.es_activo ? 'success' : 'error'}>{tenant.es_activo ? 'Activo' : 'Suspendido'}</Badge>
          </>
        )}
      </div>

      {(debt > 0 || credit > 0) && (
        <div className="mt-2.5 pt-2.5 border-t border-outline-variant/60 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold">
          {debt > 0 && <span className="text-error">Deuda: S/ {debt.toFixed(2)} · {tenant.recibos_pendientes || 0} recibos</span>}
          {credit > 0 && <span className="text-[#059669]">Saldo a favor: S/ {credit.toFixed(2)}</span>}
        </div>
      )}
    </article>
  );
};

export default React.memo(TenantMobileCard);
