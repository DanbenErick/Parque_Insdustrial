import React from 'react';

const getInitials = (name) => {
  if (!name) return '??';
  return name.substring(0, 2).toUpperCase();
};

const DataItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <span className="material-symbols-outlined text-on-surface-variant/60 text-[18px] mt-0.5">{icon}</span>
    <div>
      <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant/70">{label}</p>
      <p className="text-sm font-medium text-on-surface leading-tight mt-0.5">{value}</p>
    </div>
  </div>
);

const TenantDetailDrawer = ({ drawerTenant, setDrawerTenant, handleOpenEdit }) => {
  const deudaTotal = parseFloat(drawerTenant.deuda_total || 0);
  const hasMedidores = drawerTenant.parsedMedidores && drawerTenant.parsedMedidores.length > 0;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] !m-0 animate-fade-in"
        onClick={() => setDrawerTenant(null)}
      />
      <div className="fixed inset-y-0 right-0 w-full md:w-[420px] bg-white shadow-2xl z-[110] flex flex-col !m-0 border-l border-outline-variant/30 animate-slide-in-right">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-white">
          <h3 className="font-bold text-lg text-on-surface">Expediente del Socio</h3>
          <button onClick={() => setDrawerTenant(null)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-error/10 text-slate-700 hover:text-error rounded-full transition-colors shadow-sm border border-slate-200 hover:border-error/20">
            <span className="material-symbols-outlined text-[18px] font-bold">close</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Main Profile Info */}
          <div className="px-6 py-8 border-b border-outline-variant/30 bg-surface-container-lowest flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mb-4">
              {getInitials(drawerTenant.nombre_razonsocial)}
            </div>
            <h2 className="text-xl font-bold text-on-surface leading-tight">{drawerTenant.nombre_razonsocial}</h2>
            <p className="font-data-mono text-sm text-on-surface-variant mt-1.5">
              {drawerTenant.documento_identidad?.length === 8 ? 'DNI' : 'RUC'}: {drawerTenant.documento_identidad}
            </p>
            
            <div className="flex gap-2 mt-4">
              <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${drawerTenant.es_activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {drawerTenant.es_activo ? 'Activo' : 'Suspendido'}
              </span>
              <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-700">
                {drawerTenant.actividad_rubro || 'General'}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Financial Summary */}
            <div>
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Estado Financiero</h4>
              <div className="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4">
                <div>
                  <p className="text-sm font-medium text-on-surface">Deuda Pendiente</p>
                  {deudaTotal > 0 ? (
                    <p className="text-xs text-error font-medium mt-0.5">{drawerTenant.recibos_pendientes} recibo(s) vencido(s)</p>
                  ) : (
                    <p className="text-xs text-green-600 font-medium mt-0.5">Al día</p>
                  )}
                </div>
                <div className={`text-xl font-data-mono font-bold ${deudaTotal > 0 ? 'text-error' : 'text-on-surface'}`}>
                  S/ {deudaTotal.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Contact Data */}
            <div>
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">Datos de Contacto</h4>
              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                <DataItem icon="person" label="Representante" value={drawerTenant.cargo_representante || '-'} />
                <DataItem icon="call" label="Teléfono" value={drawerTenant.telefono || '-'} />
                <DataItem icon="mail" label="Correo" value={drawerTenant.correo || '-'} />
                <DataItem icon="location_on" label="Dirección" value={drawerTenant.direccion || '-'} />
              </div>
            </div>

            {/* Meters List */}
            <div>
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">Medidores ({hasMedidores ? drawerTenant.parsedMedidores.length : 0})</h4>
              {hasMedidores ? (
                <div className="space-y-2.5">
                  {drawerTenant.parsedMedidores.map((m, i) => {
                    const isHoraPunta = m.tipo === 'Hora Punta' || m.tipo === 'Tiempo Real';
                    const isSinMedidor = m.tipo === 'Sin Medidor';
                    let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                    if (isHoraPunta) badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
                    if (isSinMedidor) badgeColor = 'bg-slate-50 text-slate-700 border-slate-200';
                    const displayTipo = isHoraPunta ? 'Hora Punta' : (m.tipo === 'Normal' ? 'Medidor Normal' : (m.tipo || 'Medidor Normal'));

                    return (
                      <div key={i} className="flex items-center justify-between border border-outline-variant/30 bg-surface-container-lowest rounded-lg p-3">
                        <div className="flex flex-col">
                          <span className="font-data-mono font-bold text-sm text-on-surface">{m.num_serie || 'Sin código'}</span>
                        </div>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                          {displayTipo}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant/70 italic bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-3 text-center">
                  Socio sin medidor físico (Solo cuotas)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/30 bg-white">
          <button
            onClick={() => {
              setDrawerTenant(null);
              handleOpenEdit(drawerTenant);
            }}
            className="w-full py-2.5 bg-surface-container border border-outline-variant/50 hover:bg-surface-container-highest transition-colors rounded-lg font-bold text-on-surface flex justify-center items-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Editar Información
          </button>
        </div>
      </div>
    </>
  );
};

export default React.memo(TenantDetailDrawer);
