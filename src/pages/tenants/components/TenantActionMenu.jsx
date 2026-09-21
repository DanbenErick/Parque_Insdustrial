import FloatingActionMenu from '../../../components/ui/FloatingActionMenu';

const TenantActionMenu = ({ menu, onClose, onView, onWhatsApp, onResetPassword, onEdit, onToggleStatus }) => {
  if (!menu) return null;

  const { tenant, specificMedidor } = menu;
  const meterIsActive = specificMedidor
    ? specificMedidor.operativo !== false && specificMedidor.operativo !== 0 && specificMedidor.operativo !== '0'
    : Boolean(tenant.es_activo);
  const run = (callback) => {
    onClose();
    callback(tenant, specificMedidor);
  };

  return (
    <FloatingActionMenu menu={menu} onClose={onClose} className="w-60">
      <div className="px-3.5 py-2 mb-1 border-b border-outline-variant/50 bg-surface-container-lowest">
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Opciones de Socio</span>
        <p className="text-[11px] font-bold text-on-surface truncate mt-0.5">{tenant.nombre_razonsocial || 'Socio'}</p>
        {specificMedidor?.num_serie && (
          <span className="font-data-mono text-[9px] text-primary font-bold">Medidor: {specificMedidor.num_serie}</span>
        )}
      </div>

      <button type="button" onClick={() => run(onView)} className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer">
        <span className="material-symbols-outlined text-[18px] text-primary" translate="no">visibility</span>
        <span>Ver Expediente</span>
      </button>
      <button type="button" onClick={() => run(onWhatsApp)} className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer">
        <span className="material-symbols-outlined text-[18px] text-[#25D366]" translate="no">chat</span>
        <span>Enviar WhatsApp</span>
      </button>
      <button type="button" onClick={() => run(onResetPassword)} className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer">
        <span className="material-symbols-outlined text-[18px] text-secondary" translate="no">key</span>
        <span>Restablecer Clave</span>
      </button>
      <button type="button" onClick={() => run(onEdit)} className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer">
        <span className="material-symbols-outlined text-[18px] text-blue-600" translate="no">edit</span>
        <span>Editar Socio</span>
      </button>

      <div className="my-1 border-t border-outline-variant/50" />
      <button
        type="button"
        onClick={() => run(onToggleStatus)}
        className={`w-full px-3.5 py-2 text-left text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${meterIsActive ? 'text-error hover:bg-error/10' : 'text-primary hover:bg-primary/10'}`}
      >
        <span className="material-symbols-outlined text-[18px]" translate="no">{meterIsActive ? 'power_off' : 'bolt'}</span>
        <span>{specificMedidor ? (meterIsActive ? 'Dar de Baja Medidor' : 'Reactivar Medidor') : (meterIsActive ? 'Suspender Socio' : 'Reactivar Socio')}</span>
      </button>
    </FloatingActionMenu>
  );
};

export default TenantActionMenu;
