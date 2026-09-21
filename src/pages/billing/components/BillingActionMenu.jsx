import FloatingActionMenu from '../../../components/ui/FloatingActionMenu';

const ActionButton = ({ icon, label, onClick, className = 'text-on-surface', iconClass = 'text-primary', suffix }) => (
  <button type="button" onClick={onClick} className={`w-full px-3.5 py-2 text-left text-xs font-medium hover:bg-surface-container flex items-center justify-between gap-2 transition-colors cursor-pointer ${className}`}>
    <span className="flex items-center gap-2.5">
      <span className={`material-symbols-outlined text-[18px] ${iconClass}`} translate="no">{icon}</span>
      <span>{label}</span>
    </span>
    {suffix}
  </button>
);

const BillingActionMenu = ({
  menu,
  onClose,
  onView,
  onPdf,
  onWhatsApp,
  onHistory,
  onPayments,
  onPending,
  onDebt,
  onRefacture,
}) => {
  if (!menu) return null;
  const receipt = menu.recibo;
  const run = (callback) => {
    onClose();
    callback(receipt);
  };
  const historyCount = Number(receipt.cantidad_anulados || 0);
  const canModify = receipt.estado !== 'Pagado' && receipt.estado !== 'Anulado';

  return (
    <FloatingActionMenu menu={menu} onClose={onClose} className="w-64">
      <div className="px-3.5 py-2 mb-1 border-b border-outline-variant/50 bg-surface-container-lowest">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Acciones</span>
          <span className="font-data-mono text-[10px] font-bold text-primary truncate max-w-[130px]">{receipt.numero_comprobante || 'Recibo'}</span>
        </div>
        <p className="text-[11px] font-medium text-on-surface-variant truncate mt-0.5">{receipt.socio || 'Socio'}</p>
      </div>

      <ActionButton icon="visibility" label="Ver Detalle" onClick={() => run(onView)} />
      <ActionButton icon="picture_as_pdf" label="Ver Recibo (PDF)" onClick={() => run(onPdf)} iconClass="text-error" />
      <ActionButton icon="chat" label="Enviar por WhatsApp" onClick={() => run(onWhatsApp)} iconClass="text-[#25D366]" />
      <ActionButton
        icon="history"
        label="Historial de Cambios"
        onClick={() => run(onHistory)}
        iconClass={historyCount > 0 ? 'text-amber-600' : 'text-on-surface-variant'}
        suffix={historyCount > 0 ? <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-800 text-[9px] font-black rounded-full border border-amber-500/30">{historyCount}</span> : null}
      />
      <ActionButton icon="payments" label="Ver Pagos del Recibo" onClick={() => run(onPayments)} iconClass="text-indigo-500" />

      {receipt.estado !== 'Pendiente' && receipt.estado !== 'Anulado' && (
        <ActionButton icon="pending_actions" label="Poner en Pendiente" onClick={() => run(onPending)} className="text-amber-800 hover:bg-amber-50" iconClass="text-amber-600" />
      )}

      {canModify && (
        <>
          <div className="my-1 border-t border-outline-variant/50" />
          <ActionButton icon="payments" label="Añadir Deuda" onClick={() => run(onDebt)} className="text-teal-700 hover:bg-teal-50" iconClass="text-teal-600" />
          <ActionButton icon="autorenew" label="Refacturar" onClick={() => run(onRefacture)} className="text-orange-700 hover:bg-orange-50" iconClass="text-orange-600" />
        </>
      )}
    </FloatingActionMenu>
  );
};

export default BillingActionMenu;
