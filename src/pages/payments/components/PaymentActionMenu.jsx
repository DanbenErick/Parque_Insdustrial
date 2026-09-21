import FloatingActionMenu from '../../../components/ui/FloatingActionMenu';

const MenuButton = ({ icon, label, onClick, tone = 'text-on-surface', iconClass = 'text-primary', strong = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full px-3.5 py-2 text-left text-xs ${strong ? 'font-semibold' : 'font-medium'} ${tone} hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer`}
  >
    <span className={`material-symbols-outlined text-[18px] ${iconClass}`} translate="no">{icon}</span>
    <span>{label}</span>
  </button>
);

const PaymentActionMenu = ({
  menu,
  onClose,
  onViewDetails,
  onPrintTicket,
  onWhatsApp,
  onViewReceipt,
  onEdit,
  onCancel,
}) => {
  if (!menu) return null;
  const payment = menu.pago;
  const run = (callback) => {
    onClose();
    callback(payment);
  };

  return (
    <FloatingActionMenu menu={menu} onClose={onClose} className="w-56">
      <div className="px-3.5 py-2 mb-1 border-b border-outline-variant/50 flex items-center justify-between bg-surface-container-lowest">
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Acciones</span>
        <span className="font-data-mono text-[10px] font-bold text-primary">{payment.numero_comprobante || 'S/N'}</span>
      </div>

      {payment.estado_validacion === 'Anulado' ? (
        <>
          <MenuButton icon="info" label="Ver Detalle y Motivo" onClick={() => run(onViewDetails)} tone="text-error" iconClass="text-error" strong />
          <MenuButton icon="picture_as_pdf" label="Ver Recibo Original" onClick={() => run(onViewReceipt)} iconClass="text-secondary" />
        </>
      ) : (
        <>
          <MenuButton icon="receipt_long" label="Imprimir Ticket" onClick={() => run(onPrintTicket)} />
          <MenuButton icon="chat" label="Enviar por WhatsApp" onClick={() => run(onWhatsApp)} iconClass="text-[#25D366]" />
          <MenuButton icon="picture_as_pdf" label="Ver Recibo" onClick={() => run(onViewReceipt)} iconClass="text-secondary" />
          <MenuButton icon="edit" label="Modificar Pago" onClick={() => run(onEdit)} iconClass="text-amber-600" />
          <MenuButton icon="visibility" label="Ver Detalle" onClick={() => run(onViewDetails)} iconClass="text-on-surface-variant" />
          <div className="my-1 border-t border-outline-variant/60" />
          <MenuButton icon="delete" label="Anular Pago" onClick={() => run(onCancel)} tone="text-error" iconClass="text-error" strong />
        </>
      )}
    </FloatingActionMenu>
  );
};

export default PaymentActionMenu;
