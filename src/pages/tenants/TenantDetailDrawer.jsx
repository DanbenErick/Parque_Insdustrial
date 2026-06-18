import React from 'react';

const getInitials = (name) => {
  if (!name) return '??';
  return name.substring(0, 2).toUpperCase();
};

const TenantDetailDrawer = ({ drawerTenant, setDrawerTenant, handleOpenEdit }) => {
  const deudaTotal = parseFloat(drawerTenant.deuda_total || 0);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] !m-0"
        onClick={() => setDrawerTenant(null)}
      />
      <div
        className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-surface shadow-2xl z-[110] flex flex-col border-l border-outline-variant !m-0"
      >
        {/* Header del Drawer */}
        <div className="px-lg py-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">contact_page</span>
            <h3 className="font-headline-sm font-bold text-on-surface">Expediente Oficial</h3>
          </div>
          <button onClick={() => setDrawerTenant(null)} className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Cuerpo del Drawer */}
        <div className="flex-1 overflow-y-auto p-lg custom-scrollbar space-y-6">
          {/* Perfil Principal */}
          <div className="flex flex-col items-center text-center space-y-3 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center text-primary font-bold text-2xl shadow-inner">
              {getInitials(drawerTenant.nombre_razonsocial)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">{drawerTenant.nombre_razonsocial}</h2>
              <p className="font-data-mono text-sm text-on-surface-variant mt-1">RUC/DNI: {drawerTenant.documento_identidad}</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${drawerTenant.es_activo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-error border-red-200'}`}>
                {drawerTenant.es_activo ? 'CONEXIÓN ACTIVA' : 'SERVICIO SUSPENDIDO'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 uppercase">
                {drawerTenant.actividad_rubro || 'GENERAL'}
              </span>
            </div>
          </div>

          {/* Situación Financiera */}
          <div className="space-y-3">
            <h4 className="text-sm font-label-caps font-bold text-on-surface-variant uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              Situación Financiera
            </h4>
            <div className={`p-4 rounded-xl border ${deudaTotal > 0 ? 'bg-error/5 border-error/20' : 'bg-green-50 border-green-200'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className={`text-sm font-semibold ${deudaTotal > 0 ? 'text-error' : 'text-green-700'}`}>
                    {deudaTotal > 0 ? 'Deuda Pendiente' : 'Al Día (Sin Deuda)'}
                  </p>
                  {deudaTotal > 0 && (
                    <p className="text-xs text-on-surface-variant mt-1">
                      {drawerTenant.recibos_pendientes} recibo(s) sin pagar
                    </p>
                  )}
                </div>
                <div className={`text-2xl font-data-mono font-bold ${deudaTotal > 0 ? 'text-error' : 'text-green-700'}`}>
                  S/ {deudaTotal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Datos de Contacto y Representación */}
          <div className="space-y-3">
            <h4 className="text-sm font-label-caps font-bold text-on-surface-variant uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">badge</span>
              Contacto y Representación
            </h4>
            <div className="bg-white rounded-xl border border-outline-variant divide-y divide-outline-variant shadow-sm">
              <div className="p-3 flex items-start gap-3">
                <span className="material-symbols-outlined text-on-surface-variant mt-0.5">person</span>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">Representante Legal</p>
                  <p className="text-sm font-semibold text-on-surface">{drawerTenant.cargo_representante || 'No registrado'}</p>
                </div>
              </div>
              <div className="p-3 flex items-start gap-3">
                <span className="material-symbols-outlined text-on-surface-variant mt-0.5">call</span>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">Teléfono Principal</p>
                  <p className="text-sm font-semibold text-on-surface">{drawerTenant.telefono || 'No registrado'}</p>
                </div>
              </div>
              <div className="p-3 flex items-start gap-3">
                <span className="material-symbols-outlined text-on-surface-variant mt-0.5">mail</span>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">Correo Electrónico</p>
                  <p className="text-sm font-semibold text-on-surface">{drawerTenant.correo || 'No registrado'}</p>
                </div>
              </div>
              <div className="p-3 flex items-start gap-3">
                <span className="material-symbols-outlined text-on-surface-variant mt-0.5">location_on</span>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">Ubicación del Predio</p>
                  <p className="text-sm font-semibold text-on-surface">{drawerTenant.direccion || 'No registrado'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del Drawer */}
        <div className="p-lg border-t border-outline-variant bg-surface-container-lowest">
          <button
            onClick={() => {
              setDrawerTenant(null);
              handleOpenEdit(drawerTenant);
            }}
            className="w-full py-3 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-lg font-bold flex justify-center items-center gap-2 border border-primary/20"
          >
            <span className="material-symbols-outlined">edit</span>
            Editar Datos del Socio
          </button>
        </div>
      </div>
    </>
  );
};

export default React.memo(TenantDetailDrawer);
